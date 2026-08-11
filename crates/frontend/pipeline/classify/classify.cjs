'use strict';
const axios = require('axios');
const crypto = require('crypto');
const { buildPrompt } = require('./prompt.cjs');

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-3-haiku-20240307'; // cheap + fast for classification

/**
 * @param {import('../ingest/base.cjs').RawTool[]} rawTools
 * @param {string[]} categories
 * @returns {Promise<object[]>} classified listings
 */
async function classifyBatch(rawTools, categories) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.warn('[classify] ANTHROPIC_API_KEY not set â€” using passthrough classification.');
    return rawTools.map(r => passthroughClassify(r, categories));
  }

  const results = [];
  for (const raw of rawTools) {
    const classified = await classifyOne(raw, categories, key);
    results.push(classified);
    // Polite rate limiting â€” Haiku is generous but let's be safe
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

async function classifyOne(raw, categories, key) {
  const prompt = buildPrompt(raw, categories);
  try {
    const res = await axios.post(
      ANTHROPIC_API,
      {
        model:      MODEL,
        max_tokens: 512,
        messages:   [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key':         key,
          'anthropic-version': '2023-06-01',
          'Content-Type':      'application/json'
        },
        timeout: 30000
      }
    );

    const text = res.data.content[0].text.trim();
    // Strip any accidental markdown fences
    const jsonStr = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    const parsed  = JSON.parse(jsonStr);

    return mergeWithRaw(raw, parsed);
  } catch (err) {
    console.error('[classify] Failed for', raw.name, ':', err.message);
    return passthroughClassify(raw, categories);
  }
}

/** Fallback when Claude is unavailable â€” minimal classification */
function passthroughClassify(raw, categories) {
  return mergeWithRaw(raw, {
    name:              raw.name,
    short_description: raw.description ? raw.description.slice(0, 120) : '',
    long_description:  raw.description || '',
    category:          'other',
    subcategory:       null,
    pricing_model:     raw.pricing || null,
    tags:              raw.tags || [],
    website_url:       raw.website_url || null,
    logo_url:          raw.logo_url || null
  });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mergeWithRaw(raw, classified) {
  const now = new Date().toISOString();
  const id  = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return {
    id,
    name:              classified.name             || raw.name,
    slug:              slugify(classified.name     || raw.name),
    short_description: classified.short_description || '',
    long_description:  classified.long_description  || '',
    category:          classified.category          || 'other',
    subcategory:       classified.subcategory        || null,
    website_url:       classified.website_url        || raw.website_url || '',
    logo_url:          classified.logo_url           || raw.logo_url    || null,
    pricing_model:     classified.pricing_model      || raw.pricing     || null,
    tags:              classified.tags               || raw.tags        || [],
    source:            raw.source,
    source_url:        raw.source_url  || null,
    launch_date:       raw.launch_date || null,
    status:            'pending_review', // will be updated by score step
    score:             0,
    discovered_at:     now,
    last_updated_at:   now
  };
}

module.exports = { classifyBatch };