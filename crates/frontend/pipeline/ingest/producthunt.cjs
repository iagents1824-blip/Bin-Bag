'use strict';
const axios = require('axios');
const { BaseSource } = require('./base.cjs');

const GQL_QUERY = `{
  posts(order: NEWEST, topic: "artificial-intelligence", first: 30) {
    edges {
      node {
        id name tagline description
        website votesCount
        topics { edges { node { name } } }
        createdAt
        thumbnail { url }
      }
    }
  }
}`;

class ProductHuntSource extends BaseSource {
  constructor(config) { super('producthunt', config); }

  async fetchLatest() {
    const token = process.env.PRODUCTHUNT_TOKEN;
    if (!token) {
      console.warn('[producthunt] PRODUCTHUNT_TOKEN not set — skipping.');
      return [];
    }

    const res = await axios.post(
      'https://api.producthunt.com/v2/api/graphql',
      { query: GQL_QUERY },
      { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const posts = res.data && res.data.data && res.data.data.posts
      ? res.data.data.posts.edges.map(e => e.node)
      : [];

    return posts.map(p => ({
      name:        p.name,
      description: p.description || p.tagline,
      website_url: p.website,
      logo_url:    p.thumbnail ? p.thumbnail.url : null,
      source:      'producthunt',
      source_url:  'https://www.producthunt.com/posts/' + (p.slug || p.id),
      launch_date: p.createdAt,
      tags:        p.topics ? p.topics.edges.map(e => e.node.name) : [],
      pricing:     null,
      raw:         { votes: p.votesCount }
    }));
  }
}

module.exports = { ProductHuntSource };
