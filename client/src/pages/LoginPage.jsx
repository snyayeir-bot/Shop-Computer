import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user.role === 'seller') navigate('/seller');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-[#0b1220] border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl font-black text-white font-mono">
            Sign In to CYBERTECH
          </h1>
          <p className="text-xs text-slate-400">
            Access your buyer dashboard, seller portal, or admin panel
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>⚡ Quick Demo Login:</span>
            <span className="text-[10px] text-cyan-400">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('demo@demo.com');
                setPassword('demo123');
              }}
              className="p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-cyan-400 font-mono">Demo User</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">1-Click</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate font-mono">demo@demo.com</p>
              <p className="text-[9px] text-slate-500 font-mono">Pass: demo123</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('admin@cybertech.com');
                setPassword('admin123');
              }}
              className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-purple-400 font-mono">Super Admin</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">1-Click</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate font-mono">admin@cybertech.com</p>
              <p className="text-[9px] text-slate-500 font-mono">Pass: admin123</p>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-cyan-400 font-bold hover:underline font-mono">
            Register Account here
          </Link>
        </div>

      </div>
    </div>
  );
}
