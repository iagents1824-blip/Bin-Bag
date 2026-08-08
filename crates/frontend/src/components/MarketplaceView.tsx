import React, { useState, useMemo } from 'react';
import { MarketplaceAsset, AssetCategory } from '../types';
import { Download, Star, Filter, ShieldCheck, Check, Search, Cpu } from 'lucide-react';

interface MarketplaceViewProps {
  assets: MarketplaceAsset[];
  onSelectAsset: (asset: MarketplaceAsset) => void;
  onQuickBuy: (asset: MarketplaceAsset) => void;
  searchQuery: string;
}

const CATEGORIES: Array<{ label: string; value: AssetCategory | 'All' }> = [
  { label: 'All Items', value: 'All' },
  { label: 'Agentic Workflows', value: 'Agentic Workflow' },
  { label: 'LLM Fine-tunes', value: 'LLM Fine-tune' },
  { label: 'LoRA Models', value: 'LoRA Model' },
  { label: 'Chatbot Templates', value: 'Chatbot Template' },
  { label: 'Prompts & Guardrails', value: 'Prompt & Guardrails' },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  assets,
  onSelectAsset,
  onQuickBuy,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'downloads' | 'price-low' | 'price-high'>('featured');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      const matchesPrice = 
        priceFilter === 'All' ? true :
        priceFilter === 'Free' ? asset.price === 0 :
        asset.price > 0;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        asset.title.toLowerCase().includes(q) ||
        asset.description.toLowerCase().includes(q) ||
        asset.tags.some(t => t.toLowerCase().includes(q)) ||
        asset.category.toLowerCase().includes(q);

      return matchesCategory && matchesPrice && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.stats.rating - a.stats.rating;
      if (sortBy === 'downloads') return b.stats.downloads - a.stats.downloads;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [assets, selectedCategory, priceFilter, sortBy, searchQuery]);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
      
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF41] mb-2 block">VERIFIED AI MARKETPLACE</span>
          <h1 className="text-3xl sm:text-4xl font-serif italic mb-2 text-white">Curated Intelligence</h1>
          <p className="text-[#888888] text-sm max-w-xl">
            The premier marketplace for high-fidelity LLM weights, optimized agentic workflows, LoRAs, fine-tunes, and custom chatbot architectures.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <span className="text-[#555] uppercase font-mono tracking-wider text-[10px]">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#121214] border border-[#262626] text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[#555]"
          >
            <option value="featured">Featured & Curated</option>
            <option value="rating">Highest Rated</option>
            <option value="downloads">Most Downloaded</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 uppercase tracking-wider text-[11px] font-semibold transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-white text-black border-white'
                  : 'bg-[#121214] text-[#888888] border-[#262626] hover:text-white hover:border-[#555]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Free vs Paid Toggle */}
        <div className="flex items-center gap-1 bg-[#121214] border border-[#262626] p-0.5 text-[10px] uppercase font-mono">
          <button
            onClick={() => setPriceFilter('All')}
            className={`px-2.5 py-1 ${priceFilter === 'All' ? 'bg-[#262626] text-white' : 'text-[#888888]'}`}
          >
            All Prices
          </button>
          <button
            onClick={() => setPriceFilter('Paid')}
            className={`px-2.5 py-1 ${priceFilter === 'Paid' ? 'bg-[#262626] text-white' : 'text-[#888888]'}`}
          >
            Paid
          </button>
          <button
            onClick={() => setPriceFilter('Free')}
            className={`px-2.5 py-1 ${priceFilter === 'Free' ? 'bg-[#00FF41] text-black font-bold' : 'text-[#888888]'}`}
          >
            Free
          </button>
        </div>
      </div>

      {/* Assets Grid matching theme spec */}
      {filteredAssets.length === 0 ? (
        <div className="bg-[#121214] border border-[#262626] p-12 text-center my-8">
          <Cpu className="w-8 h-8 text-[#555] mx-auto mb-3" />
          <p className="text-white font-medium text-sm">No AI assets found matching your filter criteria.</p>
          <p className="text-[#888888] text-xs mt-1">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-[#121214] border border-[#262626] hover:border-[#404040] p-5 flex flex-col transition-all group relative"
            >
              {/* Top Row: Category Tag & Price */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase tracking-widest text-[#555] font-bold font-mono">
                  {asset.category}
                </span>
                <span className="text-white font-mono text-sm font-bold bg-[#0D0D0E] px-2 py-0.5 border border-[#262626]">
                  {asset.price === 0 ? (
                    <span className="text-[#00FF41]">FREE</span>
                  ) : (
                    `$${asset.price}`
                  )}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 
                onClick={() => onSelectAsset(asset)}
                className="text-lg font-semibold text-white mb-1.5 cursor-pointer group-hover:text-[#00FF41] transition-colors line-clamp-1"
              >
                {asset.title}
              </h3>
              <p className="text-xs text-[#888888] mb-4 line-clamp-2 leading-relaxed">
                {asset.tagline}
              </p>

              {/* Specs Pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-[9px] bg-[#0A0A0B] border border-[#262626] text-[#888888] px-2 py-0.5 font-mono">
                  {asset.specs.framework}
                </span>
                {asset.specs.parameters && (
                  <span className="text-[9px] bg-[#0A0A0B] border border-[#262626] text-[#888888] px-2 py-0.5 font-mono">
                    {asset.specs.parameters}
                  </span>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f22] text-xs">
                <img
                  src={asset.creator.avatar}
                  alt={asset.creator.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-[#888888] text-[11px] truncate">@{asset.creator.handle}</span>
                {asset.creator.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
                )}
              </div>

              {/* Bottom Row: Efficiency & Actions */}
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-[#00FF41] font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#00FF41] text-[#00FF41]" />
                  <span>{asset.stats.rating} ({asset.stats.reviewCount})</span>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectAsset(asset)}
                    className="text-[10px] uppercase underline tracking-widest text-white hover:text-[#00FF41] transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onQuickBuy(asset)}
                    className="bg-white hover:bg-neutral-200 text-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    {asset.price === 0 ? 'Download' : 'Acquire'}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
