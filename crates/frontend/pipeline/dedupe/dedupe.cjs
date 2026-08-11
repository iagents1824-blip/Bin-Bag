'use strict';

/**
 * Extract the apex domain from a URL for comparison.
 * e.g. 'https://api.openai.com/v1' -> 'openai.com'
 */
function extractDomain(url) {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname;
    // Remove subdomains â€” take last 2 parts
    const parts = hostname.split('.');
    return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
  } catch (_) {
    return null;
  }
}

/**
 * Normalized name for fuzzy comparison: lowercase, remove punctuation/extra spaces.
 */
function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Simple bigram-based similarity (0-1).
 * Fast and good enough for tool names.
 */
function bigramSim(a, b) {
  if (!a || !b) return 0;
  const getBigrams = s => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s[i] + s[i + 1]);
    return set;
  };
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  const ba = getBigrams(na);
  const bb = getBigrams(nb);
  let intersect = 0;
  for (const bg of ba) if (bb.has(bg)) intersect++;
  return (2 * intersect) / (ba.size + bb.size || 1);
}

/**
 * Deduplicate newListings against existingListings.
 * Returns only listings that are NOT duplicates.
 *
 * Strategy:
 *  1. Exact domain match â†’ duplicate (score >= domainThreshold)
 *  2. High name similarity (>= nameSimThreshold) â†’ duplicate
 *
 * @param {object[]} newListings
 * @param {object[]} existingListings
 * @param {object} config
 * @returns {{ unique: object[], duplicates: object[] }}
 */
function deduplicate(newListings, existingListings, config) {
  const nameThreshold   = config.nameSimThreshold || 0.80;
  const domainThreshold = config.domainThreshold  || 1.0;

  const unique     = [];
  const duplicates = [];

  // Pre-extract existing domains + names for speed
  const existingMeta = existingListings.map(e => ({
    domain: extractDomain(e.website_url),
    name:   normalizeName(e.name)
  }));

  // Also check within the new batch itself (inter-batch dedup)
  const acceptedDomains = new Set();
  const acceptedNames   = [];

  for (const listing of newListings) {
    const domain = extractDomain(listing.website_url);
    const name   = normalizeName(listing.name);

    let isDup = false;

    // 1. Domain match against existing
    if (domain) {
      for (const meta of existingMeta) {
        if (meta.domain && meta.domain === domain) { isDup = true; break; }
      }
    }

    // 2. Name similarity against existing
    if (!isDup) {
      for (const meta of existingMeta) {
        if (bigramSim(name, meta.name) >= nameThreshold) { isDup = true; break; }
      }
    }

    // 3. Intra-batch: domain already accepted this run
    if (!isDup && domain && acceptedDomains.has(domain)) isDup = true;

    // 4. Intra-batch: name similarity to already-accepted items
    if (!isDup) {
      for (const an of acceptedNames) {
        if (bigramSim(name, an) >= nameThreshold) { isDup = true; break; }
      }
    }

    if (isDup) {
      duplicates.push(listing);
    } else {
      unique.push(listing);
      if (domain) acceptedDomains.add(domain);
      acceptedNames.push(name);
    }
  }

  return { unique, duplicates };
}

module.exports = { deduplicate, bigramSim, extractDomain };