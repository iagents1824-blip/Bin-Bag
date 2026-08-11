import React, { useState } from 'react';
import { Plus, Bookmark, BookmarkCheck, Star, Check } from 'lucide-react';
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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(tool);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-36 md:h-44 overflow-hidden bg-gray-100">
        {!imgError ? (
          <img
            src={tool.image}
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

        {/* Save button - larger touch target on mobile */}
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

        {/* NEW badge */}
        {tool.isNew && (
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
            <h3 className="font-bold text-[#0A0A0A] text-[13px] md:text-sm leading-tight truncate">{tool.name}</h3>
            <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 truncate">{tool.company}</p>
          </div>
          {/* Plus button - larger touch target on mobile */}
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

        <div className="flex items-center justify-between mt-3">
          <span
            className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-2.5 rounded-full"
            style={{
              backgroundColor: tool.pricing === 'Free' ? '#F0FDF4' : tool.pricing === 'Freemium' ? '#EEF2FF' : '#FFF7ED',
              color: tool.pricing === 'Free' ? '#16A34A' : tool.pricing === 'Freemium' ? '#4F46E5' : '#C2410C',
            }}
          >
            {tool.pricing}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] md:text-xs font-semibold text-gray-600">{tool.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};