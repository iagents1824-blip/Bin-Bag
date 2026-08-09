'use strict';
const axios = require('axios');

const QUERY = '{ posts(order: NEWEST, topic: "artificial-intelligence", first: 30) { edges { node { id name tagline description website votesCount topics { edges { node { name } } } createdAt } } } }';

module.exports = async function fetchProductHunt(config, existing) {
  const token = process.env.PRODUCTHUNT_TOKEN;
  if (!token) {
    console.warn('[producthunt] No PRODUCTHUNT_TOKEN set - skipping.');
    return { data: existing || [], newCount: 0 };
  }

  const res = await axios.post(
    'https://api.producthunt.com/v2/api/graphql',
    { query: '{ ' + QUERY + ' }' },
    { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, timeout: 20000 }
  );

  const posts = res.data && res.data.data && res.data.data.posts && res.data.data.posts.edges
    ? res.data.data.posts.edges.map(function(e) { return e.node; })
    : [];
  const existingIds = new Set((existing || []).map(function(i) { return i.id; }));
  const newItems = [];

  for (const post of posts) {
    if (existingIds.has(String(post.id))) continue;
    newItems.push({
      id:           String(post.id),
      name:         post.name,
      tagline:      post.tagline,
      description:  post.description,
      url:          post.website,
      votesCount:   post.votesCount || 0,
      topics:       post.topics && post.topics.edges ? post.topics.edges.map(function(e) { return e.node.name; }) : [],
      discoveredAt: new Date().toISOString(),
      createdAt:    post.createdAt,
      status:       'pending_review'
    });
  }

  return { data: [...newItems, ...(existing || [])], newCount: newItems.length };
};