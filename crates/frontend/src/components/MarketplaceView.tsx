import React, { useState } from 'react';
import { MarketplaceAsset, AssetCategory } from '../types';
import { Download, Star, Zap } from 'lucide-react';

interface MarketplaceViewProps {
  assets: MarketplaceAsset[];
  onSelectAsset: (asset: MarketplaceAsset) => void;
  onQuickBuy: (asset: MarketplaceAsset) => void;
  searchQuery: string;
}

const CATEGORIES: Array<{ label: string; value: AssetCategory | 'All' }> = [
  { label: 'All Marketplace Assets', value: 'All' },
  { label: 'Agentic Workflows', value: 'Agentic Workflow' },
  { label: 'LLM Fine-tunes', value: 'LLM Fine-tune' },
  { label: 'Chatbot Templates', value: 'Chatbot Template' },
  { label: 'LoRA Models', value: 'LoRA Model' },
  { label: 'Prompts & Guardrails', value: 'Prompt & Guardrails' },
  { label: 'Full Model Weights', value: 'Full Model Weights' },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  assets,
  onSelectAsset,
  onQuickBuy,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'newest'>('downloads');

  const filteredAssets = assets
    .filter(asset => {
      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      const matchesPrice = priceFilter === 'All' || (priceFilter === 'Free' ? asset.price === 0 : asset.price > 0);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        asset.title.toLowerCase().includes(q) ||
        asset.tagline.toLowerCase().includes(q) ||
        asset.description.toLowerCase().includes(q) ||
        asset.creator.name.toLowerCase().includes(q) ||
        asset.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesPrice && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return b.stats.downloads - a.stats.downloads;
      if (sortBy === 'rating') return b.stats.rating - a.stats.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto bg-[#F0EFE9] text-[#0A0A0A]">
      
      {/* Header */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] mb-1 block">AI PRODUCT MARKETPLACE</span>
          <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight">Marketplace & Assets</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Acquire production-ready agentic workflows, fine-tuned model weights, high-performance system prompts, and curated datasets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          <Zap className="w-4 h-4 text-[#4F46E5]" />
          <span>{assets.length} Verified Assets</span>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Price Filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-2xl text-xs font-semibold shadow-sm">
            <button
              onClick={() => setPriceFilter('All')}
              className={`px-3 py-1 rounded-xl transition-all ${priceFilter === 'All' ? 'bg-[#0A0A0A] text-white' : 'text-gray-600'}`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter('Free')}
              className={`px-3 py-1 rounded-xl transition-all ${priceFilter === 'Free' ? 'bg-[#4F46E5] text-white' : 'text-gray-600'}`}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter('Paid')}
              className={`px-3 py-1 rounded-xl transition-all ${priceFilter === 'Paid' ? 'bg-[#0A0A0A] text-white' : 'text-gray-600'}`}
            >
              Paid
            </button>
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-2xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
        {filteredAssets.map(asset => (
          <div
            key={asset.id}
            className="bg-white border border-gray-200/80 rounded-2xl hover:border-gray-300 p-5 flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {asset.category}
                </span>
                <span className={`text-xs font-bold ${asset.price === 0 ? 'text-emerald-600' : 'text-[#0A0A0A]'}`}>
                  {asset.price === 0 ? 'Free' : `$${asset.price}`}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0A0A0A] mb-1 group-hover:text-[#4F46E5] transition-colors">
                {asset.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3 leading-snug line-clamp-2">{asset.tagline}</p>

              {/* Creator info */}
              <div className="flex items-center gap-2 mb-4">
                <img src={asset.creator.avatar} alt={asset.creator.name} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs font-semibold text-gray-700">{asset.creator.name}</span>
                {asset.creator.verified && <span className="text-[#4F46E5] text-xs">✓</span>}
              </div>

              {/* Specs pill */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Framework:</span>
                  <span className="font-bold text-gray-800">{asset.specs.framework}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Format:</span>
                  <span className="font-bold text-gray-800">{asset.specs.format}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {asset.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-[10px] bg-gray-100 border border-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {asset.stats.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  {asset.stats.downloads}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectAsset(asset)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Details
                </button>
                <button
                  onClick={() => onQuickBuy(asset)}
                  className="px-3 py-1.5 rounded-xl bg-[#0A0A0A] hover:bg-black text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {asset.price === 0 ? 'Get Free' : 'Acquire'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};