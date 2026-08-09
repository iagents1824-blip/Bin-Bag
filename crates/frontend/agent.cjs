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
            id: model._id || model.modelId,
            title: model.modelId,
            tagline: model.pipeline_tag ? `Pipeline: ${model.pipeline_tag}` : 'HuggingFace Model',
            description: 'A popular trending model fetched live from HuggingFace. ' + (model.pipeline_tag ? `Optimized for ${model.pipeline_tag}.` : ''),
            category: 'Full Model Weights',
            price: 0,
            creator: {
                name: model.author || 'Community',
                handle: `@${model.author || 'hf_community'}`,
                verified: true,
                avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${model.author || 'hf'}`
            },
            stats: {
                downloads: model.downloads || 0,
                rating: 4.8,
                reviewCount: Math.floor(Math.random() * 100),
                efficiencyScore: 'A'
            },
            tags: model.tags ? model.tags.slice(0, 4) : ['AI'],
            specs: {
                framework: 'PyTorch',
                format: 'Safetensors'
            },
            downloadUrl: `https://huggingface.co/${model.modelId}`,
            createdAt: new Date().toISOString(),
            featured: false
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
