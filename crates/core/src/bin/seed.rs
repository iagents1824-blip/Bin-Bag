use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use bin_bag_core::models::listing::{LicenseType, ListingStatus, ListingType};
use bin_bag_core::models::user::UserRole;
use sqlx::PgPool;
use std::env;
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🌱 Starting Bin Bag Database Seeder...");

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPool::connect(&database_url).await?;

    // Create a password hash for mock users
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(b"password123", &salt)?
        .to_string();

    // 1. Seed Users
    println!("👤 Seeding mock users...");
    
    let seller_id = Uuid::new_v4();
    sqlx::query(
        r#"
        INSERT INTO users (id, email, username, display_name, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        "#
    )
    .bind(seller_id)
    .bind("seller@example.com")
    .bind("DataSorcerer")
    .bind("Data Sorcerer")
    .bind(&password_hash)
    .bind(UserRole::Seller as i16)
    .execute(&pool)
    .await?;

    let buyer_id = Uuid::new_v4();
    sqlx::query(
        r#"
        INSERT INTO users (id, email, username, display_name, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        "#
    )
    .bind(buyer_id)
    .bind("buyer@example.com")
    .bind("ModelEnthusiast")
    .bind("Model Enthusiast")
    .bind(&password_hash)
    .bind(UserRole::Buyer as i16)
    .execute(&pool)
    .await?;

    // For safety, retrieve the seller ID from the DB in case it was already inserted
    #[derive(sqlx::FromRow)]
    struct IdRow { id: Uuid }
    
    let actual_seller_id = sqlx::query_as::<_, IdRow>("SELECT id FROM users WHERE email = 'seller@example.com'")
        .fetch_one(&pool)
        .await?
        .id;

    // 2. Seed Listings
    println!("📦 Seeding mock listings...");
    
    let mock_listings = vec![
        (
            "Llama 3 Finetune (Finance)",
            "A specialized finetune of Llama 3 8B optimized for financial analysis, stock prediction, and quarterly report summarization. Trained on 500k curated financial documents.",
            ListingType::Model,
            "Finance",
            2500, // $25.00
            LicenseType::Proprietary,
        ),
        (
            "Stable Diffusion XL Anime Workflow",
            "A complete ComfyUI workflow for generating ultra-high-quality anime-style images using SDXL. Includes custom nodes for upscale and face detailing.",
            ListingType::Workflow,
            "Image Generation",
            1200, // $12.00
            LicenseType::Custom,
        ),
        (
            "Medical Imaging Corpus 2026",
            "A comprehensive dataset of 10,000 anonymized X-rays and MRIs with bounding box annotations for anomaly detection.",
            ListingType::Dataset,
            "Medical",
            15000, // $150.00
            LicenseType::Proprietary,
        ),
        (
            "Ultimate Copywriting Prompt",
            "A massive 2000-token prompt for ChatGPT and Claude that turns the AI into a world-class copywriter. Includes 10 specific frameworks.",
            ListingType::Prompt,
            "Marketing",
            500, // $5.00
            LicenseType::Mit,
        ),
        (
            "CodeAssist Pro",
            "A highly optimized coding assistant model trained on Rust, Python, and Go. Excellent at identifying security vulnerabilities.",
            ListingType::Model,
            "Programming",
            0, // Free
            LicenseType::Apache2,
        ),
        (
            "Customer Support Bot Template",
            "A ready-to-deploy LangChain chatbot template with RAG capabilities built-in. Connects directly to Zendesk and Intercom.",
            ListingType::Chatbot,
            "Customer Service",
            3000, // $30.00
            LicenseType::Proprietary,
        ),
        (
            "Midjourney V6 Photorealism Kit",
            "A collection of 50 meticulously crafted prompts for Midjourney V6 to achieve hyper-realistic photography of people, food, and architecture.",
            ListingType::Prompt,
            "Art",
            800, // $8.00
            LicenseType::Other,
        ),
        (
            "Voice Synthesis Dataset (English - UK)",
            "15 hours of studio-quality voice recordings from 5 different UK accents, perfectly aligned with text transcripts.",
            ListingType::Dataset,
            "Audio",
            4500, // $45.00
            LicenseType::Proprietary,
        ),
        (
            "Auto-Blogger Agent",
            "An autonomous AutoGen agent that researches trending topics and writes SEO-optimized blog posts daily.",
            ListingType::Assistant,
            "Content Creation",
            2000, // $20.00
            LicenseType::Custom,
        ),
        (
            "Quantum Compute Sim V2",
            "A specialized transformer model trained to simulate 5-qubit quantum circuits with 99.9% accuracy.",
            ListingType::Model,
            "Science",
            5000, // $50.00
            LicenseType::Gpl3,
        ),
    ];

    for (title, desc, l_type, cat, price, lic) in mock_listings {
        let listing_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO listings (id, seller_id, title, description, listing_type, category, price_cents, license, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT DO NOTHING
            "#
        )
        .bind(listing_id)
        .bind(actual_seller_id)
        .bind(title)
        .bind(desc)
        .bind(l_type as i16)
        .bind(cat)
        .bind(price)
        .bind(lic as i16)
        .bind(ListingStatus::Active as i16)
        .execute(&pool)
        .await?;
    }

    println!("✅ Database seeding complete!");
    Ok(())
}
