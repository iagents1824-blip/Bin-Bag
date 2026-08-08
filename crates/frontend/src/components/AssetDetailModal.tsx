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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0D0E] border border-[#262626] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#262626] flex items-start justify-between bg-[#0A0A0B]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#00FF41] bg-[#121214] border border-[#262626] px-2 py-0.5">
                {asset.category}
              </span>
              {asset.featured && (
                <span className="text-[10px] uppercase font-mono tracking-widest text-white bg-[#262626] px-2 py-0.5">
                  Featured Asset
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{asset.title}</h2>
            <p className="text-xs text-[#888888]">{asset.tagline}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white hover:bg-[#262626] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-[#262626] bg-[#121214] text-xs font-mono uppercase">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#00FF41] text-[#00FF41] bg-[#0D0D0E]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            Overview & Specs
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-5 py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'border-[#00FF41] text-[#00FF41] bg-[#0D0D0E]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Demo Sandbox</span>
          </button>

          {asset.systemPromptPreview && (
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-5 py-2.5 font-bold border-b-2 transition-colors ${
                activeTab === 'prompt'
                  ? 'border-[#00FF41] text-[#00FF41] bg-[#0D0D0E]'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              System Architecture
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Creator & Price Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#121214] border border-[#262626] p-4 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <img src={asset.creator.avatar} alt={asset.creator.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <span className="text-[10px] text-[#555] block">BUILDER / CREATOR</span>
                    <span className="text-white font-bold text-xs flex items-center gap-1">
                      {asset.creator.name}
                      {asset.creator.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />}
                    </span>
                    <span className="text-[#888888] text-[10px]">@{asset.creator.handle}</span>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-[#262626] pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] text-[#555] block">ASSET VALUE</span>
                  <span className="text-xl font-bold text-[#00FF41]">
                    {asset.price === 0 ? 'FREE' : `$${asset.price}`}
                  </span>
                  <span className="text-[10px] text-[#888888] block mt-0.5">Instant Vault Delivery</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono">Description</h3>
                <p className="text-xs text-[#E2E2E2] leading-relaxed whitespace-pre-line bg-[#0A0A0B] border border-[#262626] p-4">
                  {asset.description}
                </p>
              </div>

              {/* Specifications Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono">Technical Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-[#121214] border border-[#262626] p-3">
                    <span className="text-[10px] text-[#555] block">FRAMEWORK</span>
                    <span className="text-white font-bold">{asset.specs.framework}</span>
                  </div>
                  <div className="bg-[#121214] border border-[#262626] p-3">
                    <span className="text-[10px] text-[#555] block">FORMAT</span>
                    <span className="text-white font-bold">{asset.specs.format}</span>
                  </div>
                  {asset.specs.parameters && (
                    <div className="bg-[#121214] border border-[#262626] p-3">
                      <span className="text-[10px] text-[#555] block">PARAMETERS</span>
                      <span className="text-white font-bold">{asset.specs.parameters}</span>
                    </div>
                  )}
                  {asset.specs.contextWindow && (
                    <div className="bg-[#121214] border border-[#262626] p-3">
                      <span className="text-[10px] text-[#555] block">CONTEXT WINDOW</span>
                      <span className="text-white font-bold">{asset.specs.contextWindow}</span>
                    </div>
                  )}
                  {asset.specs.baseModel && (
                    <div className="bg-[#121214] border border-[#262626] p-3">
                      <span className="text-[10px] text-[#555] block">BASE MODEL</span>
                      <span className="text-white font-bold">{asset.specs.baseModel}</span>
                    </div>
                  )}
                  <div className="bg-[#121214] border border-[#262626] p-3">
                    <span className="text-[10px] text-[#555] block">EFFICIENCY</span>
                    <span className="text-[#00FF41] font-bold">{asset.stats.efficiencyScore}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'playground' && (
            <div className="space-y-4">
              <div className="bg-[#121214] border border-[#262626] p-4 text-xs">
                <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-wider block mb-1">
                  DEMO EXECUTION TESTBED
                </span>
                <p className="text-[#888888]">
                  Run a simulated payload test to evaluate asset response characteristics and latency.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#888888] block mb-1">Sample Input Payload</label>
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder={asset.demoInputPlaceholder || 'Type custom input parameters here...'}
                  className="w-full bg-[#0A0A0B] border border-[#262626] text-xs text-white p-3 font-mono focus:outline-none focus:border-[#555]"
                />
              </div>

              <button
                onClick={handleRunPlayground}
                disabled={isExecuting}
                className="bg-[#00FF41] hover:bg-[#00cc34] text-black font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isExecuting ? 'Processing Payload...' : 'Execute Test Run'}</span>
              </button>

              {testOutput && (
                <div className="bg-[#080809] border border-[#00FF41] p-4 text-xs font-mono text-[#00FF41]">
                  <span className="text-[9px] uppercase text-[#555] block mb-2 border-b border-[#262626] pb-1">Execution Response</span>
                  <pre className="whitespace-pre-line text-[#E2E2E2]">{testOutput}</pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompt' && asset.systemPromptPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#888888]">System Instructions / Prompt Preview</span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-xs font-mono text-[#00FF41] hover:underline flex items-center gap-1"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy System Prompt'}</span>
                </button>
              </div>

              <div className="bg-[#080809] border border-[#262626] p-4 text-xs font-mono text-[#00FF41] overflow-x-auto">
                <pre className="whitespace-pre-wrap text-[#E2E2E2]">{asset.systemPromptPreview}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Checkout Trigger */}
        <div className="p-6 border-t border-[#262626] bg-[#0A0A0B] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#555] uppercase block">TOTAL PRICE</span>
            <span className="text-xl font-bold font-mono text-white">
              {asset.price === 0 ? 'FREE DOWNLOAD' : `$${asset.price}.00 USD`}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBuy(asset);
            }}
            className="bg-white hover:bg-neutral-200 text-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <span>{asset.price === 0 ? 'Claim Free Asset' : 'Proceed To Secure Checkout'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
