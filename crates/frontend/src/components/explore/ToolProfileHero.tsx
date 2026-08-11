import React, { useState } from 'react';
import { Star, Users, Bell, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';
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

  const officialUrl = company.tools[0]?.url || `https://binbag.ai/go/${company.id}`;

  const handleVisitOfficialSite = () => {
    window.open(`/go/${company.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
      {/* Banner */}
      <div className="relative h-52 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        {!bannerError ? (
          <img src={company.banner} alt="" onError={() => setBannerError(true)}
            className="w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Outbound & Follow Action buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleVisitOfficialSite}
            className="bg-[#0A0A0A] hover:bg-black text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <span>Visit Official Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setFollowing(f => !f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md ${
              following
                ? 'bg-white text-gray-700 border border-gray-200'
                : 'bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white'
            }`}
          >
            {following ? <CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> : <Bell className="w-3.5 h-3.5" />}
            {following ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Discount / New banner badge */}
        <div className="absolute bottom-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow">
          <span className="text-base">🔥</span> New model releases this week!
        </div>
      </div>

      {/* Company info row */}
      <div className="px-6 py-5 flex items-start gap-4">
        {/* Official Square Logo container */}
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
              <strong className="text-gray-700">{company.toolCount}</strong> tools indexed
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <strong className="text-gray-700">{company.rating}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="px-6 border-t border-gray-100 flex items-center justify-between">
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

        {/* Outbound Link shortcut */}
        <a
          href={`/go/${company.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:underline"
        >
          <span>{company.name} Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Tool grid / tab content */}
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
            {activeTab} breakdown for {company.name} coming soon.
          </div>
        )}
      </div>

      {/* Required Attribution Fine Print */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400">
        <ShieldAlert className="w-3 h-3 text-gray-400 shrink-0" />
        <span>Logos and trademarks are property of their respective owners. BinBag is not affiliated with the listed companies unless stated.</span>
      </div>
    </div>
  );
};