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
};

export const AI_COMPANIES: AICompany[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: LOGOS.openai,
    banner: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Chatbot',
    categoryColor: '#4F46E5',
    description: 'OpenAI is an AI safety company and the creator of ChatGPT, GPT-4o, DALL-E, Sora and Whisper.',
    followers: 2100000,
    toolCount: 12,
    rating: 4.9,
    joinedYearsAgo: 3,
    tools: [
      { id: 'chatgpt', name: 'ChatGPT', category: 'Chatbot', logo: LOGOS.openai, image: 'https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'The most popular AI chatbot, powered by GPT-4o.', company: 'OpenAI', rating: 4.9, users: 180000000, isFeatured: true, url: 'https://chat.openai.com' },
      { id: 'gpt4', name: 'GPT-4o API', category: 'API', logo: LOGOS.openai, image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop', pricing: 'Paid', pricingColor: '#DC2626', description: 'The GPT-4o API for developers building AI-powered apps.', company: 'OpenAI', rating: 4.8, users: 5000000 },
      { id: 'dalle3', name: 'DALL-E 3', category: 'Image Gen', logo: LOGOS.openai, image: 'https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'State-of-the-art text-to-image generation from OpenAI.', company: 'OpenAI', rating: 4.7, users: 10000000, isNew: true },
      { id: 'sora', name: 'Sora', category: 'Video Gen', logo: LOGOS.openai, image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'AI video generation from text prompts.', company: 'OpenAI', rating: 4.6, users: 3000000, isNew: true },
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
      { id: 'claude', name: 'Claude 4 Sonnet', category: 'Chatbot', logo: LOGOS.anthropic, image: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'Anthropic\'s most intelligent model for complex reasoning tasks.', company: 'Anthropic', rating: 4.9, users: 25000000, isFeatured: true },
      { id: 'claude-api', name: 'Claude API', category: 'API', logo: LOGOS.anthropic, image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop', pricing: 'Paid', pricingColor: '#DC2626', description: 'Production API access to Claude models.', company: 'Anthropic', rating: 4.8, users: 2000000 },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    logo: LOGOS.elevenlabs,
    banner: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Audio',
    categoryColor: '#059669',
    description: 'ElevenLabs creates the most realistic AI voice technology. Used by creators, developers and enterprises.',
    followers: 620000,
    toolCount: 8,
    rating: 4.8,
    joinedYearsAgo: 2,
    tools: [
      { id: 'el-tts', name: 'ElevenLabs TTS', category: 'Audio', logo: LOGOS.elevenlabs, image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'Ultra-realistic text-to-speech in 29 languages.', company: 'ElevenLabs', rating: 4.9, users: 8000000, isFeatured: true, isNew: true },
      { id: 'el-voiceclone', name: 'Voice Cloning', category: 'Audio', logo: LOGOS.elevenlabs, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop', pricing: '$22/mo', pricingColor: '#DC2626', description: 'Clone any voice with as little as 1 minute of audio.', company: 'ElevenLabs', rating: 4.7, users: 3000000, isNew: true },
    ],
  },
  {
    id: 'runway',
    name: 'Runway',
    logo: LOGOS.runway,
    banner: 'https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Video Gen',
    categoryColor: '#7C3AED',
    description: 'Runway is building the tools for the next wave of human creativity with AI-powered video generation.',
    followers: 450000,
    toolCount: 5,
    rating: 4.7,
    joinedYearsAgo: 3,
    tools: [
      { id: 'gen4', name: 'Runway Gen-4', category: 'Video Gen', logo: LOGOS.runway, image: 'https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'State-of-the-art text-to-video and image-to-video generation.', company: 'Runway', rating: 4.8, users: 5000000, isFeatured: true, isNew: true },
    ],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    logo: LOGOS.midjourney,
    banner: 'https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Image Gen',
    categoryColor: '#BE185D',
    description: 'Midjourney is an independent research lab producing AI-generated imagery via text prompts.',
    followers: 1800000,
    toolCount: 3,
    rating: 4.8,
    joinedYearsAgo: 3,
    tools: [
      { id: 'mj-v7', name: 'Midjourney v7', category: 'Image Gen', logo: LOGOS.midjourney, image: 'https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?w=400&auto=format&fit=crop', pricing: '$10/mo', pricingColor: '#DC2626', description: 'The most aesthetically refined AI image generation model.', company: 'Midjourney', rating: 4.9, users: 20000000, isFeatured: true },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    logo: LOGOS.perplexity,
    banner: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    categoryBadge: 'Search',
    categoryColor: '#0891B2',
    description: 'Perplexity is an AI-powered answer engine that provides accurate, trusted, real-time answers.',
    followers: 780000,
    toolCount: 4,
    rating: 4.7,
    joinedYearsAgo: 2,
    tools: [
      { id: 'perp-search', name: 'Perplexity AI', category: 'Search', logo: LOGOS.perplexity, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop', pricing: 'Freemium', pricingColor: '#4F46E5', description: 'AI-powered search with real-time citations and sources.', company: 'Perplexity', rating: 4.7, users: 15000000, isFeatured: true },
    ],
  },
];

export const ALL_TOOLS: AITool[] = AI_COMPANIES.flatMap(c => c.tools);

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: '✦' },
  { id: 'chatbot', label: 'Chatbot', icon: '💬' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'code', label: 'Code', icon: '💻' },
  { id: 'agent', label: 'Agents', icon: '🤖' },
  { id: 'api', label: 'APIs', icon: '⚡' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'writing', label: 'Writing', icon: '✏️' },
];

export function formatFollowers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
