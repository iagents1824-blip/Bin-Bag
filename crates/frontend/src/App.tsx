import React, { useState, useEffect } from 'react';

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fadeTimer = setTimeout(() => setIsFading(true), 10000);
    const completeTimer = setTimeout(() => {
      document.body.style.overflow = '';
      onComplete();
    }, 11000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-1000 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video autoPlay muted playsInline className="w-full h-full object-cover">
        <source src="/preloader.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      {/* Top Promo Bar */}
      <div className="bg-slate-900 text-white text-[10px] md:text-xs py-2 px-4 flex justify-between items-center font-light tracking-wide">
        <span className="hidden md:inline">Global Server Coverage 99.9% Uptime</span>
        <div className="mx-auto md:mx-0 flex gap-6">
          <span>Summer Infrastructure Sale: 40% Off API Credits</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Limited Time Enterprise Trial</span>
        </div>
        <span className="hidden md:inline">Support: 24/7 Priority</span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-sm"></div>
            BIN BAG
          </div>
          
          <ul className="hidden lg:flex gap-8 text-sm font-medium text-slate-600">
            <li><a href="#" className="hover:text-black transition-colors">Infrastructure</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Compute</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Edge Nodes</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Security</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Documentation</a></li>
          </ul>

          <div className="flex items-center gap-5">
            <button className="p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
            <button className="p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></button>
            <button className="relative p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] text-white w-4 h-4 flex items-center justify-center rounded-full">3</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-[#F9FAFB] lg:min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">System Status: Optimal</span>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Master Your <br/><span className="text-slate-400">AI Workflow.</span>
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-md leading-relaxed">
              Ultra-secure data processing at the edge. Scale your infrastructure with zero-latency storage and neural processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-slate-900 text-white px-8 py-4 rounded-none font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                Get Started <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="border border-slate-200 px-8 py-4 rounded-none font-medium hover:bg-white transition-all text-center">Explore Documentation</button>
            </div>
            
            <div className="mt-12 flex items-center gap-3 grayscale opacity-50">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-white"></div>
              </div>
              <span className="text-xs text-slate-500">Trusted by 50,000+ DevOps Engineers</span>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
            <div className="absolute w-[80%] h-[80%] bg-slate-100 rounded-[4rem] rotate-6"></div>
            
            <div className="relative z-10 w-64 h-80 bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col p-6">
               <div className="w-full h-32 bg-slate-50 rounded-lg mb-4 animate-pulse"></div>
               <div className="h-4 w-3/4 bg-slate-100 rounded mb-2"></div>
               <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
               <div className="mt-auto h-10 w-full bg-slate-900 rounded"></div>
            </div>

            <div className="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg border border-slate-50 flex gap-3 items-center">
              <div className="w-10 h-10 bg-blue-50 rounded text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2"/></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Latency</p>
                <p className="text-sm font-bold">0.42ms</p>
              </div>
            </div>

            <div className="absolute bottom-20 left-0 bg-white p-4 rounded-xl shadow-lg border border-slate-50 w-48">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Storage Cluster</p>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 w-2/3"></div>
              </div>
              <p className="text-[10px] mt-2 text-right">64.2 TB / 100 TB</p>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Features */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-b border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="1.5"/></svg></div>
            <div><h4 className="text-sm font-semibold">End-to-End</h4><p className="text-xs text-slate-400">AES-256 Encryption</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="1.5"/></svg></div>
            <div><h4 className="text-sm font-semibold">Instant Scaling</h4><p className="text-xs text-slate-400">On-demand resources</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="1.5"/></svg></div>
            <div><h4 className="text-sm font-semibold">Auto Backups</h4><p className="text-xs text-slate-400">30-day recovery</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="1.5"/></svg></div>
            <div><h4 className="text-sm font-semibold">Dev Support</h4><p className="text-xs text-slate-400">24/7 API assistance</p></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl font-bold">Infrastructure Components</h2>
          <a href="#" className="text-sm font-medium border-b border-slate-900 pb-1 hover:text-blue-600 transition-colors">View All Modules →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="group cursor-pointer">
            <div className="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" strokeWidth="1"/></svg>
              </div>
            </div>
            <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors">Storage Nodes</h3>
            <p className="text-xs text-slate-400 mt-1">Configure →</p>
          </div>
          <div className="group cursor-pointer">
            <div className="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeWidth="1"/></svg>
              </div>
            </div>
            <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors">Compute Units</h3>
            <p className="text-xs text-slate-400 mt-1">Provision →</p>
          </div>
          <div className="group cursor-pointer">
            <div className="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="1"/></svg>
              </div>
            </div>
            <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors">Security Keys</h3>
            <p className="text-xs text-slate-400 mt-1">Deploy →</p>
          </div>
          <div className="group cursor-pointer">
            <div className="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="1"/></svg>
              </div>
            </div>
            <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors">Edge Analytics</h3>
            <p className="text-xs text-slate-400 mt-1">Initialize →</p>
          </div>
          <div className="group cursor-pointer">
            <div className="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeWidth="1"/></svg>
              </div>
            </div>
            <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors">Data Bridges</h3>
            <p className="text-xs text-slate-400 mt-1">Sync →</p>
          </div>
        </div>
      </section>

      {/* New Deployments */}
      <section className="bg-[#fdfdfd] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-2xl font-bold">New Global Deployments</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition-colors">←</button>
              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition-colors">→</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="aspect-[4/5] bg-slate-100 mb-4 relative overflow-hidden flex items-center justify-center">
                <span className="absolute top-4 left-4 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-tighter shadow-sm z-10">Limited</span>
                <div className="w-32 h-32 border-4 border-slate-200 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center">
                  <div className="w-16 h-16 bg-slate-900 rounded-lg transform rotate-45"></div>
                </div>
                <button className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-xs py-3 translate-y-16 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest z-10">Quick Deploy</button>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">Nexus-7 Storage Array</h4>
                <span className="text-sm font-medium">$89/mo</span>
              </div>
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                <div className="w-3 h-3 bg-slate-100 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
                <span className="text-[10px] text-slate-400">(128 reviews)</span>
              </div>
            </div>

            <div className="group">
              <div className="aspect-[4/5] bg-slate-100 mb-4 relative overflow-hidden flex items-center justify-center">
                <span className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-tighter shadow-sm z-10">-20%</span>
                <div className="w-40 h-24 bg-slate-300 group-hover:scale-110 transition-transform flex flex-col gap-2 p-4">
                  <div className="h-2 w-full bg-slate-400 rounded-full"></div>
                  <div className="h-2 w-2/3 bg-slate-400 rounded-full"></div>
                </div>
                <button className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-xs py-3 translate-y-16 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest z-10">Quick Deploy</button>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">Quantum-Stream V2</h4>
                <span className="text-sm font-medium">$129/mo</span>
              </div>
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-[10px]">★★★★☆</div>
                <span className="text-[10px] text-slate-400">(85 reviews)</span>
              </div>
            </div>

            <div className="group">
              <div className="aspect-[4/5] bg-slate-100 mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="w-24 h-24 bg-slate-900 rounded-full group-hover:scale-110 transition-transform border-[12px] border-slate-200"></div>
                <button className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-xs py-3 translate-y-16 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest z-10">Quick Deploy</button>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">Security Shield Pro</h4>
                <span className="text-sm font-medium">$45/mo</span>
              </div>
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
                <span className="text-[10px] text-slate-400">(210 reviews)</span>
              </div>
            </div>

            <div className="group">
              <div className="aspect-[4/5] bg-slate-100 mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 group-hover:rotate-12 transition-transform">
                  <div className="w-8 h-8 bg-slate-900"></div>
                  <div className="w-8 h-8 bg-slate-400"></div>
                  <div className="w-8 h-8 bg-slate-300"></div>
                  <div className="w-8 h-8 bg-slate-200"></div>
                </div>
                <button className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-xs py-3 translate-y-16 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest z-10">Quick Deploy</button>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">Core Cluster X</h4>
                <span className="text-sm font-medium">$599/mo</span>
              </div>
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
                <span className="text-[10px] text-slate-400">(56 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Solutions */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-10">Enterprise Solutions</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="flex bg-slate-50 p-6 gap-6 items-center hover:bg-slate-100 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-slate-200">
            <div className="w-1/3 aspect-square bg-white flex items-center justify-center shadow-sm rounded-md">
              <svg className="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/></svg>
            </div>
            <div className="w-2/3">
              <h3 className="font-bold mb-1">Data Warehouse Pro</h3>
              <p className="text-xs text-slate-400 mb-3">Infinite scaling for massive datasets.</p>
              <span className="font-bold text-lg">$2,499</span>
              <button className="block mt-4 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors w-full sm:w-auto text-center">Inquire Now</button>
            </div>
          </div>

          <div className="flex bg-slate-50 p-6 gap-6 items-center hover:bg-slate-100 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-slate-200">
            <div className="w-1/3 aspect-square bg-white flex items-center justify-center shadow-sm rounded-md">
              <svg className="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
            <div className="w-2/3">
              <h3 className="font-bold mb-1">Vault Encryption</h3>
              <p className="text-xs text-slate-400 mb-3">Hardware-grade security module.</p>
              <span className="font-bold text-lg">$899</span>
              <button className="block mt-4 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors w-full sm:w-auto text-center">Add to Stack</button>
            </div>
          </div>

          <div className="flex bg-slate-50 p-6 gap-6 items-center hover:bg-slate-100 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-slate-200">
            <div className="w-1/3 aspect-square bg-white flex items-center justify-center shadow-sm rounded-md">
              <svg className="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44a.97.97 0 01-.97 0l-7.9-4.44c-.32-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.33-.13.5-.13.17 0 .34.04.5.13l7.9 4.44c.32.17.53.5.53.88v9z"/></svg>
            </div>
            <div className="w-2/3">
              <h3 className="font-bold mb-1">Neural Compute Node</h3>
              <p className="text-xs text-slate-400 mb-3">AI-optimized inference engines.</p>
              <span className="font-bold text-lg">$1,200</span>
              <button className="block mt-4 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors w-full sm:w-auto text-center">Provision</button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Promo Section */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-2 gap-px bg-slate-100 overflow-hidden shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-12 lg:p-20 relative overflow-hidden">
            <span className="inline-block px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6 relative z-10">Flash Sale</span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 relative z-10">Infrastructure Upgrade: Up to 70% Off</h2>
            <div className="flex gap-4 sm:gap-8 mb-10 relative z-10">
              <div><span className="text-3xl font-bold">02</span><p className="text-[10px] text-slate-400 uppercase tracking-widest">Days</p></div>
              <div><span className="text-3xl font-bold">15</span><p className="text-[10px] text-slate-400 uppercase tracking-widest">Hours</p></div>
              <div><span className="text-3xl font-bold">45</span><p className="text-[10px] text-slate-400 uppercase tracking-widest">Mins</p></div>
              <div><span className="text-3xl font-bold">30</span><p className="text-[10px] text-slate-400 uppercase tracking-widest">Secs</p></div>
            </div>
            <button className="bg-white text-slate-900 px-8 py-4 font-bold text-sm hover:bg-slate-100 transition-all uppercase tracking-widest relative z-10">Redeem Offer Now</button>
            
            <div className="absolute -right-20 -bottom-20 w-64 h-64 border-[32px] border-white/5 rounded-full pointer-events-none"></div>
          </div>

          <div className="bg-white p-12 lg:p-20 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">New Release</span>
            <h2 className="text-3xl font-bold mb-6">The 2025 Security Protocol</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">Introducing the latest trends in decentralized data management and quantum-safe encryption layers.</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button className="bg-slate-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors text-center">Learn More</button>
              <a href="#" className="text-xs font-bold uppercase tracking-widest border-b border-slate-900 hover:text-blue-600 transition-colors text-center pb-1">View Whitepaper</a>
            </div>
            <div className="mt-12 w-full h-24 border-l-4 border-slate-900 flex items-center px-6 bg-slate-50 overflow-hidden">
              <div className="flex gap-1">
                <div className="w-1 h-8 bg-slate-300"></div>
                <div className="w-1 h-12 bg-slate-900"></div>
                <div className="w-1 h-6 bg-slate-400"></div>
                <div className="w-1 h-16 bg-slate-900"></div>
                <div className="w-1 h-10 bg-slate-200"></div>
              </div>
              <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase whitespace-nowrap">Secure Stream Verification Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Stats */}
      <footer className="bg-white py-12 border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex gap-4 items-center">
            <div className="text-slate-400 text-xl">⚡</div>
            <div><h5 className="text-sm font-bold">Ultra Latency</h5><p className="text-xs text-slate-400">Under 1ms globally</p></div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-slate-400 text-xl">🔒</div>
            <div><h5 className="text-sm font-bold">Secure Checkout</h5><p className="text-xs text-slate-400">100% Encrypted</p></div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-slate-400 text-xl">☁️</div>
            <div><h5 className="text-sm font-bold">Global Sync</h5><p className="text-xs text-slate-400">Multi-region active</p></div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-slate-400 text-xl">💬</div>
            <div><h5 className="text-sm font-bold">Human Support</h5><p className="text-xs text-slate-400">No bots, real experts</p></div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
