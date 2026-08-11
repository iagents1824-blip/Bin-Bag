import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Clock, ShieldCheck, Download, ThumbsUp } from 'lucide-react';

interface FlagshipModel {
  familyName: string;
  developer: string;
  kind: 'model' | 'chatbot' | 'both';
  category: string;
  description: string;
  officialUrl: string;
  latestKnownVersion: string;
  lastUpdated: string;
}

interface BroadModel {
  id: string;
  name: string;
  author: string;
  pipelineTag: string;
  downloads: number;
  likes: number;
  createdAt: string;
  url: string;
  status: string;
}

const KIND_BADGE: Record<string, { label: string; color: string }> = {
  model:   { label: 'Model',        color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  chatbot: { label: 'Chatbot',      color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  both:    { label: 'Model + Chat', color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

function FlagshipCard({ model }: { model: FlagshipModel }) {
  const badge = KIND_BADGE[model.kind] || KIND_BADGE.model;
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all relative overflow-hidden group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {model.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#0A0A0A] mb-1 group-hover:text-[#4F46E5] transition-colors">
          {model.familyName}
        </h3>
        <p className="text-xs text-gray-500 font-medium mb-3">by {model.developer}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{model.description}</p>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Latest Version</span>
          <span className="text-xs font-bold text-gray-900">{model.latestKnownVersion}</span>
        </div>
        <a
          href={model.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700 transition-colors"
        >
          Official Site ↗
        </a>
      </div>
    </div>
  );
}

export const ModelsView: React.FC = () => {
  const [flagshipModels, setFlagshipModels] = useState<FlagshipModel[]>([]);
  const [newModels, setNewModels] = useState<BroadModel[]>([]);
  const [establishedModels, setEstablishedModels] = useState<BroadModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const [flagRes, newRes, estRes] = await Promise.all([
          fetch('/api/listings/flagship'),
          fetch('/api/listings/models?status=new'),
          fetch('/api/listings/models?status=established')
        ]);
        const flagship = await flagRes.json();
        const newM = await newRes.json();
        const estM = await estRes.json();
        if (Array.isArray(flagship)) setFlagshipModels(flagship);
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
    <div className="flex-1 overflow-y-auto bg-[#F0EFE9] text-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-[#4F46E5]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight">AI Models Index</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Curated flagship models and chatbots, plus real-time trending models from the open-source AI community.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20 font-medium animate-pulse">Loading model index...</div>
        ) : (
          <>
            {/* Flagship (top priority) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-lg font-bold text-[#0A0A0A] uppercase tracking-wider">Flagship Models & Chatbots</h2>
              </div>
              <p className="text-xs text-gray-500 -mt-2">Hand-curated list with human-verified version tracking.</p>
              {flagshipModels.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No flagship models found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flagshipModels.map(m => <FlagshipCard key={m.familyName} model={m} />)}
                </div>
              )}
            </section>

            {/* New Models */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-[#0A0A0A] uppercase tracking-wider">Trending New Arrivals (30 Days)</h2>
              </div>
              <p className="text-xs text-gray-500 -mt-2">Automated feed of high-engagement models released on HuggingFace.</p>
              {newModels.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No trending new models yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newModels.slice(0, 10).map(model => (
                    <a
                      href={model.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={model.id}
                      className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-[#0A0A0A] truncate max-w-[70%]">{model.name}</h4>
                        <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          {model.pipelineTag}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-auto pt-3 border-t border-gray-100 text-gray-500">
                        <div className="flex items-center gap-1.5 text-xs"><Download className="w-3.5 h-3.5" />{model.downloads.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 text-xs"><ThumbsUp className="w-3.5 h-3.5" />{model.likes.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 text-xs ml-auto font-mono text-gray-400">{new Date(model.createdAt).toLocaleDateString()}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>

            {/* Established Models */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-[#0A0A0A] uppercase tracking-wider">Most Downloaded</h2>
              </div>
              <p className="text-xs text-gray-500 -mt-2">All-time top downloaded models across HuggingFace.</p>
              {establishedModels.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No established models yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {establishedModels.slice(0, 12).map(model => (
                    <a
                      href={model.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={model.id}
                      className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex flex-col hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <h4 className="text-xs font-bold text-[#0A0A0A] truncate mb-1" title={model.name}>{model.name}</h4>
                      <span className="text-[10px] text-gray-500 mb-3 truncate">by {model.author}</span>
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-gray-500 font-semibold">{model.downloads.toLocaleString()} downloads</span>
                        <span className="text-[9px] font-semibold text-[#4F46E5] uppercase">{model.pipelineTag}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};