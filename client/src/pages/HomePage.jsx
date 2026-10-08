import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Layers, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Store, 
  Sparkles, 
  Laptop, 
  HardDrive, 
  Server, 
  Box, 
  CheckCircle2 
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/products/categories')
        ]);
        setFeaturedProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryIcons = {
    gpu: Cpu,
    cpu: Zap,
    laptop: Laptop,
    ram: Layers,
    motherboard: Server,
    psu: Zap,
    storage: HardDrive,
    cases: Box
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section with Dark-Tech Glowing Aesthetic */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-glow-cyan">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Next-Gen Multi-Vendor Computer Hardware Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
            UNLEASH MAXIMUM <br />
            <span className="cyber-gradient-text">COMPUTING POWER</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Directly connect with top verified hardware vendors in Cambodia. Source flagship GPUs, Ryzen & Intel CPUs, DDR5 RAM, and high-refresh OLED laptops with guaranteed genuine warranties.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
            <Link
              to="/products"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-sm flex items-center gap-2 hover:opacity-95 transition-all shadow-glow-cyan font-mono"
            >
              <span>Explore Hardware Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/seller"
              className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500/60 text-slate-200 hover:text-white font-bold text-sm flex items-center gap-2 transition-all font-mono"
            >
              <Store className="h-4 w-4 text-indigo-400" />
              <span>Become a Vendor</span>
            </Link>
          </div>

          {/* Key metrics strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-black font-mono text-cyan-400">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">Authentic Hardware</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-black font-mono text-indigo-400">KHQR</span>
              <p className="text-xs text-slate-400 mt-0.5">Instant Bakong Pay</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-black font-mono text-emerald-400">&lt; 24h</span>
              <p className="text-xs text-slate-400 mt-0.5">Fast Dispatch</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-black font-mono text-purple-400">Multi</span>
              <p className="text-xs text-slate-400 mt-0.5">Vendor Ecosystem</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="h-6 w-6 text-cyan-400" />
              Shop by Hardware Category
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select component specifications, sockets, and generations
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const IconComp = categoryIcons[cat.slug] || Cpu;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 flex flex-col items-center text-center transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-slate-800/80 group-hover:bg-cyan-950/60 group-hover:text-cyan-300 text-slate-400 transition-colors mb-2">
                  <IconComp className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                  {cat.name.split('(')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Hardware Inventory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Zap className="h-6 w-6 text-indigo-400" />
              Featured Hardware & Laptops
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verified stock from approved computer stores
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            See Full Catalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Seller Portal Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-indigo-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-500/30">
              For Computer Shops & Importers
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Sell Your Hardware to Thousands of Builders & Gamers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch your official vendor storefront, manage real-time inventory with custom JSON technical specifications, track revenue analytics, and receive Bakong payments with 0 hassle.
            </p>
            <div className="pt-2">
              <Link
                to="/seller"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-mono font-bold text-xs shadow-glow-indigo transition-all"
              >
                <span>Launch Vendor Store</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}
