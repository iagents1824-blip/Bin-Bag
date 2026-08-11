import React from 'react';
import { NewsItem } from '../types';
import { X, ExternalLink, Bookmark, BookmarkCheck, Radio } from 'lucide-react';

interface NewsArticleModalProps {
  news: NewsItem | null;
  onClose: () => void;
  onToggleBookmark: (newsId: string) => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ news, onClose, onToggleBookmark }) => {
  if (!news) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#0A0A0A] max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#4F46E5] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              BINBAG AI WIRE — {news.category}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold border-b border-gray-100 pb-3">
            <span>SOURCE: <span className="text-gray-900 font-bold">{news.source}</span></span>
            <span>DATE: {news.timestamp}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0A0A0A] leading-snug">
            {news.title}
          </h2>

          <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-[#4F46E5] tracking-wider block mb-1">Executive Summary</span>
            <p className="text-xs text-gray-800 leading-relaxed font-medium">{news.summary}</p>
          </div>

          <div className="text-xs text-gray-700 leading-relaxed space-y-3 pt-2">
            <p className="whitespace-pre-line">{news.fullArticle}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => onToggleBookmark(news.id)}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            {news.bookmarked ? <BookmarkCheck className="w-4 h-4 text-[#4F46E5]" /> : <Bookmark className="w-4 h-4" />}
            <span>{news.bookmarked ? 'Saved to Bookmarks' : 'Bookmark Story'}</span>
          </button>

          <a
            href={news.url}
            target="_blank"
            rel="noreferrer"
            className="bg-[#0A0A0A] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <span>Original Source</span>
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </a>
        </div>

      </div>
    </div>
  );
};