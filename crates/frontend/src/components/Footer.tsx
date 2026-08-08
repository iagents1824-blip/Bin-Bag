import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-12 border-t border-[#262626] px-4 sm:px-8 flex flex-wrap items-center justify-between bg-[#0A0A0B] text-[10px] font-mono uppercase tracking-widest text-[#555] shrink-0 z-30">
      <div>&copy; 2026 Bin Bag Marketplace. Secure Gateway Active.</div>
      <div className="hidden sm:flex items-center gap-6">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
          <span>System Status: Optimal</span>
        </span>
        <span>Market Volatility: Low</span>
        <span>Verified Builders: 1,429</span>
      </div>
    </footer>
  );
};
