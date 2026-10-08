import React from 'react';
import { ShoppingCart, Eye, Store, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelect }) {
  const { addToCart } = useCart();

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;
  const isOutOfStock = product.stock_quantity <= 0;

  // Extract primary key spec labels
  const specs = product.specifications || {};
  const primarySpecs = [
    specs.vram && { label: 'VRAM', val: specs.vram },
    specs.socket && { label: 'Socket', val: specs.socket },
    specs.ddr_generation && { label: 'DDR', val: specs.ddr_generation },
    specs.capacity && { label: 'Cap', val: specs.capacity },
    specs.wattage && { label: 'PSU', val: specs.wattage },
    specs.gpu && { label: 'GPU', val: specs.gpu },
    specs.cpu && { label: 'CPU', val: specs.cpu }
  ].filter(Boolean).slice(0, 3);

  return (
    <div className="group relative rounded-2xl bg-[#0e1628]/80 border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-glow-cyan transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-md">
      
      {/* Top badges & Stock indicator */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1628] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm uppercase">
            {product.brand || 'Hardware'}
          </span>
          {product.is_featured === 1 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-gradient-to-r from-amber-500/90 to-rose-500/90 text-black flex items-center gap-1 shadow-sm">
              <Zap className="h-3 w-3 fill-black" />
              HOT
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-950/90 text-rose-400 border border-rose-500/40 backdrop-blur-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-950/90 text-amber-400 border border-amber-500/40 backdrop-blur-sm flex items-center gap-1 animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              Only {product.stock_quantity} left
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              In Stock ({product.stock_quantity})
            </span>
          )}
        </div>

        {/* Quick view hover button */}
        <button
          onClick={() => onSelect(product)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 shadow-glow-cyan transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="h-3.5 w-3.5" />
            Quick Inspect
          </span>
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Vendor Info */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
            <Store className="h-3 w-3 text-indigo-400" />
            <span className="truncate hover:text-indigo-300 transition-colors">
              {product.shop_name || 'TechZone Hardware'}
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer leading-tight min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          {/* Key Specs Tags */}
          {primarySpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {primarySpecs.map((spec, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300 truncate max-w-[130px]"
                >
                  <strong className="text-cyan-400">{spec.label}:</strong> {spec.val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">MSRP Price</span>
            <span className="text-lg font-extrabold font-mono text-cyan-400">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black hover:opacity-90 shadow-glow-cyan hover:scale-[1.02]'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

    </div>
  );
}
