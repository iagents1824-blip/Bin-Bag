export type AssetCategory = 
  | 'Agentic Workflow' 
  | 'LLM Fine-tune' 
  | 'Chatbot Template' 
  | 'LoRA Model' 
  | 'Prompt & Guardrails' 
  | 'Full Model Weights';

export interface MarketplaceAsset {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: AssetCategory;
  price: number; // 0 = Free
  creator: {
    name: string;
    handle: string;
    verified: boolean;
    avatar: string;
  };
  stats: {
    downloads: number;
    rating: number;
    reviewCount: number;
    efficiencyScore: string;
  };
  tags: string[];
  specs: {
    framework: string;
    parameters?: string;
    format: string;
    contextWindow?: string;
    baseModel?: string;
  };
  systemPromptPreview?: string;
  demoInputPlaceholder?: string;
  sampleOutput?: string;
  downloadUrl: string;
  createdAt: string;
  featured?: boolean;
}

export type CommunityPostType = 
  | 'Model Review' 
  | 'Enhancement Tip' 
  | 'Bug Report' 
  | 'Showcase' 
  | 'Support Request';

export interface CommunityReply {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  upvotes: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    role: string;
  };
  type: CommunityPostType;
  content: string;
  codeSnippet?: string;
  tags: string[];
  upvotes: number;
  hasUpvoted?: boolean;
  repliesCount: number;
  createdAt: string;
  replies: CommunityReply[];
  targetModelName?: string;
}

export type DirectoryCategory = 
  | 'Text LLMs' 
  | 'Multimodal & Vision' 
  | 'Code & Dev Tools' 
  | 'Audio & Speech' 
  | 'Image & Video' 
  | 'Frameworks & Infrastructure';

export interface DirectoryItem {
  id: string;
  name: string;
  provider: string;
  category: DirectoryCategory;
  type: 'Open Source' | 'Proprietary / API' | 'Hybrid';
  description: string;
  pricing: string;
  rating: number;
  officialUrl: string;
  parameters?: string;
  contextWindow?: string;
  tags: string[];
  featured?: boolean;
}

export type NewsCategory = 
  | 'Hardware News' 
  | 'Model Release' 
  | 'Policy Update' 
  | 'Research Paper' 
  | 'Open Source';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title: string;
  summary: string;
  fullArticle: string;
  timestamp: string;
  source: string;
  impactLevel: 'Critical' | 'High' | 'Medium';
  url: string;
  coverImage?: string;
  bookmarked?: boolean;
  readsCount: number;
}

export interface VaultPurchase {
  id: string;
  assetId: string;
  assetTitle: string;
  assetCategory: string;
  purchaseDate: string;
  amountPaid: number;
  licenseKey: string;
  apiEndpoint: string;
  downloadUrl: string;
}
