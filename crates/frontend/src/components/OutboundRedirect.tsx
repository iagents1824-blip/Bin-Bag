import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ALL_TOOLS, AI_COMPANIES } from '../data/mockAIData';
import { ExternalLink, ShieldCheck, ArrowLeft } from 'lucide-react';

export const OutboundRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [targetName, setTargetName] = useState<string>('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    // 1. Check tools
    const tool = ALL_TOOLS.find(t => t.id === id || t.id === `tool-${id}`);
    if (tool) {
      const url = tool.url || 'https://openai.com';
      setTargetUrl(url);
      setTargetName(tool.name);
      logOutboundClick(tool.id, tool.name);
      return;
    }

    // 2. Check companies
    const company = AI_COMPANIES.find(c => c.id === id);
    if (company) {
      const url = company.tools[0]?.url || 'https://openai.com';
      setTargetUrl(url);
      setTargetName(company.name);
      logOutboundClick(company.id, company.name);
      return;
    }

    // Default fallback
    setTargetUrl('https://openai.com');
    setTargetName('Official Portal');
  }, [id]);

  const logOutboundClick = (itemId: string, name: string) => {
    try {
      const raw = localStorage.getItem('bb_outbound_clicks');
      const clicks = raw ? JSON.parse(raw) : {};
      clicks[itemId] = (clicks[itemId] || 0) + 1;
      localStorage.setItem('bb_outbound_clicks', JSON.stringify(clicks));
    } catch (_) {}
  };

  useEffect(() => {
    if (targetUrl) {
      const timer = setTimeout(() => {
        window.location.replace(targetUrl);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [targetUrl]);

  if (notFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F0EFE9] text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Link Unavailable</h2>
        <p className="text-xs text-gray-500 mb-6">The requested tool link could not be verified.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#0A0A0A] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to BinBag
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F0EFE9] text-center">
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-md max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-[#4F46E5]">
          <ExternalLink className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider block mb-1">LIGHTWEIGHT REDIRECT</span>
          <h2 className="text-xl font-black text-[#0A0A0A]">Redirecting to {targetName}...</h2>
          <p className="text-xs text-gray-500 mt-1">You are leaving BinBag to visit the verified official destination.</p>
        </div>

        {targetUrl && (
          <div className="pt-2">
            <a
              href={targetUrl}
              className="bg-[#0A0A0A] hover:bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Click if not redirected automatically</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verified Outbound Route · Powered by BinBag</span>
        </div>
      </div>
    </div>
  );
};