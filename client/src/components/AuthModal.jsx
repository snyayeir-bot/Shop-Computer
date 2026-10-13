import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, Store, Sparkles, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalTab, setAuthModalTab, login, register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone: '',
    shopName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        const res = await login(formData.email, formData.password);
        setIsAuthModalOpen(false);
        if (res.user.role === 'seller') navigate('/seller');
        else if (res.user.role === 'admin') navigate('/admin');
        else navigate('/products');
      } else {
        const res = await register(formData);
        setSuccessMsg('Account registered successfully!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          if (res.user.role === 'seller') navigate('/seller');
          else if (res.user.role === 'admin') navigate('/admin');
          else navigate('/products');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={() => setIsAuthModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1628] border border-slate-700/80 shadow-2xl z-10 overflow-hidden my-6">
        
        {/* Header with Close */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              {authModalTab === 'login' ? 'Sign In to Account' : 'Register New Account'}
            </h3>
            <p className="text-xs text-slate-400">
              {authModalTab === 'login' 
                ? 'Enter your credentials to access your portal' 
                : 'Create a Buyer or Vendor / Seller account'}
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => { setAuthModalTab('login'); setError(''); }}
            className={`flex-1 py-3 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors ${
              authModalTab === 'login'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setAuthModalTab('register'); setError(''); }}
            className={`flex-1 py-3 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors ${
              authModalTab === 'register'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {authModalTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'buyer' })}
                    className={`py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
                      formData.role === 'buyer'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Buyer Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'seller' })}
                    className={`py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
                      formData.role === 'seller'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5" />
                    Vendor / Seller
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {formData.role === 'seller' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Store / Shop Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="e.g. Phnom Penh PC Gaming Store"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                    <Store className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your-email@domain.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold font-mono text-sm hover:opacity-95 transition-all shadow-glow-cyan disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : authModalTab === 'login' ? 'Sign In Now' : 'Create Account'}
          </button>

          {/* Quick Demo Fill Buttons for Login Tab */}
          {authModalTab === 'login' && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>⚡ Quick Demo Credentials:</span>
                <span className="text-[10px] text-cyan-400">1-Click</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, email: 'demo@demo.com', password: 'demo123' }))}
                  className="p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                >
                  <p className="text-[11px] font-bold text-cyan-400 font-mono">Demo User</p>
                  <p className="text-[10px] text-slate-300 truncate font-mono">demo@demo.com</p>
                  <p className="text-[9px] text-slate-500 font-mono">Pass: demo123</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, email: 'admin@cybertech.com', password: 'admin123' }))}
                  className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-left transition-all hover:scale-[1.02]"
                >
                  <p className="text-[11px] font-bold text-purple-400 font-mono">Super Admin</p>
                  <p className="text-[10px] text-slate-300 truncate font-mono">admin@cybertech.com</p>
                  <p className="text-[9px] text-slate-500 font-mono">Pass: admin123</p>
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            {authModalTab === 'login' ? (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalTab('register')}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Register Account here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalTab('login')}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
