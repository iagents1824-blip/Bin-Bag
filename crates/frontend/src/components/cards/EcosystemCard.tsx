import React, { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, BookOpen, Briefcase, Database, Calendar, Headphones, GraduationCap, Plus, Check, Star, AlertTriangle } from 'lucide-react';
import { AITool } from '../../data/mockAIData';
import { Link } from 'react-router-dom';

interface EcosystemCardProps {
  tool: AITool;
  onClick?: () => void;
  onSave?: (tool: AITool) => void;
  saved?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  research:  { icon: BookOpen,      color: '#7C3AED', bgColor: '#F5F3FF' },
  learning:  { icon: GraduationCap, color: '#0891B2', bgColor: '#ECFEFF' },
  job:       { icon: Briefcase,     color: '#059669', bgColor: '#ECFDF5' },
  dataset:   { icon: Database,      color: '#D97706', bgColor: '#FFFBEB' },
  event:     { icon: Calendar,      color: '#DC2626', bgColor: '#FEF2F2' },
  podcast:   { icon: Headphones,    color: '#7C3AED', bgColor: '#F5F3FF' },
  framework: { icon: Plus,          color: '#0891B2', bgColor: '#ECFEFF' },
  community: { icon: Star,          color: '#EA4335', bgColor: '#FFF1F0' },
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const EcosystemCard: React.FC<EcosystemCardProps> = ({ tool, onClick, onSave, saved }) => {
  const [justSaved, setJustSaved] = useState(false);
  const [imgError, setImgError] = useState(false);

  const type = tool.item_type || 'tool';
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.research;
  const Icon = cfg.icon;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSave?.(tool);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const isDiscontinued = tool.status === 'discontinued';
  const slug = tool.slug || slugify(tool.name);

  return (
    <Link
      to={`/tool/${slug}`}
      className={`block bg-white rounded-2xl border border-gray-100 shadow-sm transition-all ${
        isDiscontinued ? 'opacity-60 grayscale-[50%]' : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
      }`}
      onClick={onClick}
    >
      {/* Type header bar */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
        >
          <Icon className="w-3 h-3" />
          {type}
        </span>
        <button onClick={handleSave} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          {saved || justSaved
            ? <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            : <Bookmark className="w-4 h-4 text-gray-400" />
          }
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h3 className="font-bold text-[#0A0A0A] text-sm leading-tight mb-1 line-clamp-2">{tool.name}</h3>

        {/* Source / company */}
        <p className="text-[11px] text-gray-400 mb-2 truncate">{tool.company}</p>

        {/* Type-specific fields */}
        {type === 'research' && tool.authors && (
          <p className="text-[11px] text-purple-600 font-medium truncate mb-2">{tool.authors}</p>
        )}
        {type === 'job' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">{tool.location || 'Remote'}</span>
          </div>
        )}
        {type === 'event' && tool.event_date && (
          <div className="flex items-center gap-1 mb-2 text-[11px] text-red-600 font-semibold">
            <Calendar className="w-3 h-3" />
            {new Date(tool.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {/* Description */}
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {tool.short_description || tool.description || ''}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tool.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[9px] font-medium bg-gray-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};