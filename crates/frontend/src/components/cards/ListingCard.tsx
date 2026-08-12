import React, { useState } from 'react';
import { Plus, Bookmark, BookmarkCheck, Star, Check, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AITool } from '../../data/mockAIData';

interface ListingCardProps {
  tool: AITool;
  onClick?: () => void;
  onSave?: (tool: AITool) => void;
  saved?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ tool, onClick, onSave, saved }) => {
  const [imgError, setImgError] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hovered, setHovered] = useState(false);

  const slug = tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const detailPath = `/tool/${slug}`;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(tool);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const isDiscontinued = tool.status === 'discontinued';
  const isBrokenLink = tool.status === 'broken_link';

  // Calculate days since last verified
  let verifiedText = '';
  if (tool.last_verified_at) {
    const days = Math.floor((Date.now() - new Date(tool.last_verified_at).getTime()) / (1000 * 60 * 60 * 24));
    verifiedText = `Verified ${days === 0 ? 'today' : days + 'd ago'}`;
  }

  const renderCardBody = () => {
    if (tool.item_type === 'job') {
      return (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-2.5 rounded-full bg-blue-50 text-blue-700 truncate max-w-[70%]">
            {tool.location || 'Remote'}
          </span>
          <span className="text-[11px] md:text-xs font-semibold text-gray-500">Full-time</span>
        </div>
      );
    }
    
    if (tool.item_type === 'research') {
      return (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-2.5 rounded-full bg-purple-50 text-purple-700 truncate max-w-[70%]">
            {tool.authors || 'Paper'}
          </span>
        </div>
      );
    }
    
    if (tool.item_type === 'event') {
      return (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-2.5 rounded-full bg-orange-50 text-orange-700 truncate max-w-[70%]">
            {tool.event_date || 'Upcoming'}
          </span>
        </div>
      );
    }

    // Default Tool rendering
    return (
      <div className="flex items-center justify-between mt-3">
        <span
          className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-2.5 rounded-full truncate max-w-[60%]"
          style={{
            backgroundColor: tool.pricing === 'Free' ? '#F0FDF4' : tool.pricing === 'Freemium' ? '#EEF2FF' : '#FFF7ED',
            color: tool.pricing === 'Free' ? '#16A34A' : tool.pricing === 'Freemium' ? '#4F46E5' : '#C2410C',
          }}
        >
          {tool.pricing}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[11px] md:text-xs font-semibold text-gray-600">{tool.rating?.toFixed(1) || '0.0'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative group">
      <Link
        to={detailPath}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`block bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all cursor-pointer ${isDiscontinued ? 'opacity-60 grayscale-[50%]' : 'hover:shadow-md hover:-translate-y-0.5'}`}
        onClick={onClick}
      >
      {/* Image */}
      <div className="relative h-36 md:h-44 overflow-hidden bg-gray-100">
        {!imgError ? (
          <img
            src={tool.image || tool.logo}
            alt={tool.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="text-3xl font-black text-indigo-300">{tool.name[0]}</span>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          title="Save to Collection"
          className="absolute top-2 right-2 md:top-3 md:right-3 w-10 h-10 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
        >
          {saved || justSaved
            ? <BookmarkCheck className="w-5 h-5 md:w-4 md:h-4 text-emerald-600" />
            : <Bookmark className="w-5 h-5 md:w-4 md:h-4 text-gray-600" />
          }
        </button>

        {/* Status badges */}
        {isDiscontinued && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <AlertTriangle className="w-3 h-3" /> Discontinued
          </span>
        )}
        {!isDiscontinued && isBrokenLink && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <AlertTriangle className="w-3 h-3" /> Broken Link
          </span>
        )}
        {!isDiscontinued && !isBrokenLink && tool.isNew && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#0A0A0A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}

        {/* Category badge */}
        <span className="absolute bottom-2 left-2 md:bottom-3 md:left-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: '#4F46E5' }}>
          {tool.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-[#0A0A0A] text-[13px] md:text-sm leading-tight truncate">{tool.name}</h3>
              {verifiedText && (
                <div title={verifiedText} className="flex shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                </div>
              )}
            </div>
            <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 truncate">{tool.company}</p>
          </div>
          {/* Plus button */}
          <button
            onClick={handleSaveClick}
            title="Add to Collection"
            className={`w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              justSaved ? 'bg-emerald-600 text-white' : 'bg-[#0A0A0A] text-white hover:bg-indigo-600'
            }`}
          >
            {justSaved ? <Check className="w-5 h-5 md:w-4 md:h-4" /> : <Plus className="w-5 h-5 md:w-4 md:h-4" />}
          </button>
        </div>

        {renderCardBody()}
      </div>
      </Link>
      
      {/* External Link hover overlay */}
      {hovered && !isDiscontinued && !isBrokenLink && (
        <a 
          href={detailPath} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center hover:bg-black hover:scale-110"
          onClick={(e) => e.stopPropagation()}
          title="Open detail page in new tab"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      )}
    </div>
  );
};