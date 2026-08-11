'use strict';
const axios = require('axios');
const { BaseSource } = require('./base.cjs');

const EXCLUDE_TAGS = ['tabular-classification', 'tabular-regression', 'token-classification', 'fill-mask'];

class HuggingFaceSource extends BaseSource {
  constructor(config) { super('huggingface', config); }

  async fetchLatest() {
    const limit = this.config.limitPerRun || 50;
    const minLikes = this.config.minLikes || 3;

    const [trendRes, newRes, spaceRes] = await Promise.all([
      // Trending last 7 days — high quality signal
      axios.get('https://huggingface.co/api/models?sort=likes&direction=-1&limit=' + limit + '&full=false', { timeout: 20000 }),
      // Freshest models with any downloads (>0 means someone used it)
      axios.get('https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=' + limit + '&full=false', { timeout: 20000 }),
      axios.get('https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=' + limit, { timeout: 20000 })
    ]);

    // Trending: require at least some likes
    const trending = (trendRes.data || []).filter(m =>
      (m.likes || 0) >= minLikes &&
      !EXCLUDE_TAGS.includes(m.pipeline_tag)
    );

    // New: require at least some downloads to filter pure noise
    const newest = (newRes.data || []).filter(m =>
      (m.downloads || 0) >= 10 &&
      !EXCLUDE_TAGS.includes(m.pipeline_tag)
    );

    // Merge, dedup by modelId
    const seen = new Set();
    const models = [];
    for (const m of [...trending, ...newest]) {
      const key = m.modelId || m.id;
      if (!seen.has(key)) { seen.add(key); models.push(m); }
    }

    const spaces = (spaceRes.data || []).filter(s =>
      (s.likes || 0) >= minLikes
    );

    const toRaw = (item, isSpace) => ({
      name:        item.modelId || item.id,
      description: item.cardData && item.cardData.description || null,
      website_url: 'https://huggingface.co/' + (item.modelId || item.id),
      logo_url:    null,
      source:      'huggingface',
      source_url:  'https://huggingface.co/' + (item.modelId || item.id),
      launch_date: item.createdAt || null,
      tags:        item.tags ? item.tags.slice(0, 8) : [],
      pricing:     'open-source',
      raw:         { likes: item.likes, downloads: item.downloads, pipelineTag: item.pipeline_tag, isSpace }
    });

    return [
      ...models.map(m => toRaw(m, false)),
      ...spaces.map(s => toRaw(s, true))
    ];
  }
}

module.exports = { HuggingFaceSource };
