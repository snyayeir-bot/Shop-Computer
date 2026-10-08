import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Store, Mail, Lock, Phone, UserPlus, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
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
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      setSuccess(true);
      setTimeout(() => {
        if (res.user.role === 'seller') navigate('/seller');
        else if (res.user.role === 'admin') navigate('/admin');
        else navigate('/products');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="p-8 rounded-3xl bg-[#0b1220] border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create New Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
            Join CYBERTECH Marketplace
          </h1>
          <p className="text-xs text-slate-400">
            Choose your account role to buy PC hardware or start selling as a verified vendor
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Account created successfully! Redirecting to your portal...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
              Select Account Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  formData.role === 'buyer'
                    ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-glow-cyan'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">Buyer Account</h4>
                  <p className="text-[11px] text-slate-400">Browse & order PC parts</p>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, role: 'seller' })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  formData.role === 'seller'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-glow-indigo'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">Vendor / Seller</h4>
                  <p className="text-[11px] text-slate-400">List & sell hardware items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sokha Chan"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Store Name (if seller) */}
          {formData.role === 'seller' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Store / Shop Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="e.g. Apex PC Hardware & Gaming Store"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <Store className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@domain.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+855 12 345 678"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold font-mono text-sm hover:opacity-95 transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <UserPlus className="h-4 w-4" />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-bold hover:underline font-mono">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
