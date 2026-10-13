import React, { useState } from 'react';
import { X, ShoppingCart, Check, Store, ShieldCheck, Cpu, HardDrive, Zap, Info, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const specs = product.specifications || {};
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0d1424] border border-slate-700/80 shadow-2xl z-10 overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              {product.brand || 'Hardware'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SKU: CYBER-{product.id?.toString().padStart(5, '0')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Image & Vendor Card */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Vendor Details */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                  <Store className="h-4 w-4 text-indigo-400" />
                  <span>{product.shop_name || 'TechZone Cambodia'}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Approved Vendor
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {product.shop_description || 'Authorized distributor of genuine PC components and gaming rigs with nationwide warranty.'}
              </p>
            </div>
          </div>

          {/* Right Column: Title, Price, Hardware Specs */}
          <div className="space-y-5 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white leading-snug">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black font-mono text-amber-400">
                  {product.price?.toFixed(2)} Credits
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Stock: <strong className={product.stock_quantity < 5 ? 'text-amber-400' : 'text-emerald-400'}>
                    {product.stock_quantity} units available
                  </strong>
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                {product.description || 'High-performance computing component built with cutting-edge engineering and maximum reliability.'}
              </p>

              {/* Technical Specifications JSON Table */}
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-bold">
                  <Cpu className="h-3.5 w-3.5" />
                  Technical Specifications
                </h4>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden divide-y divide-slate-800/80 text-xs">
                  {Object.keys(specs).length > 0 ? (
                    Object.entries(specs).map(([k, v]) => (
                      <div key={k} className="flex px-3 py-2 justify-between">
                        <span className="text-slate-400 capitalize font-mono text-[11px]">
                          {k.replace('_', ' ')}
                        </span>
                        <span className="text-slate-200 font-semibold font-mono text-[11px] text-right">
                          {String(v)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-slate-500 text-xs italic">
                      Standard manufacturer specifications applied.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart button */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">Quantity:</span>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                    disabled={qty >= product.stock_quantity}
                    className="text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 rounded-xl font-mono font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-glow-cyan ${
                  addedSuccess
                    ? 'bg-emerald-500 text-black'
                    : isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black hover:opacity-90'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart (${(product.price * qty).toFixed(2)})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Includes 12-36 Months Distributor Hardware Warranty</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
