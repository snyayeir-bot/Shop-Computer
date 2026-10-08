import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Phone, 
  User, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import BakongKHQRModal from '../components/BakongKHQRModal';

export default function CheckoutPage() {
  const { items, vendorGroups, subtotal, taxAmount, shippingFee, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('KHQR'); // 'KHQR' | 'Card'
  const [shippingAddress, setShippingAddress] = useState('St 271, Sangkat Boeung Tumpun, Khan Mean Chey, Phnom Penh');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '+855 12 889 900');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(null);

  // Bakong KHQR Modal state
  const [isKHQRModalOpen, setIsKHQRModalOpen] = useState(false);
  const [pendingOrderPayload, setPendingOrderPayload] = useState(null);

  if (items.length === 0 && !orderCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-mono">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Add hardware products to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-glow-cyan"
        >
          Browse Hardware Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrderClick = (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Please provide a delivery address');
      return;
    }

    const payload = {
      items: items.map((i) => ({
        productId: i.id,
        quantity: i.quantity
      })),
      shippingAddress: `${shippingAddress} (Phone: ${recipientPhone})`,
      paymentMethod,
      notes
    };

    setPendingOrderPayload(payload);

    if (paymentMethod === 'KHQR') {
      // Open Bakong KHQR Modal
      setIsKHQRModalOpen(true);
    } else {
      executeOrderCheckout(payload);
    }
  };

  const executeOrderCheckout = async (payload) => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/orders', payload || pendingOrderPayload);
      setOrderCompleted(res.data.order);
      clearCart();
      setIsKHQRModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
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
            Payment & Order Confirmed!
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your order <span className="font-mono text-cyan-400 font-bold">#{orderCompleted.orderNumber}</span> has been processed via <span className="text-rose-400 font-bold">{orderCompleted.paymentMethod}</span> and is being prepared for dispatch.
          </p>

          {/* Receipt details */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Order Number:</span>
              <span className="text-white font-bold">{orderCompleted.orderNumber}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Gateway:</span>
              <span className="text-rose-400 font-bold">{orderCompleted.paymentMethod} (PAID)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 uppercase font-bold">{orderCompleted.orderStatus}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm text-white font-bold">
              <span>Amount Paid:</span>
              <span className="text-cyan-400 text-base">${orderCompleted.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/profile"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-mono font-bold text-xs shadow-glow-cyan hover:opacity-90 transition-all"
            >
              View Order Timeline in Dashboard
            </Link>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-mono font-bold text-xs hover:bg-slate-700 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-cyan-400" />
          Checkout & Dispatch
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review items grouped by vendor and pay with Bakong KHQR (KHPay) or Credit Card
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form & Items grouped by shop */}
        <div className="lg:col-span-2 space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Details */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              1. Delivery Destination (Cambodia)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, handle fragile"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address / Landmark</label>
                <textarea
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="House #, Street name, Sangkat, Khan, City/Province"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              2. Payment Method (KHQR / KHPay)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bakong KHQR (Recommended) */}
              <div
                onClick={() => setPaymentMethod('KHQR')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'KHQR'
                    ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-[#E1251B] shadow-lg shadow-rose-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
                    <span className="bg-[#E1251B] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      KHQR
                    </span>
                    <span>Bakong KHQR (KHPay)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Instant 0% Fee
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Scan and pay instantly using ABA Mobile, ACLEDA, Wing, Canadia, or any Bakong banking app in Cambodia.
                </p>
              </div>

              {/* Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'Card'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-glow-indigo'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-mono">
                    <CreditCard className="h-4 w-4" />
                    <span>Credit / Debit Card</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Visa / MC
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Standard international card processing simulation with 256-bit encryption.
                </p>
              </div>
            </div>

            {/* KHPay Feature Highlight Strip */}
            {paymentMethod === 'KHQR' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E1251B] text-white flex items-center justify-center font-black font-sans text-xs shadow-md">
                    KHQR
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Bakong Individual & Merchant KHQR Enabled</h5>
                    <p className="text-[11px] text-slate-400">Dynamic QR generated on next step with auto-verification</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  ⚡ Auto-Verified
                </span>
              </div>
            )}
          </div>

          {/* Grouped Vendor Packages */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Store className="h-4 w-4 text-cyan-400" />
              3. Items in Order ({items.length} items)
            </h3>

            <div className="space-y-4">
              {Object.entries(vendorGroups).map(([shopName, shopItems]) => (
                <div key={shopName} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-indigo-400" />
                      Vendor: {shopName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {shopItems.length} items
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
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-cyan-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Summary Card & Action Button */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800">
              Order Cost Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Value Added Tax (10% VAT)</span>
                <span className="font-mono text-white">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span className="font-mono text-white">${shippingFee.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-black text-white">
                <span>Grand Total</span>
                <span className="font-mono text-cyan-400 text-lg">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrderClick}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-extrabold font-mono text-sm flex items-center justify-center gap-2 transition-all mt-4 ${
                paymentMethod === 'KHQR'
                  ? 'bg-[#E1251B] hover:bg-[#c91e15] text-white shadow-lg shadow-rose-950/50'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-glow-cyan hover:opacity-95'
              }`}
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : paymentMethod === 'KHQR' ? (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>Pay with Bakong KHQR (${grandTotal.toFixed(2)})</span>
                </>
              ) : (
                <>
                  <span>Pay with Card (${grandTotal.toFixed(2)})</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="space-y-2 pt-3 text-[11px] text-slate-500 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Estimated dispatch: 24h from Phnom Penh Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Secured by NBC Bakong KHQR Payment Gateway</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bakong KHQR Interactive Popup Modal */}
      <BakongKHQRModal
        isOpen={isKHQRModalOpen}
        onClose={() => setIsKHQRModalOpen(false)}
        amount={grandTotal}
        currency="USD"
        merchantName={Object.keys(vendorGroups)[0] || 'CYBERTECH COMPUTER STORE'}
        orderNumber={`ORD-${Date.now().toString().slice(-6)}`}
        onPaymentSuccess={() => executeOrderCheckout()}
      />

    </div>
  );
}
