import React from 'react';
import { ShoppingBag, MessageSquare, Compass, Newspaper, Key, PlusCircle, Search, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'marketplace' | 'community' | 'directory' | 'news';
  setActiveTab: (tab: 'marketplace' | 'community' | 'directory' | 'news') => void;
  vaultCount: number;
  onOpenVault: () => void;
  onOpenListAsset: () => void;
  onOpenNewPost: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  vaultCount,
  onOpenVault,
  onOpenListAsset,
  onOpenNewPost,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="bg-[#0D0D0E] border-b border-[#262626] sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('marketplace')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-4 h-4 bg-black"></div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tighter text-white block leading-none">BIN BAG</span>
            <span className="text-[9px] font-mono text-[#00FF41] tracking-widest uppercase block mt-1">AI MARKETPLACE & HUB</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4 relative">
          <Search className="w-4 h-4 absolute left-3 text-[#555]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models, workflows, news..."
            className="w-full bg-[#121214] border border-[#262626] rounded-sm pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#555] transition-colors"
          />
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-6 text-xs font-medium uppercase tracking-widest text-[#888888]">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-1.5 py-2 px-2 border-b-2 transition-colors ${
              activeTab === 'marketplace'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1.5 py-2 px-2 border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Community</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 py-2 px-2 border-b-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-1.5 py-2 px-2 border-b-2 transition-colors ${
              activeTab === 'news'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">AI News</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {activeTab === 'marketplace' && (
            <button
              onClick={onOpenListAsset}
              className="hidden sm:flex items-center gap-1.5 bg-[#121214] hover:bg-[#1a1a1e] border border-[#262626] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>List AI Asset</span>
            </button>
          )}

          {activeTab === 'community' && (
            <button
              onClick={onOpenNewPost}
              className="hidden sm:flex items-center gap-1.5 bg-[#121214] hover:bg-[#1a1a1e] border border-[#262626] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>Post Model</span>
            </button>
          )}

          <button
            onClick={onOpenVault}
            className="bg-white hover:bg-neutral-200 text-black px-3.5 py-1.5 text-xs font-bold uppercase tracking-tighter flex items-center gap-2 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-black" />
            <span>Vault</span>
            {vaultCount > 0 && (
              <span className="bg-black text-[#00FF41] font-mono text-[10px] px-1.5 py-0.2 rounded-xs">
                {vaultCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
