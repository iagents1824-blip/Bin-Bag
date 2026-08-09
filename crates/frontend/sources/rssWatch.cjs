'use strict';
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

const FEEDS = [
  'https://openai.com/news/rss.xml',
  'https://blog.google/technology/ai/rss/',
  'https://huggingface.co/blog/feed.xml',
  'https://www.marktechpost.com/feed/'
];

const LAUNCH_KEYWORDS = ['introducing', 'announcing', 'launch', 'release', 'unveil', 'debut'];

module.exports = async function fetchRssWatch(config, existing) {
  const seedPath = path.join(__dirname, '..', config.seedFile);
  let seedList = [];
  if (fs.existsSync(seedPath)) {
    seedList = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
  const familyNames = seedList.map(s => s.familyName.toLowerCase());

  const existingLinks = new Set((existing || []).map(c => c.link));
  const newCandidates = [];

  for (const feedUrl of FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items) {
        if (!item.link || existingLinks.has(item.link)) continue;
        const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
        const matchedFamily = familyNames.find(fn => text.includes(fn));
        if (!matchedFamily) continue;
        const isLaunch = LAUNCH_KEYWORDS.some(kw => text.includes(kw));
        if (!isLaunch) continue;

        const seeded = seedList.find(s => s.familyName.toLowerCase() === matchedFamily);
        newCandidates.push({
          headline: item.title,
          link: item.link,
          matchedFamily: seeded.familyName,
          dateFound: new Date().toISOString(),
          publishedDate: item.pubDate || null,
          status: 'pending_review'
        });
        existingLinks.add(item.link);
      }
    } catch (err) {
      console.error(`[rssWatch] Error parsing feed ${feedUrl}:`, err.message);
    }
  }

  const data = [...newCandidates, ...(existing || [])];
  return { data, newCount: newCandidates.length };
};