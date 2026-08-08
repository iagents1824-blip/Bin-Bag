import { MarketplaceAsset, CommunityPost, DirectoryItem, NewsItem } from '../types';

export const INITIAL_ASSETS: MarketplaceAsset[] = [
  {
    id: 'asset-1',
    title: 'Quant-Fin V4 Agentic Workflow',
    tagline: 'Automated market sentiment & multi-exchange arbitrage execution agent',
    description: 'A high-frequency agentic workflow designed for real-time crypto & equities market analysis. Uses chain-of-thought financial sentiment extraction, order book depth evaluation, and risk-managed execution triggers.',
    category: 'Agentic Workflow',
    price: 149,
    creator: {
      name: 'Dr. Marcus Vance',
      handle: 'quant_vance',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    stats: {
      downloads: 1420,
      rating: 4.9,
      reviewCount: 184,
      efficiencyScore: '98% Latency Reduction',
    },
    tags: ['FinTech', 'n8n', 'LangChain', 'Trading', 'Sentiment'],
    specs: {
      framework: 'LangGraph / Python',
      format: 'JSON & Python Package',
      contextWindow: '128k Tokens',
      baseModel: 'Gemini 1.5 Pro / GPT-4o',
    },
    systemPromptPreview: `You are Quant-Fin V4, a disciplined hedge fund analyst AI. Process raw order book updates and news streams. Never execute trades unless confidence metrics exceed 0.94 and VaR calculation is within strict risk boundaries.`,
    demoInputPlaceholder: 'Analyze BTC/USDT price action with recent Federal Reserve rate decisions...',
    sampleOutput: `[QUANT-FIN V4 ANALYSIS REPORT]
Sentiment Score: 0.82 (Bullish Shift)
Liquidity Depth: High ($42M bid cushion)
Recommended Action: Allocate 2.5% portfolio to 48-hour arbitrage window with target +3.4% delta.`,
    downloadUrl: 'https://github.com/binbag/quant-fin-v4/releases/v4.2.0.zip',
    createdAt: '2026-08-01',
    featured: true,
  },
  {
    id: 'asset-2',
    title: 'Legal-Mind 7B Fine-tune',
    tagline: 'Fine-tuned on 40,000 corporate contracts & IP jurisprudence',
    description: 'An enterprise-grade specialized GGUF and Safetensors fine-tune designed for paralegals and legal ops teams. Automatically flags non-compete indemnities, breach thresholds, and liability caps.',
    category: 'LLM Fine-tune',
    price: 89,
    creator: {
      name: 'Aria Sterling, JD',
      handle: 'lex_architect',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    stats: {
      downloads: 980,
      rating: 4.8,
      reviewCount: 92,
      efficiencyScore: 'GGUF Q5_K_M Included',
    },
    tags: ['Legal', 'Contract Analysis', 'Mistral 7B', 'GGUF', 'Safetensors'],
    specs: {
      framework: 'Llama.cpp / Ollama',
      parameters: '7 Billion',
      format: 'Safetensors / GGUF Q4, Q5, Q8',
      contextWindow: '32k Tokens',
      baseModel: 'Mistral-7B-Instruct-v0.3',
    },
    systemPromptPreview: `System: You are Legal-Mind 7B. Review clauses against Delaware Corporate Law standards. Highlight liability exposure in red markdown and draft balanced counter-clauses instantly.`,
    demoInputPlaceholder: 'Paste Non-Disclosure Agreement clause regarding perpetual confidentiality...',
    sampleOutput: `[LEGAL-MIND CLAUSE AUDIT]
Flagged Risk: Section 4.2 enforces an indefinite term for standard trade secrets.
Standard Practice: 3 to 5 year limitation.
Suggested Revision: "Confidentiality obligations shall persist for a period of five (5) years following termination..."`,
    downloadUrl: 'https://huggingface.co/binbag/legal-mind-7b-gguf',
    createdAt: '2026-07-28',
    featured: true,
  },
  {
    id: 'asset-3',
    title: 'Retro-Future XL LoRA Weight',
    tagline: '70s Brutalist Architecture & Neon Cyberpunk Aesthetics',
    description: 'A meticulously trained SDXL LoRA weight that turns architectural renders into 1970s retro-futuristic monoliths with warm analog film grain, brutalist concrete textures, and moody neon backlighting.',
    category: 'LoRA Model',
    price: 25,
    creator: {
      name: 'Kaelen Vance',
      handle: 'synth_artisan',
      verified: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    stats: {
      downloads: 2410,
      rating: 4.9,
      reviewCount: 310,
      efficiencyScore: 'SDXL 1.0 & Flux Compatible',
    },
    tags: ['SDXL', 'LoRA', 'Architecture', 'Brutalism', 'Art Generation'],
    specs: {
      framework: 'ComfyUI / Automatic1111',
      format: '.safetensors',
      baseModel: 'SDXL 1.0 Base',
    },
    demoInputPlaceholder: 'A towering brutalist research station in atmospheric fog, neon light bars, 35mm photography...',
    sampleOutput: 'Render generated with seed 84920194 at 1024x1024 resolution.',
    downloadUrl: 'https://civitai.com/models/retro-future-xl-lora',
    createdAt: '2026-08-03',
    featured: true,
  },
  {
    id: 'asset-4',
    title: 'Ghost-Writer Narrative Engine',
    tagline: 'Dynamic world-building chatbot & RPG branching storyline simulator',
    description: 'A rich chatbot API system prompt & backend orchestration wrapper that tracks inventory, NPC memory states, emotional dynamics, and plot tension vectors in interactive fiction games.',
    category: 'Chatbot Template',
    price: 55,
    creator: {
      name: 'Evelyn Noir',
      handle: 'story_matrix',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    stats: {
      downloads: 870,
      rating: 4.7,
      reviewCount: 68,
      efficiencyScore: 'Multi-Modal Memory',
    },
    tags: ['RPG', 'Chatbot', 'Storytelling', 'State Tracking', 'Python'],
    specs: {
      framework: 'FastAPI / React',
      format: 'TypeScript / Express / Python SDK',
      contextWindow: '64k Tokens',
      baseModel: 'Gemini 1.5 Flash / Claude 3.5 Sonnet',
    },
    systemPromptPreview: `You are Ghost-Writer RPG Core. Maintain state objects [Inventory, Faction Standing, Stress Level]. Append state modifications in JSON blocks at the tail of each narrative response.`,
    demoInputPlaceholder: 'I attempt to lockpick the heavy iron vault door while the guards patrol outside...',
    sampleOutput: `You slide the tension wrench into the tumbler. Click. Click. A sudden heavy footsteps echo down the corridor.
{"state_update": {"stress": +15, "lock_status": "Unlocked", "stealth_check": "Success"}}`,
    downloadUrl: 'https://github.com/binbag/ghost-writer-engine.zip',
    createdAt: '2026-07-15',
  },
  {
    id: 'asset-5',
    title: 'DeepSeek-R1 MedReason Pipeline',
    tagline: 'Medical diagnostic reasoning workflow with medical paper retrieval',
    description: 'A chain-of-thought reasoning pipeline utilizing DeepSeek-R1 and PubMed RAG vector databases to formulate differential diagnosis matrices, treatment options, and interaction warnings.',
    category: 'Agentic Workflow',
    price: 120,
    creator: {
      name: 'BioTech Labs',
      handle: 'biotech_official',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    },
    stats: {
      downloads: 650,
      rating: 4.95,
      reviewCount: 74,
      efficiencyScore: 'PubMed RAG Sync',
    },
    tags: ['Healthcare', 'DeepSeek-R1', 'RAG', 'Chain-of-Thought', 'Medical'],
    specs: {
      framework: 'LlamaIndex / Qdrant',
      format: 'Python / Docker Compose',
      contextWindow: '64k Tokens',
      baseModel: 'DeepSeek-R1-671B / Llama-3.3-70B',
    },
    downloadUrl: 'https://github.com/biotech-labs/medreason-r1.zip',
    createdAt: '2026-08-05',
  },
  {
    id: 'asset-6',
    title: 'Zero-Leak Security Guardrails V2',
    tagline: 'Production-grade prompt injection defender & PII redactor',
    description: 'A lightweight regex & sub-model guardrail layer that prevents prompt injection attacks, system prompt leaks, jailbreaks, and sensitive PII exposure in customer-facing chatbots.',
    category: 'Prompt & Guardrails',
    price: 0, // FREE asset
    creator: {
      name: 'CyberDef AI',
      handle: 'cyberdef_sec',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    stats: {
      downloads: 5120,
      rating: 4.9,
      reviewCount: 420,
      efficiencyScore: '<3ms Latency Impact',
    },
    tags: ['Security', 'Guardrails', 'Free', 'PII Redaction', 'Prompt Injection'],
    specs: {
      framework: 'Middleware JS / Python',
      format: 'NPM Package / PyPI Module',
    },
    downloadUrl: 'https://npmjs.com/package/@cyberdef/zero-leak-guardrails',
    createdAt: '2026-06-20',
  }
];

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    title: 'Reducing quantization loss on Llama-3.3-70B for 4-bit EXL2 & GGUF',
    author: {
      name: 'Elena Rostova',
      handle: 'quant_master',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Core Quantizer',
    },
    type: 'Enhancement Tip',
    content: 'When quantizing 70B models down to 4.25 bits, standard Importance Matrix (imatrix) datasets trained on Wikipedia cause notable perplexity degradation in mathematical reasoning. By replacing the calibration dataset with 10k synthetic Python & LaTeX proofs, we reduced perplexity from 6.42 down to 4.88!',
    codeSnippet: `# Quantize command with custom calibration dataset
llama-quantize --imatrix calibration_math_proofs.dat \\
  ./llama-3.3-70b-fp16.gguf \\
  ./llama-3.3-70b-Q4_K_M.gguf \\
  Q4_K_M`,
    tags: ['Llama-3.3', 'Quantization', 'GGUF', 'Optimization'],
    upvotes: 142,
    hasUpvoted: false,
    repliesCount: 18,
    createdAt: '2 hours ago',
    targetModelName: 'Llama-3.3-70B',
    replies: [
      {
        id: 'rep-1',
        author: {
          name: 'Alex Chen',
          handle: 'alex_ml',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        content: 'This is huge! Did you notice any impact on creative writing benchmarks when calibrating heavily on LaTeX math?',
        createdAt: '1 hour ago',
        upvotes: 14,
      },
      {
        id: 'rep-2',
        author: {
          name: 'Elena Rostova',
          handle: 'quant_master',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        content: 'Good question Alex! A 70/30 split between math proofs and high-entropy narrative stories prevents any creative degradation.',
        createdAt: '30 mins ago',
        upvotes: 22,
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Review & Peer Feedback requested: MedReason-R1 PubMed RAG Pipeline',
    author: {
      name: 'BioTech Labs',
      handle: 'neural_architect',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      role: 'AI Researcher',
    },
    type: 'Model Review',
    content: 'We just open-sourced our RAG orchestration for clinical PubMed paper indexing. We are looking for peer feedback on vector chunking strategies (512 token overlap vs semantic sentence splits). Check out the pipeline snippet below.',
    codeSnippet: `from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.embeddings.gemini import GeminiEmbedding

embed_model = GeminiEmbedding(model_name="models/text-embedding-004")
splitter = SemanticSplitterNodeParser(
    buffer_size=1, breakpoint_percentile_threshold=95, embed_model=embed_model
)`,
    tags: ['Medical AI', 'RAG', 'DeepSeek-R1', 'LlamaIndex'],
    upvotes: 89,
    hasUpvoted: true,
    repliesCount: 9,
    createdAt: '5 hours ago',
    targetModelName: 'MedReason-R1',
    replies: [
      {
        id: 'rep-3',
        author: {
          name: 'Dr. Sarah Jenkins',
          handle: 'sarah_md',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        },
        content: 'Tested the semantic splitter on oncology clinical trial PDF abstracts. The precision on dosage references improved significantly over fixed 512-token chunks!',
        createdAt: '3 hours ago',
        upvotes: 31,
      }
    ]
  },
  {
    id: 'post-3',
    title: 'How to bypass context length throttling in local Ollama API instances',
    author: {
      name: 'DevOps_Dan',
      handle: 'dan_ops',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Infrastructure Lead',
    },
    type: 'Support Request',
    content: 'Default Ollama Modelfiles cap `num_ctx` at 2048 tokens unless explicitly overriden in your request payload or custom Modelfile. Here is how to lock `num_ctx` to 32768 tokens permanently.',
    codeSnippet: `FROM llama3.3:70b
PARAMETER num_ctx 32768
PARAMETER num_predict 4096
PARAMETER temperature 0.2`,
    tags: ['Ollama', 'Local LLM', 'DevOps', 'Context Window'],
    upvotes: 215,
    hasUpvoted: false,
    repliesCount: 24,
    createdAt: '1 day ago',
    replies: []
  }
];

export const INITIAL_DIRECTORY: DirectoryItem[] = [
  {
    id: 'dir-1',
    name: 'Gemini 1.5 Pro & Flash',
    provider: 'Google DeepMind',
    category: 'Multimodal & Vision',
    type: 'Proprietary / API',
    description: 'Groundbreaking 2-Million token context window supporting native audio, 1-hour video, codebases, and ultra-fast structured outputs.',
    pricing: '$1.25 / 1M input tokens',
    rating: 4.95,
    officialUrl: 'https://ai.google.dev/',
    contextWindow: '2,000,000 Tokens',
    parameters: 'MoE Architecture',
    tags: ['Audio', 'Video', '2M Context', 'Multimodal', 'Google'],
    featured: true,
  },
  {
    id: 'dir-2',
    name: 'DeepSeek R1',
    provider: 'DeepSeek AI',
    category: 'Text LLMs',
    type: 'Open Source',
    description: 'State-of-the-art open-weights reasoning model using reinforcement learning without initial supervised fine-tuning. Outperforms commercial benchmarks in math and logic.',
    pricing: 'Free / MIT License (API: $0.55 / 1M tokens)',
    rating: 4.92,
    officialUrl: 'https://www.deepseek.com/',
    contextWindow: '128,000 Tokens',
    parameters: '671 Billion (37B active)',
    tags: ['Reasoning', 'Open Source', 'Math', 'MIT License'],
    featured: true,
  },
  {
    id: 'dir-3',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'Text LLMs',
    type: 'Proprietary / API',
    description: 'Leading model for complex software engineering, nuance, multi-step agentic workflows, and document analysis with Artifacts support.',
    pricing: '$3.00 / 1M input tokens',
    rating: 4.9,
    officialUrl: 'https://www.anthropic.com/claude',
    contextWindow: '200,000 Tokens',
    tags: ['Coding', 'Agents', 'API', 'Anthropic'],
    featured: true,
  },
  {
    id: 'dir-4',
    name: 'Flux.1 Schnell & Dev',
    provider: 'Black Forest Labs',
    category: 'Image & Video',
    type: 'Open Source',
    description: '12-Billion parameter rectified flow transformer image generation model capable of photorealistic text rendering and hands anatomy.',
    pricing: 'Free / Apache 2.0 (Schnell)',
    rating: 4.88,
    officialUrl: 'https://blackforestlabs.ai/',
    parameters: '12 Billion',
    tags: ['Image Gen', 'Flux', 'Text Rendering', 'Open Weights'],
  },
  {
    id: 'dir-5',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta AI',
    category: 'Text LLMs',
    type: 'Open Source',
    description: 'Meta’s flagship 70B open weights model delivering performance matching previous 405B dense models at a fraction of compute inference cost.',
    pricing: 'Free / Meta Llama License',
    rating: 4.89,
    officialUrl: 'https://www.llama.com/',
    contextWindow: '128,000 Tokens',
    parameters: '70 Billion',
    tags: ['Meta', 'Open Source', 'Self-Hosted', '70B'],
  },
  {
    id: 'dir-6',
    name: 'Cursor AI IDE',
    provider: 'Anysphere',
    category: 'Code & Dev Tools',
    type: 'Proprietary / API',
    description: 'AI-first code editor built on VS Code with background indexing, multi-file edits, inline terminal debugging, and composer mode.',
    pricing: 'Free Tier / $20/mo Pro',
    rating: 4.93,
    officialUrl: 'https://cursor.com/',
    tags: ['IDE', 'Developer Tools', 'Autopilot', 'VSCode'],
  },
  {
    id: 'dir-7',
    name: 'ElevenLabs Prime Voice',
    provider: 'ElevenLabs',
    category: 'Audio & Speech',
    type: 'Proprietary / API',
    description: 'Ultra-low latency speech synthesis, expressive voice cloning, multilingual dubbing, and real-time conversational WebSockets.',
    pricing: '$0.15 / 1k characters',
    rating: 4.91,
    officialUrl: 'https://elevenlabs.io/',
    tags: ['Text-to-Speech', 'Voice Cloning', 'Audio', 'Realtime'],
  },
  {
    id: 'dir-8',
    name: 'LangChain & LangGraph',
    provider: 'LangChain Inc.',
    category: 'Frameworks & Infrastructure',
    type: 'Open Source',
    description: 'The standard framework for building stateful, multi-actor agentic applications with cyclical graphs and persistence.',
    pricing: 'Free / MIT License',
    rating: 4.82,
    officialUrl: 'https://www.langchain.com/',
    tags: ['Agent Framework', 'Python', 'TypeScript', 'Graphs'],
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    category: 'Hardware News',
    title: 'NVIDIA & Frankfurt Data Centers Deploy Next-Gen H200 Superclusters',
    summary: 'European AI research hubs receive first batch of liquid-cooled H200 141GB HBM3e nodes, unlocking 4.8TB/s memory bandwidth for 100B+ model training.',
    fullArticle: 'Frankfurt, Germany — In a major expansion of European AI compute sovereignty, three cloud infrastructure providers have brought online 12,000 NVIDIA H200 Tensor Core GPUs. With 141GB of HBM3e memory operating at 4.8 terabytes per second, the clusters allow local research institutions to host unquantized 70B to 405B parameter models on a single node without tensor parallelism bottlenecks.',
    timestamp: '08 AUG 2026 — 10:30 GMT',
    source: 'Silicon Frontier',
    impactLevel: 'Critical',
    url: 'https://nvidianews.nvidia.com',
    readsCount: 3820,
  },
  {
    id: 'news-2',
    category: 'Model Release',
    title: 'Google DeepMind Unveils Gemini 2.0 Flash Thinking Experimental',
    summary: 'New experimental architecture incorporates explicit reasoning tokens prior to text generation, scoring 94.2% on MATH-500 and 89.1% on HumanEval.',
    fullArticle: 'Mountain View, CA — Google DeepMind has released Gemini 2.0 Flash Thinking, a lightweight model architecture that exposes step-by-step reasoning logs in real time. The model dynamically scales its internal thinking budget based on query complexity while maintaining sub-second time-to-first-token latency.',
    timestamp: '08 AUG 2026 — 08:15 GMT',
    source: 'DeepMind Blog',
    impactLevel: 'Critical',
    url: 'https://deepmind.google/technologies/gemini/',
    readsCount: 5410,
  },
  {
    id: 'news-3',
    category: 'Policy Update',
    title: 'EU AI Act Enforcement Phase Enters Standard Audit Compliance',
    summary: 'High-risk AI system providers must now register model documentation, training data provenance, and automated red-teaming logs in European central repository.',
    fullArticle: 'Brussels, Belgium — The European Artificial Intelligence Office has activated its online portal for high-risk system compliance. Developers hosting generative models for legal, medical, and financial automated decision-making must submit watermarking protocols and toxicity evaluation benchmarks.',
    timestamp: '07 AUG 2026 — 18:40 GMT',
    source: 'EU Policy Monitor',
    impactLevel: 'High',
    url: 'https://ec.europa.eu/ai-act',
    readsCount: 2190,
  },
  {
    id: 'news-4',
    category: 'Open Source',
    title: 'Mistral AI Releases Open-Source Multimodal Model Weights',
    summary: 'Apache 2.0 licensed vision-language model trained natively on technical diagrams, CAD schematics, and UI screenshots.',
    fullArticle: 'Paris, France — Mistral AI has dropped new open-source multimodal weights. The model natively processes multi-page PDF blueprints, circuit diagrams, and web page screenshots with precise spatial bounding box coordinates.',
    timestamp: '07 AUG 2026 — 14:10 GMT',
    source: 'Mistral AI News',
    impactLevel: 'High',
    url: 'https://mistral.ai/',
    readsCount: 4100,
  }
];
