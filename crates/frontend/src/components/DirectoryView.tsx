import React, { useState } from 'react';
import { DirectoryItem, DirectoryCategory } from '../types';
import { ExternalLink, Compass, ShieldCheck, Tag, Star, Zap, Terminal } from 'lucide-react';

interface DirectoryViewProps {
  items: DirectoryItem[];
  searchQuery: string;
}

const CATEGORIES: Array<{ label: string; value: DirectoryCategory | 'All' }> = [
  { label: 'All AI Index', value: 'All' },
  { label: 'Text LLMs', value: 'Text LLMs' },
  { label: 'Multimodal & Vision', value: 'Multimodal & Vision' },
  { label: 'Code & Dev Tools', value: 'Code & Dev Tools' },
  { label: 'Audio & Speech', value: 'Audio & Speech' },
  { label: 'Image & Video', value: 'Image & Video' },
  { label: 'Frameworks', value: 'Frameworks & Infrastructure' },
];

export const DirectoryView: React.FC<DirectoryViewProps> = ({ items, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Open Source' | 'Proprietary / API'>('All');

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.provider.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
      
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF41] mb-2 block">GLOBAL AI INDEX & DIRECTORY</span>
          <h1 className="text-3xl sm:text-4xl font-serif italic mb-2 text-white">Universal AI Index</h1>
          <p className="text-[#888888] text-sm max-w-xl">
            A comprehensive, updated directory listing top AI models, developer frameworks, speech engines, and creative tools available across the internet.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#888888] font-mono">
          <Zap className="w-4 h-4 text-[#00FF41]" />
          <span>{items.length} AI Models & Tools Indexed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Category Pills */}
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

        {/* License Filter */}
        <div className="flex items-center gap-1 bg-[#121214] border border-[#262626] p-0.5 text-[10px] uppercase font-mono">
          <button
            onClick={() => setTypeFilter('All')}
            className={`px-2.5 py-1 ${typeFilter === 'All' ? 'bg-[#262626] text-white' : 'text-[#888888]'}`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('Open Source')}
            className={`px-2.5 py-1 ${typeFilter === 'Open Source' ? 'bg-[#00FF41] text-black font-bold' : 'text-[#888888]'}`}
          >
            Open Source
          </button>
          <button
            onClick={() => setTypeFilter('Proprietary / API')}
            className={`px-2.5 py-1 ${typeFilter === 'Proprietary / API' ? 'bg-[#262626] text-white' : 'text-[#888888]'}`}
          >
            Proprietary API
          </button>
        </div>
      </div>

      {/* Directory Grid matching theme spec */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-[#121214] border border-[#262626] hover:border-[#404040] p-5 flex flex-col transition-all group relative"
          >
            {/* Top Bar: Provider & Type Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#555] font-bold">
                {item.provider}
              </span>
              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${
                item.type === 'Open Source'
                  ? 'bg-[#0A0A0B] text-[#00FF41] border-[#00FF41]'
                  : 'bg-[#0A0A0B] text-[#888888] border-[#262626]'
              }`}>
                {item.type}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-[#00FF41] transition-colors flex items-center justify-between">
              <span>{item.name}</span>
            </h3>

            {/* Description */}
            <p className="text-xs text-[#888888] mb-4 leading-relaxed line-clamp-3">
              {item.description}
            </p>

            {/* Technical Specs */}
            <div className="space-y-1.5 mb-4 bg-[#0A0A0B] border border-[#262626] p-2.5 text-[11px] font-mono text-[#888888]">
              {item.contextWindow && (
                <div className="flex justify-between">
                  <span className="text-[#555]">Context:</span>
                  <span className="text-white font-bold">{item.contextWindow}</span>
                </div>
              )}
              {item.parameters && (
                <div className="flex justify-between">
                  <span className="text-[#555]">Params:</span>
                  <span className="text-white font-bold">{item.parameters}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#555]">Pricing:</span>
                <span className="text-[#00FF41] font-bold">{item.pricing}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {item.tags.map(t => (
                <span key={t} className="text-[9px] bg-[#0D0D0E] border border-[#262626] text-[#888888] px-2 py-0.5">
                  #{t}
                </span>
              ))}
            </div>

            {/* Footer Row */}
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#1a1a1d]">
              <span className="text-[10px] font-mono text-white flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#00FF41] text-[#00FF41]" />
                <span>{item.rating} Rating</span>
              </span>

              <a
                href={item.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-neutral-200 text-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3 text-black" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
