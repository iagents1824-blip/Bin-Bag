'use strict';
const Parser = require('rss-parser');
const { BaseSource } = require('./base.cjs');

const parser = new Parser({ timeout: 15000 });

// Keywords that signal a product launch (vs. a research post)
const LAUNCH_SIGNALS = [
  'launch', 'release', 'introducing', 'announce', 'available',
  'new model', 'now open', 'api access', 'open source'
];

class RssLabsSource extends BaseSource {
  constructor(config) {
    super('rss-labs', config);
    this.feeds = config.feeds || [];
  }

  async fetchLatest() {
    const results = [];
    const cutoff = Date.now() - 2 * 24 * 60 * 60 * 1000; // last 48h

    for (const feed of this.feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items) {
          const pubMs = item.pubDate ? new Date(item.pubDate).getTime() : 0;
          if (pubMs < cutoff) continue;

          const text = ((item.title || '') + ' ' + (item.contentSnippet || '')).toLowerCase();
          const isLaunch = LAUNCH_SIGNALS.some(kw => text.includes(kw));
          if (!isLaunch) continue;

          results.push({
            name:        item.title,
            description: item.contentSnippet || item.summary || '',
            website_url: item.link,
            logo_url:    null,
            source:      'rss-labs',
            source_url:  item.link,
            launch_date: item.pubDate || null,
            tags:        [feed.name.toLowerCase().replace(/\s+/g, '-')],
            pricing:     null,
            raw:         { feedName: feed.name, feedUrl: feed.url }
          });
        }
      } catch (err) {
        console.error('[rss-labs] Feed ' + feed.name + ' failed: ' + err.message);
      }
    }
    return results;
  }
}

module.exports = { RssLabsSource };
