use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/bin_bag".to_string());
    let pool = PgPoolOptions::new().max_connections(5).connect(&database_url).await?;

    let seller_id = Uuid::new_v4();
    let pwhash = "$argon2id$v=19$m=19456,t=2,p=1$X1YwYkh6aHBUdE5mSW8waw$aV0K1x7aYq+DqN8zF/gG8Xw6pXvH2z9w2u3qM0K/s1g";

    // Insert a dummy seller user
    sqlx::query(
        "INSERT INTO users (id, email, username, password_hash, role) VALUES ($1, $2, $3, $4, 'seller') ON CONFLICT DO NOTHING"
    )
    .bind(seller_id)
    .bind("demo@seller.com")
    .bind("DemoSeller")
    .bind(pwhash)
    .execute(&pool).await?;

    // We need to fetch the seller id if it already existed
    let actual_seller: (Uuid,) = sqlx::query_as("SELECT id FROM users WHERE email = 'demo@seller.com'").fetch_one(&pool).await?;
    let s_id = actual_seller.0;

    // Clear old dummy models to keep the marketplace clean and realistic
    sqlx::query("DELETE FROM listings").execute(&pool).await?;
    sqlx::query("DELETE FROM tags").execute(&pool).await?;

    let dummy_listings = vec![
        (
            "Llama 3 (70B Instruct)",
            "Meta's most capable open-source large language model. Highly tuned for instruction following, coding, and reasoning tasks.",
            "model", "LLM", 0, "mit", vec!["Meta", "LLM", "Open Source", "Reasoning"]
        ),
        (
            "Claude 3.5 Sonnet API",
            "Anthropic's fastest and most intelligent model. Unparalleled coding capabilities and visual reasoning via API access.",
            "chatbot", "API", 1500, "proprietary", vec!["Anthropic", "API", "Coding", "Vision"]
        ),
        (
            "GPT-4o API Workflow",
            "Complete OpenAI GPT-4o integration workflow with streaming capabilities, function calling, and structured JSON output.",
            "workflow", "Integration", 2900, "proprietary", vec!["OpenAI", "GPT-4", "Workflow", "JSON"]
        ),
        (
            "Stable Diffusion 3 Medium",
            "Stability AI's most advanced text-to-image open model. Features photorealism, typography generation, and complex prompt adherence.",
            "model", "Image Generation", 0, "custom", vec!["Stable Diffusion", "Art", "Text-to-Image"]
        ),
        (
            "Midjourney v6 Prompt Engineering Course",
            "A comprehensive database of 1,000+ optimized Midjourney v6 prompts for cinematic lighting, character design, and hyper-realism.",
            "prompt", "Art", 3900, "proprietary", vec!["Midjourney", "Prompting", "Design"]
        ),
        (
            "Whisper V3 (Large)",
            "OpenAI's state-of-the-art automatic speech recognition system. Supports multiple languages and translation to English.",
            "model", "Audio", 0, "mit", vec!["Speech-to-Text", "OpenAI", "Audio"]
        ),
        (
            "Mistral Large 2",
            "Mistral AI's flagship frontier model with massive context length and top-tier multilingual coding performance.",
            "model", "LLM", 0, "apache2", vec!["Mistral", "LLM", "Multilingual"]
        ),
        (
            "HuggingFace Fine-Web Dataset",
            "15 Trillion token dataset cleaned and deduplicated for training frontier language models. The ultimate pre-training data.",
            "dataset", "Data", 0, "mit", vec!["Dataset", "Pre-training", "Tokens"]
        ),
        (
            "AutoGPT Autonomous Agent",
            "Experimental open-source application showcasing the capabilities of LLMs to autonomously achieve complex goals.",
            "assistant", "Agent", 0, "mit", vec!["AutoGPT", "Agent", "Autonomous"]
        ),
        (
            "GitHub Copilot Enterprise Integration",
            "Custom workflow setup for injecting proprietary corporate codebases into Copilot's RAG system for Enterprise teams.",
            "workflow", "DevOps", 9900, "proprietary", vec!["GitHub", "Copilot", "Coding"]
        ),
        (
            "Sora Video Generation API Access",
            "Early access API wrapper for OpenAI's Sora text-to-video model. Generates up to 60 seconds of high-fidelity video.",
            "model", "Video Generation", 19900, "proprietary", vec!["Sora", "Video", "Generative AI"]
        ),
        (
            "ElevenLabs Voice Cloning Pipeline",
            "Automated workflow for generating hyper-realistic AI voice clones from 30-second audio samples via the ElevenLabs API.",
            "workflow", "Audio", 4900, "proprietary", vec!["ElevenLabs", "Voice", "TTS"]
        ),
    ];

    for (title, desc, l_type, cat, price, license, tags) in dummy_listings {
        let id = Uuid::new_v4();
        sqlx::query(
            "INSERT INTO listings (id, seller_id, title, description, listing_type, category, price_cents, license, status) VALUES ($1, $2, $3, $4, CAST($5 AS listing_type), $6, $7, CAST($8 AS license_type), 'active')"
        )
        .bind(id)
        .bind(s_id)
        .bind(title)
        .bind(desc)
        .bind(l_type)
        .bind(cat)
        .bind(price)
        .bind(license)
        .execute(&pool).await?;

        for tag in tags {
            let tag_id = Uuid::new_v4();
            sqlx::query(
                "INSERT INTO tags (id, name) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id"
            )
            .bind(tag_id)
            .bind(tag)
            .execute(&pool).await?;
            
            let fetched_tag: (Uuid,) = sqlx::query_as("SELECT id FROM tags WHERE name = $1").bind(tag).fetch_one(&pool).await?;

            sqlx::query(
                "INSERT INTO listing_tags (listing_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING"
            )
            .bind(id)
            .bind(fetched_tag.0)
            .execute(&pool).await?;
        }
        println!("Inserted listing: {}", title);
    }

    for i in 0..20 {
        let order_id = Uuid::new_v4();
        let offset_val = (i % 8) as i64;
        let listing: (Uuid, i32) = sqlx::query_as("SELECT id, price_cents FROM listings LIMIT 1 OFFSET $1").bind(offset_val).fetch_one(&pool).await?;
        
        let q = format!(
            "INSERT INTO orders (id, buyer_id, seller_id, listing_id, price_cents, status, created_at) VALUES ($1, $2, $3, $4, $5, 'completed', NOW() - interval '{} days')",
            i % 14
        );
        sqlx::query(&q)
            .bind(order_id)
            .bind(s_id)
            .bind(s_id) // Using seller_id as buyer_id for dummy data
            .bind(listing.0)
            .bind(listing.1)
            .execute(&pool).await?;
    }

    println!("Seeding complete! Added 8 listings and 20 dummy orders.");
    Ok(())
}
