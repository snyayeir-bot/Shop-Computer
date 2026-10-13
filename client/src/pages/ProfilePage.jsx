import React, { useState, useEffect } from 'react';
import {
  User,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Coins,
  ArrowUpRight,
  QrCode,
  Eye,
  Upload,
  X,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { balance, walletDetails, setIsTopUpOpen, fetchBalance } = useWallet();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({ totalSpent: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  // Seller shop wallet & withdrawal states
  const [shopWallet, setShopWallet] = useState({ availableBalance: 0, pendingBalance: 0 });
  const [shopInfo, setShopInfo] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: 'ACLEDA Bank Plc.',
    bankAccountName: '',
    bankAccountNumber: '',
    sellerQrImage: ''
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [selectedProofModal, setSelectedProofModal] = useState(null);
  const [selectedQrModal, setSelectedQrModal] = useState(null);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || []);
      setMetrics(res.data.metrics || { totalSpent: 0, totalOrders: 0 });

      // If user is seller or admin, fetch seller shop wallet & withdrawals
      if (user && (user.role === 'seller' || user.role === 'admin')) {
        const [wRes, withRes] = await Promise.all([
          api.get('/wallet/seller/balance').catch(() => null),
          api.get('/wallet/seller/withdrawals').catch(() => null)
        ]);
        if (wRes?.data?.wallet) {
          setShopWallet(wRes.data.wallet);
          setShopInfo(wRes.data.shop || null);
        }
        if (withRes?.data?.withdrawals) {
          setWithdrawals(withRes.data.withdrawals);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWithdrawForm(prev => ({ ...prev, sellerQrImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawMsg('');
    try {
      await api.post('/wallet/seller/withdraw', withdrawForm);
      setWithdrawMsg('សំណើដកប្រាក់ត្រូវបានបញ្ជូនដោយជោគជ័យ! Admin នឹងពិនិត្យ និងស្កេន QR Code បាញ់លុយជូន។');

      // Refresh seller wallet and withdrawals
      const [wRes, withRes] = await Promise.all([
        api.get('/wallet/seller/balance'),
        api.get('/wallet/seller/withdrawals')
      ]);
      if (wRes?.data?.wallet) setShopWallet(wRes.data.wallet);
      if (withRes?.data?.withdrawals) setWithdrawals(withRes.data.withdrawals);
      fetchBalance();

      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawMsg('');
        setWithdrawForm({
          amount: '',
          bankName: 'ACLEDA Bank Plc.',
          bankAccountName: '',
          bankAccountNumber: '',
          sellerQrImage: ''
        });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'បរាជ័យក្នុងការស្នើសុំដកប្រាក់');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            In Transit / Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Processing Order
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="h-16 w-16 text-slate-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white font-mono">Sign In Required</h2>
        <p className="text-xs text-slate-400">Please log in or switch to a demo account to view your buyer dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Profile Header */}
      <div className="p-6 rounded-3xl bg-[#0b1424] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
            alt={user.name}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-glow-cyan"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                user.role === 'admin'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : user.role === 'seller'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            <p className="text-xs text-slate-500 font-mono">{user.phone || 'Phone: +855 12 345 678'}</p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-black hover:opacity-90 transition-all shadow-glow-cyan flex items-center gap-1.5"
          >
            <Coins className="h-4 w-4" />
            <span>{lang === 'kh' ? '+ បញ្ចូល Credits' : '+ Top-Up Credits'}</span>
          </button>

          {user.role === 'seller' && (
            <Link
              to="/seller"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Store className="h-4 w-4 text-indigo-400" />
              <span>{lang === 'kh' ? 'ផ្ទាំងអ្នកលក់' : 'Seller Portal'}</span>
            </Link>
          )}

          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-rose-500/40 text-rose-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4 text-rose-400" />
              <span>{lang === 'kh' ? 'ផ្ទាំងគ្រប់គ្រង' : 'Admin Panel'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Equal-Sized Metric Cards Grid (សមមាត្រស្មើគ្នា មិនធំមួយតូចមួយ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: សមតុល្យគណនីសរុប (Usable Balance) */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 flex flex-col justify-between transition-all duration-200 min-h-[175px] shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <Coins className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'kh' ? 'សមតុល្យគណនី (Usable)' : 'Usable Balance'}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                Wallet
              </span>
            </div>
            <span className="text-2xl font-black font-mono text-cyan-400 block tracking-tight">
              {Number(balance || 0).toFixed(2)} Credits
            </span>
            <span className="text-[11px] text-slate-400 font-mono block mt-1 line-clamp-1">
              {(user.role === 'seller' || user.role === 'admin')
                ? `(ផ្ទាល់ខ្លួន ${Number(walletDetails?.personalBalance || 0).toFixed(2)} + ពីហាង ${Number(shopWallet.availableBalance || 0).toFixed(2)})`
                : (lang === 'kh' ? 'សមតុល្យសម្រាប់ទិញទំនិញ' : 'Available for shopping')}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Coins className="h-3.5 w-3.5" />
              <span>{lang === 'kh' ? '+ បញ្ចូលលុយ (Top-Up)' : '+ Top-Up Credits'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: ចំណូលហាង (Shop Credits) */}
        {(user.role === 'seller' || user.role === 'admin') ? (
          <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-amber-500/40 flex flex-col justify-between transition-all duration-200 min-h-[175px] shadow-sm">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <Store className="h-4 w-4 text-amber-400" />
                  <span>{lang === 'kh' ? 'ចំណូលហាង (Shop)' : 'Shop Credits'}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                  Store
                </span>
              </div>
              <span className="text-2xl font-black font-mono text-amber-400 block tracking-tight">
                {Number(shopWallet.availableBalance || 0).toFixed(2)} Credits
              </span>
              <span className="text-[11px] text-emerald-400 font-mono block mt-1 font-semibold line-clamp-1">
                {lang === 'kh' ? '✓ រាប់ចូលគណនី (អាចដកបាន)' : '✓ Counted in account'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center gap-2">
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={shopWallet.availableBalance <= 0}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-40"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{lang === 'kh' ? 'ដកប្រាក់' : 'Withdraw'}</span>
              </button>
              <Link
                to="/seller"
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 border border-slate-700"
              >
                <Store className="h-3.5 w-3.5 text-indigo-400" />
                <span>{lang === 'kh' ? 'ហាង' : 'Shop'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-indigo-500/40 flex flex-col justify-between transition-all duration-200 min-h-[175px] shadow-sm">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300">
                  <Store className="h-4 w-4 text-indigo-400" />
                  <span>{lang === 'kh' ? 'គណនីអ្នកលក់' : 'Vendor Portal'}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Portal
                </span>
              </div>
              <span className="text-2xl font-black font-mono text-slate-300 block tracking-tight">
                0.00 Credits
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-1 line-clamp-1">
                {lang === 'kh' ? 'បើកហាងដើម្បីទទួលចំណូល' : 'Open shop to sell'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800/80 mt-3">
              <Link
                to="/seller"
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Store className="h-3.5 w-3.5" />
                <span>{lang === 'kh' ? 'បើកហាងលក់ (Open Store)' : 'Become a Seller'}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Card 3: Total Spent */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between transition-all duration-200 min-h-[175px] shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'kh' ? 'ការចំណាយសរុប' : 'Total Spent'}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                Outflow
              </span>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-400 block tracking-tight">
              {Number(metrics.totalSpent || 0).toFixed(2)} Credits
            </span>
            <span className="text-[11px] text-slate-400 font-mono block mt-1 line-clamp-1">
              {lang === 'kh' ? 'ទំហំទឹកប្រាក់ទិញទំនិញសរុប' : 'Total payments completed'}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <div className="w-full py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{lang === 'kh' ? 'ទូទាត់ជោគជ័យ' : 'Verified Orders'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Orders Placed */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-indigo-500/40 flex flex-col justify-between transition-all duration-200 min-h-[175px] shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                <ShoppingBag className="h-4 w-4 text-indigo-400" />
                <span>{lang === 'kh' ? 'ការបញ្ជាទិញសរុប' : 'Orders Placed'}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                History
              </span>
            </div>
            <span className="text-2xl font-black font-mono text-indigo-400 block tracking-tight">
              {orders.length} {lang === 'kh' ? 'ការកុម្ម៉ង់' : 'Orders'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono block mt-1 line-clamp-1">
              {lang === 'kh' ? 'ប្រវត្តិវិក្កយបត្រក្នុងគណនី' : 'Order transactions history'}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <div className="w-full py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-indigo-400" />
              <span>{orders.length} {lang === 'kh' ? 'ប្រតិបត្តិការ' : 'Transactions'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Seller Withdrawal Requests History (Only shown for sellers) */}
      {(user.role === 'seller' || user.role === 'admin') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-amber-400" />
                ប្រវត្តិដកប្រាក់ពីហាង (Shop Withdrawal & Payout History)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Admin នឹងបាញ់លុយតាម QR Code ឬលេខគណនី ហើយផ្ញើវិក្កយបត្របញ្ជាក់មកទីនេះ
              </p>
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm hover:from-amber-400 hover:to-amber-500"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+ ស្នើសុំដកប្រាក់ថ្មី</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#0b1120] border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">កាលបរិច្ឆេទ</th>
                  <th className="p-3.5">ចំនួនទឹកប្រាក់</th>
                  <th className="p-3.5">ធនាគារ & ឈ្មោះគណនី</th>
                  <th className="p-3.5">លេខគណនី / ទូរស័ព្ទ</th>
                  <th className="p-3.5 text-center">QR Code</th>
                  <th className="p-3.5 text-center">ស្ថានភាព</th>
                  <th className="p-3.5 text-right">វិក្កយបត្រពី Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      មិនទាន់មានប្រវត្តិស្នើសុំដកប្រាក់នៅឡើយទេ។
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 text-slate-400">{new Date(w.created_at).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-amber-400 text-sm">
                        {Number(w.amount).toFixed(2)} Credits
                      </td>
                      <td className="p-3.5">
                        <p className="text-white font-bold">{w.bank_account_name}</p>
                        <p className="text-[10px] text-slate-400">{w.bank_name}</p>
                      </td>
                      <td className="p-3.5 text-slate-300 font-semibold">{w.bank_account_number}</td>
                      <td className="p-3.5 text-center">
                        {w.seller_qr_image ? (
                          <button
                            onClick={() => setSelectedQrModal(w.seller_qr_image)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold inline-flex items-center gap-1 border border-cyan-500/30"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>មើល QR</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">គ្មាន QR</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${w.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : w.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                            }`}
                        >
                          {w.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                          {w.status === 'pending' && <Clock className="h-3 w-3" />}
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {w.admin_proof_url ? (
                          <button
                            onClick={() => setSelectedProofModal(w)}
                            className="px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>ពិនិត្យវិក្កយបត្រ</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {w.status === 'pending' ? 'រង់ចាំ Admin បាញ់លុយ...' : 'គ្មានវិក្កយបត្រ'}
                          </span>
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

      {/* Orders Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Package className="h-5 w-5 text-cyan-400" />
            Purchases & Hardware Order Timeline
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {orders.length} Total Orders Tracked
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500">Explore the marketplace and checkout your first computer parts!</p>
            <Link
              to="/products"
              className="inline-block px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
            >
              Browse Hardware Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-[#0b1120] border border-slate-800/90 overflow-hidden shadow-lg transition-all hover:border-slate-700"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      #{order.order_number}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.order_status)}
                    <span className="font-mono font-black text-sm text-amber-400">
                      {Number(order.total_amount).toFixed(2)} Credits
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 divide-y divide-slate-800/60 space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=150'}
                          alt={item.product_name}
                          className="h-12 w-12 rounded-lg object-cover bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-white line-clamp-1">
                            {item.product_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-indigo-400">
                              <Store className="h-3 w-3" />
                              {item.shop_name}
                            </span>
                            <span>•</span>
                            <span className="font-mono">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-amber-400">
                        {(item.price_each * item.quantity).toFixed(2)} Credits
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer / Shipping Info */}
                <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <span>Destination: {order.shipping_address}</span>
                  <span className="text-emerald-400 font-mono">Payment: {order.payment_method} (Verified)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. MODAL: REQUEST WITHDRAWAL (ស្នើសុំដកប្រាក់ចំណូលហាង) */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setIsWithdrawModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1220] border border-amber-500/40 text-white shadow-2xl z-10 overflow-hidden my-6">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-mono">
                    ស្នើសុំដកប្រាក់ពីហាង (Shop Withdrawal)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    សមតុល្យដែលអាចដកបាន៖ <strong className="text-amber-400">{Number(shopWallet.availableBalance || 0).toFixed(2)} Credits</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {withdrawMsg && (
              <div className="m-5 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{withdrawMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  ចំនួន Credits ដែលចង់ដក (Amount) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={shopWallet.availableBalance}
                  required
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder={`Max: ${shopWallet.availableBalance.toFixed(2)} Credits`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">ធនាគារទទួលប្រាក់ *</label>
                  <select
                    value={withdrawForm.bankName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="ACLEDA Bank Plc.">ACLEDA Bank Plc. (KHQR)</option>
                    <option value="ABA Bank">ABA Bank</option>
                    <option value="Bakong App">Bakong NBC</option>
                    <option value="Wing Bank">Wing Bank</option>
                    <option value="Canadia Bank">Canadia Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">ឈ្មោះម្ចាស់គណនី *</label>
                  <input
                    type="text"
                    required
                    value={withdrawForm.bankAccountName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccountName: e.target.value })}
                    placeholder="e.g. SANIYA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">លេខគណនី / លេខទូរស័ព្ទ *</label>
                <input
                  type="text"
                  required
                  value={withdrawForm.bankAccountNumber}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccountNumber: e.target.value })}
                  placeholder="e.g. 015650751 ឬ 85515650751@aclb"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Upload QR Code (KHQR) Image */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-cyan-400" />
                    រូបភាព QR Code / KHQR ទទួលប្រាក់ (Optional)
                  </span>
                  {withdrawForm.sellerQrImage && (
                    <button
                      type="button"
                      onClick={() => setWithdrawForm(prev => ({ ...prev, sellerQrImage: '' }))}
                      className="text-[10px] text-rose-400 hover:underline font-mono"
                    >
                      លុប QR
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                  ភ្ជាប់រូប QR Code របស់អ្នក ដើម្បីឱ្យ Admin ងាយស្រួលស្កេនបាញ់លុយផ្ទាល់ពីកម្មវិធីធនាគារ
                </p>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold border border-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>ជ្រើសរើសរូប QR Code</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrUpload}
                    />
                  </label>

                  {withdrawForm.sellerQrImage && (
                    <div className="flex items-center gap-2">
                      <img
                        src={withdrawForm.sellerQrImage}
                        alt="Seller QR Preview"
                        className="h-10 w-10 object-contain rounded-lg border border-cyan-500/40 bg-black"
                      />
                      <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        បានភ្ជាប់រួចរាល់
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={withdrawLoading || shopWallet.availableBalance <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-amber transition-all disabled:opacity-40"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>{withdrawLoading ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនសំណើដកប្រាក់ (Submit Request)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs"
                >
                  បោះបង់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: INSPECT ADMIN TRANSFER SLIP (ពិនិត្យវិក្កយបត្រផ្ទេរប្រាក់ពី Admin) */}
      {selectedProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setSelectedProofModal(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1220] border border-emerald-500/40 text-white shadow-2xl z-10 overflow-hidden my-6">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-mono">
                    វិក្កយបត្រផ្ទេរប្រាក់ពី Admin (Bank Payout Slip)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ចំនួនទឹកប្រាក់៖ <strong className="text-emerald-400">${Number(selectedProofModal.amount).toFixed(2)} USD ({Number(selectedProofModal.amount).toFixed(2)} Credits)</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProofModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-black/60 p-2 flex items-center justify-center max-h-[420px] overflow-hidden">
                {selectedProofModal.admin_proof_url ? (
                  <img
                    src={selectedProofModal.admin_proof_url}
                    alt="Admin Transfer Slip"
                    className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-500 font-mono text-xs">
                    មិនមានរូបភាពវិក្កយបត្រភ្ជាប់មកជាមួយទេ។
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>ធនាគារផ្ទេរទៅ៖</span>
                  <strong className="text-white">{selectedProofModal.bank_name}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ឈ្មោះគណនី៖</span>
                  <span className="text-cyan-300 font-bold">{selectedProofModal.bank_account_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>លេខគណនី៖</span>
                  <span className="text-white">{selectedProofModal.bank_account_number}</span>
                </div>
                {selectedProofModal.admin_notes && (
                  <div className="pt-2 border-t border-slate-800 text-slate-300">
                    <span className="text-slate-400 block text-[11px] mb-0.5">សម្គាល់ពី Admin៖</span>
                    <p className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300 text-[11px]">
                      {selectedProofModal.admin_notes}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedProofModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: PREVIEW SELLER QR CODE */}
      {selectedQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedQrModal(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0b1220] border border-cyan-500/40 text-white shadow-2xl z-10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                <QrCode className="h-4 w-4" />
                <span>QR Code ទទួលប្រាក់របស់អ្នកលក់</span>
              </h3>
              <button onClick={() => setSelectedQrModal(null)} className="p-1 rounded bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-white p-3 rounded-2xl flex items-center justify-center">
              <img src={selectedQrModal} alt="Seller QR Code" className="max-h-[300px] object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
