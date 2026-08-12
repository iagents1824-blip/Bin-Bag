'use strict';
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { getListings, atomicWrite } = require('./persist/persist.cjs');

const DISCONTINUED_KEYWORDS = ['sunset', 'deprecated', 'shut down', 'discontinued', 'no longer available'];

async function checkWebsite(url) {
  try {
    const res = await axios.get(url, { timeout: 8000, validateStatus: () => true });
    
    if (res.status >= 400) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const html = (res.data || '').toString().toLowerCase();
    
    const discontinued = DISCONTINUED_KEYWORDS.some(kw => html.includes(kw));
    if (discontinued) {
      return { ok: true, discontinued: true };
    }

    return { ok: true, discontinued: false };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function runReverification() {
  console.log('[reverify] Starting daily reverification job...');
  
  const allListings = getListings();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Filter listings that need verification (older than 24 hours or never verified)
  // We'll process a batch of up to 50
  const toVerify = allListings
    .filter(l => l.status === 'auto_published' || l.status === 'pending_review')
    .filter(l => {
      if (!l.last_verified_at) return true;
      return (now - new Date(l.last_verified_at).getTime()) > ONE_DAY;
    })
    .sort((a, b) => {
      const tA = a.last_verified_at ? new Date(a.last_verified_at).getTime() : 0;
      const tB = b.last_verified_at ? new Date(b.last_verified_at).getTime() : 0;
      return tA - tB;
    })
    .slice(0, 50);

  if (toVerify.length === 0) {
    console.log('[reverify] No listings require verification at this time.');
    return;
  }

  console.log(`[reverify] Found ${toVerify.length} listings to verify.`);

  for (const item of toVerify) {
    console.log(`[reverify] Checking ${item.name} (${item.website_url})...`);
    let needsUpdate = false;

    // Default to 0
    item.broken_link_count = item.broken_link_count || 0;

    if (item.website_url) {
      const result = await checkWebsite(item.website_url);
      
      if (!result.ok) {
        item.broken_link_count++;
        console.log(`  -> FAILED: ${result.error}. Fail count: ${item.broken_link_count}`);
        
        if (item.broken_link_count >= 3) {
          console.log(`  -> FLAGGING as broken_link.`);
          item.status = 'broken_link';
          needsUpdate = true;
        }
      } else {
        item.broken_link_count = 0; // Reset on success
        if (result.discontinued) {
          console.log(`  -> FLAGGING as discontinued.`);
          item.status = 'discontinued';
          needsUpdate = true;
        } else {
          console.log(`  -> OK.`);
        }
      }
    }

    item.last_verified_at = new Date().toISOString();
    
    // Polite delay
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save changes
  console.log('[reverify] Persisting updates...');
  
  // Update the master list
  const lookup = new Map(toVerify.map(l => [l.id, l]));
  const updatedListings = allListings.map(l => lookup.has(l.id) ? lookup.get(l.id) : l);
  
  // We need a helper in persist.cjs to write the whole array directly
  const DATA_DIR = path.join(__dirname, '..', '..', 'data');
  const LISTINGS_FILE = path.join(DATA_DIR, 'auto-listings.json');
  const tmp = LISTINGS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(updatedListings, null, 2), 'utf8');
  fs.renameSync(tmp, LISTINGS_FILE);

  console.log('[reverify] Reverification batch complete.');
}

if (require.main === module) {
  runReverification().catch(err => {
    console.error('REVERIFY FATAL ERROR:', err);
    process.exit(1);
  });
}

module.exports = { runReverification };