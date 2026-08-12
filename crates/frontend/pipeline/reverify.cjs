'use strict';
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'auto-listings.json');
const LOG_DIR = path.join(DATA_DIR, 'pipeline-logs');

const DISCONTINUED_KEYWORDS = [
  'sunset', 'deprecated', 'shut down', 'discontinu', 'no longer available',
  'end of life', 'eol', 'winding down', 'shutting down'
];
const CONCURRENCY = 15;
const TIMEOUT_MS = 8000;
const BATCH_SIZE = 100;

function readStore() {
  if (!fs.existsSync(LISTINGS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8')); }
  catch (_) { return []; }
}

function atomicWrite(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = LISTINGS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, LISTINGS_FILE);
}

function writeRunLog(summary) {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  const file = path.join(LOG_DIR, 'reverify-' + new Date().toISOString().split('T')[0] + '.json');
  let existing = [];
  if (fs.existsSync(file)) {
    try { existing = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) {}
  }
  existing.push(summary);
  fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');
}

async function checkWebsite(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      signal: controller.signal,
      validateStatus: () => true,
      maxRedirects: 5,
      headers: { 'User-Agent': 'BinBag-Verify/1.0 (+https://binbag.ai)' }
    });
    clearTimeout(timer);
    if (res.status >= 400) return { ok: false, error: `HTTP ${res.status}` };
    const html = (res.data || '').toString().toLowerCase().slice(0, 30000);
    const discontinued = DISCONTINUED_KEYWORDS.some(kw => html.includes(kw));
    if (discontinued) return { ok: true, discontinued: true };
    return { ok: true, discontinued: false };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: err.code || err.message };
  }
}

async function checkBatch(items) {
  const results = new Map();
  // Process in chunks of CONCURRENCY
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map(item => item.website_url ? checkWebsite(item.website_url) : Promise.resolve({ ok: true, skipped: true }))
    );
    chunk.forEach((item, idx) => {
      const r = settled[idx];
      results.set(item.id, r.status === 'fulfilled' ? r.value : { ok: false, error: r.reason?.message || 'unknown' });
    });
  }
  return results;
}

async function runReverification() {
  const runStart = new Date().toISOString();
  console.log('[reverify] Starting parallel reverification job at', runStart);

  const allListings = readStore();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const toVerify = allListings
    .filter(l => ['auto_published', 'pending_review'].includes(l.status))
    .filter(l => !l.last_verified_at || (now - new Date(l.last_verified_at).getTime()) > ONE_DAY)
    .sort((a, b) => {
      const tA = a.last_verified_at ? new Date(a.last_verified_at).getTime() : 0;
      const tB = b.last_verified_at ? new Date(b.last_verified_at).getTime() : 0;
      return tA - tB;
    })
    .slice(0, BATCH_SIZE);

  if (toVerify.length === 0) {
    console.log('[reverify] No listings require verification.');
    writeRunLog({ run_at: runStart, checked: 0, updated: 0, newly_broken: 0, newly_discontinued: 0, errors: [] });
    return;
  }

  console.log(`[reverify] Checking ${toVerify.length} listings with concurrency=${CONCURRENCY}...`);
  const checkResults = await checkBatch(toVerify);

  let updated = 0, newly_broken = 0, newly_discontinued = 0;
  const errors = [];
  const verifiedAt = new Date().toISOString();

  for (const item of toVerify) {
    const result = checkResults.get(item.id) || { ok: true, skipped: true };
    item.broken_link_count = item.broken_link_count || 0;

    if (result.skipped) {
      // No URL — just update timestamp
    } else if (!result.ok) {
      item.broken_link_count++;
      errors.push(`${item.name}: ${result.error} (fail #${item.broken_link_count})`);
      if (item.broken_link_count >= 3 && item.status !== 'broken_link') {
        console.log(`  -> BROKEN: ${item.name}`);
        item.status = 'broken_link';
        newly_broken++;
        updated++;
      }
    } else {
      item.broken_link_count = 0;
      if (result.discontinued && item.status !== 'discontinued') {
        console.log(`  -> DISCONTINUED: ${item.name}`);
        item.status = 'discontinued';
        newly_discontinued++;
        updated++;
      }
    }
    item.last_verified_at = verifiedAt;
  }

  // Merge back and persist
  const lookup = new Map(toVerify.map(l => [l.id, l]));
  const updatedListings = allListings.map(l => lookup.has(l.id) ? lookup.get(l.id) : l);
  atomicWrite(updatedListings);

  const summary = {
    run_at: runStart,
    checked: toVerify.length,
    updated,
    newly_broken,
    newly_discontinued,
    errors: errors.slice(0, 20)
  };
  writeRunLog(summary);
  console.log('[reverify] Done.', JSON.stringify(summary));
  return summary;
}

if (require.main === module) {
  runReverification().catch(err => {
    console.error('REVERIFY FATAL ERROR:', err);
    process.exit(1);
  });
}

module.exports = { runReverification };