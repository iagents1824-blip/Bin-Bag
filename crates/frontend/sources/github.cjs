'use strict';
const axios = require('axios');

const TOPICS = ['ai-agent', 'llm-agent', 'agentic', 'langchain', 'crewai', 'autogen', 'ai-workflow'];
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function normalizeRepo(r, status) {
  return {
    id: r.id,
    fullName: r.full_name,
    owner: r.owner ? r.owner.login : 'unknown',
    description: r.description || '',
    stars: r.stargazers_count || 0,
    topics: r.topics || [],
    url: r.html_url,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
    status
  };
}

module.exports = async function fetchGitHub(config, existing) {
  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  const starredResults = [];
  const newResults = [];
  const seenIds = new Set();

  for (const topic of TOPICS) {
    try {
      const [starRes, newRes] = await Promise.all([
        axios.get('https://api.github.com/search/repositories?q=topic:' + topic + '&sort=stars&order=desc&per_page=30', { headers, timeout: 15000 }),
        axios.get('https://api.github.com/search/repositories?q=topic:' + topic + '&sort=created&order=desc&per_page=30', { headers, timeout: 15000 })
      ]);

      for (const r of (starRes.data.items || [])) {
        if (!seenIds.has(r.id)) { seenIds.add(r.id); starredResults.push(normalizeRepo(r, 'established')); }
      }
      for (const r of (newRes.data.items || [])) {
        if (!seenIds.has(r.id)) { seenIds.add(r.id); newResults.push(normalizeRepo(r, 'new')); }
      }
    } catch (err) {
      console.error('[github] Error fetching topic ' + topic + ': ' + err.message);
    }
  }

  const existingNew = (existing && existing.new) ? existing.new : [];
  const existingIds = new Set(existingNew.map(r => r.id));
  const trulyNew = newResults.filter(r => !existingIds.has(r.id));

  const cutoff = Date.now() - THIRTY_DAYS;
  const updatedNew = [...trulyNew, ...existingNew]
    .filter(r => !r.createdAt || new Date(r.createdAt).getTime() > cutoff);

  return { data: { new: updatedNew, established: starredResults }, newCount: trulyNew.length };
};