'use strict';
const axios = require('axios');

module.exports = async function fetchDevTo(config, existing) {
  const [aiRes, mlRes] = await Promise.all([
    axios.get('https://dev.to/api/articles?tag=ai&per_page=50', { timeout: 15000 }),
    axios.get('https://dev.to/api/articles?tag=machinelearning&per_page=50', { timeout: 15000 })
  ]);

  const combined = [...aiRes.data, ...mlRes.data];
  const existingUrls = new Set((existing || []).map(i => i.url));
  const newArticles = [];

  for (const article of combined) {
    const url = article.canonical_url || article.url;
    if (!url || existingUrls.has(url)) continue;
    existingUrls.add(url);
    newArticles.push({
      id: String(article.id),
      title: article.title,
      summary: article.description || article.title,
      timestamp: article.published_at,
      source: article.user && article.user.name ? article.user.name : 'Dev.to',
      url,
      tag: article.tag_list && article.tag_list[0] ? article.tag_list[0] : 'ai',
      impactLevel: 'Medium',
      category: 'Open Source'
    });
  }

  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const merged = [...newArticles, ...(existing || [])]
    .filter(a => a.timestamp ? new Date(a.timestamp).getTime() > cutoff : true)
    .slice(0, 100);

  return { data: merged, newCount: newArticles.length };
};