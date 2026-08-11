import React, { useState } from 'react';
import { NewsItem } from '../types';
import { Clock, Bookmark, BookmarkCheck, ExternalLink, Radio, Tag } from 'lucide-react';

interface NewsViewProps {
  news: NewsItem[];
  onToggleBookmark: (newsId: string) => void;
  onSelectNews: (item: NewsItem) => void;
  searchQuery: string;
}

const TAG_GRADIENTS: Record<string, string> = {
  ai:              'from-indigo-600 via-purple-600 to-indigo-800',
  machinelearning: 'from-blue-600 via-cyan-600 to-teal-700',
  llm:             'from-emerald-600 via-teal-600 to-emerald-800',
  openai:          'from-slate-800 via-gray-800 to-zinc-900',
  python:          'from-amber-600 via-orange-600 to-red-600',
  deeplearning:    'from-rose-600 via-pink-600 to-purple-700',
  default:         'from-indigo-700 via-purple-700 to-slate-800',
};

function getGradient(tag?: string): string {
  if (!tag) return TAG_GRADIENTS.default;
  const t = tag.toLowerCase().replace(/[^a-z]/g, '');
  return TAG_GRADIENTS[t] ?? TAG_GRADIENTS.default;
}

function formatDate(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface AdaptiveImageProps {
  src?: string | null;
  alt: string;
  tag?: string;
  className?: string;
  overlay?: boolean;
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({ src, alt, tag, className = '', overlay = false }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const gradient = getGradient(tag);
  const showImage = src && !imgFailed;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Radio className="w-8 h-8 text-white/30" />
        </div>
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      )}
    </div>
  );
};

interface FeaturedCardProps {
  item: NewsItem;
  onSelectNews: (item: NewsItem) => void;
  onToggleBookmark: (id: string) => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, onSelectNews, onToggleBookmark }) => (
  <div
    className="relative rounded-3xl overflow-hidden group cursor-pointer h-[420px] md:h-[480px] shadow-sm border border-gray-200"
    onClick={() => onSelectNews(item)}
  >
    <AdaptiveImage
      src={item.coverImage}
      alt={item.title}
      tag={(item as any).tag}
      className="absolute inset-0 w-full h-full"
      overlay
    />
    <div className="absolute top-4 left-4 z-10">
      <span className="bg-[#0A0A0A] text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
        Featured Article
      </span>
    </div>
    <button
      onClick={e => { e.stopPropagation(); onToggleBookmark(item.id); }}
      className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors text-[#0A0A0A] shadow-sm"
    >
      {item.bookmarked
        ? <BookmarkCheck className="w-4 h-4 text-[#4F46E5]" />
        : <Bookmark className="w-4 h-4 text-gray-700" />}
    </button>
    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{item.category}</span>
        <span className="text-white/60 text-xs">·</span>
        <span className="text-xs text-white/80 font-medium">{formatDate(item.timestamp)}</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 drop-shadow-sm">
        {item.title}
      </h2>
      <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{item.summary}</p>
    </div>
  </div>
);

interface SideCardProps {
  item: NewsItem;
  onSelectNews: (item: NewsItem) => void;
}

const SideCard: React.FC<SideCardProps> = ({ item, onSelectNews }) => (
  <div
    className="flex gap-3 items-start group cursor-pointer hover:bg-white p-2.5 rounded-2xl transition-all border border-transparent hover:border-gray-200/80 hover:shadow-sm"
    onClick={() => onSelectNews(item)}
  >
    <div className="shrink-0 w-20 h-16 rounded-xl overflow-hidden border border-gray-200">
      <AdaptiveImage
        src={item.coverImage}
        alt={item.title}
        tag={(item as any).tag}
        className="w-full h-full"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-semibold text-gray-400 uppercase">{formatDate(item.timestamp)}</span>
      </div>
      <h4 className="text-sm font-bold text-[#0A0A0A] leading-snug line-clamp-2 group-hover:text-[#4F46E5] transition-colors">
        {item.title}
      </h4>
    </div>
  </div>
);

interface WeeklyCardProps {
  item: NewsItem;
  onSelectNews: (item: NewsItem) => void;
  onToggleBookmark: (id: string) => void;
}

const WeeklyCard: React.FC<WeeklyCardProps> = ({ item, onSelectNews, onToggleBookmark }) => (
  <div
    className="group rounded-2xl overflow-hidden border border-gray-200/80 bg-white hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col justify-between"
    onClick={() => onSelectNews(item)}
  >
    <div>
      <div className="relative h-44 overflow-hidden">
        <AdaptiveImage
          src={item.coverImage}
          alt={item.title}
          tag={(item as any).tag}
          className="w-full h-full"
        />
        <button
          onClick={e => { e.stopPropagation(); onToggleBookmark(item.id); }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-1.5 rounded-full transition-colors text-gray-700 shadow-sm"
        >
          {item.bookmarked
            ? <BookmarkCheck className="w-4 h-4 text-[#4F46E5]" />
            : <Bookmark className="w-4 h-4 text-gray-700" />}
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-400 font-semibold uppercase">
          <span>{formatDate(item.timestamp)}</span>
        </div>
        <h3 className="text-sm font-bold text-[#0A0A0A] leading-snug line-clamp-2 group-hover:text-[#4F46E5] transition-colors mb-2">
          {item.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.summary}</p>
      </div>
    </div>
    <div className="p-4 pt-0">
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <span className="text-[10px] text-gray-500 font-semibold">{item.source}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs font-bold text-[#4F46E5] hover:text-indigo-700 transition-colors flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" /> Read
        </a>
      </div>
    </div>
  </div>
);

const TAGS = ['All', 'AI', 'Machine Learning', 'LLM', 'Open Source'];

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  onToggleBookmark,
  onSelectNews,
  searchQuery,
}) => {
  const [activeTag, setActiveTag] = useState('All');

  const filtered = news.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q);
    const matchesTag = activeTag === 'All' ||
      (item as any).tag?.toLowerCase().includes(activeTag.toLowerCase()) ||
      item.category.toLowerCase().includes(activeTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  const [featured, ...rest] = filtered;
  const sideItems = rest.slice(0, 4);
  const weeklyItems = rest.slice(4, 16);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0EFE9] text-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page header */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-[#4F46E5] animate-pulse" />
              <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">LIVE AI INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight">Daily News & Insights</h1>
          </div>

          <div className="flex items-center gap-2">
            {TAGS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeTag === t
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >{t}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-24 font-medium">No news articles found.</div>
        ) : (
          <>
            {/* Hero row: Featured + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                {featured && (
                  <FeaturedCard
                    item={featured}
                    onSelectNews={onSelectNews}
                    onToggleBookmark={onToggleBookmark}
                  />
                )}
              </div>

              <div className="lg:col-span-2 flex flex-col gap-2 bg-white/60 border border-gray-200/80 p-3 rounded-3xl">
                {sideItems.map(item => (
                  <SideCard key={item.id} item={item} onSelectNews={onSelectNews} />
                ))}
              </div>
            </div>

            {/* Weekly Top News section */}
            {weeklyItems.length > 0 && (
              <section className="pt-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-[#0A0A0A]">Weekly Top News</h2>
                  <p className="text-sm text-gray-500">
                    Stay updated with the latest AI trends, model releases, and breakthroughs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {weeklyItems.map(item => (
                    <WeeklyCard
                      key={item.id}
                      item={item}
                      onSelectNews={onSelectNews}
                      onToggleBookmark={onToggleBookmark}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};