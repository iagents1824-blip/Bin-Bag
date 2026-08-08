import React, { useState } from 'react';
import { MarketplaceAsset, VaultPurchase } from '../types';
import { X, ShieldCheck, CreditCard, Lock, CheckCircle2, Copy, Key, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  asset: MarketplaceAsset | null;
  onClose: () => void;
  onCompletePurchase: (purchase: VaultPurchase) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ asset, onClose, onCompletePurchase }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cryptoCurrency, setCryptoCurrency] = useState<'USDT' | 'SOL' | 'ETH'>('USDT');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPurchase, setCompletedPurchase] = useState<VaultPurchase | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!asset) return null;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedKey = `NN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-VAULT`;
      
      const purchase: VaultPurchase = {
        id: `purch-${Date.now()}`,
        assetId: asset.id,
        assetTitle: asset.title,
        assetCategory: asset.category,
        purchaseDate: new Date().toISOString().split('T')[0],
        amountPaid: asset.price,
        licenseKey: generatedKey,
        apiEndpoint: `https://api.binbag.ai/v1/vault/${asset.id}`,
        downloadUrl: asset.downloadUrl,
      };

      setCompletedPurchase(purchase);
      setIsProcessing(false);
      onCompletePurchase(purchase);
    }, 1200);
  };

  const handleCopyKey = () => {
    if (completedPurchase) {
      navigator.clipboard.writeText(completedPurchase.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0D0E] border border-[#262626] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00FF41]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {completedPurchase ? 'ORDER RECEIPT & ACCESS VAULT' : 'SECURE PAYMENT GATEWAY'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedPurchase ? (
            /* Success Receipt Screen */
            <div className="text-center space-y-5">
              <div className="w-12 h-12 bg-[#00FF41]/10 border border-[#00FF41] rounded-full flex items-center justify-center mx-auto text-[#00FF41]">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest block">PAYMENT CONFIRMED</span>
                <h3 className="text-xl font-bold text-white">{completedPurchase.assetTitle}</h3>
                <p className="text-xs text-[#888888] mt-1">
                  License & files have been deposited directly into your Vault.
                </p>
              </div>

              {/* License Key Box */}
              <div className="bg-[#080809] border border-[#262626] p-4 text-left font-mono">
                <span className="text-[9px] uppercase text-[#555] block mb-1">Generated License Key</span>
                <div className="flex items-center justify-between text-xs text-[#00FF41] font-bold">
                  <span>{completedPurchase.licenseKey}</span>
                  <button onClick={handleCopyKey} className="text-[#888888] hover:text-white">
                    {copiedKey ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={completedPurchase.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#00FF41] hover:bg-[#00cc34] text-black font-mono font-bold text-xs py-2.5 uppercase tracking-wider block text-center transition-colors"
                >
                  Download Asset Package
                </a>
                <button
                  onClick={onClose}
                  className="w-full bg-[#121214] border border-[#262626] text-white hover:border-[#555] font-mono text-xs py-2 uppercase tracking-wider"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Payment Form */
            <form onSubmit={handleProcessPayment} className="space-y-5">
              
              {/* Asset Item Preview */}
              <div className="bg-[#121214] border border-[#262626] p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] block">{asset.category}</span>
                  <span className="text-white font-bold">{asset.title}</span>
                </div>
                <span className="text-base font-bold font-mono text-[#00FF41]">
                  {asset.price === 0 ? 'FREE' : `$${asset.price}.00`}
                </span>
              </div>

              {asset.price > 0 && (
                <>
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border flex items-center justify-center gap-2 ${
                        paymentMethod === 'card'
                          ? 'border-[#00FF41] bg-[#00FF41]/5 text-white'
                          : 'border-[#262626] bg-[#0A0A0B] text-[#888888]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#00FF41]" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-3 border flex items-center justify-center gap-2 ${
                        paymentMethod === 'crypto'
                          ? 'border-[#00FF41] bg-[#00FF41]/5 text-white'
                          : 'border-[#262626] bg-[#0A0A0B] text-[#888888]'
                      }`}
                    >
                      <Key className="w-4 h-4 text-[#00FF41]" />
                      <span>Crypto Pay</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#0A0A0B] border border-[#262626] text-xs text-white p-2.5 font-mono focus:outline-none focus:border-[#555]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#0A0A0B] border border-[#262626] text-xs text-white p-2.5 font-mono focus:outline-none focus:border-[#555]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">CVC / CVV</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-[#0A0A0B] border border-[#262626] text-xs text-white p-2.5 font-mono focus:outline-none focus:border-[#555]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">Select Crypto Currency</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['USDT', 'SOL', 'ETH'] as const).map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setCryptoCurrency(c)}
                              className={`p-2 text-xs font-mono border ${
                                cryptoCurrency === c ? 'border-[#00FF41] text-[#00FF41]' : 'border-[#262626] text-[#888888]'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#080809] border border-[#262626] p-3 text-[10px] font-mono text-[#888888]">
                        <p className="text-white">Payable: {asset.price} {cryptoCurrency}</p>
                        <p className="mt-1 text-[#555]">Vault Key will be minted automatically on 1 block confirmation.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold text-xs py-3 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>
                  {isProcessing
                    ? 'AUTHORIZING TRANSACTION...'
                    : asset.price === 0
                    ? 'CLAIM FREE ASSET TO VAULT'
                    : `PAY $${asset.price}.00 & MINT LICENSE`}
                </span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
