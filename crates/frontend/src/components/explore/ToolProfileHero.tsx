import React, { useState } from 'react';
import { Star, Users, Bell, CheckCircle } from 'lucide-react';
import { AICompany, formatFollowers } from '../../data/mockAIData';
import { ListingCard } from '../cards/ListingCard';

const TABS = ['Overview', 'Features', 'Pricing', 'Reviews', 'Alternatives'];

interface ToolProfileHeroProps {
  company: AICompany;
  onToolClick?: (toolId: string) => void;
}

export const ToolProfileHero: React.FC<ToolProfileHeroProps> = ({ company, onToolClick }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [following, setFollowing] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
      {/* Banner */}
      <div className="relative h-52 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        {!bannerError ? (
          <img src={company.banner} alt="" onError={() => setBannerError(true)}
            className="w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Follow button */}
        <button
          onClick={() => setFollowing(f => !f)}
          className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md ${
            following
              ? 'bg-white text-gray-700 border border-gray-200'
              : 'bg-[#0A0A0A] text-white hover:bg-gray-800'
          }`}
        >
          {following ? <CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> : <Bell className="w-3.5 h-3.5" />}
          {following ? 'Following' : 'Follow'}
        </button>

        {/* Discount / New banner badge */}
        <div className="absolute bottom-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
          <span className="text-base">🔥</span> New tools this week!
        </div>
      </div>

      {/* Company info row */}
      <div className="px-6 py-5 flex items-start gap-4">
        {/* Logo — overlapping banner */}
        <div className="w-16 h-16 -mt-10 bg-white rounded-2xl border-2 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
          {!logoError ? (
            <img src={company.logo} alt={company.name} onError={() => setLogoError(true)}
              className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-2xl font-black text-gray-300">{company.name[0]}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-black text-[#0A0A0A] text-xl leading-tight">{company.name}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: company.categoryColor }}>
              {company.categoryBadge}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{company.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" /> <strong className="text-gray-700">{formatFollowers(company.followers)}</strong> followers
            </span>
            <span className="text-xs text-gray-500">
              <strong className="text-gray-700">{company.toolCount}</strong> tools
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <strong className="text-gray-700">{company.rating}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="px-6 border-t border-gray-100">
        <div className="flex gap-1 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-[#0A0A0A] text-[#0A0A0A]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tool grid */}
      <div className="p-6">
        {activeTab === 'Overview' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {company.tools.map(tool => (
              <ListingCard
                key={tool.id}
                tool={tool}
                onClick={() => onToolClick?.(tool.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            {activeTab} content coming soon
          </div>
        )}
      </div>
    </div>
  );
};
