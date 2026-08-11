'use strict';
const path = require('path');
const fs   = require('fs');

// â”€â”€ Load config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pipelineConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config', 'pipeline.config.json'), 'utf8')
);
const sourcesConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config', 'sources.config.json'), 'utf8')
);

// â”€â”€ Sources â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const { HuggingFaceSource } = require('./ingest/huggingface.cjs');
const { ProductHuntSource } = require('./ingest/producthunt.cjs');
const { RssLabsSource }     = require('./ingest/rss-labs.cjs');
const { GitHubSource }      = require('./ingest/github.cjs');

// â”€â”€ Pipeline stages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const { classifyBatch }   = require('./classify/classify.cjs');
const { deduplicate }     = require('./dedupe/dedupe.cjs');
const { scoreBatch }      = require('./score/score.cjs');
const { persistListings, getListings } = require('./persist/persist.cjs');
const { sendDigest }      = require('./notify/notify.cjs');

// â”€â”€ Logging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LOG_DIR  = path.join(__dirname, '..', 'data', 'pipeline-logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function log(msg) {
  const line = '[' + new Date().toISOString() + '] ' + msg;
  console.log(line);
  const file = path.join(LOG_DIR, new Date().toISOString().split('T')[0] + '.log');
  fs.appendFileSync(file, line + '\n', 'utf8');
}

// â”€â”€ Main pipeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function runPipeline() {
  log('=== BinBag Auto-Listing Pipeline START ===');
  const errors    = [];
  const rawAll    = [];

  // 1. INGEST â€” run all enabled sources in parallel with per-source retry
  const sources = [];
  if (sourcesConfig.huggingface && sourcesConfig.huggingface.enabled) {
    sources.push(new HuggingFaceSource(sourcesConfig.huggingface));
  }
  if (sourcesConfig['rss-labs'] && sourcesConfig['rss-labs'].enabled) {
    sources.push(new RssLabsSource(sourcesConfig['rss-labs']));
  }
  if (sourcesConfig.github && sourcesConfig.github.enabled) {
    sources.push(new GitHubSource(sourcesConfig.github));
  }
  if (sourcesConfig.producthunt && sourcesConfig.producthunt.enabled) {
    sources.push(new ProductHuntSource(sourcesConfig.producthunt));
  }

  const ingestResults = await Promise.allSettled(
    sources.map(s => s.fetchWithRetry(3, 2000))
  );

  for (let i = 0; i < ingestResults.length; i++) {
    const r = ingestResults[i];
    if (r.status === 'fulfilled') {
      rawAll.push(...r.value);
    } else {
      const errMsg = sources[i].name + ': ' + (r.reason && r.reason.message || 'unknown error');
      errors.push(errMsg);
      log('ERROR ingest ' + errMsg);
    }
  }
  log('Ingested ' + rawAll.length + ' raw items from ' + sources.length + ' sources.');

  if (rawAll.length === 0) {
    log('No raw items â€” aborting pipeline.');
    await sendDigest({ ingested: 0, unique: 0, autoPublished: 0, pendingReview: 0, rejected: 0, highlights: [], errors });
    return;
  }

  // 2. CLASSIFY â€” Claude categorizes + extracts structured fields
  log('Classifying ' + rawAll.length + ' items...');
  const classified = await classifyBatch(rawAll, pipelineConfig.taxonomy.categories);
  log('Classification complete: ' + classified.length + ' items.');

  // 3. DEDUPE â€” fuzzy match against existing store + within batch
  const existing = getListings(null);
  const { unique, duplicates } = deduplicate(classified, existing, pipelineConfig.dedup);
  log('Deduplication: ' + unique.length + ' unique, ' + duplicates.length + ' duplicates removed.');

  // 4. SCORE â€” assign auto_publish or pending_review
  const scored  = scoreBatch(unique, pipelineConfig.scoring);
  const autoP   = scored.filter(l => l.status === 'auto_published');
  const pending = scored.filter(l => l.status === 'pending_review');
  log('Scored: ' + autoP.length + ' auto-publish, ' + pending.length + ' pending-review.');

  // 5. PERSIST â€” atomic write to JSON store
  const { inserted } = persistListings(scored, pipelineConfig.retention);
  log('Persisted ' + inserted + ' new listings.');

  // 6. NOTIFY â€” daily digest
  const highlights = [...autoP, ...pending]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  await sendDigest({
    ingested:      rawAll.length,
    unique:        unique.length,
    autoPublished: autoP.length,
    pendingReview: pending.length,
    rejected:      duplicates.length,
    highlights,
    errors
  });

  log('=== BinBag Auto-Listing Pipeline DONE ===');
}

// â”€â”€ Entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (require.main === module) {
  runPipeline().catch(err => {
    console.error('PIPELINE FATAL ERROR:', err);
    process.exit(1);
  });
}

module.exports = { runPipeline };