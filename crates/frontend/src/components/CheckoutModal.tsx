import React, { useState } from 'react';
import { MarketplaceAsset, VaultPurchase } from '../types';
import { X, CreditCard, ShieldCheck, CheckCircle2, Copy, Check, Download, Key } from 'lucide-react';

interface CheckoutModalProps {
  asset: MarketplaceAsset | null;
  onClose: () => void;
  onCompletePurchase: (purchase: VaultPurchase) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ asset, onClose, onCompletePurchase }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<VaultPurchase | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!asset) return null;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newPurchase: VaultPurchase = {
        id: `purch-${Date.now()}`,
        assetId: asset.id,
        assetTitle: asset.title,
        assetCategory: asset.category,
        purchaseDate: new Date().toISOString().split('T')[0],
        amountPaid: asset.price,
        licenseKey: `BB-LIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        apiEndpoint: `https://api.binbag.ai/v1/deploy/${asset.id}`,
        downloadUrl: asset.downloadUrl || '#'
      };
      setPurchaseSuccess(newPurchase);
      onCompletePurchase(newPurchase);
    }, 1200);
  };

  const handleCopyLicense = () => {
    if (purchaseSuccess) {
      navigator.clipboard.writeText(purchaseSuccess.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#0A0A0A]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] block mb-1">
              SECURE CHECKOUT
            </span>
            <h2 className="text-xl font-black text-[#0A0A0A]">
              {purchaseSuccess ? 'Acquisition Confirmed' : 'Acquire License'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!purchaseSuccess ? (
            <>
              {/* Order Summary */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Selected Item</span>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{asset.title}</h3>
                    <p className="text-xs text-gray-500">{asset.category}</p>
                  </div>
                  <span className="text-lg font-black text-[#0A0A0A]">
                    {asset.price === 0 ? 'Free' : `$${asset.price}`}
                  </span>
                </div>
              </div>

              {/* Payment selector */}
              {asset.price > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'crypto'
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      <span>Crypto (USDT/SOL)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Security info */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified License Key automatically generated on confirmation.</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full bg-[#0A0A0A] hover:bg-black text-white py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
              >
                {isProcessing ? 'Processing Transaction...' : asset.price === 0 ? 'Claim Free Asset' : `Pay $${asset.price}`}
              </button>
            </>
          ) : (
            /* Success Receipt */
            <div className="space-y-5">
              <div className="text-center py-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-lg font-black text-gray-900">License Generated!</h3>
                <p className="text-xs text-gray-500">Your asset has been deposited into your personal BinBag Vault.</p>
              </div>

              {/* License box */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">License Key</span>
                  <div className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-xl">
                    <code className="text-xs font-mono font-bold text-indigo-600">{purchaseSuccess.licenseKey}</code>
                    <button onClick={handleCopyLicense} className="text-gray-400 hover:text-gray-900">
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Deployment Endpoint</span>
                  <input
                    readOnly
                    value={purchaseSuccess.apiEndpoint}
                    className="w-full bg-white border border-gray-200 p-2 rounded-xl text-xs font-mono text-gray-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="w-full bg-[#0A0A0A] text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};