import React, { useState } from 'react';
import { MarketplaceAsset, AssetCategory } from '../types';
import { X, Upload } from 'lucide-react';

interface ListAssetModalProps {
  onClose: () => void;
  onAddAsset: (asset: MarketplaceAsset) => void;
}

export const ListAssetModal: React.FC<ListAssetModalProps> = ({ onClose, onAddAsset }) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Agentic Workflow');
  const [price, setPrice] = useState('0');
  const [framework, setFramework] = useState('LangChain');
  const [format, setFormat] = useState('JSON / Python');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tags, setTags] = useState('AI, Agent, Automation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAsset: MarketplaceAsset = {
      id: `asset-${Date.now()}`,
      title,
      tagline: tagline || title,
      description,
      category,
      price: parseFloat(price) || 0,
      creator: {
        name: 'You',
        handle: 'you',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      stats: {
        downloads: 1,
        rating: 5.0,
        reviewCount: 1,
        efficiencyScore: '98.5%',
      },
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      specs: {
        framework,
        format,
      },
      systemPromptPreview: systemPrompt,
      downloadUrl: '#',
      createdAt: new Date().toISOString().split('T')[0],
      featured: false,
    };

    onAddAsset(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#0A0A0A] max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] block mb-1">
              CREATOR PUBLISHING
            </span>
            <h2 className="text-xl font-black text-[#0A0A0A]">List New AI Asset</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Asset Title *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Multi-agent Arbitrage Engine"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
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
              <label className="text-xs font-bold text-gray-700 block mb-1">Price ($USD, 0 = Free)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Tagline</label>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="Short 1-line summary"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain how this asset works and how to use it..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Framework</label>
              <input
                value={framework}
                onChange={e => setFramework(e.target.value)}
                placeholder="e.g. n8n / LangChain"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Format</label>
              <input
                value={format}
                onChange={e => setFormat(e.target.value)}
                placeholder="e.g. JSON / GGUF"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">System Prompt / Logic Preview</label>
            <textarea
              rows={2}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Paste system instructions or preview code..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Trading, LangChain, n8n"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0A0A0A] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Publish Listing</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};