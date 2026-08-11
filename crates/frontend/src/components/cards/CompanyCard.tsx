import React, { useState } from 'react';
import { Star, Users } from 'lucide-react';
import { AICompany, formatFollowers } from '../../data/mockAIData';

interface CompanyCardProps {
  company: AICompany;
  onClick?: () => void;
  compact?: boolean;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick, compact }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-3 p-4 shrink-0"
      style={compact ? { width: 260 } : {}}
      onClick={onClick}
    >
      {/* Logo */}
      <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
        {!logoError ? (
          <img src={company.logo} alt={company.name} onError={() => setLogoError(true)} className="w-full h-full object-contain p-1.5" />
        ) : (
          <span className="text-lg font-black text-gray-400">{company.name[0]}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0A0A0A] text-sm truncate">{company.name}</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 text-white"
            style={{ backgroundColor: company.categoryColor }}
          >
            {company.categoryBadge}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
            <Users className="w-2.5 h-2.5" /> {formatFollowers(company.followers)}
          </span>
          <span className="text-[10px] text-gray-500">{company.toolCount} tools</span>
          <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> {company.rating}
          </span>
          <span className="text-[10px] text-gray-400">·{company.joinedYearsAgo}y</span>
        </div>
      </div>
    </div>
  );
};
