import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  Coins, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Phone, 
  AlertCircle,
  Zap,
  Scan,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import api from '../api/axios';

export default function CheckoutPage() {
  const { items, vendorGroups, subtotal, taxAmount, shippingFee, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { balance, walletDetails, setIsTopUpOpen, fetchBalance } = useWallet();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('St 271, Sangkat Boeung Tumpun, Khan Mean Chey, Phnom Penh');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '+855 12 889 900');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(null);

  if (items.length === 0 && !orderCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-mono">កន្ត្រកទំនិញរបស់អ្នកទទេ (Cart is Empty)</h2>
        <p className="text-xs text-slate-400">សូមជ្រើសរើសទំនិញកុំព្យូទ័រចូលកន្ត្រកមុននឹងធ្វើការទូទាត់ប្រាក់។</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-glow-cyan"
        >
          មើលទំនិញកុំព្យូទ័រទាំងអស់
        </Link>
      </div>
    );
  }

  const handlePlaceOrderClick = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន');
      return;
    }

    if (balance < grandTotal) {
      setError(`សមតុល្យ Credits មិនគ្រប់គ្រាន់ទេ! (អ្នកមាន ${balance.toFixed(2)} Credits, ត្រូវការ ${grandTotal.toFixed(2)} Credits)។ សូមចុចប៊ូតុង "Top-Up Credits" ដើម្បីស្គែនវិក្កយបត្របញ្ចូលលុយ។`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity
        })),
        shippingAddress: `${shippingAddress} (Phone: ${recipientPhone})`,
        paymentMethod: 'wallet_credits',
        notes
      };

      const res = await api.post('/orders', payload);
      setOrderCompleted(res.data.order);
      clearCart();
      await fetchBalance();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'ការបញ្ជាទិញបានបរាជ័យ សូមសាកល្បងម្ដងទៀត');
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (orderCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="p-8 rounded-3xl bg-[#0b1424] border border-cyan-500/30 text-center space-y-5 shadow-glow-cyan">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-black text-white font-mono">
            ទូទាត់ប្រាក់ និងបញ្ជាទិញជោគជ័យ!
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            ការបញ្ជាទិញរបស់អ្នក <span className="font-mono text-cyan-400 font-bold">#{orderCompleted.orderNumber}</span> ត្រូវបានកាត់កងតាមរយៈ <span className="text-amber-400 font-bold">Wallet Credits</span> រួចរាល់ ហើយកំពុងរៀបចំដឹកជញ្ជូន។
          </p>

          {/* Receipt details */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>លេខកូដបញ្ជាទិញ:</span>
              <span className="text-white font-bold">{orderCompleted.orderNumber}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>វិធីសាស្ត្រទូទាត់:</span>
              <span className="text-amber-400 font-bold">Wallet Credits (PAID)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>ស្ថានភាព:</span>
              <span className="text-emerald-400 uppercase font-bold">{orderCompleted.orderStatus}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm text-white font-bold">
              <span>ចំនួន Credits ដែលបានកាត់:</span>
              <span className="text-amber-400 text-base">{orderCompleted.totalAmount?.toFixed(2)} Credits</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/profile"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-mono font-bold text-xs shadow-glow-cyan hover:opacity-90 transition-all"
            >
              មើលប្រវត្តិបញ្ជាទិញ (Profile)
            </Link>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-mono font-bold text-xs hover:bg-slate-700 transition-all"
            >
              បន្តទិញទំនិញ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isBalanceEnough = balance >= grandTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-cyan-400" />
          ទូទាត់ប្រាក់ និងដឹកជញ្ជូន (Checkout with Credits)
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          ការទូទាត់ប្រាក់ទាំងអស់ត្រូវបានប្រើប្រាស់ដោយ <strong>CREDITS</strong> តែមួយគត់ ($1 = 1 Credit)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Delivery info & Credits Wallet Payment */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Destination */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              1. ព័ត៌មានដឹកជញ្ជូន (Delivery Destination)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">លេខទូរស័ព្ទអ្នកទទួល</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ចំណាំបន្ថែម (Order Notes)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ទូរស័ព្ទមុនពេលដឹកមកដល់"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">អាសយដ្ឋានលម្អិត</label>
                <textarea
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់, ខណ្ឌ, រាជធានី/ខេត្ត"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method: Wallet Credits Only */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                2. វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Method: CREDITS តែមួយគត់)
              </h3>
              <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                1 USD = 1 Credit
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">
                      សមតុល្យគណនី (Wallet Credits Balance)
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {walletDetails?.shopBalance > 0
                        ? `រាប់បញ្ចូលទាំងចំណូលហាង (${walletDetails.shopBalance.toFixed(2)} Credits) - អាចប្រើទិញបាន`
                        : 'បច្ចុប្បន្នភាពគណនីរបស់អ្នក'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black font-mono ${isBalanceEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {balance.toFixed(2)} Credits
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    (ត្រូវការ: {grandTotal.toFixed(2)} Credits)
                  </span>
                </div>
              </div>

              {!isBalanceEnough ? (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-mono text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>ខ្វះ {(grandTotal - balance).toFixed(2)} Credits ដើម្បីទូទាត់</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-glow-amber hover:opacity-95 transition-all cursor-pointer"
                  >
                    <Scan className="h-3.5 w-3.5" />
                    <span>⚡ ស្គែនវិក្កយបត្រ Top-Up Credits</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>សមតុល្យ Credits គ្រប់គ្រាន់សម្រាប់ទូទាត់ប្រាក់ភ្លាមៗ</span>
                </div>
              )}
            </div>
          </div>

          {/* Items in Order */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Store className="h-4 w-4 text-cyan-400" />
              3. ទំនិញក្នុងកន្ត្រក ({items.length} មុខ)
            </h3>

            <div className="space-y-4">
              {Object.entries(vendorGroups).map(([shopName, shopItems]) => (
                <div key={shopName} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-indigo-400" />
                      ហាង: {shopName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {shopItems.length} មុខ
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-slate-800/60">
                    {shopItems.map((item) => (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=150'}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                          />
                          <div>
                            <p className="text-slate-200 font-medium line-clamp-1">{item.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              ចំនួន: {item.quantity} × {item.price.toFixed(2)} Credits
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-black text-amber-400">
                          {(item.price * item.quantity).toFixed(2)} Credits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Place Order */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800">
              សរុបការចំណាយ (Credits Summary)
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>តម្លៃទំនិញសរុប (Subtotal):</span>
                <span className="font-bold text-white">{subtotal.toFixed(2)} Credits</span>
              </div>
              <div className="flex justify-between">
                <span>ពន្ធអាករ (10% VAT):</span>
                <span className="font-bold text-white">{taxAmount.toFixed(2)} Credits</span>
              </div>
              <div className="flex justify-between">
                <span>សេវាដឹកជញ្ជូនរហ័ស:</span>
                <span className="font-bold text-white">{shippingFee.toFixed(2)} Credits</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-black text-white">
                <span>សរុបចុងក្រោយ (Total):</span>
                <span className="font-mono text-amber-400 text-lg">{grandTotal.toFixed(2)} Credits</span>
              </div>
            </div>

            {isBalanceEnough ? (
              <button
                onClick={handlePlaceOrderClick}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-mono font-black text-xs flex items-center justify-center gap-2 transition-all mt-4 bg-gradient-to-r from-amber-500 to-rose-500 text-black shadow-glow-amber hover:opacity-95 cursor-pointer uppercase tracking-wider"
              >
                {loading ? (
                  <span>កំពុងកាត់ប្រាក់ Credits...</span>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>ទូទាត់ប្រាក់ភ្លាមៗ ({grandTotal.toFixed(2)} Credits)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTopUpOpen(true)}
                className="w-full py-3.5 rounded-xl font-mono font-black text-xs flex items-center justify-center gap-2 transition-all mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-glow-cyan hover:opacity-95 cursor-pointer uppercase tracking-wider"
              >
                <Scan className="h-4 w-4" />
                <span>Top-Up Credits ដើម្បីទូទាត់ (ស្គែន Slip)</span>
              </button>
            )}

            <div className="space-y-2 pt-3 text-[11px] text-slate-400 border-t border-slate-800/80 font-mono">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-cyan-400" />
                <span>ដឹកជញ្ជូនរហ័សទូទាំងប្រទេសកម្ពុជា</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>ធានាសុវត្ថិភាព 100% តាមប្រព័ន្ធ Wallet Credits</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
