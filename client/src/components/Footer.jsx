import React from 'react';
import { Cpu, ShieldCheck, Truck, Clock, Award, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#060a14] pt-12 pb-8 mt-20 text-slate-400 text-sm">
      {/* Feature highlights bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Genuine Hardware</h4>
              <p className="text-xs text-slate-400">Official distributor warranties</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400">24-48h arrival across Cambodia</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Instant KHQR & Card</h4>
              <p className="text-xs text-slate-400">Bakong KHQR seamless checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Multi-Vendor Verified</h4>
              <p className="text-xs text-slate-400">Strict store moderation queue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-white font-bold font-mono tracking-wider text-base">
              CYBER<span className="text-cyan-400">TECH</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Leading multi-vendor computer parts, PC builder hardware, and high-performance gaming laptops marketplace in Cambodia.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>Built with Node.js & React</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-mono mb-4 text-cyan-400">
            Hardware Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products?category=gpu" className="hover:text-cyan-400 transition-colors">Graphics Cards (RTX 4090 / RX 7900)</Link></li>
            <li><Link to="/products?category=cpu" className="hover:text-cyan-400 transition-colors">Processors (Ryzen 7000 / Intel 14th)</Link></li>
            <li><Link to="/products?category=laptop" className="hover:text-cyan-400 transition-colors">Gaming Laptops & OLED Ultrabooks</Link></li>
            <li><Link to="/products?category=ram" className="hover:text-cyan-400 transition-colors">DDR5 & DDR4 Overclock Memory</Link></li>
            <li><Link to="/products?category=storage" className="hover:text-cyan-400 transition-colors">PCIe 4.0 / 5.0 NVMe SSDs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-mono mb-4 text-indigo-400">
            Vendor & Portals
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/seller" className="hover:text-indigo-400 transition-colors">Vendor Shop Registration</Link></li>
            <li><Link to="/seller" className="hover:text-indigo-400 transition-colors">Product & Stock Manager</Link></li>
            <li><Link to="/seller" className="hover:text-indigo-400 transition-colors">Vendor Analytics Dashboard</Link></li>
            <li><Link to="/admin" className="hover:text-rose-400 transition-colors">Super Admin Moderation Queue</Link></li>
            <li><Link to="/profile" className="hover:text-cyan-400 transition-colors">Buyer Order Timeline & Tracking</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-mono mb-4 text-purple-400">
            Payment & Support
          </h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Support Bakong KHQR, Visa/Mastercard, and Cash on Delivery with direct vendor warranty verification.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">Support Hot-Line:</span>
            <p className="mt-1 text-slate-200">+855 (0) 23 888 999</p>
            <p className="text-slate-500 text-[11px]">support@cybertech-kh.com</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 CYBERTECH Multi-Vendor Platform. All rights reserved.</p>
        <p className="font-mono text-[11px] text-slate-400">
          Powered by React + Tailwind + Express.js + MySQL/SQLite Engine
        </p>
      </div>
    </footer>
  );
}
