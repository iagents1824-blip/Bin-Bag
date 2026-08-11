'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_DIR    = path.join(__dirname, '..', '..', 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'auto-listings.json');

function readStore() {
  if (!fs.existsSync(LISTINGS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8')); }
  catch (_) { return []; }
}

function atomicWrite(data) {
  const tmp = LISTINGS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, LISTINGS_FILE);
}

/**
 * Persist an array of scored listings to the JSON store.
 * Returns { inserted, skipped } counts.
 *
 * @param {object[]} listings
 * @param {object} retentionConfig
 */
function persistListings(listings, retentionConfig) {
  const existing = readStore();
  const maxAgeMs = (retentionConfig.maxPendingReviewAgeDays || 30) * 24 * 60 * 60 * 1000;
  const maxAuto  = retentionConfig.maxAutoPublishedEntries || 500;

  // Prune stale pending-review items
  const now = Date.now();
  let pruned = existing.filter(e => {
    if (e.status !== 'pending_review') return true;
    return now - new Date(e.discovered_at).getTime() < maxAgeMs;
  });

  // Cap auto-published
  const autoPublished = pruned.filter(e => e.status === 'auto_published');
  if (autoPublished.length > maxAuto) {
    const excess = autoPublished.length - maxAuto;
    pruned = pruned.filter(e => {
      if (e.status !== 'auto_published') return true;
      return true; // keep all for now â€” just log
    });
    console.log('[persist] Note: ' + excess + ' excess auto-published entries (retention cap: ' + maxAuto + ')');
  }

  // Merge new listings
  const existingIds = new Set(pruned.map(e => e.id));
  let inserted = 0;
  for (const l of listings) {
    if (!existingIds.has(l.id)) {
      pruned.push(l);
      inserted++;
    }
  }

  atomicWrite(pruned);
  return { inserted, skipped: listings.length - inserted };
}

/** Read all listings, optionally filtered by status */
function getListings(status) {
  const all = readStore();
  if (!status) return all;
  return all.filter(l => l.status === status);
}

/** Update listing status (approve / reject from admin UI) */
function updateStatus(id, newStatus) {
  const all = readStore();
  const idx = all.findIndex(l => l.id === id);
  if (idx === -1) return null;
  all[idx].status = newStatus;
  all[idx].last_updated_at = new Date().toISOString();
  atomicWrite(all);
  return all[idx];
}

module.exports = { persistListings, getListings, updateStatus };