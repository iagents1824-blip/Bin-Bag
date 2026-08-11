'use strict';
const axios = require('axios');
const { BaseSource } = require('./base.cjs');

class GitHubSource extends BaseSource {
  constructor(config) { super('github', config); }

  async fetchLatest() {
    const token    = process.env.GITHUB_TOKEN;
    const headers  = token ? { Authorization: 'Bearer ' + token } : {};
    const topics   = this.config.topics || ['ai-agent', 'llm'];
    const minStars = this.config.minStars || 50;
    const seenIds  = new Set();
    const results  = [];

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const topic of topics) {
      try {
        const res = await axios.get(
          'https://api.github.com/search/repositories?q=topic:' + topic +
          '+created:>' + since + '&sort=stars&order=desc&per_page=20',
          { headers, timeout: 15000 }
        );
        for (const r of res.data.items || []) {
          if (seenIds.has(r.id) || r.stargazers_count < minStars) continue;
          seenIds.add(r.id);
          results.push({
            name:        r.name,
            description: r.description || '',
            website_url: r.homepage || r.html_url,
            logo_url:    r.owner ? r.owner.avatar_url : null,
            source:      'github',
            source_url:  r.html_url,
            launch_date: r.created_at,
            tags:        r.topics || [],
            pricing:     'open-source',
            raw:         { stars: r.stargazers_count, owner: r.owner && r.owner.login }
          });
        }
      } catch (err) {
        console.error('[github] Topic ' + topic + ' failed: ' + err.message);
      }
    }
    return results;
  }
}

module.exports = { GitHubSource };
