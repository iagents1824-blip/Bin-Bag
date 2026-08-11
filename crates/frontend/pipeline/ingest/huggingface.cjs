'use strict';
const axios = require('axios');
const { BaseSource } = require('./base.cjs');

const VALID_PIPELINE_TAGS = [
  'text-generation', 'text-to-image', 'text-to-video', 'image-text-to-text',
  'text-to-speech', 'automatic-speech-recognition', 'text-to-audio',
  'image-segmentation', 'object-detection'
];

class HuggingFaceSource extends BaseSource {
  constructor(config) { super('huggingface', config); }

  async fetchLatest() {
    const limit = this.config.limitPerRun || 50;
    const minLikes = this.config.minLikes || 5;

    const [newRes, spaceRes] = await Promise.all([
      axios.get('https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=' + limit, { timeout: 20000 }),
      axios.get('https://huggingface.co/api/spaces?sort=createdAt&direction=-1&limit=' + limit, { timeout: 20000 })
    ]);

    const models = (newRes.data || []).filter(m =>
      (m.likes >= minLikes || m.downloads >= 100) &&
      VALID_PIPELINE_TAGS.includes(m.pipeline_tag)
    );

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
