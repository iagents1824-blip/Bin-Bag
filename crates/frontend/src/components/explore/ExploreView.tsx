import React, { useState } from 'react';
import { TrendingUp, Zap, Crown } from 'lucide-react';
import { AI_COMPANIES, ALL_TOOLS, CATEGORIES, AICompany, AITool } from '../../data/mockAIData';
import { ToolProfileHero } from './ToolProfileHero';
import { ListingCard } from '../cards/ListingCard';
import { CategoryExploreRow } from './CategoryExploreRow';

interface ExploreViewProps {
  searchQuery: string;
  onToolClick?: (toolId: string) => void;
  onAddToCollection?: (item: { title: string; category: string; url?: string; key?: string; price?: number }) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ searchQuery, onToolClick, onAddToCollection }) => {
  const [featuredCompany] = useState<AICompany>(AI_COMPANIES[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [savedTools, setSavedTools] = useState<Set<string>>(new Set());

  const filtered = ALL_TOOLS.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.company.toLowerCase().includes(q);
    const matchCat = activeCategory === 'all' || t.category.toLowerCase().includes(activeCategory);
    return matchQ && matchCat;
  });

  const handleSaveTool = (tool: AITool) => {
    setSavedTools(prev => {
      const next = new Set(prev);
      if (next.has(tool.id)) {
        next.delete(tool.id);
      } else {
        next.add(tool.id);
        onAddToCollection?.({
          title: tool.name,
          category: tool.category,
          price: tool.pricing === 'Free' ? 0 : 49,
          url: `https://binbag.ai/tool/${tool.id}`,
        });
      }
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#0A0A0A] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured company hero */}
      {activeCategory === 'all' && !searchQuery && (
        <ToolProfileHero company={featuredCompany} onToolClick={onToolClick} />
      )}

      {/* Explore categories row */}
      {activeCategory === 'all' && !searchQuery && (
        <CategoryExploreRow
          title="Explore categories"
          companies={AI_COMPANIES}
          onCompanyClick={c => console.log('company', c.id)}
        />
      )}

      {/* Trending / new tools banner */}
      {activeCategory === 'all' && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-gradient-to-br from-[#0A0A0A] to-gray-800 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">New This Week</span>
              </div>
              <h3 className="text-white font-black text-xl mb-1">Just Launched</h3>
              <p className="text-gray-400 text-sm">Discover the freshest AI tools added this week</p>
            </div>
            <button className="bg-white text-[#0A0A0A] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors shrink-0 ml-4">
              Claim it now
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-300" />
              <span className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Featured</span>
            </div>
            <div>
              <p className="text-white font-black text-lg">{ALL_TOOLS.filter(t => t.isFeatured).length}+ Featured tools</p>
              <p className="text-indigo-200 text-xs mt-1">Hand-picked by BinBag editors</p>
            </div>
            <button className="bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors w-fit">
              Browse all
            </button>
          </div>
        </div>
      )}

      {/* Tool grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-[#0A0A0A] text-lg">
              {activeCategory === 'all' ? 'All Tools' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            <span className="text-sm text-gray-400 font-normal">({filtered.length})</span>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">No tools found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(tool => (
              <ListingCard
                key={tool.id}
                tool={tool}
                onClick={() => onToolClick?.(tool.id)}
                onSave={() => handleSaveTool(tool)}
                saved={savedTools.has(tool.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};