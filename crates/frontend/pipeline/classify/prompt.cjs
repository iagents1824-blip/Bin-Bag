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
  "name":              string  â€” clean product name (title-case, no version suffixes unless essential),
  "short_description": string  â€” 1 sentence, max 120 chars, plain English, no hype words,
  "long_description":  string  â€” 2-4 sentences describing what it does and who it's for,
  "category":          string  â€” one of: ${categories.join(', ')},
  "subcategory":       string  â€” most specific subcategory that fits, lowercase-hyphen,
  "pricing_model":     string  â€” one of: free, freemium, paid, open-source,
  "tags":              string[] â€” 3-6 lowercase descriptive tags,
  "website_url":       string  â€” canonical product URL (not a blog post URL),
  "logo_url":          string | null â€” direct image URL if known, else null
}

Rules:
- Return ONLY valid JSON. No explanation, no markdown fences, no extra text.
- If a field cannot be determined from the input, use null.
- For category, choose the MOST specific fit from the list provided.
- Do not invent facts; base everything on the input data.
- If this looks like a research paper rather than a usable product/tool, set category to "other" and note it in short_description.

Input data:
Name: ${raw.name || '(unknown)'}
Description: ${raw.description || '(none)'}
Website: ${raw.website_url || '(none)'}
Source: ${raw.source}
Tags: ${raw.tags ? raw.tags.join(', ') : '(none)'}
Pricing hint: ${raw.pricing || '(unknown)'}`;
}

module.exports = { buildPrompt };