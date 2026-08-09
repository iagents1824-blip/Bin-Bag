const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

const dataPath = path.join(__dirname, 'data', 'listings.json');
const newsDataPath = path.join(__dirname, 'data', 'news.json');
const broadModelsPath = path.join(__dirname, 'data', 'models.json');
const majorCandidatesPath = path.join(__dirname, 'data', 'major-models-candidates.json');
const majorSeedPath = path.join(__dirname, 'data', 'major-models-seed.json');

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

async function updateModelsList() {
    try {
        console.log('[Agent] Fetching broad tier models from HuggingFace...');
        const [newRes, estRes] = await Promise.all([
            axios.get('https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=50'),
            axios.get('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=50')
        ]);

        const validTags = ['text-generation', 'text-to-image', 'text-to-video', 'image-text-to-text'];

        const fetchedNew = newRes.data
            .filter(m => (m.likes >= 5 || m.downloads >= 1000) && validTags.includes(m.pipeline_tag))
            .map(m => ({
                id: m._id || m.modelId,
                name: m.modelId,
                author: m.author || 'Community',
                pipelineTag: m.pipeline_tag,
                downloads: m.downloads || 0,
                likes: m.likes || 0,
                createdAt: m.createdAt,
                url: `https://huggingface.co/${m.modelId}`,
                status: 'new'
            }));

        const established = estRes.data.map(m => ({
            id: m._id || m.modelId,
            name: m.modelId,
            author: m.author || 'Community',
            pipelineTag: m.pipeline_tag,
            downloads: m.downloads || 0,
            likes: m.likes || 0,
            createdAt: m.createdAt,
            url: `https://huggingface.co/${m.modelId}`,
            status: 'established'
        }));

        let existingModels = { new: [], established: [] };
        if (fs.existsSync(broadModelsPath)) {
            try {
                existingModels = JSON.parse(fs.readFileSync(broadModelsPath, 'utf8'));
            } catch (e) {}
        }

        const existingNewIds = new Set(existingModels.new.map(m => m.id));
        const trulyNew = fetchedNew.filter(m => !existingNewIds.has(m.id));

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const updatedNew = [...trulyNew, ...existingModels.new].filter(m => {
            return new Date(m.createdAt).getTime() > thirtyDaysAgo;
        });

        const updatedModels = {
            new: updatedNew,
            established: established
        };

        const tmpPath = broadModelsPath + '.tmp';
        fs.writeFileSync(tmpPath, JSON.stringify(updatedModels, null, 2));
        fs.renameSync(tmpPath, broadModelsPath);
        
        console.log(`[Agent] Successfully updated models.json (New: ${updatedNew.length}, Established: ${established.length})`);
    } catch (error) {
        console.error('[Agent] Error updating broad models list:', error.message);
    }
}

async function watchMajorModelCandidates() {
    try {
        console.log('[Agent] Watching major model feeds for candidates...');
        
        let seedList = [];
        if (fs.existsSync(majorSeedPath)) {
            seedList = JSON.parse(fs.readFileSync(majorSeedPath, 'utf8'));
        }
        const familyNames = seedList.map(s => s.familyName.toLowerCase());
        const launchKeywords = ['introducing', 'announcing', 'launch', 'release'];

        const feeds = [
            'https://openai.com/news/rss.xml',
            'https://blog.google/technology/ai/rss/',
            'https://huggingface.co/blog/feed.xml',
            'https://www.marktechpost.com/feed/'
        ];

        let candidates = [];
        if (fs.existsSync(majorCandidatesPath)) {
            try {
                candidates = JSON.parse(fs.readFileSync(majorCandidatesPath, 'utf8'));
            } catch (e) {}
        }
        const existingLinks = new Set(candidates.map(c => c.link));

        let newCandidates = [];

        for (const feedUrl of feeds) {
            try {
                const feed = await parser.parseURL(feedUrl);
                for (const item of feed.items) {
                    if (existingLinks.has(item.link)) continue;

                    const textToSearch = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
                    
                    const matchedFamily = familyNames.find(fn => textToSearch.includes(fn));
                    if (!matchedFamily) continue;

                    const isLaunch = launchKeywords.some(kw => textToSearch.includes(kw));
                    if (!isLaunch) continue;

                    newCandidates.push({
                        headline: item.title,
                        link: item.link,
                        matchedFamily: seedList.find(s => s.familyName.toLowerCase() === matchedFamily).familyName,
                        dateFound: new Date().toISOString(),
                        publishedDate: item.pubDate,
                        status: 'pending_review'
                    });
                    existingLinks.add(item.link);
                }
            } catch (err) {
                console.error(`[Agent] Error parsing feed ${feedUrl}:`, err.message);
            }
        }

        if (newCandidates.length > 0) {
            const updatedCandidates = [...newCandidates, ...candidates];
            const tmpPath = majorCandidatesPath + '.tmp';
            fs.writeFileSync(tmpPath, JSON.stringify(updatedCandidates, null, 2));
            fs.renameSync(tmpPath, majorCandidatesPath);
            console.log(`[Agent] Found ${newCandidates.length} new major model candidates.`);
        } else {
            console.log('[Agent] No new major model candidates found.');
        }

    } catch (error) {
        console.error('[Agent] Error watching major models:', error.message);
    }
}

function startScrapingAgent() {
    console.log('[Agent] Starting background auto-agent...');
    
    // Run the scrapers immediately on startup
    scrapeHuggingFace();
    scrapeDailyNews();
    updateModelsList();
    watchMajorModelCandidates();

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

    // Schedule Broad AI Models List - 8 hours
    cron.schedule('0 */8 * * *', () => {
        console.log('[Agent] Running scheduled broad models scraping job...');
        updateModelsList();
    });

    // Schedule Curated Watcher - Daily
    cron.schedule('0 0 * * *', () => {
        console.log('[Agent] Running scheduled major model watcher...');
        watchMajorModelCandidates();
    });
}

module.exports = { startScrapingAgent };
