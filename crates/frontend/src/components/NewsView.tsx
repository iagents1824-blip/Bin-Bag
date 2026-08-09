import React, { useState } from 'react';
import { NewsItem } from '../types';
import { Clock, Bookmark, BookmarkCheck, ExternalLink, Radio, Tag } from 'lucide-react';

interface NewsViewProps {
  news: NewsItem[];
  onToggleBookmark: (newsId: string) => void;
  onSelectNews: (item: NewsItem) => void;
  searchQuery: string;
}

// ── Adaptive image helpers ──────────────────────────────────────────────────

// Gradient palette keyed by tag keyword — used when no real image exists
const TAG_GRADIENTS: Record<string, string> = {
  ai:             'from-violet-900 via-purple-800 to-indigo-900',
  machinelearning:'from-blue-900 via-cyan-800 to-teal-900',
  llm:            'from-emerald-900 via-green-800 to-teal-900',
  openai:         'from-slate-800 via-gray-700 to-zinc-900',
  python:         'from-yellow-900 via-amber-800 to-orange-900',
  deeplearning:   'from-rose-900 via-red-800 to-pink-900',
  default:        'from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]',
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

// ── Adaptive image component ────────────────────────────────────────────────
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
          <Radio className="w-8 h-8 text-white/10" />
        </div>
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      )}
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

interface FeaturedCardProps {
  item: NewsItem;
  onSelectNews: (item: NewsItem) => void;
  onToggleBookmark: (id: string) => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, onSelectNews, onToggleBookmark }) => (
  <div className="relative rounded-xl overflow-hidden group cursor-pointer h-[420px] md:h-[480px]"
    onClick={() => onSelectNews(item)}>
    <AdaptiveImage
      src={item.coverImage}
      alt={item.title}
      tag={(item as any).tag}
      className="absolute inset-0 w-full h-full"
      overlay
    />
    {/* Featured badge */}
    <div className="absolute top-4 left-4 z-10">
      <span className="bg-white text-black text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
        Featured Post
      </span>
    </div>
    {/* Bookmark */}
    <button
      onClick={e => { e.stopPropagation(); onToggleBookmark(item.id); }}
      className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/70 p-2 rounded-full transition-colors"
    >
      {item.bookmarked
        ? <BookmarkCheck className="w-4 h-4 text-[#00FF41]" />
        : <Bookmark className="w-4 h-4 text-white" />}
    </button>
    {/* Content overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest">{item.category}</span>
        <span className="text-[#888] text-[10px]">·</span>
        <span className="text-[10px] text-[#aaa]">{formatDate(item.timestamp)}</span>
        {(item as any).readingTime && (
          <>
            <span className="text-[#888] text-[10px]">·</span>
            <span className="text-[10px] text-[#aaa]">{(item as any).readingTime} min read</span>
          </>
        )}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 drop-shadow">
        {item.title}
      </h2>
      <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{item.summary}</p>
    </div>
  </div>
);

interface SideCardProps {
  item: NewsItem;
  onSelectNews: (item: NewsItem) => void;
}

const SideCard: React.FC<SideCardProps> = ({ item, onSelectNews }) => (
  <div
    className="flex gap-3 items-start group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
    onClick={() => onSelectNews(item)}
  >
    <div className="shrink-0 w-20 h-16 rounded-lg overflow-hidden">
      <AdaptiveImage
        src={item.coverImage}
        alt={item.title}
        tag={(item as any).tag}
        className="w-full h-full"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] font-mono text-[#888] uppercase">{formatDate(item.timestamp)}</span>
        {(item as any).readingTime && (
          <span className="text-[9px] text-[#666]">· {(item as any).readingTime} min</span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-[#ddd] leading-snug line-clamp-2 group-hover:text-white transition-colors">
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
    className="group rounded-xl overflow-hidden border border-[#1e1e1e] bg-[#0f0f11] hover:border-[#333] transition-all cursor-pointer"
    onClick={() => onSelectNews(item)}
  >
    <div className="relative h-44 overflow-hidden">
      <AdaptiveImage
        src={item.coverImage}
        alt={item.title}
        tag={(item as any).tag}
        className="w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <button
        onClick={e => { e.stopPropagation(); onToggleBookmark(item.id); }}
        className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 p-1.5 rounded-full transition-colors"
      >
        {item.bookmarked
          ? <BookmarkCheck className="w-3.5 h-3.5 text-[#00FF41]" />
          : <Bookmark className="w-3.5 h-3.5 text-white/70" />}
      </button>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2 text-[10px] text-[#666] font-mono uppercase">
        <span>{formatDate(item.timestamp)}</span>
        {(item as any).readingTime && <span>· {(item as any).readingTime} min read</span>}
      </div>
      <h3 className="text-sm font-bold text-[#ddd] leading-snug line-clamp-2 group-hover:text-white transition-colors mb-2">
        {item.title}
      </h3>
      <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">{item.summary}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e1e]">
        <span className="text-[10px] text-[#555] font-mono">{item.source}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-[10px] text-[#888] hover:text-[#00FF41] transition-colors flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" /> Read
        </a>
      </div>
    </div>
  </div>
);

// ── Main View ───────────────────────────────────────────────────────────────

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
    <div className="flex-1 overflow-y-auto bg-[#080809]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-3.5 h-3.5 text-[#00FF41] animate-pulse" />
              <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest">Live AI News</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Daily Intelligence</h1>
          </div>
          {/* Tag filter pills */}
          <div className="hidden md:flex items-center gap-2">
            {TAGS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeTag === t
                    ? 'bg-white text-black'
                    : 'bg-[#121214] text-[#888] border border-[#262626] hover:text-white'
                }`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Mobile tag filter */}
        <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                activeTag === t
                  ? 'bg-white text-black'
                  : 'bg-[#121214] text-[#888] border border-[#262626]'
              }`}
            >{t}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-[#555] py-24">No news articles found.</div>
        ) : (
          <>
            {/* Hero row: Featured + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
              {/* Featured large card */}
              <div className="lg:col-span-3">
                {featured && (
                  <FeaturedCard
                    item={featured}
                    onSelectNews={onSelectNews}
                    onToggleBookmark={onToggleBookmark}
                  />
                )}
              </div>

              {/* Side list */}
              <div className="lg:col-span-2 flex flex-col gap-1 divide-y divide-[#1a1a1a]">
                {sideItems.map(item => (
                  <div key={item.id} className="py-3 first:pt-0">
                    <SideCard item={item} onSelectNews={onSelectNews} />
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Top News section */}
            {weeklyItems.length > 0 && (
              <section>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Weekly Top News</h2>
                  <p className="text-sm text-[#666] max-w-md mx-auto">
                    Stay updated with the latest AI trends, model releases, and research from the community.
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

                {rest.length > 16 && (
                  <div className="text-center mt-8">
                    <span className="text-xs font-mono text-[#555]">
                      Showing {Math.min(filtered.length, 17)} of {filtered.length} articles
                    </span>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};