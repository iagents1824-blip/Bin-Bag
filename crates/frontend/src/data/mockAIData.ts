export interface AITool {
  id: string;
  name: string;
  category: string;
  logo: string;
  image: string;
  pricing: string;
  pricingColor: string;
  description: string;
  company: string;
  rating: number;
  users: number;
  isNew?: boolean;
  isFeatured?: boolean;
  url?: string;
  status?: string;
  last_verified_at?: string;
  item_type?: string;
  authors?: string;
  location?: string;
  event_date?: string;
}

export interface AICompany {
  id: string;
  name: string;
  logo: string;
  banner: string;
  categoryBadge: string;
  categoryColor: string;
  description: string;
  followers: number;
  toolCount: number;
  rating: number;
  joinedYearsAgo: number;
  tools: AITool[];
}

const LOGOS: Record<string, string> = {
  openai:     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/320px-OpenAI_Logo.svg.png',
  anthropic:  'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg',
  google:     'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png',
  elevenlabs: 'https://storage.googleapis.com/eleven-public-prod/website/elevenlabs_logo.svg',
  runway:     'https://runway.com/assets/favicon.ico',
  midjourney: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png',
  stability:  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Stability-AI-Logo.svg/320px-Stability-AI-Logo.svg.png',
  meta:       'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Meta_Platforms_Inc._logo.svg/320px-Meta_Platforms_Inc._logo.svg.png',
  mistral:    'https://mistral.ai/favicon.ico',
  perplexity: 'https://www.perplexity.ai/favicon.ico',
  cursor:     'https://cursor.com/favicon.ico',
  huggingface:'https://huggingface.co/front/assets/huggingface_logo-feed.svg',
  synthesia:  'https://www.synthesia.io/favicon.ico',
  assemblyai: 'https://www.assemblyai.com/favicon.ico',
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop',
];

