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

const newsDataPath = path.join(__dirname, 'data', 'news.json');

async function scrapeDailyNews() {
    try {
        console.log('[Agent] Fetching latest AI news from Dev.to...');
        
        const [aiRes, mlRes] = await Promise.all([
            axios.get('https://dev.to/api/articles?tag=ai&per_page=30'),
            axios.get('https://dev.to/api/articles?tag=machinelearning&per_page=30')
        ]);
        
        const combined = [...aiRes.data, ...mlRes.data];
        
        let existingNews = [];
        if (fs.existsSync(newsDataPath)) {
            try {
                existingNews = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
            } catch (e) {
                console.error('[Agent] Could not read existing news.json, starting fresh.');
            }
        }
        
        const existingUrls = new Set(existingNews.map(item => item.url));
        const newArticles = [];
        
        for (const article of combined) {
            const url = article.canonical_url || article.url;
            if (!existingUrls.has(url)) {
                existingUrls.add(url);
                newArticles.push({
                    id: String(article.id),
                    category: 'Open Source', 
                    title: article.title,
                    summary: article.description || article.title,
                    fullArticle: '', 
                    timestamp: article.published_at,
                    source: article.user?.name || 'Dev.to',
                    impactLevel: 'Medium',
                    url: url,
                    readsCount: article.public_reactions_count || 0
                });
            }
        }
        
        if (newArticles.length === 0) {
            console.log('[Agent] No new news articles found.');
            return;
        }
        
        const updatedNews = [...newArticles, ...existingNews].slice(0, 100);
        
        // Atomic write
        const tmpPath = newsDataPath + '.tmp';
        fs.writeFileSync(tmpPath, JSON.stringify(updatedNews, null, 2));
        fs.renameSync(tmpPath, newsDataPath);
        
        console.log(`[Agent] Successfully scraped and appended ${newArticles.length} new articles to news.json`);
    } catch (error) {
        console.error('[Agent] Error scraping Dev.to news:', error.message);
    }
}

function startScrapingAgent() {
    console.log('[Agent] Starting background auto-agent...');
    
    // Run the scrapers immediately on startup
    scrapeHuggingFace();
    scrapeDailyNews();

    // Schedule the HF scraper to run every 1 hour
    cron.schedule('0 * * * *', () => {
        console.log('[Agent] Running scheduled HF scraping job...');
        scrapeHuggingFace();
    });

    // Schedule the News scraper to run every 12 hours
    cron.schedule('0 */12 * * *', () => {
        console.log('[Agent] Running scheduled News scraping job...');
        scrapeDailyNews();
    });
}

module.exports = { startScrapingAgent };
