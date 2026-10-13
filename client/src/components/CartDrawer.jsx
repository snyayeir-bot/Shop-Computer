import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function CartDrawer() {
  const { lang, t } = useLanguage();
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    items,
    vendorGroups,
    updateQuantity,
    removeFromCart,
    subtotal,
    taxAmount,
    shippingFee,
    grandTotal
  } = useCart();

  const { user, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    setIsDrawerOpen(false);
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b1120] border-l border-slate-800 flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t('cart.title')}</h3>
                <p className="text-xs text-slate-400">
                  {items.length} {t('cart.items')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body: Items grouped by Vendor */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-semibold text-slate-300">{t('cart.emptyTitle')}</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  {t('cart.emptyDesc')}
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/products');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-all font-mono"
                >
                  {t('cart.startShopping')}
                </button>
              </div>
            ) : (
              Object.entries(vendorGroups).map(([vendorName, vendorItems]) => (
                <div
                  key={vendorName}
                  className="rounded-xl bg-slate-900/80 border border-slate-800/90 overflow-hidden"
                >
                  {/* Vendor Group Header */}
                  <div className="px-3.5 py-2 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                      <Store className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{vendorName}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      Verified Seller
                    </span>
                  </div>

                  {/* Vendor Items */}
                  <div className="p-3 divide-y divide-slate-800/60 space-y-3">
                    {vendorItems.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=150'}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                            {item.name}
                          </h5>
                          <p className="text-xs font-mono font-bold text-amber-400 mt-1">
                            {item.price.toFixed(2)} Credits
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="text-slate-400 hover:text-white p-0.5"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-mono font-bold text-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={item.quantity >= item.stock_quantity}
                                className="text-slate-400 hover:text-white p-0.5 disabled:opacity-30"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer: Real-time calculations */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}:</span>
                  <span className="font-bold text-slate-200">{subtotal.toFixed(2)} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.vatTax')}:</span>
                  <span className="font-bold text-slate-200">{taxAmount.toFixed(2)} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.shipping')}:</span>
                  <span className="font-bold text-slate-200">{shippingFee.toFixed(2)} Credits</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>{t('cart.grandTotal')}:</span>
                  <span className="font-black text-amber-400 text-base">{grandTotal.toFixed(2)} Credits</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-black text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-glow-amber font-mono uppercase tracking-wider"
              >
                <span>{t('cart.proceedCheckout')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{lang === 'kh' ? 'ទូទាត់ប្រាក់ដោយប្រើ Wallet Credits' : 'Checkout securely with Wallet Credits'}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
