import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, Clock, Zap } from 'lucide-react';
import { ALL_TOOLS } from '../data/mockAIData';
import { ListingCard } from './cards/ListingCard';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onToolClick?: (toolId: string) => void;
}

const RECENT_SEARCHES = ['video generator', 'claude 3.5', 'elevenlabs', 'open source llm'];

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({ isOpen, onClose, onToolClick }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? ALL_TOOLS.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) || 
        t.category.toLowerCase().includes(query.toLowerCase()) || 
        t.company.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20)
    : [];

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Search Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100 bg-white shadow-sm">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search AI tools, models, creators..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-gray-100 border-none text-gray-900 text-sm rounded-full pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F0EFE9]">
        {!query.trim() ? (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Recent Searches</h3>
            <div className="space-y-1">
              {RECENT_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="w-full flex items-center gap-3 py-3 text-left bg-white hover:bg-gray-50 rounded-2xl px-4 shadow-sm transition-colors border border-gray-100"
                >
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{term}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-8 bg-indigo-50 rounded-3xl p-5 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-indigo-900 text-sm">Pro Tip</h4>
              </div>
              <p className="text-xs text-indigo-700/80 leading-relaxed">
                Search by category like "video gen", company name like "OpenAI", or use specific keywords to find the exact model weights.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-gray-900">Search Results</h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {filtered.length} found
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(tool => (
                  <ListingCard
                    key={tool.id}
                    tool={tool}
                    onClick={() => {
                      onToolClick?.(tool.id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
