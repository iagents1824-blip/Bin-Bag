import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Clock, ShieldCheck, Download, ThumbsUp } from 'lucide-react';

export const ModelsView: React.FC = () => {
  const [majorModels, setMajorModels] = useState<any[]>([]);
  const [newModels, setNewModels] = useState<any[]>([]);
  const [establishedModels, setEstablishedModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const [majorRes, newRes, estRes] = await Promise.all([
          fetch('/api/models/major'),
          fetch('/api/models?status=new'),
          fetch('/api/models?status=established')
        ]);
        
        const major = await majorRes.json();
        const newM = await newRes.json();
        const estM = await estRes.json();
        
        if (Array.isArray(major)) setMajorModels(major);
        if (Array.isArray(newM)) setNewModels(newM);
        if (Array.isArray(estM)) setEstablishedModels(estM);
      } catch (e) {
        console.error('Error fetching models:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Header */}
        <div className="border-b border-[#262626] pb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tighter">
            <Sparkles className="text-[#00FF41] w-6 h-6" />
            AI Models Index
          </h1>
          <p className="text-sm text-[#888] mt-1 tracking-wide">
            Curated major foundation models and real-time trending models from the open-source community.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-[#555] py-20 animate-pulse">Loading model index...</div>
        ) : (
          <>
            {/* Major Models (Curated) */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00FF41]" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Major Foundation Models</h2>
              </div>
              <p className="text-xs text-[#666] -mt-4">Curated list of flagship models. Hand-reviewed for accuracy.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {majorModels.map(model => (
                  <div key={model.familyName} className="bg-[#121214] border border-[#262626] rounded-sm p-5 hover:border-[#444] transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2">
                      <span className="text-[9px] font-mono bg-[#00FF41]/10 text-[#00FF41] px-1.5 py-0.5 rounded-sm uppercase">{model.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00FF41] transition-colors">{model.familyName}</h3>
                    <p className="text-xs text-[#888] font-mono mb-3">by {model.developer}</p>
                    <p className="text-sm text-[#ccc] line-clamp-2 mb-4 h-10">{model.description}</p>
                    <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-[#666] tracking-wider">Latest Version</span>
                        <span className="text-xs font-bold text-white">{model.latestKnownVersion}</span>
                      </div>
                      <a href={model.officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">Official Site ↗</a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending New Models */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FFB000]" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Trending New Arrivals (30 Days)</h2>
              </div>
              <p className="text-xs text-[#666] -mt-4">Automated feed of highly active models created in the last 30 days on HuggingFace.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newModels.slice(0, 10).map(model => (
                  <a href={model.url} target="_blank" rel="noopener noreferrer" key={model.id} className="bg-[#0f0f11] border border-[#222] p-4 flex flex-col hover:bg-[#151518] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-[#eee] truncate max-w-[70%]">{model.name}</h4>
                      <span className="text-[10px] font-mono text-[#555] bg-[#1a1a1a] px-1.5 py-0.5 rounded-sm border border-[#333]">{model.pipelineTag}</span>
                    </div>
                    <div className="flex gap-4 mt-auto pt-3 text-[#777]">
                      <div className="flex items-center gap-1.5 text-[11px]"><Download className="w-3 h-3" /> {model.downloads.toLocaleString()}</div>
                      <div className="flex items-center gap-1.5 text-[11px]"><ThumbsUp className="w-3 h-3" /> {model.likes.toLocaleString()}</div>
                      <div className="flex items-center gap-1.5 text-[11px] ml-auto font-mono">{new Date(model.createdAt).toLocaleDateString()}</div>
                    </div>
                  </a>
                ))}
                {newModels.length === 0 && <div className="text-sm text-[#555] italic">No trending new models found recently.</div>}
              </div>
            </section>

            {/* Established Models */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00E5FF]" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Most Downloaded AI Models</h2>
              </div>
              <p className="text-xs text-[#666] -mt-4">All-time top downloaded models from HuggingFace.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {establishedModels.slice(0, 12).map(model => (
                  <a href={model.url} target="_blank" rel="noopener noreferrer" key={model.id} className="bg-[#0f0f11] border border-[#222] p-3 flex flex-col hover:bg-[#151518] transition-colors">
                    <h4 className="text-xs font-bold text-[#ccc] truncate mb-1" title={model.name}>{model.name}</h4>
                    <span className="text-[9px] text-[#666] mb-3 truncate">by {model.author}</span>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-[10px] text-[#888] font-mono">{model.downloads.toLocaleString()} dl</span>
                      <span className="text-[9px] font-mono text-[#444] uppercase">{model.pipelineTag}</span>
                    </div>
                  </a>
                ))}
                {establishedModels.length === 0 && <div className="text-sm text-[#555] italic">No established models found.</div>}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
