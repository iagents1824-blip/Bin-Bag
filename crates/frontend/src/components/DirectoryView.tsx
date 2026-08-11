import React, { useState } from 'react';
import { DirectoryItem, DirectoryCategory } from '../types';
import { ExternalLink, Star, Zap, Plus, Check } from 'lucide-react';

interface DirectoryViewProps {
  items: DirectoryItem[];
  searchQuery: string;
  onAddToCollection?: (item: { title: string; category: string; url?: string; key?: string; price?: number }) => void;
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

export const DirectoryView: React.FC<DirectoryViewProps> = ({ items, searchQuery, onAddToCollection }) => {
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Open Source' | 'Proprietary / API'>('All');
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

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

  const handleSaveItem = (item: DirectoryItem) => {
    onAddToCollection?.({
      title: item.name,
      category: `${item.category} (${item.provider})`,
      url: item.officialUrl,
    });
    setSavedMap(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setSavedMap(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto bg-[#F0EFE9] text-[#0A0A0A]">
      
      {/* Section Header */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] mb-1 block">GLOBAL AI INDEX & DIRECTORY</span>
          <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight">Universal AI Directory</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            A comprehensive, verified directory listing top AI models, developer frameworks, speech engines, and creative tools across the Web.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          <Zap className="w-4 h-4 text-[#4F46E5]" />
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

        {/* License Filter */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-2xl text-xs font-semibold shadow-sm">
          <button
            onClick={() => setTypeFilter('All')}
            className={`px-3 py-1 rounded-xl transition-all ${typeFilter === 'All' ? 'bg-[#0A0A0A] text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('Open Source')}
            className={`px-3 py-1 rounded-xl transition-all ${typeFilter === 'Open Source' ? 'bg-[#4F46E5] text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Open Source
          </button>
          <button
            onClick={() => setTypeFilter('Proprietary / API')}
            className={`px-3 py-1 rounded-xl transition-all ${typeFilter === 'Proprietary / API' ? 'bg-[#0A0A0A] text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Proprietary API
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white border border-gray-200/80 rounded-2xl hover:border-gray-300 p-5 flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              {/* Top Bar: Provider & Type Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-semibold text-gray-400">
                  {item.provider}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  item.type === 'Open Source'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {item.type}
                </span>
              </div>

              {/* Name */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-lg font-bold text-[#0A0A0A] group-hover:text-[#4F46E5] transition-colors">
                  {item.name}
                </h3>
                <button
                  onClick={() => handleSaveItem(item)}
                  title="Save to Collection"
                  className={`p-1.5 rounded-full border transition-all shrink-0 ${
                    savedMap[item.id]
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-[#0A0A0A] hover:text-white'
                  }`}
                >
                  {savedMap[item.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-4 leading-relaxed line-clamp-3">
                {item.description}
              </p>

              {/* Technical Specs */}
              <div className="space-y-1.5 mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600">
                {item.contextWindow && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Context Window:</span>
                    <span className="text-[#0A0A0A] font-bold">{item.contextWindow}</span>
                  </div>
                )}
                {item.parameters && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parameters:</span>
                    <span className="text-[#0A0A0A] font-bold">{item.parameters}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Pricing Model:</span>
                  <span className="text-[#4F46E5] font-bold">{item.pricing}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {item.tags.map(t => (
                  <span key={t} className="text-[10px] bg-gray-100 border border-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Row */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{item.rating} Rating</span>
              </span>

              <a
                href={item.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0A0A0A] hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};