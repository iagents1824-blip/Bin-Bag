const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'listings.json');

// Function to fetch top trending models from HuggingFace
async function scrapeHuggingFace() {
    try {
        console.log('[Agent] Fetching latest models from HuggingFace...');
        const response = await axios.get('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20');
        
        const models = response.data.map(model => ({
            id: model._id,
            title: model.modelId,
            description: 'A popular model from HuggingFace. ' + (model.pipeline_tag ? `Pipeline: ${model.pipeline_tag}` : ''),
            price: 'Free',
            author: model.author || 'Community',
            type: 'Model',
            tags: model.tags ? model.tags.slice(0, 3) : ['AI'],
            rating: 5.0,
            downloads: model.downloads || 0,
            isNew: true
        }));

        // Write the data to listings.json
        fs.writeFileSync(dataPath, JSON.stringify(models, null, 2));
        console.log(`[Agent] Successfully scraped and saved ${models.length} models to listings.json`);
    } catch (error) {
        console.error('[Agent] Error scraping HuggingFace:', error.message);
    }
}

function startScrapingAgent() {
    console.log('[Agent] Starting background auto-agent...');
    
    // Run the scraper immediately on startup
    scrapeHuggingFace();

    // Schedule the scraper to run every 1 hour
    cron.schedule('0 * * * *', () => {
        console.log('[Agent] Running scheduled scraping job...');
        scrapeHuggingFace();
    });
}

module.exports = { startScrapingAgent };
