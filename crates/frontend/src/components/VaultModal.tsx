import React, { useState } from 'react';
import { VaultPurchase } from '../types';
import { X, Package, Key, Copy, Check, Trash2, Plus, ExternalLink } from 'lucide-react';

interface VaultModalProps {
  purchases: VaultPurchase[];
  onClose: () => void;
  onRemovePurchase: (id: string) => void;
  onAddPurchase: (purchase: VaultPurchase) => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  purchases,
  onClose,
  onRemovePurchase,
  onAddPurchase,
}) => {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for adding new collection item
  const [assetTitle, setAssetTitle] = useState('');
  const [assetCategory, setAssetCategory] = useState('Agentic Workflow');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [amountPaid, setAmountPaid] = useState('0');

  const handleCopyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTitle.trim()) return;

    const newItem: VaultPurchase = {
      id: `purch-${Date.now()}`,
      assetId: `custom-${Date.now()}`,
      assetTitle,
      assetCategory,
      purchaseDate: new Date().toISOString().split('T')[0],
      amountPaid: parseFloat(amountPaid) || 0,
      licenseKey: licenseKey || `BB-KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      apiEndpoint: apiEndpoint || 'https://api.binbag.ai/v1/custom-item',
      downloadUrl: apiEndpoint || '#',
    };

    onAddPurchase(newItem);

    // Reset form
    setAssetTitle('');
    setApiEndpoint('');
    setLicenseKey('');
    setAmountPaid('0');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#0A0A0A] max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-2xl text-[#4F46E5] border border-indigo-100">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0A0A0A]">My Saved Collections</h2>
              <p className="text-xs text-gray-500">{purchases.length} Items & Saved Licenses in Collection</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(v => !v)}
              className="bg-[#0A0A0A] hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancel' : 'Add Item'}</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Item Form Collapse */}
        {isAdding && (
          <form onSubmit={handleFormSubmit} className="p-5 bg-indigo-50/40 border-b border-indigo-100 space-y-3">
            <h4 className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">Add Custom Item to Collection</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Item Title *</label>
                <input
                  required
                  value={assetTitle}
                  onChange={e => setAssetTitle(e.target.value)}
                  placeholder="e.g. Finance Sentiment Agent"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={assetCategory}
                  onChange={e => setAssetCategory(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="Agentic Workflow">Agentic Workflow</option>
                  <option value="LLM Fine-tune">LLM Fine-tune</option>
                  <option value="LoRA Model">LoRA Model</option>
                  <option value="Chatbot Template">Chatbot Template</option>
                  <option value="System Prompt">System Prompt</option>
                  <option value="Custom Tool">Custom Tool</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">API Endpoint / Link</label>
                <input
                  value={apiEndpoint}
                  onChange={e => setApiEndpoint(e.target.value)}
                  placeholder="https://api.binbag.ai/v1/..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-700 block mb-1">License Key / Access Token</label>
                <input
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value)}
                  placeholder="BB-LIC-XXXX-XXXX"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Save to Collection
              </button>
            </div>
          </form>
        )}

        {/* List of items */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {purchases.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-700">Your Collection is Empty</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Acquired agentic workflows and saved tools will appear here. Click "+ Add Item" above to add items manually.
              </p>
            </div>
          ) : (
            purchases.map(item => (
              <div key={item.id} className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3 hover:border-gray-300 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        {item.assetCategory}
                      </span>
                      <span className="text-[10px] text-gray-400">Added {item.purchaseDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-1">{item.assetTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      {item.amountPaid === 0 ? 'Free' : `$${item.amountPaid}`}
                    </span>
                    <button
                      onClick={() => onRemovePurchase(item.id)}
                      title="Remove from Collection"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-3 rounded-xl space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">License Key</span>
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono font-bold text-indigo-600 truncate max-w-[80%]">{item.licenseKey}</code>
                      <button
                        onClick={() => handleCopyKey(item.id, item.licenseKey)}
                        className="text-gray-400 hover:text-gray-900 text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        {copiedKeyId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Endpoint / Link</span>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={item.apiEndpoint}
                        className="flex-1 bg-gray-50 border border-gray-100 p-1.5 rounded-lg text-xs font-mono text-gray-600 truncate"
                      />
                      {item.downloadUrl && item.downloadUrl !== '#' && (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {purchases.length} saved item{purchases.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={onClose}
            className="bg-[#0A0A0A] hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Close Collection
          </button>
        </div>

      </div>
    </div>
  );
};