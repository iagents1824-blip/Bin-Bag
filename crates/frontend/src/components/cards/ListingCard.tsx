import React, { useState } from 'react';
import { Plus, Bookmark, BookmarkCheck, Star } from 'lucide-react';
import { AITool } from '../../data/mockAIData';

interface ListingCardProps {
  tool: AITool;
  onClick?: () => void;
  onSave?: () => void;
  saved?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ tool, onClick, onSave, saved }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
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

        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); onSave?.(); }}
          className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          {saved
            ? <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
            : <Bookmark className="w-3.5 h-3.5 text-gray-500" />
          }
        </button>

        {/* NEW badge */}
        {tool.isNew && (
          <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}

        {/* Category badge */}
        <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: '#4F46E5' }}>
          {tool.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#0A0A0A] text-sm leading-tight truncate">{tool.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{tool.company}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); }}
            className="w-7 h-7 bg-[#0A0A0A] rounded-full flex items-center justify-center shrink-0 hover:bg-indigo-600 transition-colors ml-2"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: tool.pricing === 'Free' ? '#F0FDF4' : tool.pricing === 'Freemium' ? '#EEF2FF' : '#FFF7ED',
              color: tool.pricing === 'Free' ? '#16A34A' : tool.pricing === 'Freemium' ? '#4F46E5' : '#C2410C',
            }}
          >
            {tool.pricing}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-600">{tool.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
