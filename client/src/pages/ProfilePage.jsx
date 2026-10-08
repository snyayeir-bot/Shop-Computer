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
  Calendar
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({ totalSpent: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.orders || []);
        setMetrics(res.data.metrics || { totalSpent: 0, totalOrders: 0 });
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

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
      <div className="p-6 rounded-3xl bg-[#0b1424] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
            alt={user.name}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-glow-cyan"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono">{user.name}</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            <p className="text-xs text-slate-500 font-mono">{user.phone || 'Phone: +855 12 345 678'}</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-44 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-xs font-mono text-slate-400 block mb-1">Total Spent ($)</span>
            <span className="text-2xl font-black font-mono text-cyan-400">
              ${Number(metrics.totalSpent).toFixed(2)}
            </span>
          </div>

          <div className="flex-1 md:w-44 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-xs font-mono text-slate-400 block mb-1">Orders Placed</span>
            <span className="text-2xl font-black font-mono text-indigo-400">
              {orders.length} Orders
            </span>
          </div>
        </div>
      </div>

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
                    <span className="font-mono font-bold text-sm text-white">
                      ${Number(order.total_amount).toFixed(2)}
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

                      <span className="text-xs font-mono font-bold text-cyan-400">
                        ${(item.price_each * item.quantity).toFixed(2)}
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

    </div>
  );
}
