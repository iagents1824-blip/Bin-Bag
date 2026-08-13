'use strict';
const express = require('express');
const crypto = require('crypto');
const { getListings, persistListings } = require('../persist/persist.cjs');

const router = express.Router();

// Basic rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 100;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = rateLimits.get(ip);
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
  
  record.count++;
  next();
}

// Authentication middleware
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.INGEST_API_KEY;

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing x-api-key header' });
  }
  
  next();
}

router.use(rateLimiter);
router.use(requireApiKey);

// Helper for slug generation
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// GET /api/admin/listings/check
router.get('/listings/check', (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Missing required query parameter: name' });
  }

  const allListings = getListings(null);
  const searchName = name.toLowerCase();

  // Simple fuzzy check
  const matched = allListings.find(l => {
    const lName = (l.name || '').toLowerCase();
    return lName.includes(searchName) || searchName.includes(lName);
  });

  console.log(`[Ingest API] Check name="${name}" -> ${matched ? `Exists (${matched.id})` : 'Not found'}`);

  if (matched) {
    res.json({ exists: true, matched_name: matched.name, matched_id: matched.id });
  } else {
    res.json({ exists: false });
  }
});

// POST /api/admin/listings
router.post('/listings', (req, res) => {
  const body = req.body;
  const { name, website_url, category, pricing_model } = body;

  if (!name || !website_url || !category) {
    return res.status(400).json({ error: 'Missing required fields: name, website_url, category' });
  }

  const allowedCategories = ['chatbot', 'audio', 'video', 'image', 'document', 'code', 'agent', 'api', 'browser-extension', 'writing', 'other', 'research', 'learning', 'job', 'community', 'dataset', 'framework', 'event', 'podcast'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${allowedCategories.join(', ')}` });
  }

  const allowedPricing = ['free', 'freemium', 'paid', 'open-source'];
  if (pricing_model && !allowedPricing.includes(pricing_model)) {
    return res.status(400).json({ error: `Invalid pricing_model. Must be one of: ${allowedPricing.join(', ')}` });
  }

  const slug = body.slug || generateSlug(name);
  const allListings = getListings(null);

  // Check for existing slug
  const existing = allListings.find(l => l.slug === slug);
  if (existing) {
    console.log(`[Ingest API] Create rejected -> Conflict on slug="${slug}"`);
    return res.status(409).json({ error: `Listing with slug '${slug}' already exists (ID: ${existing.id})` });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

  const newListing = {
    id,
    name,
    slug,
    short_description: body.short_description || '',
    long_description: body.long_description || '',
    category,
    subcategory: body.subcategory || null,
    pricing_model: pricing_model || null,
    website_url,
    logo_url: body.logo_url || null,
    source: body.source || 'n8n_automation',
    source_url: body.source_url || null,
    launch_date: body.launch_date || null,
    status: 'pending_review',
    score: 0,
    discovered_at: now,
    created_at: now,
    last_updated_at: now,
    last_verified_at: null,
    broken_link_count: 0
  };

  try {
    persistListings([newListing], { maxPendingReviewAgeDays: 30, maxAutoPublishedEntries: 500 });
    console.log(`[Ingest API] Created listing: ${name} (ID: ${id})`);
    res.status(201).json(newListing);
  } catch (err) {
    console.error('[Ingest API] Error saving listing:', err);
    res.status(500).json({ error: 'Internal server error while saving listing.' });
  }
});

module.exports = router;