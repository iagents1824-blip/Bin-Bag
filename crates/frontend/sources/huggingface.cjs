'use strict';
const axios = require('axios');

const VALID_TAGS = ['text-generation', 'text-to-image', 'text-to-video', 'image-text-to-text'];
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function normalizeModel(m, status) {
  return {
    id: m._id || m.modelId,
    name: m.modelId,
    author: m.author || 'Community',
    pipelineTag: m.pipeline_tag || 'unknown',
    downloads: m.downloads || 0,
    likes: m.likes || 0,
    createdAt: m.createdAt,
    url: 'https://huggingface.co/' + m.modelId,
    status
  };
}

module.exports = async function fetchHuggingFace(config, existing) {
  const [newRes, estRes] = await Promise.all([
    axios.get('https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=50', { timeout: 20000 }),
    axios.get('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=50', { timeout: 20000 })
  ]);

  const fetchedNew = newRes.data
    .filter(m => (m.likes >= 5 || m.downloads >= 1000) && VALID_TAGS.includes(m.pipeline_tag))
    .map(m => normalizeModel(m, 'new'));

  const established = estRes.data.map(m => normalizeModel(m, 'established'));

  const existingNew = (existing && existing.new) ? existing.new : [];
  const existingIds = new Set(existingNew.map(m => m.id));
  const trulyNew = fetchedNew.filter(m => !existingIds.has(m.id));

  const cutoff = Date.now() - THIRTY_DAYS;
  const updatedNew = [...trulyNew, ...existingNew]
    .filter(m => !m.createdAt || new Date(m.createdAt).getTime() > cutoff);

  return { data: { new: updatedNew, established }, newCount: trulyNew.length };
};