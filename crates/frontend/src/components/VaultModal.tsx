import React, { useState } from 'react';
import { VaultPurchase } from '../types';
import { X, Package, Key, ExternalLink, Download, Copy, Check } from 'lucide-react';

interface VaultModalProps {
  purchases: VaultPurchase[];
  onClose: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({ purchases, onClose }) => {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#0A0A0A] max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-[#4F46E5]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0A0A0A]">Personal BinBag Vault</h2>
              <p className="text-xs text-gray-500">{purchases.length} Acquired Licenses & Deployments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {purchases.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-700">Your Vault is Empty</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Acquired agentic workflows and model licenses will appear here with live API endpoints and license keys.
              </p>
            </div>
          ) : (
            purchases.map(item => (
              <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {item.assetCategory}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1">{item.assetTitle}</h3>
                    <span className="text-[10px] text-gray-400">Acquired {item.purchaseDate}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {item.amountPaid === 0 ? 'Free' : `$${item.amountPaid}`}
                  </span>
                </div>

                <div className="bg-white border border-gray-200 p-3 rounded-xl space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">License Key</span>
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono font-bold text-indigo-600">{item.licenseKey}</code>
                      <button
                        onClick={() => handleCopyKey(item.id, item.licenseKey)}
                        className="text-gray-400 hover:text-gray-900 text-xs font-bold flex items-center gap-1"
                      >
                        {copiedKeyId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Endpoint</span>
                    <input
                      readOnly
                      value={item.apiEndpoint}
                      className="w-full bg-gray-50 border border-gray-100 p-1.5 rounded-lg text-xs font-mono text-gray-600"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0A0A0A] hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};