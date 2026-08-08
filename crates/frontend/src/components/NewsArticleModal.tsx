import React from 'react';
import { NewsItem } from '../types';
import { X, ExternalLink, Bookmark, BookmarkCheck, Share2, Radio } from 'lucide-react';

interface NewsArticleModalProps {
  news: NewsItem | null;
  onClose: () => void;
  onToggleBookmark: (newsId: string) => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ news, onClose, onToggleBookmark }) => {
  if (!news) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0D0E] border border-[#262626] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00FF41] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              NEURAL NEXUS WIRE — {news.category}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#555] border-b border-[#1a1a1d] pb-2">
            <span>SOURCE: <span className="text-white">{news.source}</span></span>
            <span>TIMESTAMP: {news.timestamp}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {news.title}
          </h2>

          <div className="bg-[#121214] border border-[#262626] p-4 text-xs font-mono text-[#00FF41]">
            <span className="text-[9px] uppercase text-[#555] block mb-1">Executive Summary</span>
            <p className="text-[#E2E2E2]">{news.summary}</p>
          </div>

          <div className="text-xs text-[#E2E2E2] leading-relaxed space-y-3 pt-2">
            <p className="whitespace-pre-line">{news.fullArticle}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#262626] bg-[#0A0A0B] flex items-center justify-between">
          <button
            onClick={() => onToggleBookmark(news.id)}
            className="flex items-center gap-2 text-xs font-mono text-[#888888] hover:text-[#00FF41]"
          >
            {news.bookmarked ? <BookmarkCheck className="w-4 h-4 text-[#00FF41]" /> : <Bookmark className="w-4 h-4" />}
            <span>{news.bookmarked ? 'Saved to Bookmarks' : 'Bookmark Story'}</span>
          </button>

          <a
            href={news.url}
            target="_blank"
            rel="noreferrer"
            className="bg-white hover:bg-neutral-200 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors font-sans"
          >
            <span>Original Press Release</span>
            <ExternalLink className="w-3.5 h-3.5 text-black" />
          </a>
        </div>

      </div>
    </div>
  );
};
