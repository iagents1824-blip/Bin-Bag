'use strict';
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { startScrapingAgent } = require('./agent.cjs');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const listingsPath = path.join(DATA_DIR, 'listings.json');
if (!fs.existsSync(listingsPath)) fs.writeFileSync(listingsPath, '[]', 'utf8');

// ── Cache ──────────────────────────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000;
const cache = {};

function readCached(key, filePath) {
  const now = Date.now();
  if (cache[key] && (now - cache[key].ts < CACHE_TTL)) return cache[key].data;
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    cache[key] = { data, ts: now };
    return data;
  } catch (e) { return null; }
}

// ── Legacy marketplace listings ────────────────────────────────────────────
app.get('/api/listings', (req, res) => {
  res.json(readCached('listings', listingsPath) || []);
});

// ── News (legacy + new unified path) ──────────────────────────────────────
function serveNews(req, res) {
  let data = readCached('news', path.join(DATA_DIR, 'news.json')) || [];
  const { tag } = req.query;
  if (tag) {
    const t = tag.toLowerCase();
    data = data.filter(a =>
      (a.title  || '').toLowerCase().includes(t) ||
      (a.summary || '').toLowerCase().includes(t)
    );
  }
  res.json(data);
}
app.get('/api/news',              serveNews);
app.get('/api/listings/news',     serveNews);

// ── Category files map ─────────────────────────────────────────────────────
const CATEGORY_FILES = {
  models:    'models.json',
  flagship:  'flagship-seed.json',
  workflows: 'workflows.json'
};

const CANDIDATE_FILES = {
  flagship: 'flagship-candidates.json',
  tools:    'tools-candidates.json'
};

// ── GET /api/listings/:category ───────────────────────────────────────────
app.get('/api/listings/:category', (req, res) => {
  const { category } = req.params;

  // Candidates sub-route
  if (req.path.endsWith('/candidates')) return; // handled below

  const file = CATEGORY_FILES[category];
  if (!file) return res.status(404).json({ error: 'Unknown category: ' + category });

  let data = readCached(category, path.join(DATA_DIR, file));
  if (!data) return res.json(['models','workflows'].includes(category) ? { new: [], established: [] } : []);

  const { status } = req.query;
  if (status === 'new'         && data.new         !== undefined) return res.json(data.new);
  if (status === 'established' && data.established !== undefined) return res.json(data.established);
  res.json(data);
});

// ── GET /api/listings/:category/candidates (admin only) ───────────────────
app.get('/api/listings/:category/candidates', (req, res) => {
  const { category } = req.params;
  const file = CANDIDATE_FILES[category];
  if (!file) return res.status(404).json({ error: 'No candidates for: ' + category });
  res.json(readCached(category + '-candidates', path.join(DATA_DIR, file)) || []);
});

// ── Auto-listings public feed (auto_published only) ──────────────────────
app.get('/api/auto-listings', (req, res) => {
  const autoFile = path.join(DATA_DIR, 'auto-listings.json');
  const all = readCached('auto-listings', autoFile) || [];
  const { category, status } = req.query;
  let data = all.filter(l => l.status === 'auto_published');
  if (category) data = data.filter(l => l.category === category);
  res.json(data);
});

// ── Admin router (pipeline review queue) ──────────────────────────────
try {
  const adminRouter = require('./pipeline/admin/admin-server.cjs');
  app.use('/admin', adminRouter);
  console.log('Admin routes mounted at /admin');
} catch (err) {
  console.warn('Admin pipeline routes not available:', err.message);
}

// ── Static + SPA catch-all ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
  startScrapingAgent();
});