'use strict';

/**
 * Build the classification prompt for a single RawTool.
 * @param {object} raw - RawTool
 * @param {string[]} categories - list of valid category slugs
 * @returns {string}
 */
function buildPrompt(raw, categories) {
  return `You are a structured data extractor for BinBag, an AI tool directory.

Given the following raw information about an AI tool or model, extract and return a JSON object with these exact fields:

{
  "name":              string  — clean product name (title-case, no version suffixes unless essential),
  "short_description": string  — 1 sentence, max 120 chars, plain English, no hype words,
  "long_description":  string  — 2-4 sentences describing what it does and who it's for,
  "item_type":         string  — one of: tool, research, learning, job, community, dataset, framework, event, podcast. Infer from context. Defaults to "tool".
  "category":          string  — one of: ${categories.join(', ')},
  "subcategory":       string  — most specific subcategory that fits, lowercase-hyphen,
  "pricing_model":     string  — one of: free, freemium, paid, open-source,
  "tags":              string[] — 3-6 lowercase descriptive tags,
  "website_url":       string  — canonical product URL (not a blog post URL),
  "logo_url":          string | null — direct image URL if known, else null
}

Rules:
- Return ONLY valid JSON. No explanation, no markdown fences, no extra text.
- If a field cannot be determined from the input, use null.
- For category, choose the MOST specific fit from the list provided.
- Do not invent facts; base everything on the input data.
- Accurately determine the item_type. If it is a paper, set to "research". If it's a repository for training models, set to "framework". If it's an app, set to "tool".

Input data:
Name: ${raw.name || '(unknown)'}
Description: ${raw.description || '(none)'}
Website: ${raw.website_url || '(none)'}
Source: ${raw.source}
Tags: ${raw.tags ? raw.tags.join(', ') : '(none)'}
Pricing hint: ${raw.pricing || '(unknown)'}`;
}

module.exports = { buildPrompt };