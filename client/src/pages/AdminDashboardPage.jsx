import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Server, 
  ShoppingBag, 
  Layers, 
  Sparkles,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, switchDemoUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [anaRes, finRes, shopsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/financials'),
        api.get('/admin/shops')
      ]);

      setAnalytics(anaRes.data);
      setFinancials(finRes.data);
      setShops(shopsRes.data.shops || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleModeration = async (shopId, isApproved) => {
    setActionLoading(shopId);
    try {
      await api.put(`/admin/shops/${shopId}/approve`, { is_approved: isApproved });
      await fetchAdminData();
    } catch (err) {
      alert('Error updating shop moderation status');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white font-mono">Super Admin Access Required</h2>
        <p className="text-xs text-slate-400">This control panel is restricted to system administrators.</p>
        <button
          onClick={() => switchDemoUser('admin')}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-glow-rose transition-all"
        >
          Switch to Super Admin Demo Profile
        </button>
      </div>
    );
  }

  const stats = analytics?.stats || {
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    dailyActiveUsers: 0,
    dailyPageViews: 0
  };

  const fin = financials?.financials || {
    totalMarketplaceGMV: 0,
    platformCommission: 0,
    serverExpenses: 45,
    netProfit: 0,
    paidOrdersCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title Header */}
      <div className="p-6 rounded-3xl bg-[#120e24] border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-glow-rose">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono">
                Platform Super Admin Control Panel
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                SYSTEM ROOT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Marketplace GMV, Server Operating Overhead & Vendor Moderation Queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            Refresh Analytics
          </button>
        </div>
      </div>

      {/* 1. PLATFORM TRAFFIC & DAU METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Daily Active Users (DAU)</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black font-mono text-cyan-400">
            {stats.dailyActiveUsers.toLocaleString()} Users
          </p>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +14.2% daily surge
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Daily Page Views</span>
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black font-mono text-indigo-400">
            {stats.dailyPageViews.toLocaleString()} Hits
          </p>
          <span className="text-[11px] text-slate-500 font-mono">Catalog & checkout hits</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Total Registered Users</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats.totalUsers} Accounts
          </p>
          <span className="text-[11px] text-slate-400 font-mono">
            {stats.totalBuyers} Buyers | {stats.totalSellers} Sellers
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Catalog Inventory</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">
            {stats.totalProducts} Hardware Items
          </p>
          <span className="text-[11px] text-slate-500 font-mono">Across 8 Categories</span>
        </div>

      </div>

      {/* 2. FINANCIAL BREAKDOWN METRICS */}
      <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Marketplace Financial Breakdown & Commissions
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Commission Rate: <strong className="text-cyan-400">5.0% flat fee</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Marketplace GMV</span>
            <p className="text-2xl font-black font-mono text-cyan-400">
              ${Number(fin.totalMarketplaceGMV).toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">{fin.paidOrdersCount} Paid Orders</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Platform Commission (5%)</span>
            <p className="text-2xl font-black font-mono text-indigo-400">
              ${Number(fin.platformCommission).toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">Gross Platform Revenue</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Server & CDN Expenses</span>
            <p className="text-2xl font-black font-mono text-rose-400">
              -${Number(fin.serverExpenses).toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">Cloud infra & edge hosting</span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 space-y-1">
            <span className="text-[11px] font-mono text-emerald-300 uppercase font-bold">Net Platform Profit</span>
            <p className="text-2xl font-black font-mono text-emerald-400">
              ${Number(fin.netProfit).toFixed(2)}
            </p>
            <span className="text-[10px] text-emerald-300/80 font-mono">After operational costs</span>
          </div>

        </div>

        {/* Daily Traffic 7-Day Chart Preview */}
        {analytics?.trafficHistory && (
          <div className="pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              7-Day Visitor Traffic Trend
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {analytics.trafficHistory.map((t) => (
                <div key={t.visit_date} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">{t.visit_date}</span>
                  <span className="text-sm font-black font-mono text-cyan-400 block mt-1">
                    {t.unique_visitors}
                  </span>
                  <span className="text-[10px] text-slate-500">{t.page_views} views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. MODERATION QUEUE FOR VENDOR SHOPS */}
      <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-400" />
              Vendor Store Moderation Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review new store applications and toggle Approve / Reject status
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {shops.length} Vendor Stores Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3.5">Store / Shop Name</th>
                <th className="p-3.5">Owner Details</th>
                <th className="p-3.5 text-center">Items Listed</th>
                <th className="p-3.5 text-center">Current Status</th>
                <th className="p-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={shop.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                        alt={shop.shop_name}
                        className="h-10 w-10 rounded-xl object-cover bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{shop.shop_name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{shop.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono">
                    <p className="text-slate-200 font-medium">{shop.owner_name}</p>
                    <p className="text-[11px] text-slate-400">{shop.owner_email}</p>
                  </td>

                  <td className="p-3.5 text-center font-mono font-bold text-indigo-400">
                    {shop.total_products || 0}
                  </td>

                  <td className="p-3.5 text-center">
                    {shop.is_approved ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 animate-pulse">
                        <XCircle className="h-3 w-3" />
                        Pending Review
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!shop.is_approved ? (
                        <button
                          onClick={() => handleModeration(shop.id, 1)}
                          disabled={actionLoading === shop.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-[11px] shadow-sm transition-all"
                        >
                          Approve Store
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModeration(shop.id, 0)}
                          disabled={actionLoading === shop.id}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 font-mono text-[11px] border border-slate-700 transition-colors"
                        >
                          Suspend / Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
