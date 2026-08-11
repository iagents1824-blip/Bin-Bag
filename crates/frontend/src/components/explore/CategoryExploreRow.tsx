import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { AICompany } from '../../data/mockAIData';
import { CompanyCard } from '../cards/CompanyCard';

interface CategoryExploreRowProps {
  title: string;
  companies: AICompany[];
  onCompanyClick?: (company: AICompany) => void;
  onSeeAll?: () => void;
}

export const CategoryExploreRow: React.FC<CategoryExploreRowProps> = ({ title, companies, onCompanyClick, onSeeAll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#0A0A0A] text-lg">{title}</h2>
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          See all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {companies.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={() => onCompanyClick?.(company)}
            compact
          />
        ))}
      </div>
    </section>
  );
};