export const AI_COMPANIES: AICompany[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: LOGOS.openai,
    banner: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Chatbot',
    categoryColor: '#4F46E5',
    description: 'OpenAI is an AI safety company and creator of ChatGPT, GPT-4o, DALL-E, Sora and Whisper.',
    followers: 2100000,
    toolCount: 12,
    rating: 4.9,
    joinedYearsAgo: 3,
    tools: [
      { id: 'chatgpt', name: 'ChatGPT', category: 'Chatbot', logo: LOGOS.openai, image: SAMPLE_IMAGES[0], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'The most popular AI chatbot, powered by GPT-4o.', company: 'OpenAI', rating: 4.9, users: 180000000, isFeatured: true, url: 'https://chat.openai.com' },
      { id: 'gpt4', name: 'GPT-4o API', category: 'API', logo: LOGOS.openai, image: SAMPLE_IMAGES[1], pricing: 'Paid', pricingColor: '#DC2626', description: 'The GPT-4o API for developers building AI-powered apps.', company: 'OpenAI', rating: 4.8, users: 5000000 },
      { id: 'dalle3', name: 'DALL-E 3', category: 'Image Gen', logo: LOGOS.openai, image: SAMPLE_IMAGES[2], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'State-of-the-art text-to-image generation from OpenAI.', company: 'OpenAI', rating: 4.7, users: 10000000, isNew: true },
      { id: 'sora', name: 'Sora', category: 'Video Gen', logo: LOGOS.openai, image: SAMPLE_IMAGES[3], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'AI video generation from text prompts.', company: 'OpenAI', rating: 4.6, users: 3000000, isNew: true },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: LOGOS.anthropic,
    banner: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Chatbot',
    categoryColor: '#D97706',
    description: 'Anthropic builds reliable, interpretable, and steerable AI systems. Creator of Claude.',
    followers: 980000,
    toolCount: 6,
    rating: 4.8,
    joinedYearsAgo: 2,
    tools: [
      { id: 'claude', name: 'Claude 3.5 Sonnet', category: 'Chatbot', logo: LOGOS.anthropic, image: SAMPLE_IMAGES[4], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'Anthropic\'s flagship model for coding & complex reasoning.', company: 'Anthropic', rating: 4.9, users: 25000000, isFeatured: true },
      { id: 'claude-api', name: 'Claude API', category: 'API', logo: LOGOS.anthropic, image: SAMPLE_IMAGES[1], pricing: 'Paid', pricingColor: '#DC2626', description: 'Production API access to Claude models.', company: 'Anthropic', rating: 4.8, users: 2000000 },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    logo: LOGOS.elevenlabs,
    banner: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Audio',
    categoryColor: '#059669',
    description: 'ElevenLabs creates the most realistic AI voice technology for creators and enterprises.',
    followers: 620000,
    toolCount: 8,
    rating: 4.8,
    joinedYearsAgo: 2,
    tools: [
      { id: 'el-tts', name: 'ElevenLabs TTS', category: 'Audio', logo: LOGOS.elevenlabs, image: SAMPLE_IMAGES[5], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'Ultra-realistic text-to-speech in 29 languages.', company: 'ElevenLabs', rating: 4.9, users: 8000000, isFeatured: true, isNew: true },
      { id: 'el-voiceclone', name: 'Voice Cloning', category: 'Audio', logo: LOGOS.elevenlabs, image: SAMPLE_IMAGES[6], pricing: '$22/mo', pricingColor: '#DC2626', description: 'Clone any voice with 1 minute of audio.', company: 'ElevenLabs', rating: 4.7, users: 3000000, isNew: true },
    ],
  },
  {
    id: 'runway',
    name: 'Runway',
    logo: LOGOS.runway,
    banner: 'https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Video Gen',
    categoryColor: '#7C3AED',
    description: 'Runway builds AI tools for cinematic video generation and real-time video editing.',
    followers: 450000,
    toolCount: 5,
    rating: 4.7,
    joinedYearsAgo: 3,
    tools: [
      { id: 'gen4', name: 'Runway Gen-4', category: 'Video Gen', logo: LOGOS.runway, image: SAMPLE_IMAGES[7], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'Text-to-video and image-to-video generation engine.', company: 'Runway', rating: 4.8, users: 5000000, isFeatured: true, isNew: true },
    ],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    logo: LOGOS.midjourney,
    banner: 'https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Image Gen',
    categoryColor: '#BE185D',
    description: 'Midjourney is an independent lab producing high-aesthetic AI imagery.',
    followers: 1800000,
    toolCount: 3,
    rating: 4.8,
    joinedYearsAgo: 3,
    tools: [
      { id: 'mj-v7', name: 'Midjourney v7', category: 'Image Gen', logo: LOGOS.midjourney, image: SAMPLE_IMAGES[2], pricing: '$10/mo', pricingColor: '#DC2626', description: 'Refined AI image generation model.', company: 'Midjourney', rating: 4.9, users: 20000000, isFeatured: true },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    logo: LOGOS.perplexity,
    banner: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Search',
    categoryColor: '#0891B2',
    description: 'Perplexity is an AI answer engine providing real-time trusted answers with citations.',
    followers: 780000,
    toolCount: 4,
    rating: 4.7,
    joinedYearsAgo: 2,
    tools: [
      { id: 'perp-search', name: 'Perplexity AI', category: 'Search', logo: LOGOS.perplexity, image: SAMPLE_IMAGES[8], pricing: 'Freemium', pricingColor: '#4F46E5', description: 'AI-powered search engine with live citations.', company: 'Perplexity', rating: 4.7, users: 15000000, isFeatured: true },
    ],
  },
  {
    id: 'google',
    name: 'Google AI',
    logo: LOGOS.google,
    banner: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Multimodal',
    categoryColor: '#EA4335',
    description: 'Google AI powers Gemini 1.5 Pro, Imagen 3, Veo video model, and Vertex AI suite.',
    followers: 2400000,
    toolCount: 14,
    rating: 4.8,
    joinedYearsAgo: 4,
    tools: [
      { id: 'gemini-pro', name: 'Gemini 1.5 Pro', category: 'Chatbot', logo: LOGOS.google, image: SAMPLE_IMAGES[9], pricing: 'Freemium', pricingColor: '#4F46E5', description: '2 million token context window multimodal LLM.', company: 'Google AI', rating: 4.8, users: 40000000, isFeatured: true },
      { id: 'imagen-3', name: 'Imagen 3', category: 'Image Gen', logo: LOGOS.google, image: SAMPLE_IMAGES[10], pricing: 'Free', pricingColor: '#16A34A', description: 'Photorealistic image generator with high prompt adherence.', company: 'Google AI', rating: 4.7, users: 12000000, isNew: true },
    ],
  },
  {
    id: 'meta',
    name: 'Meta AI',
    logo: LOGOS.meta,
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Open Source',
    categoryColor: '#0668E1',
    description: 'Meta AI is democratizing AI through open weights models including Llama 3.3 70B.',
    followers: 1950000,
    toolCount: 10,
    rating: 4.9,
    joinedYearsAgo: 3,
    tools: [
      { id: 'llama33', name: 'Llama 3.3 70B', category: 'Open Source', logo: LOGOS.meta, image: SAMPLE_IMAGES[11], pricing: 'Free', pricingColor: '#16A34A', description: 'State-of-the-art open source 70B parameter model.', company: 'Meta AI', rating: 4.9, users: 35000000, isFeatured: true },
    ],
  },
];

// Generate 100+ mock AI tools across 10 categories
const BASE_CATEGORIES = ['Chatbot', 'Audio', 'Video Gen', 'Image Gen', 'Code', 'Agents', 'API', 'Search', 'Writing', 'Document'];
const TECH_NAMES = [
  'Agentic Flow', 'Synthetix LLM', 'VoiceForge AI', 'DeepVision HD', 'CodeCraft Copilot',
  'DataScribe RAG', 'NeuralCanvas 3D', 'PromptPilot', 'OmniSearch AI', 'WhisperStream',
  'QuantModel v4', 'DocuReader OCR', 'VideoFlex FX', 'HyperTranslate', 'AutoBot Studio',
  'ScaleAgent Prime', 'LangPulse Engine', 'VectorMind DB', 'ChromaCode Pro', 'AuraVoice TTS',
  'PixelCraft v2', 'LogicChain AI', 'GenScript Copilot', 'SoraStudio FX', 'SemanticSearch',
  'ApexLLM 70B', 'CognitiveFlow', 'MindGraph AI', 'EchoAudio HD', 'VisionCraft 4K',
];
const PRICINGS = ['Free', 'Freemium', 'Paid', '$15/mo', '$29/mo', 'Open-source'];

const GENERATED_TOOLS: AITool[] = [];

let idCount = 1;
for (let i = 0; i < 110; i++) {
  const cat = BASE_CATEGORIES[i % BASE_CATEGORIES.length];
  const name = `${TECH_NAMES[i % TECH_NAMES.length]} ${Math.floor(i / TECH_NAMES.length) + 1}`;
  const company = AI_COMPANIES[i % AI_COMPANIES.length].name;
  const logo = AI_COMPANIES[i % AI_COMPANIES.length].logo;
  const pricing = PRICINGS[i % PRICINGS.length];
  const rating = +(4.2 + (i % 8) * 0.1).toFixed(1);
  const users = (i + 1) * 125000;

  GENERATED_TOOLS.push({
    id: `tool-gen-${idCount++}`,
    name,
    category: cat,
    logo,
    image: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
    pricing,
    pricingColor: pricing === 'Free' || pricing === 'Open-source' ? '#16A34A' : pricing === 'Freemium' ? '#4F46E5' : '#C2410C',
    description: `High performance ${cat.toLowerCase()} AI tool designed for developers and creators.`,
    company,
    rating,
    users,
    isNew: i % 4 === 0,
    isFeatured: i % 7 === 0,
    url: 'https://binbag.ai',
  });
}

export const ALL_TOOLS: AITool[] = [
  ...AI_COMPANIES.flatMap(c => c.tools),
  ...GENERATED_TOOLS,
];

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: '✦' },
  { id: 'chatbot', label: 'Chatbot', icon: '💬' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'video gen', label: 'Video', icon: '🎬' },
  { id: 'image gen', label: 'Image', icon: '🖼️' },
  { id: 'code', label: 'Code', icon: '💻' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'api', label: 'APIs', icon: '⚡' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'writing', label: 'Writing', icon: '✏️' },
  { id: 'document', label: 'Document', icon: '📄' },
];

export function formatFollowers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}