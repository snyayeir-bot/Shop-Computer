import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  RotateCcw, 
  Cpu, 
  Layers, 
  ChevronRight, 
  Zap, 
  Sparkles, 
  Store 
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { useLanguage } from '../context/LanguageContext';

export default function CatalogPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const currentCategory = searchParams.get('category') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentSocket = searchParams.get('socket') || '';
  const currentVram = searchParams.get('vram') || '';
  const currentDdr = searchParams.get('ddr') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMaxPrice = searchParams.get('maxPrice') || '3000';

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data.categories || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  // Fetch products with all filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentCategory && currentCategory !== 'all') queryParams.set('category', currentCategory);
        if (currentBrand && currentBrand !== 'all') queryParams.set('brand', currentBrand);
        if (currentSocket) queryParams.set('socket', currentSocket);
        if (currentVram) queryParams.set('vram', currentVram);
        if (currentDdr) queryParams.set('ddr', currentDdr);
        if (currentSearch) queryParams.set('search', currentSearch);
        if (currentSort) queryParams.set('sort', currentSort);
        if (currentMaxPrice) queryParams.set('maxPrice', currentMaxPrice);

        const res = await api.get(`/products?${queryParams.toString()}`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentBrand, currentSocket, currentVram, currentDdr, currentSearch, currentSort, currentMaxPrice]);

  const updateFilter = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (!val || val === 'all') {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    setSearchParams(params);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const brandsList = ['All', 'ASUS', 'AMD', 'Intel', 'MSI', 'Corsair', 'Samsung', 'Seasonic', 'Lian Li'];
  const socketsList = ['', 'AM5', 'LGA1700', 'AM4'];
  const vramList = ['', '24GB', '16GB', '12GB', '8GB'];
  const ddrList = ['', 'DDR5', 'DDR4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>Hardware Marketplace</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300 capitalize">{currentCategory || t('catalog.allCategories')}</span>
          </div>
          <h1 className="text-3xl font-black text-white font-mono tracking-tight">
            {t('catalog.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('catalog.subtitle')}
          </p>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>{t('catalog.filters')}</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">{lang === 'kh' ? 'តម្រៀប:' : 'Sort by:'}</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent text-xs font-mono text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">{lang === 'kh' ? 'ថ្មីៗ & ពេញនិយម' : 'Featured & Newest'}</option>
              <option value="price-low" className="bg-slate-900 text-slate-200">{lang === 'kh' ? 'តម្លៃ៖ ទាបទៅខ្ពស់' : 'Price: Low to High'}</option>
              <option value="price-high" className="bg-slate-900 text-slate-200">{lang === 'kh' ? 'តម្លៃ៖ ខ្ពស់ទៅទាប' : 'Price: High to Low'}</option>
              <option value="stock" className="bg-slate-900 text-slate-200">{lang === 'kh' ? 'ចំនួនស្តុក' : 'Stock Quantity'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-6 sticky top-24">
            
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t('catalog.filters')}
              </h3>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                {lang === 'kh' ? 'កំណត់ឡើងវិញ' : 'Reset'}
              </button>
            </div>

            {/* Keyword Search Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Search Catalog</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="RTX 4090, AM5, DDR5..."
                  value={currentSearch}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', 'all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                    currentCategory === 'all'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                      currentCategory === cat.slug
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat.name.split('(')[0]}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{cat.slug}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-slate-300">Max Credits</label>
                <span className="text-xs font-mono font-bold text-amber-400">{currentMaxPrice} Credits</span>
              </div>
              <input
                type="range"
                min="50"
                max="3500"
                step="50"
                value={currentMaxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>50 Credits</span>
                <span>3,500 Credits</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Brand</label>
              <div className="flex flex-wrap gap-1.5">
                {brandsList.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateFilter('brand', b.toLowerCase())}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                      currentBrand === b.toLowerCase() || (b === 'All' && currentBrand === 'all')
                        ? 'bg-indigo-600 text-white font-bold shadow-glow-indigo'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Spec Hardware Filters (Socket, VRAM, DDR) */}
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                ⚙️ Technical Spec Filters
              </h4>

              {/* Socket Filter */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">CPU / Board Socket</label>
                <div className="flex flex-wrap gap-1.5">
                  {socketsList.map((s) => (
                    <button
                      key={s || 'all-socket'}
                      onClick={() => updateFilter('socket', s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        currentSocket === s
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {s || 'Any Socket'}
                    </button>
                  ))}
                </div>
              </div>

              {/* VRAM Size Filter */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">GPU VRAM Capacity</label>
                <div className="flex flex-wrap gap-1.5">
                  {vramList.map((v) => (
                    <button
                      key={v || 'all-vram'}
                      onClick={() => updateFilter('vram', v)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        currentVram === v
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {v || 'Any VRAM'}
                    </button>
                  ))}
                </div>
              </div>

              {/* DDR Generation Filter */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">Memory Generation</label>
                <div className="flex flex-wrap gap-1.5">
                  {ddrList.map((d) => (
                    <button
                      key={d || 'all-ddr'}
                      onClick={() => updateFilter('ddr', d)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        currentDdr === d
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {d || 'Any DDR'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Showing <strong className="text-cyan-400">{products.length}</strong> matching hardware components
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Cpu className="h-12 w-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No matching hardware found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or clearing specific socket/VRAM spec filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Product Inspect Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}
