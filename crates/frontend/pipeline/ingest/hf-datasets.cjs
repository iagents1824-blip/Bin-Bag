'use strict';
const axios = require('axios');
const { BaseSource } = require('./base.cjs');

class HuggingFaceDatasetsSource extends BaseSource {
  constructor(config) { super('hf-datasets', config); }

  async fetchLatest() {
    const limit = this.config.limitPerRun || 30;
    const minLikes = this.config.minLikes || 5;
    try {
      const res = await axios.get(
        `https://huggingface.co/api/datasets?sort=createdAt&direction=-1&limit=${limit}`,
        { timeout: 20000 }
      );
      const datasets = (res.data || []).filter(d => (d.likes || 0) >= minLikes);
      return datasets.map(d => ({
        name:        d.id || d.modelId,
        description: d.cardData?.description || null,
        website_url: `https://huggingface.co/datasets/${d.id}`,
        logo_url:    null,
        source:      'hf-datasets',
        source_url:  `https://huggingface.co/datasets/${d.id}`,
        launch_date: d.createdAt || null,
        tags:        (d.tags || []).slice(0, 6),
        pricing:     'open-source',
        raw:         { likes: d.likes, downloads: d.downloads }
      }));
    } catch (err) {
      console.error('[hf-datasets] Failed:', err.message);
      return [];
    }
  }
}

module.exports = { HuggingFaceDatasetsSource };