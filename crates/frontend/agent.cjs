'use strict';
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SOURCES = {
  devto:       require('./sources/devto.cjs'),
  huggingface: require('./sources/huggingface.cjs'),
  rssWatch:    require('./sources/rssWatch.cjs'),
  github:      require('./sources/github.cjs'),
  producthunt: require('./sources/producthunt.cjs')
};

const CONFIG   = require('./agent-config.json');
const DATA_DIR = path.join(__dirname, 'data');

// â”€â”€ Legacy marketplace listings scraper (kept intact) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const listingsPath = path.join(DATA_DIR, 'listings.json');

async function scrapeHuggingFace() {
  try {
    console.log('[Agent] Fetching latest models from HuggingFace (listings)...');
    const res = await axios.get(
      'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20',
      { timeout: 20000 }
    );
    const models = res.data.map(m => ({
      id:          m._id || m.modelId,
      title:       m.modelId,
      tagline:     m.pipeline_tag ? 'Pipeline: ' + m.pipeline_tag : 'HuggingFace Model',
      description: 'A popular trending model fetched live from HuggingFace.' + (m.pipeline_tag ? ' Optimized for ' + m.pipeline_tag + '.' : ''),
      category:    'Full Model Weights',
      price:       0,
      creator: {
        name:     m.author || 'Community',
        handle:   '@' + (m.author || 'hf_community'),
        verified: true,
        avatar:   'https://api.dicebear.com/7.x/identicon/svg?seed=' + (m.author || 'hf')
      },
      stats: { downloads: m.downloads || 0, rating: 4.8, reviewCount: Math.floor(Math.random() * 100), efficiencyScore: 'A' },
      tags:        m.tags ? m.tags.slice(0, 4) : ['AI'],
      specs:       { framework: 'PyTorch', format: 'Safetensors' },
      downloadUrl: 'https://huggingface.co/' + m.modelId,
      createdAt:   new Date().toISOString(),
      featured:    false
    }));
    fs.writeFileSync(listingsPath, JSON.stringify(models, null, 2), 'utf8');
    console.log('[Agent] Saved ' + models.length + ' models to listings.json');
  } catch (err) {
    console.error('[Agent] Error scraping HuggingFace listings:', err.message);
  }
}

// â”€â”€ Generic runner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function readExisting(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { return null; }
}

function atomicWrite(filePath, data) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

async function runCategory(entry) {
  const tag = '[' + entry.category + ']';
  console.log(tag + ' Running...');

  const fetcher = SOURCES[entry.source];
  if (!fetcher) { console.error(tag + ' Unknown source: ' + entry.source); return; }

  const outputPath = path.join(DATA_DIR, path.basename(entry.outputFile));
  const existing   = readExisting(outputPath);

  let result;
  try {
    result = await fetcher(entry, existing);
  } catch (err) {
    console.error(tag + ' Fetch failed - leaving existing file untouched. Error: ' + err.message);
    return;
  }

  atomicWrite(outputPath, result.data);
  console.log(tag + ' Done. New items: ' + result.newCount);
}

// â”€â”€ Entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function startScrapingAgent() {
  console.log('[Agent] Starting unified config-driven content agent...');

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(listingsPath)) fs.writeFileSync(listingsPath, '[]', 'utf8');

  // Immediate startup run
  scrapeHuggingFace();
  for (const entry of CONFIG) { runCategory(entry); }

  // Hourly listings scraper
  cron.schedule('0 * * * *', () => scrapeHuggingFace());

  // Per-category schedules from config
  for (const entry of CONFIG) {
    cron.schedule(entry.schedule, () => runCategory(entry));
  }

  console.log('[Agent] All schedules registered.');

  // ── Auto-Listing Pipeline (daily at 03:00) ────────────────────────────
  try {
    const { runPipeline } = require('./pipeline/runner.cjs');
    // Run once on startup (so first deploy populates data immediately)
    runPipeline().catch(err => console.error('[Pipeline] Startup run failed:', err.message));
    // Then daily at 03:00 server time
    cron.schedule('0 3 * * *', () => {
      console.log('[Pipeline] Running daily auto-listing pipeline...');
      runPipeline().catch(err => console.error('[Pipeline] Daily run failed:', err.message));
    });
    console.log('[Agent] Auto-listing pipeline scheduled (daily 03:00).');
  } catch (err) {
    console.warn('[Agent] Pipeline not available (missing dependencies?):', err.message);
  }
}

module.exports = { startScrapingAgent };