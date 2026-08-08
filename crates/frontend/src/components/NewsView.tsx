import React, { useState } from 'react';
import { NewsItem, NewsCategory } from '../types';
import { Radio, Bookmark, BookmarkCheck, Share2, ExternalLink, Flame, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';

interface NewsViewProps {
  news: NewsItem[];
  onToggleBookmark: (newsId: string) => void;
  onSelectNews: (item: NewsItem) => void;
  searchQuery: string;
}

const CATEGORIES: Array<{ label: string; value: NewsCategory | 'All' }> = [
  { label: 'All Intelligence', value: 'All' },
  { label: 'Hardware & Compute', value: 'Hardware News' },
  { label: 'Model Releases', value: 'Model Release' },
  { label: 'Policy & EU Act', value: 'Policy Update' },
  { label: 'Research Papers', value: 'Research Paper' },
  { label: 'Open Source Drops', value: 'Open Source' },
];

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  onToggleBookmark,
  onSelectNews,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'All'>('All');

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
      
      {/* Section Header matching theme spec */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF41] mb-2 block flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00FF41]" />
            LIVE AI NEWS CHANNEL BROADCAST
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif italic mb-2 text-white">Daily Intelligence</h1>
          <p className="text-[#888888] text-sm max-w-xl">
            Real-time breaking news, model weight releases, GPU cluster infrastructure updates, and AI regulatory policy streams.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-[#555]">
          <p>SERVER TIME: 08 AUG 2026</p>
          <p className="text-[#00FF41] font-bold">STATUS: STREAM ACTIVE</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* News Feed matching theme spec */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
        {filteredNews.map((item, index) => (
          <div
            key={item.id}
            className={`bg-[#0D0D0E] border p-6 flex flex-col justify-between transition-all group ${
              index === 0 ? 'border-l-4 border-l-white border-y border-r-[#262626]' : 'border-[#262626] hover:border-[#404040]'
            }`}
          >
            <div>
              {/* Category & Timestamp Bar */}
              <div className="flex items-center justify-between mb-3 text-[10px] uppercase font-mono">
                <span className="text-[#888888] font-bold tracking-widest">{item.category}</span>
                <span className="text-[#555]">{item.timestamp}</span>
              </div>

              {/* Title */}
              <h3 
                onClick={() => onSelectNews(item)}
                className="text-lg font-semibold text-white mb-2 leading-snug cursor-pointer group-hover:text-[#00FF41] transition-colors"
              >
                {item.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-[#888888] mb-4 leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Article Footer */}
            <div className="pt-4 border-t border-[#1a1a1d] flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-[#555] uppercase">
                Source: <span className="text-white">{item.source}</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleBookmark(item.id)}
                  className="text-[#888888] hover:text-[#00FF41] transition-colors"
                  title="Bookmark story"
                >
                  {item.bookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-[#00FF41]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => onSelectNews(item)}
                  className="text-[10px] font-mono font-bold uppercase underline tracking-widest text-white hover:text-[#00FF41] transition-colors"
                >
                  Read Full Wire
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
