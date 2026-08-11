# BinBag Auto-Listing Pipeline

A daily automated discovery pipeline that ingests new AI tools/models from multiple sources, classifies them with Claude, deduplicates, quality-scores, and persists them — with a Discord digest and admin review API.

## Folder structure
`
pipeline/
├── config/pipeline.config.json   taxonomy, scoring weights, retention
├── config/sources.config.json    enable/disable sources + per-source options
├── ingest/base.cjs               BaseSource + fetchWithRetry()
├── ingest/huggingface.cjs        HuggingFace Models & Spaces
├── ingest/producthunt.cjs        Product Hunt GraphQL
├── ingest/rss-labs.cjs           Lab blogs RSS (OpenAI, Google, Anthropic…)
├── ingest/github.cjs             GitHub repo search (AI topics)
├── classify/prompt.cjs           Claude prompt template
├── classify/classify.cjs         Anthropic API + passthrough fallback
├── dedupe/dedupe.cjs             exact domain + bigram fuzzy name match
├── score/score.cjs               0–100 score → auto_published / pending_review
├── persist/persist.cjs           atomic JSON store (data/auto-listings.json)
├── notify/notify.cjs             Discord webhook daily digest
├── admin/admin-server.cjs        Express router mounted at /admin
├── admin/standalone-admin.cjs    standalone admin on port 3001
└── runner.cjs                    orchestrator
`

## Setup

### 1. Install pipeline deps
`ash
cd crates/frontend/pipeline && npm install && cd ..
`

### 2. Environment variables
`
ANTHROPIC_API_KEY=sk-ant-...         # Claude Haiku classification
DISCORD_WEBHOOK_URL=https://...      # Daily digest
GITHUB_TOKEN=ghp_...                 # Raises GH rate limit (recommended)
PRODUCTHUNT_TOKEN=...                # Only if PH source enabled
`

### 3. Run manually
`ash
node pipeline/runner.cjs
`
Output: data/auto-listings.json + data/pipeline-logs/YYYY-MM-DD.log

### 4. Automatic scheduling
Registered in agent.cjs via node-cron — runs daily at 03:00 server time automatically. No extra process needed.

## Admin review

`ash
# List pending
curl http://localhost:3000/admin/pending-listings

# Approve
curl -X PATCH http://localhost:3000/admin/listings/<id> \
  -H 'Content-Type: application/json' -d '{"status":"auto_published"}'

# Reject
curl -X PATCH http://localhost:3000/admin/listings/<id> \
  -H 'Content-Type: application/json' -d '{"status":"rejected"}'
`

## Tuning

- **Category taxonomy**: edit config/pipeline.config.json → taxonomy
- **Auto-publish threshold**: scoring.autoPublishThreshold (default 70/100)
- **Classification prompt**: edit classify/prompt.cjs buildPrompt()
- **Add a source**: create ingest/mysource.cjs extending BaseSource, add to sources.config.json and runner.cjs

## Public API

GET /api/auto-listings            → auto_published listings only
GET /api/auto-listings?category=  → filter by category slug
