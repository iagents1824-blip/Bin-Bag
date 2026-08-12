'use strict';
const Parser = require('rss-parser');
const { BaseSource } = require('./base.cjs');

const parser = new Parser({ timeout: 15000 });

const FEEDS = [
  { id: 'cs.AI',  url: 'https://export.arxiv.org/rss/cs.AI',  label: 'AI' },
  { id: 'cs.CL',  url: 'https://export.arxiv.org/rss/cs.CL',  label: 'Computation & Language' },
  { id: 'cs.LG',  url: 'https://export.arxiv.org/rss/cs.LG',  label: 'Machine Learning' },
];

class ArxivSource extends BaseSource {
  constructor(config) { super('arxiv', config); }

  async fetchLatest() {
    const limit = this.config.limitPerRun || 30;
    const results = [];

    for (const feed of FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, Math.ceil(limit / FEEDS.length));
        for (const item of items) {
          const arxivId = (item.link || '').split('/abs/').pop() || item.guid;
          results.push({
            name:        item.title ? item.title.replace(/\s+/g, ' ').trim() : 'Untitled Paper',
            description: item.contentSnippet || item.content || '',
            website_url: item.link || `https://arxiv.org/abs/${arxivId}`,
            logo_url:    null,
            source:      'arxiv',
            source_url:  item.link || null,
            launch_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
            tags:        ['research', 'paper', feed.label.toLowerCase()],
            pricing:     'free',
            authors:     item.author || item.creator || null,
            raw:         { arxivId, feed: feed.id }
          });
        }
      } catch (err) {
        console.error(`[arxiv] Failed to fetch ${feed.id}: ${err.message}`);
      }
    }
    return results;
  }
}

module.exports = { ArxivSource };