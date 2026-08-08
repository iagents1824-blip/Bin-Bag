import React, { useState } from 'react';
import { VaultPurchase } from '../types';
import { X, Key, Download, Copy, Check, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

interface VaultModalProps {
  purchases: VaultPurchase[];
  onClose: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({ purchases, onClose }) => {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0D0E] border border-[#262626] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#00FF41]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              MY PERSONAL AI ACCESS VAULT ({purchases.length})
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Purchases List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {purchases.length === 0 ? (
            <div className="text-center py-12 border border-[#262626] bg-[#121214] p-6">
              <Key className="w-8 h-8 text-[#555] mx-auto mb-3" />
              <p className="text-white text-sm font-medium">Your Vault is empty.</p>
              <p className="text-[#888888] text-xs mt-1">
                Acquire AI models, fine-tunes, or agent workflows in the Marketplace to receive license keys and instant downloads.
              </p>
            </div>
          ) : (
            purchases.map(item => (
              <div key={item.id} className="bg-[#121214] border border-[#262626] p-4 text-xs font-mono">
                
                {/* Title & Date Bar */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#262626]">
                  <div>
                    <span className="text-[9px] text-[#00FF41] uppercase">{item.assetCategory}</span>
                    <h3 className="text-sm font-bold text-white font-sans">{item.assetTitle}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#555] block">ACQUIRED: {item.purchaseDate}</span>
                    <span className="text-xs text-white font-bold">
                      {item.amountPaid === 0 ? 'FREE' : `$${item.amountPaid}.00`}
                    </span>
                  </div>
                </div>

                {/* License Key Box */}
                <div className="space-y-2 my-3">
                  <div className="bg-[#080809] border border-[#262626] p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#555] uppercase block">LICENSE KEY</span>
                      <span className="text-xs text-[#00FF41] font-bold">{item.licenseKey}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.id, item.licenseKey)}
                      className="text-[#888888] hover:text-white p-1"
                    >
                      {copiedKeyId === item.id ? <Check className="w-4 h-4 text-[#00FF41]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-[#555] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>Verified License</span>
                  </span>

                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-neutral-200 text-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors font-sans"
                  >
                    <Download className="w-3.5 h-3.5 text-black" />
                    <span>Download Package</span>
                  </a>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#0A0A0B] text-right">
          <button
            onClick={onClose}
            className="bg-[#121214] border border-[#262626] text-white hover:border-[#555] px-4 py-1.5 text-xs font-mono uppercase"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
