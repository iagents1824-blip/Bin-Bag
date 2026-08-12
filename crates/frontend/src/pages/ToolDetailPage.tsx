import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ExternalLink, ArrowLeft, Star, Users, Calendar, Tag,
  ShieldCheck, AlertTriangle, BookOpen, Cpu, Sparkles,
  ChevronRight, Info, DollarSign, Globe, Clock
} from 'lucide-react';
import { ALL_TOOLS, AI_COMPANIES, formatFollowers, AITool } from '../data/mockAIData';

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const ToolDetailPage: React.FC = () => {
  const { slug, type } = useParams<{ slug: string; type?: string }>();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // Find tool by slug or id
  const tool = ALL_TOOLS.find(t =>
    (t.slug || slugify(t.name)) === slug || t.id === slug
  );

  if (!tool) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-5xl font-black text-[#0A0A0A] mb-3">404</h1>
        <p className="text-gray-500 text-sm mb-6">This tool doesn't exist in BinBag yet.</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  const parentCompany = AI_COMPANIES.find(c => c.name === tool.company);
  const companyTools = ALL_TOOLS.filter(t => t.company === tool.company && t.id !== tool.id).slice(0, 8);
  const similarTools = ALL_TOOLS.filter(t =>
    t.category === tool.category && t.id !== tool.id && t.company !== tool.company
  ).slice(0, 8);

  const isDiscontinued = tool.status === 'discontinued';
  const isBrokenLink = tool.status === 'broken_link';

  let verifiedText = '';
  if (tool.last_verified_at) {
    const days = Math.floor((Date.now() - new Date(tool.last_verified_at).getTime()) / (1000 * 60 * 60 * 24));
    verifiedText = `Verified ${days === 0 ? 'today' : `${days}d ago`}`;
  }

  const fullDesc = tool.full_description || tool.description || tool.short_description || '';
  const officialUrl = tool.url || `https://binbag.ai/go/${tool.id}`;

  const handleVisit = () => {
    window.open(officialUrl, '_blank', 'noopener,noreferrer');
  };

  const pricingBg = tool.pricing === 'Free' || tool.pricing === 'open-source' ? '#F0FDF4'
    : tool.pricing === 'Freemium' ? '#EEF2FF' : '#FFF7ED';
  const pricingColor = tool.pricing === 'Free' || tool.pricing === 'open-source' ? '#16A34A'
    : tool.pricing === 'Freemium' ? '#4F46E5' : '#C2410C';

  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
      {/* Back nav */}
      <div className="px-4 md:px-6 pt-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="px-4 md:px-6 max-w-5xl mx-auto">
        {/* Hero card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          {/* Screenshot / Banner */}
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 overflow-hidden">
            {tool.screenshot_url && !bannerError ? (
              <img
                src={tool.screenshot_url}
                alt={`${tool.name} screenshot`}
                onError={() => setBannerError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-black text-indigo-100 select-none">{tool.name[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Status badges */}
            {isDiscontinued && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Discontinued
              </span>
            )}
            {!isDiscontinued && isBrokenLink && (
              <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Broken Link
              </span>
            )}
            {!isDiscontinued && !isBrokenLink && tool.isNew && (
              <span className="absolute top-4 left-4 bg-[#0A0A0A] text-white text-xs font-bold px-3 py-1 rounded-full">NEW</span>
            )}

            {/* Desktop CTA */}
            <div className="hidden md:block absolute top-4 right-4">
              <button
                onClick={handleVisit}
                disabled={isDiscontinued || isBrokenLink}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                  isDiscontinued || isBrokenLink
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#0A0A0A] hover:bg-gray-50'
                }`}
              >
                {isDiscontinued || isBrokenLink ? 'Site Unavailable' : 'Visit Official Site'}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info row */}
          <div className="p-5 md:p-7">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 -mt-12 md:-mt-14 bg-white rounded-2xl border-2 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 z-10">
                {!imgError ? (
                  <img
                    src={tool.logo || tool.image}
                    alt={tool.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-2xl font-black text-gray-300">{tool.name[0]}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-black text-[#0A0A0A] text-2xl md:text-3xl leading-tight">{tool.name}</h1>
                  {verifiedText && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> {verifiedText}
                    </span>
                  )}
                </div>

                {/* Company link */}
                {parentCompany ? (
                  <Link
                    to="/"
                    className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1 w-fit"
                    onClick={() => {/* navigate to company profile */}}
                  >
                    {tool.company} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-sm text-gray-500">{tool.company}</span>
                )}

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#4F46E5', color: 'white' }}
                  >
                    {tool.category}
                  </span>
                  {tool.subcategory && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {tool.subcategory}
                    </span>
                  )}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: pricingBg, color: pricingColor }}
                  >
                    {tool.pricing}
                  </span>
                  {tool.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {tool.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Full description */}
            <div className="mt-6">
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">{fullDesc}</p>
              {tool.ai_generated_description && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Description generated from public sources by BinBag AI
                </p>
              )}
            </div>

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tool.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] font-medium bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: DollarSign, label: 'Pricing', value: tool.pricing || 'Unknown', color: pricingColor },
            { icon: Calendar, label: 'Launched', value: tool.launch_date ? new Date(tool.launch_date).getFullYear().toString() : 'Unknown' },
            { icon: Clock, label: 'Verified', value: verifiedText || 'Not yet verified' },
            { icon: Users, label: 'Users', value: tool.users ? formatFollowers(tool.users) : 'Unknown' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-sm font-bold truncate" style={color ? { color } : {}}>{value}</p>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-full hover:border-indigo-300 hover:text-indigo-700 transition-all shadow-sm"
          >
            <Globe className="w-4 h-4" /> Official Website
          </a>
          {tool.official_pricing_url && (
            <a
              href={tool.official_pricing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-full hover:border-indigo-300 hover:text-indigo-700 transition-all shadow-sm"
            >
              <DollarSign className="w-4 h-4" /> Pricing Page
            </a>
          )}
        </div>

        {/* More from company */}
        {companyTools.length > 0 && (
          <section className="mb-8">
            <h2 className="font-black text-[#0A0A0A] text-lg mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" /> More from {tool.company}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {companyTools.map(t => (
                <Link
                  key={t.id}
                  to={`/tool/${t.slug || slugify(t.name)}`}
                  className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={t.logo} alt={t.name} className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0A0A0A] truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{t.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar tools */}
        {similarTools.length > 0 && (
          <section className="mb-8">
            <h2 className="font-black text-[#0A0A0A] text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" /> Similar Tools in {tool.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {similarTools.map(t => (
                <Link
                  key={t.id}
                  to={`/tool/${t.slug || slugify(t.name)}`}
                  className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={t.logo} alt={t.name} className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0A0A0A] truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{t.company}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Attribution */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 pb-4">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Logos, trademarks, and product information belong to their respective owners. BinBag is not affiliated with any listed company.</span>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-[#F0EFE9] via-[#F0EFE9]/90 to-transparent z-40 pointer-events-none">
        <button
          onClick={handleVisit}
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
    </div>
  );
};