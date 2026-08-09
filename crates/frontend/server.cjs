const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { startScrapingAgent } = require('./agent.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data', 'listings.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

app.get('/api/listings', (req, res) => {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const listings = JSON.parse(rawData);
        res.json(listings);
    } catch (error) {
        console.error('Error reading listings:', error);
        res.status(500).json({ error: 'Failed to load listings' });
    }
});

// Cache variables for news API
let newsCache = null;
let newsCacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// API Endpoint to get daily news
app.get('/api/news', (req, res) => {
    try {
        const now = Date.now();
        let newsData = [];
        
        // Check cache
        if (newsCache && (now - newsCacheTimestamp < CACHE_DURATION_MS)) {
            newsData = newsCache;
        } else {
            // Read from file
            const newsPath = path.join(__dirname, 'data', 'news.json');
            if (fs.existsSync(newsPath)) {
                const rawData = fs.readFileSync(newsPath, 'utf8');
                newsData = JSON.parse(rawData);
                
                // Update cache
                newsCache = newsData;
                newsCacheTimestamp = now;
            }
        }
        
        // Handle optional ?tag= filter
        const tag = req.query.tag;
        if (tag) {
            const lowerTag = tag.toLowerCase();
            newsData = newsData.filter(article => 
                // Dev.to tags usually don't come through our simple scrape unless mapped to category, 
                // but we can search within title/summary
                article.title.toLowerCase().includes(lowerTag) || 
                article.summary.toLowerCase().includes(lowerTag)
            );
        }
        
        res.json(newsData);
    } catch (error) {
        console.error('Error reading news:', error);
        res.status(500).json({ error: 'Failed to load news' });
    }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    startScrapingAgent();
});
