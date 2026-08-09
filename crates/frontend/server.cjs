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

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    startScrapingAgent();
});
