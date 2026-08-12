'use strict';
const axios = require('axios');
const { BaseSource } = require('./base.cjs');

class HuggingFacePapersSource extends BaseSource {
  constructor(config) { super('hf-papers', config); }

  async fetchLatest() {
    const limit = this.config.limitPerRun || 20;
    try {
      const res = await axios.get('https://huggingface.co/api/daily_papers', { timeout: 15000 });
      const papers = (res.data || []).slice(0, limit);
      return papers.map(p => ({
        name:        p.paper?.title || p.title || 'Untitled',
        description: p.paper?.summary || p.summary || '',
        website_url: `https://huggingface.co/papers/${p.paper?.id || p.id}`,
        logo_url:    null,
        source:      'hf-papers',
        source_url:  `https://huggingface.co/papers/${p.paper?.id || p.id}`,
        launch_date: p.publishedAt || null,
        tags:        ['research', 'paper', 'huggingface'],
        pricing:     'free',
        authors:     p.paper?.authors?.map(a => a.name).join(', ') || null,
        raw:         { id: p.paper?.id || p.id, upvotes: p.totalUpvotes }
      }));
    } catch (err) {
      console.error('[hf-papers] Failed:', err.message);
      return [];
    }
  }
}

module.exports = { HuggingFacePapersSource };