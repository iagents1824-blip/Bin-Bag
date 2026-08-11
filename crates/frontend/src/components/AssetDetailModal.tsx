import React, { useState } from 'react';
import { MarketplaceAsset } from '../types';
import { X, Star, ShieldCheck, Download, Play, Terminal, Copy, Check, ExternalLink, Cpu } from 'lucide-react';

interface AssetDetailModalProps {
  asset: MarketplaceAsset | null;
  onClose: () => void;
  onBuy: (asset: MarketplaceAsset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose, onBuy }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'playground' | 'prompt'>('overview');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!asset) return null;

  const handleRunPlayground = () => {
    setIsExecuting(true);
    setTestOutput(null);
    setTimeout(() => {
      setIsExecuting(false);
      setTestOutput(
        asset.sampleOutput || 
        `[BIN BAG DEMO RUNNER v4.2]
Input Processed: "${testInput || 'Default test parameters'}"
Status: 200 OK (Latency: 142ms)
Output: Asset processed input with high fidelity. Confidence score: 0.982.`
      );
    }, 800);
  };

  const handleCopyPrompt = () => {
    if (asset.systemPromptPreview) {
      navigator.clipboard.writeText(asset.systemPromptPreview);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#0A0A0A]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                {asset.category}
              </span>
              {asset.featured && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#0A0A0A] px-2.5 py-0.5 rounded-full">
                  Featured Asset
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-[#0A0A0A] mb-1">{asset.title}</h2>
            <p className="text-xs text-gray-500">{asset.tagline}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview & Specs
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-4 py-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Interactive Demo Sandbox</span>
          </button>

          {asset.systemPromptPreview && (
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-3 font-bold border-b-2 transition-colors ${
                activeTab === 'prompt'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              System Prompt Preview
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {asset.description}
                </p>
              </div>

              {/* Creator Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={asset.creator.avatar} alt={asset.creator.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{asset.creator.name}</span>
                      {asset.creator.verified && <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />}
                    </div>
                    <span className="text-xs text-gray-400">@{asset.creator.handle}</span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-gray-400 block">Efficiency Rating</span>
                  <span className="font-bold text-[#4F46E5]">{asset.stats.efficiencyScore}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Technical Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Framework</span>
                    <span className="text-xs font-bold text-gray-900">{asset.specs.framework}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Format</span>
                    <span className="text-xs font-bold text-gray-900">{asset.specs.format}</span>
                  </div>
                  {asset.specs.parameters && (
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Parameters</span>
                      <span className="text-xs font-bold text-gray-900">{asset.specs.parameters}</span>
                    </div>
                  )}
                  {asset.specs.contextWindow && (
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Context Window</span>
                      <span className="text-xs font-bold text-gray-900">{asset.specs.contextWindow}</span>
                    </div>
                  )}
                  {asset.specs.baseModel && (
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Base Model</span>
                      <span className="text-xs font-bold text-gray-900">{asset.specs.baseModel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {asset.tags.map(t => (
                    <span key={t} className="text-xs bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'playground' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Simulate standard execution against this model/workflow asset before purchasing.
              </p>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Demo Input Parameter</label>
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder={asset.demoInputPlaceholder || 'Type sample input query...'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <button
                onClick={handleRunPlayground}
                disabled={isExecuting}
                className="bg-[#0A0A0A] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isExecuting ? 'Executing Sandbox...' : 'Run Simulation'}</span>
              </button>

              {testOutput && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Output Stream</span>
                  <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-gray-800">
                    {testOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompt' && asset.systemPromptPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">System Prompt Instructions</span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-xs text-[#4F46E5] font-bold flex items-center gap-1 hover:underline"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>

              <pre className="bg-gray-900 text-gray-200 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-gray-800">
                {asset.systemPromptPreview}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer / CTA */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Acquire Asset</span>
            <span className="text-xl font-black text-[#0A0A0A]">
              {asset.price === 0 ? 'Free Download' : `$${asset.price}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => onBuy(asset)}
              className="bg-[#0A0A0A] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{asset.price === 0 ? 'Download Asset' : 'Proceed to Checkout'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};