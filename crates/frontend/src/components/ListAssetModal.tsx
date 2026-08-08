import React, { useState } from 'react';
import { MarketplaceAsset, AssetCategory } from '../types';
import { X, PlusCircle, Upload, ShieldCheck } from 'lucide-react';

interface ListAssetModalProps {
  onClose: () => void;
  onAddAsset: (asset: MarketplaceAsset) => void;
}

export const ListAssetModal: React.FC<ListAssetModalProps> = ({ onClose, onAddAsset }) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Agentic Workflow');
  const [price, setPrice] = useState<number>(49);
  const [framework, setFramework] = useState('LangGraph / Python');
  const [parameters, setParameters] = useState('7 Billion');
  const [format, setFormat] = useState('GGUF / Safetensors');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState('Agent, LangChain, Python');
  const [creatorHandle, setCreatorHandle] = useState('ai_builder');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim()) return;

    const newAsset: MarketplaceAsset = {
      id: `asset-${Date.now()}`,
      title,
      tagline,
      description: description || tagline,
      category,
      price: Number(price),
      creator: {
        name: creatorHandle.replace('_', ' ').toUpperCase(),
        handle: creatorHandle,
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      stats: {
        downloads: 1,
        rating: 5.0,
        reviewCount: 1,
        efficiencyScore: '100% Latency Optimized',
      },
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      specs: {
        framework,
        parameters,
        format,
        contextWindow: '128k Tokens',
      },
      systemPromptPreview: systemPrompt,
      downloadUrl: 'https://github.com/binbag/releases/latest.zip',
      createdAt: new Date().toISOString().split('T')[0],
      featured: true,
    };

    onAddAsset(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0D0E] border border-[#262626] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#00FF41]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              LIST AI ASSET ON MARKETPLACE
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-mono flex-1">
          
          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Asset Name / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quant-Fin V5 Arbitrage Agent"
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#888888] uppercase block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
              >
                <option value="Agentic Workflow">Agentic Workflow</option>
                <option value="LLM Fine-tune">LLM Fine-tune</option>
                <option value="Chatbot Template">Chatbot Template</option>
                <option value="LoRA Model">LoRA Model</option>
                <option value="Prompt & Guardrails">Prompt & Guardrails</option>
                <option value="Full Model Weights">Full Model Weights</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#888888] uppercase block mb-1">Price ($ USD, 0 for Free)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Short Tagline *</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Real-time market sentiment and multi-chain execution agent"
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain architecture, training dataset, or usage instructions..."
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-[#888888] uppercase block mb-1">Framework</label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2 focus:outline-none focus:border-[#555]"
              />
            </div>
            <div>
              <label className="text-[9px] text-[#888888] uppercase block mb-1">Parameters</label>
              <input
                type="text"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2 focus:outline-none focus:border-[#555]"
              />
            </div>
            <div>
              <label className="text-[9px] text-[#888888] uppercase block mb-1">Format</label>
              <input
                type="text"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2 focus:outline-none focus:border-[#555]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">System Instructions / Prompt Preview</label>
            <textarea
              rows={2}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt preview..."
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#262626]">
            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-sans font-bold text-xs py-3 uppercase tracking-wider transition-colors"
            >
              Publish Asset To Marketplace
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
