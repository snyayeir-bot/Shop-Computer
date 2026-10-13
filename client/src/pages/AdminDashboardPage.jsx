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
  Zap,
  Coins,
  ArrowUpRight,
  Clock,
  Check,
  X,
  FileText,
  Eye,
  FileCheck2,
  ExternalLink,
  Building,
  Hash,
  Search,
  Filter,
  CreditCard,
  Image as ImageIcon,
  QrCode,
  Upload
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboardPage() {
  const { user, switchDemoUser } = useAuth();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'topups' | 'withdrawals'
  const [analytics, setAnalytics] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [shops, setShops] = useState([]);
  const [topups, setTopups] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Receipt Inspection & Filter States
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [topupSearch, setTopupSearch] = useState('');
  const [topupFilter, setTopupFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'

  // Payout Proof & Seller QR Modals
  const [payoutApprovalModal, setPayoutApprovalModal] = useState(null);
  const [payoutProofImage, setPayoutProofImage] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [viewingSellerQr, setViewingSellerQr] = useState(null);
  const [viewingAdminProof, setViewingAdminProof] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [anaRes, finRes, shopsRes, topupsRes, withRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/financials'),
        api.get('/admin/shops'),
        api.get('/wallet/admin/topups').catch(() => ({ data: { topups: [] } })),
        api.get('/wallet/admin/withdrawals').catch(() => ({ data: { withdrawals: [] } }))
      ]);

      setAnalytics(anaRes.data);
      setFinancials(finRes.data);
      setShops(shopsRes.data.shops || []);
      setTopups(topupsRes.data?.topups || []);
      setWithdrawals(withRes.data?.withdrawals || []);
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
    setActionLoading(`shop_${shopId}`);
    try {
      await api.put(`/admin/shops/${shopId}/approve`, { is_approved: isApproved });
      await fetchAdminData();
    } catch (err) {
      alert('Error updating shop moderation status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTopupApproval = async (topupId, status) => {
    setActionLoading(`topup_${topupId}`);
    try {
      await api.put(`/wallet/admin/topups/${topupId}`, { status });
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update top-up status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdrawalApproval = async (withdrawalId, status) => {
    setActionLoading(`withdraw_${withdrawalId}`);
    try {
      await api.put(`/wallet/admin/withdrawals/${withdrawalId}`, { status });
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update withdrawal status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProofSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPayoutProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayoutWithProof = async (e) => {
    e.preventDefault();
    if (!payoutApprovalModal) return;
    setActionLoading(`withdraw_${payoutApprovalModal.id}`);
    try {
      await api.put(`/wallet/admin/withdrawals/${payoutApprovalModal.id}`, {
        status: 'approved',
        adminProofUrl: payoutProofImage || null,
        adminNotes: payoutNotes || null
      });
      await fetchAdminData();
      setPayoutApprovalModal(null);
      setPayoutProofImage('');
      setPayoutNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve payout');
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

  const pendingTopupsCount = topups.filter((t) => t.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center shadow-glow-rose">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono">Super Admin Control Hub</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                Level 1 Clearance
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Logged in: {user.name} ({user.email})
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-glow-rose'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('admin.tabOverview')}
          </button>
          <button
            onClick={() => setActiveTab('topups')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'topups'
                ? 'bg-rose-600 text-white shadow-glow-rose'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>{t('admin.tabTopups')}</span>
            {pendingTopupsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-extrabold animate-pulse">
                {pendingTopupsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-rose-600 text-white shadow-glow-rose'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t('admin.tabWithdrawals')}</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500 text-black font-extrabold animate-pulse">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW & FINANCIALS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">{t('admin.totalUsers')}</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-black font-mono text-white">{stats.totalUsers}</p>
              <span className="text-[11px] text-slate-500 font-mono">
                {stats.totalBuyers} {t('admin.buyers')} • {stats.totalSellers} {t('admin.sellers')}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">{t('admin.hardwareProducts')}</span>
                <Layers className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black font-mono text-indigo-400">{stats.totalProducts}</p>
              <span className="text-[11px] text-slate-500 font-mono">{t('admin.acrossApproved')}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">{t('admin.totalOrders')}</span>
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono text-emerald-400">{stats.totalOrders}</p>
              <span className="text-[11px] text-slate-500 font-mono">{fin.paidOrdersCount} {t('admin.paidOrders')}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">{t('admin.dailyVisitors')}</span>
                <Activity className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black font-mono text-rose-400">{stats.dailyActiveUsers}</p>
              <span className="text-[11px] text-slate-500 font-mono">{stats.dailyPageViews} {t('admin.pageViewsToday')}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  {t('admin.financialTitle')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('admin.financialSubtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">{t('admin.totalMarketplaceVolume')}</span>
                <p className="text-2xl font-black font-mono text-cyan-400">
                  {Number(fin.totalMarketplaceGMV).toFixed(2)} Credits
                </p>
                <span className="text-[10px] text-slate-500">{fin.paidOrdersCount} {t('admin.paidOrders')}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">{t('admin.platformCommission')}</span>
                <p className="text-2xl font-black font-mono text-indigo-400">
                  {Number(fin.platformCommission).toFixed(2)} Credits
                </p>
                <span className="text-[10px] text-slate-500">{t('admin.grossRevenue')}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">{t('admin.serverExpenses')}</span>
                <p className="text-2xl font-black font-mono text-rose-400">
                  -{Number(fin.serverExpenses).toFixed(2)} Credits
                </p>
                <span className="text-[10px] text-slate-500">{t('admin.cloudInfra')}</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-mono text-emerald-300 uppercase font-bold">{t('admin.netProfit')}</span>
                <p className="text-2xl font-black font-mono text-emerald-400">
                  {Number(fin.netProfit).toFixed(2)} Credits
                </p>
                <span className="text-[10px] text-emerald-300/80 font-mono">{t('admin.afterCosts')}</span>
              </div>
            </div>
          </div>

          {/* Moderation Queue for Vendor Shops */}
          <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Store className="h-5 w-5 text-indigo-400" />
                  {t('admin.vendorModerationTitle')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('admin.vendorModerationSubtitle')}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {shops.length} {t('admin.storesRegistered')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">{t('admin.storeName')}</th>
                    <th className="p-3.5">{t('admin.ownerDetails')}</th>
                    <th className="p-3.5 text-center">{t('admin.itemsListed')}</th>
                    <th className="p-3.5 text-center">{t('admin.shopBalance')}</th>
                    <th className="p-3.5 text-center">{t('admin.currentStatus')}</th>
                    <th className="p-3.5 text-right">{t('admin.actions')}</th>
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

                      <td className="p-3.5 text-center font-mono">
                        <p className="font-bold text-amber-400 text-xs">
                          {Number(shop.available_balance || 0).toFixed(2)} Credits
                        </p>
                        <p className="text-[10px] text-slate-400">
                          បានដក: {Number(shop.total_withdrawn || 0).toFixed(2)} Credits
                        </p>
                      </td>

                      <td className="p-3.5 text-center">
                        {shop.is_approved ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t('admin.approved')}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 animate-pulse">
                            <XCircle className="h-3 w-3" />
                            {t('admin.pending')}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!shop.is_approved ? (
                            <button
                              onClick={() => handleModeration(shop.id, 1)}
                              disabled={actionLoading === `shop_${shop.id}`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-[11px] shadow-sm transition-all"
                            >
                              {lang === 'kh' ? 'អនុម័តហាង' : 'Approve Store'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleModeration(shop.id, 0)}
                              disabled={actionLoading === `shop_${shop.id}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 font-mono text-[11px] border border-slate-700 transition-colors"
                            >
                              {lang === 'kh' ? 'ផ្អាក / បដិសេធ' : 'Suspend / Reject'}
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
      )}

      {/* 2. TOP-UP TRANSFERS & RECEIPT INSPECTION TAB */}
      {activeTab === 'topups' && (
        <div className="space-y-6">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-mono">ប្រតិបត្តិការសរុប (Total)</p>
                <p className="text-lg font-black text-white font-mono">{topups.length}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-mono">Credits បានបញ្ចូល (Approved)</p>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  +{topups.filter(t => t.status === 'approved').reduce((sum, t) => sum + Number(t.credits_issued || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-mono">មានរូបវិក្កយបត្រ (Slips)</p>
                <p className="text-lg font-black text-cyan-300 font-mono">
                  {topups.filter(t => Boolean(t.slip_image_url)).length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-mono">រង់ចាំត្រួតពិនិត្យ (Pending)</p>
                <p className="text-lg font-black text-rose-400 font-mono">
                  {topups.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
            {/* Header & Search/Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-amber-400" />
                  ត្រួតពិនិត្យវិក្កយបត្រ Top-Up របស់អ្នកប្រើប្រាស់ (Slip Inspection)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ពិនិត្យមើលបង្កាន់ដៃផ្ទេរប្រាក់ជាក់ស្ដែង (Bank Slip), ធនាគារ, រូបិយប័ណ្ណ (៛ KHR / $ USD) និងទិន្នន័យស្រង់ដោយ AI
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTopupFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    topupFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  ទាំងអស់ ({topups.length})
                </button>
                <button
                  onClick={() => setTopupFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    topupFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  បានអនុម័ត ({topups.filter(t => t.status === 'approved').length})
                </button>
                <button
                  onClick={() => setTopupFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    topupFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  រង់ចាំ ({topups.filter(t => t.status === 'pending').length})
                </button>
                <button
                  onClick={() => setTopupFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    topupFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  បដិសេធ ({topups.filter(t => t.status === 'rejected').length})
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះអ្នកប្រើប្រាស់, Email, ធនាគារ ឬលេខប្រតិបត្តិការ (Ref ID)..."
                value={topupSearch}
                onChange={(e) => setTopupSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Topups Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">កាលបរិច្ឆេទ & ម៉ោង</th>
                    <th className="p-3.5">អ្នកប្រើប្រាស់ (User)</th>
                    <th className="p-3.5">វិក្កយបត្រ (Slip Proof)</th>
                    <th className="p-3.5">ធនាគារ & លេខយោង</th>
                    <th className="p-3.5">ទឹកប្រាក់ក្នុង Slip</th>
                    <th className="p-3.5">Credits បានបញ្ចូល</th>
                    <th className="p-3.5 text-center">ស្ថានភាព</th>
                    <th className="p-3.5 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                  {(() => {
                    const filtered = topups.filter(t => {
                      const matchesFilter = topupFilter === 'all' || t.status === topupFilter;
                      const q = topupSearch.toLowerCase().trim();
                      if (!q) return matchesFilter;
                      const userName = (t.user_name || '').toLowerCase();
                      const userEmail = (t.user_email || '').toLowerCase();
                      const trxRef = (t.transaction_ref || '').toLowerCase();
                      const bank = (t.bank_name || '').toLowerCase();
                      return matchesFilter && (userName.includes(q) || userEmail.includes(q) || trxRef.includes(q) || bank.includes(q));
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            មិនមានទិន្នន័យវិក្កយបត្រដែលត្រូវគ្នានឹងការស្វែងរកឡើយ។
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((t) => {
                      let details = {};
                      if (t.slip_details) {
                        try {
                          details = typeof t.slip_details === 'string' ? JSON.parse(t.slip_details) : t.slip_details;
                        } catch (e) {}
                      }

                      const rawCurrency = String(details.currency || (Number(t.amount) >= 1000 ? 'KHR' : 'USD')).toUpperCase();
                      const isKhr = rawCurrency.includes('KHR') || rawCurrency.includes('៛');

                      return (
                        <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 text-slate-400">
                            {new Date(t.created_at).toLocaleDateString()}
                            <span className="block text-[10px] text-slate-500">{new Date(t.created_at).toLocaleTimeString()}</span>
                          </td>

                          {/* User info */}
                          <td className="p-3.5">
                            <p className="text-white font-bold">{t.user_name}</p>
                            <p className="text-[10px] text-slate-400">{t.user_email}</p>
                            {t.user_phone && <p className="text-[10px] text-slate-500">{t.user_phone}</p>}
                          </td>

                          {/* Slip Proof Thumbnail */}
                          <td className="p-3.5">
                            {t.slip_image_url ? (
                              <button
                                onClick={() => setSelectedSlip(t)}
                                className="group relative flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left"
                              >
                                <img
                                  src={t.slip_image_url}
                                  alt="Bank Slip"
                                  className="h-10 w-10 object-cover rounded-lg bg-black"
                                />
                                <div className="pr-1">
                                  <span className="text-[10px] text-cyan-300 font-bold block group-hover:underline flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    ពិនិត្យវិក្កយបត្រ
                                  </span>
                                  <span className="text-[9px] text-slate-400 block">ចុចដើម្បីមើលធំ</span>
                                </div>
                              </button>
                            ) : (
                              <span className="px-2 py-1 rounded-lg bg-slate-900 text-slate-500 text-[10px] flex items-center gap-1 w-fit">
                                <FileText className="h-3 w-3" />
                                QR ស្គែនផ្ទាល់
                              </span>
                            )}
                          </td>

                          {/* Bank & Ref ID */}
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-bold block w-fit mb-1">
                              {t.bank_name || details.bank_name || 'ACLEDA Bank'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Ref: {t.transaction_ref || details.transaction_id || `TRX-${t.id}`}
                            </span>
                          </td>

                          {/* Original Amount & Currency */}
                          <td className="p-3.5 font-bold">
                            <span className={isKhr ? 'text-amber-300' : 'text-cyan-300'}>
                              {isKhr
                                ? `${Number(t.amount).toLocaleString()} ៛`
                                : `$${Number(t.amount).toFixed(2)} USD`}
                            </span>
                            <span className="block text-[9px] text-slate-500 font-normal">
                              {isKhr ? 'ប្រាក់រៀល (KHR)' : 'ប្រាក់ដុល្លារ (USD)'}
                            </span>
                          </td>

                          {/* Credits Issued */}
                          <td className="p-3.5 font-bold text-amber-400 text-sm">
                            +{Number(t.credits_issued).toFixed(2)} Credits
                          </td>

                          {/* Status */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                t.status === 'approved'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : t.status === 'rejected'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                              }`}
                            >
                              {t.status === 'approved' && <Check className="h-3 w-3" />}
                              {t.status === 'rejected' && <X className="h-3 w-3" />}
                              {t.status === 'pending' && <Clock className="h-3 w-3" />}
                              {t.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {t.slip_image_url && (
                                <button
                                  onClick={() => setSelectedSlip(t)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>ពិនិត្យ</span>
                                </button>
                              )}

                              {t.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleTopupApproval(t.id, 'approved')}
                                    disabled={actionLoading === `topup_${t.id}`}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[11px]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleTopupApproval(t.id, 'rejected')}
                                    disabled={actionLoading === `topup_${t.id}`}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-[11px]"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SELLER WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-cyan-400" />
                Seller Withdrawal Payout Requests
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and approve seller shop balance withdrawals to ACLEDA/Bank accounts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Shop & Seller</th>
                  <th className="p-3.5">Amount ($)</th>
                  <th className="p-3.5">Bank & Account Name</th>
                  <th className="p-3.5">Account / Phone</th>
                  <th className="p-3.5 text-center">Seller QR</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Transfer Slip</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      No withdrawal requests recorded.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 text-slate-400">{new Date(w.created_at).toLocaleString()}</td>
                      <td className="p-3.5">
                        <p className="text-white font-bold">{w.shop_name}</p>
                        <p className="text-[10px] text-slate-400">{w.seller_name} ({w.seller_email})</p>
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">{Number(w.amount).toFixed(2)} Credits</td>
                      <td className="p-3.5">
                        <p className="text-white font-bold">{w.bank_account_name}</p>
                        <p className="text-[10px] text-slate-400">{w.bank_name}</p>
                      </td>
                      <td className="p-3.5 text-slate-300 font-semibold">{w.bank_account_number}</td>
                      <td className="p-3.5 text-center">
                        {w.seller_qr_image ? (
                          <button
                            onClick={() => setViewingSellerQr(w.seller_qr_image)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold inline-flex items-center gap-1 border border-cyan-500/30 transition-colors"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>ស្កេន QR</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">គ្មាន QR</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            w.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : w.status === 'rejected'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {w.status === 'approved' && <Check className="h-3 w-3" />}
                          {w.status === 'rejected' && <X className="h-3 w-3" />}
                          {w.status === 'pending' && <Clock className="h-3 w-3" />}
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {w.admin_proof_url ? (
                          <button
                            onClick={() => setViewingAdminProof(w)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Eye className="h-3 w-3" />
                            <span>មើលវិក្កយបត្រ</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            {w.status === 'approved' ? 'មិនបានភ្ជាប់' : '-'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {w.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPayoutApprovalModal(w);
                                setPayoutProofImage('');
                                setPayoutNotes('');
                              }}
                              disabled={actionLoading === `withdraw_${w.id}`}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>បាញ់លុយ & អនុម័ត</span>
                            </button>
                            <button
                              onClick={() => handleWithdrawalApproval(w.id, 'rejected')}
                              disabled={actionLoading === `withdraw_${w.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-[11px] border border-slate-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: SLIP INSPECTION (ពិនិត្យវិក្កយបត្រផ្ទេរប្រាក់ជាក់ស្ដែង) */}
      {selectedSlip && (() => {
        let details = {};
        if (selectedSlip.slip_details) {
          try {
            details = typeof selectedSlip.slip_details === 'string' ? JSON.parse(selectedSlip.slip_details) : selectedSlip.slip_details;
          } catch (e) {}
        }
        const rawCurr = String(details.currency || (Number(selectedSlip.amount) >= 1000 ? 'KHR' : 'USD')).toUpperCase();
        const isKhr = rawCurr.includes('KHR') || rawCurr.includes('៛');
        const formattedAmount = isKhr
          ? `${Number(selectedSlip.amount).toLocaleString()} ៛`
          : `$${Number(selectedSlip.amount).toFixed(2)} USD`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div
              onClick={() => setSelectedSlip(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <div className="relative w-full max-w-4xl rounded-3xl bg-[#0b1220] border border-cyan-500/40 text-white shadow-2xl z-10 overflow-hidden my-6 animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                      ផ្ទាំងពិនិត្យវិក្កយបត្រ Top-Up (Slip Inspection)
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {selectedSlip.bank_name || details.bank_name || 'Bank Slip'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Ref: {selectedSlip.transaction_ref || details.transaction_id || `TRX-${selectedSlip.id}`} • {new Date(selectedSlip.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body: 2 Columns */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
                {/* Column 1: Receipt Slip Image */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-cyan-400" />
                      រូបភាពបង្កាន់ដៃ (Original Slip Image)
                    </span>
                    {selectedSlip.slip_image_url && (
                      <a
                        href={selectedSlip.slip_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        <ExternalLink className="h-3 w-3" />
                        បើកមើលទំហំធំ
                      </a>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-black/60 p-2 flex items-center justify-center min-h-[350px] max-h-[500px] overflow-hidden">
                    {selectedSlip.slip_image_url ? (
                      <img
                        src={selectedSlip.slip_image_url}
                        alt="Bank Payment Slip"
                        className="w-full h-auto max-h-[480px] object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-center p-8 space-y-2 text-slate-500">
                        <ImageIcon className="h-12 w-12 mx-auto stroke-1" />
                        <p className="text-xs font-mono">មិនមានរូបភាពវិក្កយបត្រភ្ជាប់មកជាមួយទេ (ស្គែនតាម KHQR ផ្ទាល់)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Extracted Details & Verification Scorecard */}
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                      <Zap className="h-4 w-4" />
                      ព័ត៌មានផ្ទៀងផ្ទាត់ដោយប្រព័ន្ធ (AI & KHQR Verification)
                    </h4>

                    {/* Bank & Transaction Ref */}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>ធនាគារ (Bank):</span>
                      <strong className="text-white">
                        {selectedSlip.bank_name || details.bank_name || 'ACLEDA Bank Plc.'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>លេខប្រតិបត្តិការ (Ref / Trx ID):</span>
                      <span className="font-bold text-cyan-300">
                        {selectedSlip.transaction_ref || details.transaction_id || `TRX-${selectedSlip.id}`}
                      </span>
                    </div>

                    {/* Original Amount & Currency */}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>ទឹកប្រាក់ក្នុង Slip:</span>
                      <strong className="text-white text-sm">
                        {formattedAmount}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>រូបិយប័ណ្ណ (Currency):</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isKhr ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {isKhr ? '🇰🇭 ៛ KHR (ប្រាក់រៀល)' : '💵 $ USD (ប្រាក់ដុល្លារ)'}
                      </span>
                    </div>

                    {/* Credits Calculated Box */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-amber-300 font-bold block">
                          Credits បានបញ្ចូល (Credits Issued):
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isKhr
                            ? `អត្រា ៤,០០០ ៛ = ១ Credit (${Number(selectedSlip.amount).toLocaleString()} ÷ 4,000)`
                            : `អត្រា $1 USD = ១ Credit`}
                        </span>
                      </div>
                      <span className="text-lg font-black text-amber-400">
                        +{Number(selectedSlip.credits_issued).toFixed(2)} Credits
                      </span>
                    </div>

                    {/* Sender and Receiver */}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>អ្នកផ្ញើ (Sender):</span>
                      <span className="text-slate-200 font-bold">
                        {selectedSlip.sender_name || details.sender_name || 'N/A'} {details.sender_account ? `(${details.sender_account})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>អ្នកទទួល (Receiver):</span>
                      <span className="text-cyan-300 font-bold">
                        {selectedSlip.merchant_name || 'YAI SORNYA'} ({selectedSlip.recipient_account || '85515650751@aclb'})
                      </span>
                    </div>

                    {/* System User Details */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 block mb-1">គណនីក្នុងប្រព័ន្ធ (System User):</span>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">ឈ្មោះ:</span>
                          <strong className="text-white text-[11px]">{selectedSlip.user_name}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Email:</span>
                          <span className="text-slate-300 text-[11px]">{selectedSlip.user_email}</span>
                        </div>
                        {selectedSlip.user_phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">លេខទូរស័ព្ទ:</span>
                            <span className="text-slate-300 text-[11px]">{selectedSlip.user_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span>ស្ថានភាពប្រតិបត្តិការ:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          selectedSlip.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : selectedSlip.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {selectedSlip.status === 'approved' && <Check className="h-3 w-3" />}
                        {selectedSlip.status === 'rejected' && <X className="h-3 w-3" />}
                        {selectedSlip.status === 'pending' && <Clock className="h-3 w-3" />}
                        {selectedSlip.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions inside Modal */}
                  <div className="pt-2 flex items-center gap-3">
                    {selectedSlip.status === 'pending' ? (
                      <>
                        <button
                          onClick={async () => {
                            await handleTopupApproval(selectedSlip.id, 'approved');
                            setSelectedSlip(null);
                          }}
                          disabled={actionLoading === `topup_${selectedSlip.id}`}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          <span>អនុម័តបញ្ចូល Credits (Approve)</span>
                        </button>
                        <button
                          onClick={async () => {
                            await handleTopupApproval(selectedSlip.id, 'rejected');
                            setSelectedSlip(null);
                          }}
                          disabled={actionLoading === `topup_${selectedSlip.id}`}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 font-bold font-mono text-xs border border-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                          <span>បដិសេធ (Reject)</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedSlip(null)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs transition-colors cursor-pointer"
                      >
                        បិទផ្ទាំងពិនិត្យ (Close)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. MODAL: APPROVE PAYOUT WITH TRANSFER PROOF (បាញ់លុយ និងផ្ញើវិក្កយបត្រ) */}
      {payoutApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setPayoutApprovalModal(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative w-full max-w-xl rounded-3xl bg-[#0b1220] border border-emerald-500/40 text-white shadow-2xl z-10 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-mono">
                    ផ្ទាំងបាញ់លុយ និងផ្ញើវិក្កយបត្រ (Approve Payout & Attach Slip)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ហាង៖ <strong className="text-white">{payoutApprovalModal.shop_name}</strong> • ម្ចាស់៖ {payoutApprovalModal.seller_name} ({payoutApprovalModal.seller_phone || payoutApprovalModal.seller_email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPayoutApprovalModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayoutWithProof} className="p-5 space-y-4">
              {/* Payment Target Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>ចំនួនទឹកប្រាក់ត្រូវផ្ទេរ៖</span>
                  <span className="text-lg font-black text-emerald-400">
                    ${Number(payoutApprovalModal.amount).toFixed(2)} USD ({Number(payoutApprovalModal.amount).toFixed(2)} Credits)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>ធនាគារទទួលប្រាក់៖</span>
                  <strong className="text-white text-sm">{payoutApprovalModal.bank_name}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>ឈ្មោះគណនី៖</span>
                  <strong className="text-cyan-300">{payoutApprovalModal.bank_account_name}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>លេខគណនី / ទូរស័ព្ទ៖</span>
                  <strong className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {payoutApprovalModal.bank_account_number}
                  </strong>
                </div>
              </div>

              {/* Seller's QR Code for Admin to scan */}
              {payoutApprovalModal.seller_qr_image && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-center space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-center gap-1.5">
                    <QrCode className="h-4 w-4" />
                    QR Code របស់អ្នកលក់ (ស្កេនដើម្បីបាញ់លុយ)
                  </span>
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                    <img 
                      src={payoutApprovalModal.seller_qr_image} 
                      alt="Seller Payment QR" 
                      className="max-h-[220px] max-w-[220px] object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ប្រើកម្មវិធីធនាគារលើទូរស័ព្ទដៃ (ACLEDA / ABA / Bakong) ស្កេន QR ខាងលើនេះ
                  </p>
                </div>
              )}

              {/* Attach Proof Slip */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-200 block">
                  ភ្ជាប់រូបភាពវិក្កយបត្រផ្ទេរប្រាក់ (Attach Transfer Receipt / Slip) *
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  ក្រោយពីបាញ់លុយរួច សូម Screenshot ឬ Upload រូបវិក្កយបត្រ ដើម្បីឱ្យហាងអាចពិនិត្យផ្ទៀងផ្ទាត់ដោយខ្លួនឯង
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold border border-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload រូបវិក្កយបត្រ</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProofSlipUpload} 
                    />
                  </label>

                  {payoutProofImage && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={payoutProofImage} 
                        alt="Proof Preview" 
                        className="h-10 w-10 object-contain rounded-lg border border-emerald-500/40 bg-black"
                      />
                      <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        បានភ្ជាប់រួចរាល់
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  កំណត់សម្គាល់ / លេខយោង (Admin Notes / Ref)
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. បានផ្ទេរតាម ACLEDA Mobile Trx #9812492"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={actionLoading === `withdraw_${payoutApprovalModal.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {actionLoading === `withdraw_${payoutApprovalModal.id}` ? 'កំពុងដំណើរការ...' : 'បញ្ជាក់ការផ្ទេរប្រាក់ និងផ្ញើវិក្កយបត្រ (Confirm Payout)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutApprovalModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                >
                  បោះបង់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: VIEW SELLER QR CODE (ពិនិត្យ QR Code អ្នកលក់) */}
      {viewingSellerQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setViewingSellerQr(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0b1220] border border-cyan-500/40 text-white shadow-2xl z-10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                <QrCode className="h-4 w-4" />
                <span>QR Code ទទួលប្រាក់របស់អ្នកលក់</span>
              </h3>
              <button onClick={() => setViewingSellerQr(null)} className="p-1 rounded bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-white p-3 rounded-2xl flex items-center justify-center">
              <img src={viewingSellerQr} alt="Seller QR Code" className="max-h-[320px] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: VIEW ADMIN TRANSFER PROOF SLIP */}
      {viewingAdminProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setViewingAdminProof(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1220] border border-emerald-500/40 text-white shadow-2xl z-10 overflow-hidden my-6">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
              <h3 className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4" />
                <span>វិក្កយបត្រផ្ទេរប្រាក់ជាក់ស្ដែង (Admin Transfer Proof)</span>
              </h3>
              <button onClick={() => setViewingAdminProof(null)} className="p-1.5 rounded-lg bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-black/60 p-2 flex items-center justify-center max-h-[420px] overflow-hidden">
                <img 
                  src={viewingAdminProof.admin_proof_url} 
                  alt="Admin Proof Slip" 
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                />
              </div>
              {viewingAdminProof.admin_notes && (
                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
                  សម្គាល់៖ {viewingAdminProof.admin_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
