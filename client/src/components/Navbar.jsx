import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Cpu,
  ShoppingCart,
  User,
  Store,
  ShieldAlert,
  LogOut,
  Sparkles,
  Menu,
  X,
  Search,
  LogIn,
  UserPlus,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const { totalCount, setIsDrawerOpen } = useCart();
  const { balance, setIsTopUpOpen } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    }
    console.log(totalCount);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070c18]/90 backdrop-blur-xl">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-glow-cyan transition-transform group-hover:scale-105">
              <div className="h-full w-full bg-[#090e1c] rounded-[11px] flex items-center justify-center">
                <Cpu className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white font-mono flex items-center gap-1">
                CYBER<span className="text-cyan-400">TECH</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Hardware & Laptops
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search RTX 4090, Ryzen 7800X3D, DDR5, ROG Laptop..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
            <Link
              to="/products"
              className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/products'
                  ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              Hardware Catalog
            </Link>

            {user?.role === 'seller' && (
              <Link
                to="/seller"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname.startsWith('/seller')
                    ? 'text-indigo-400 bg-indigo-950/30 border border-indigo-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <Store className="h-4 w-4 text-indigo-400" />
                Seller Portal
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname.startsWith('/admin')
                    ? 'text-rose-400 bg-rose-950/30 border border-rose-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Admin Panel
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/profile'
                    ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Actions: Wallet Credits, Cart & Profile Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet Credits Badge & Top-Up trigger */}
            {user && (
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-mono shadow-sm group"
                title="Top-Up Wallet Credits via ACLEDA KHQR"
              >
                <Coins className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black">{balance.toFixed(2)}</span>
                <span className="text-[10px] uppercase font-bold text-amber-400/80 hidden sm:inline">Credits</span>
                <span className="ml-1 text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded-md">
                  + Top-Up
                </span>
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500 text-slate-200 hover:text-cyan-400 transition-all shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-[11px] h-5 w-5 rounded-full flex items-center justify-center shadow-glow-cyan animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/profile'}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="h-7 w-7 rounded-lg object-cover border border-cyan-500/30"
                  />
                  <div className="text-left leading-tight hidden xl:block">
                    <p className="text-xs font-bold text-slate-200">{user.name}</p>
                    <p className="text-[10px] text-cyan-400 font-mono capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-all font-mono flex items-center gap-1.5"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-black hover:opacity-90 transition-all shadow-glow-cyan font-mono flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register Account</span>
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-4 space-y-2">
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <input
                type="text"
                placeholder="Search computer hardware..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200"
              />
            </form>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
            >
              Catalog & Search
            </Link>

            {user?.role === 'seller' && (
              <Link
                to="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-indigo-300 hover:bg-slate-800"
              >
                Seller Portal
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-rose-300 hover:bg-slate-800"
              >
                Super Admin Panel
              </Link>
            )}

            {!user && (
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-xs font-mono text-center text-slate-200 font-bold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                  className="flex-1 py-2 rounded-lg bg-cyan-500 text-black text-xs font-mono text-center font-bold"
                >
                  Register Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
