import React, { useState } from 'react';
import { Search, LayoutGrid, List, Bell, ChevronDown } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onToggleListAsset?: () => void;
}

const CATEGORIES = ['All Categories', 'Chatbot', 'Audio', 'Video', 'Image', 'Code', 'Agent', 'API', 'Search', 'Writing'];
const SORT_OPTIONS = ['Newest', 'Most Popular', 'Trending', 'Top Rated', 'Free Only'];

export const TopBar: React.FC<TopBarProps> = ({ searchQuery, setSearchQuery, onToggleListAsset }) => {
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Most Popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-3xl mb-4 shadow-sm border border-gray-100">
      {/* Category dropdown */}
      <div className="relative shrink-0">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      {/* Sort dropdown */}
      <div className="relative shrink-0">
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
        >
          {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for any AI tool..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-2xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder-gray-400"
        />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notification */}
      <button className="relative p-2 rounded-2xl hover:bg-gray-100 transition-colors shrink-0">
        <Bell className="w-4 h-4 text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
      </button>

      {/* List a tool CTA */}
      {onToggleListAsset && (
        <button
          onClick={onToggleListAsset}
          className="shrink-0 bg-[#0A0A0A] text-white text-xs font-semibold px-4 py-2 rounded-2xl hover:bg-gray-800 transition-colors"
        >
          + List Tool
        </button>
      )}
    </div>
  );
};
