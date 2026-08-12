import React, { useState } from 'react';
import { Star, Users, Bell, CheckCircle, ExternalLink, ShieldAlert, ChevronDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AICompany, formatFollowers, ALL_TOOLS } from '../../data/mockAIData';
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
  const [displayLimit, setDisplayLimit] = useState(16);

  const officialUrl = company.tools[0]?.url || `https://binbag.ai/go/${company.id}`;

  const handleVisitOfficialSite = () => {
    window.open(`/go/${company.id}`, '_blank', 'noopener,noreferrer');
  };

  const companyTools = ALL_TOOLS.filter(t => t.company === company.name);
  const visibleTools = companyTools.slice(0, displayLimit);

  const primaryTool = company.tools[0] || companyTools[0];
  const isDiscontinued = primaryTool?.status === 'discontinued';
  const isBrokenLink = primaryTool?.status === 'broken_link';
  
  let verifiedText = '';
  if (primaryTool?.last_verified_at) {
    const days = Math.floor((Date.now() - new Date(primaryTool.last_verified_at).getTime()) / (1000 * 60 * 60 * 24));
    verifiedText = `Verified ${days === 0 ? 'today' : days + 'd ago'}`;
  }


  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6 relative">
      {/* Banner */}
      <div className="relative h-40 md:h-52 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        {!bannerError ? (
          <img src={company.banner} alt="" onError={() => setBannerError(true)}
            className="w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Desktop Outbound & Follow Action buttons */}
        <div className="hidden md:flex absolute top-4 right-4 items-center gap-2">
          <button
            onClick={handleVisitOfficialSite}
            disabled={isDiscontinued || isBrokenLink}
            className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isDiscontinued || isBrokenLink 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-[#0A0A0A] hover:bg-black text-white'
            }`}
          >
            <span>{isDiscontinued || isBrokenLink ? 'Site Unavailable' : 'Visit Official Site'}</span>
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

        {/* Mobile Follow Button */}
        <div className="md:hidden absolute top-4 right-4">
          <button
            onClick={() => setFollowing(f => !f)}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md ${
              following ? 'bg-white text-indigo-600' : 'bg-black/30 text-white'
            }`}
          >
            {following ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
        </div>

        {/* Discount / New banner badge */}
        <div className="absolute bottom-4 left-4 bg-indigo-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-3.5 rounded-full flex items-center gap-1.5 shadow">
          <span className="text-sm md:text-base">🔥</span> New model releases this week!
        </div>
      </div>

      {/* Company info row (Stacked on mobile, side-by-side on desktop) */}
      <div className="px-5 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
        {/* Official Square Logo container */}
        <div className="w-16 h-16 md:w-20 md:h-20 -mt-10 md:-mt-12 bg-white rounded-2xl md:rounded-[1.25rem] border-2 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 z-10">
          {!logoError ? (
            <img src={company.logo} alt={company.name} onError={() => setLogoError(true)}
              className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-2xl font-black text-gray-300">{company.name[0]}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1 md:pt-2">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="font-black text-[#0A0A0A] text-xl md:text-2xl leading-tight">
              {company.name}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: company.categoryColor }}>
              {company.categoryBadge}
            </span>
            {isDiscontinued && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Discontinued
              </span>
            )}
            {verifiedText && !isDiscontinued && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {verifiedText}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{company.description}</p>
          <div className="flex items-center gap-3 md:gap-4 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3 md:w-3.5 md:h-3.5" /> <strong className="text-gray-700">{formatFollowers(company.followers)}</strong> <span className="hidden md:inline">followers</span>
            </span>
            <span className="text-xs text-gray-500">
              <strong className="text-gray-700">{companyTools.length}</strong> tools
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400 fill-amber-400" />
              <strong className="text-gray-700">{company.rating}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tab nav - Horizontally scrollable on mobile */}
      <div className="px-5 md:px-6 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 md:py-0 w-full" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setDisplayLimit(16); }}
              className={`shrink-0 px-4 py-2 md:py-3 text-[13px] md:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'md:border-b-2 md:border-[#0A0A0A] md:bg-transparent bg-[#0A0A0A] text-white md:text-[#0A0A0A] rounded-full md:rounded-none'
                  : 'border-transparent text-gray-500 hover:text-gray-800 bg-gray-50 md:bg-transparent rounded-full md:rounded-none'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Desktop Outbound Link shortcut */}
        <button
          onClick={handleVisitOfficialSite}
          disabled={isDiscontinued || isBrokenLink}
          className={`hidden md:flex shrink-0 items-center gap-1 text-xs font-bold ml-4 ${
            isDiscontinued || isBrokenLink ? 'text-gray-400 cursor-not-allowed' : 'text-[#4F46E5] hover:underline'
          }`}
        >
          <span>{company.name} Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Tool grid / tab content */}
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        {activeTab === 'Overview' ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
              {visibleTools.map(tool => (
                <ListingCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => onToolClick?.(tool.id)}
                />
              ))}
            </div>
            
            {visibleTools.length < companyTools.length && (
              <div className="mt-8 text-center flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-3 font-semibold">
                  Showing {visibleTools.length} of {companyTools.length} {company.name} tools
                </p>
                <button
                  onClick={() => setDisplayLimit(prev => prev + 16)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-[#0A0A0A] px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Load More</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            {activeTab} breakdown for {company.name} coming soon.
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-[#F0EFE9] via-[#F0EFE9]/90 to-transparent z-40 pointer-events-none">
        <button
          onClick={handleVisitOfficialSite}
          disabled={isDiscontinued || isBrokenLink}
          className={`w-full py-3.5 rounded-2xl text-[13px] font-black tracking-wide flex items-center justify-center gap-2 shadow-xl pointer-events-auto transition-transform ${
            isDiscontinued || isBrokenLink 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-[#0A0A0A] text-white active:scale-[0.98]'
          }`}
        >
          <span>{isDiscontinued || isBrokenLink ? 'Site Unavailable' : 'Visit Official Site'}</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Required Attribution Fine Print */}
      <div className="px-5 md:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 pb-24 md:pb-3">
        <ShieldAlert className="w-3 h-3 text-gray-400 shrink-0" />
        <span>Logos and trademarks are property of their respective owners. BinBag is not affiliated with the listed companies unless stated.</span>
      </div>
    </div>
  );
};