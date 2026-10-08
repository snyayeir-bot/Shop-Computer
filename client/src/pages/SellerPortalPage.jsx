import React, { useState, useEffect } from 'react';
import { 
  Store, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Save, 
  Sliders, 
  Cpu, 
  Layers, 
  Clock, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Info,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Search,
  Check,
  Truck,
  FileText,
  CreditCard,
  X
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SellerPortalPage() {
  const { user, switchDemoUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'inventory' | 'settings'
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state for Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals for Order Details & Customer Orders
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Shop Profile State
  const [shopForm, setShopForm] = useState({
    shop_name: '',
    description: '',
    logo: '',
    banner: '',
    contact_email: '',
    contact_phone: ''
  });
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: 1,
    brand: 'ASUS',
    price: '',
    cost_price: '',
    stock_quantity: 10,
    image_url: '',
    description: '',
    is_featured: 0
  });

  // Dynamic JSON Specs Key-Value pairs
  const [specPairs, setSpecPairs] = useState([
    { key: 'vram', val: '16GB GDDR6X' },
    { key: 'interface', val: 'PCIe 4.0 x16' },
    { key: 'tdp', val: '285W' }
  ]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, catRes] = await Promise.all([
        api.get('/seller/dashboard'),
        api.get('/seller/products'),
        api.get('/products/categories')
      ]);

      setDashboardData(dashRes.data);
      setOrders(dashRes.data.allOrders || []);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);

      if (dashRes.data.shop) {
        setShopForm({
          shop_name: dashRes.data.shop.shop_name || '',
          description: dashRes.data.shop.description || '',
          logo: dashRes.data.shop.logo || '',
          banner: dashRes.data.shop.banner || '',
          contact_email: dashRes.data.shop.contact_email || '',
          contact_phone: dashRes.data.shop.contact_phone || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'seller' || user.role === 'admin')) {
      fetchVendorData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await api.put(`/seller/orders/${orderId}/status`, { order_status: newStatus });
      
      // Update local state
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, order_status: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
      }
      if (selectedCustomerModal) {
        setSelectedCustomerModal((prev) => ({
          ...prev,
          orders: prev.orders.map((ord) =>
            ord.id === orderId ? { ...ord, order_status: newStatus } : ord
          )
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open customer's full order history modal
  const handleOpenCustomerHistory = async (customerId) => {
    try {
      const res = await api.get(`/seller/customers/${customerId}/orders`);
      setSelectedCustomerModal(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load customer order history');
    }
  };

  // Handle Shop profile save
  const handleSaveShop = async (e) => {
    e.preventDefault();
    try {
      await api.post('/seller/shop', shopForm);
      setShopSaveSuccess(true);
      setTimeout(() => setShopSaveSuccess(false), 3000);
      fetchVendorData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shop');
    }
  };

  // Open Add / Edit Product
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category_id: product.category_id,
        brand: product.brand || 'Generic',
        price: product.price,
        cost_price: product.cost_price,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url || '',
        description: product.description || '',
        is_featured: product.is_featured || 0
      });

      // Convert JSON specs to pairs
      const specs = product.specifications || {};
      const pairs = Object.entries(specs).map(([k, v]) => ({ key: k, val: String(v) }));
      setSpecPairs(pairs.length > 0 ? pairs : [{ key: 'socket', val: 'AM5' }]);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category_id: categories[0]?.id || 1,
        brand: 'ASUS',
        price: '',
        cost_price: '',
        stock_quantity: 10,
        image_url: '',
        description: '',
        is_featured: 0
      });
      setSpecPairs([
        { key: 'vram', val: '16GB GDDR6' },
        { key: 'interface', val: 'PCIe 4.0 x16' }
      ]);
    }
    setIsProductModalOpen(true);
  };

  // Dynamic spec pair handlers
  const handleAddSpecPair = () => {
    setSpecPairs([...specPairs, { key: '', val: '' }]);
  };

  const handleUpdateSpecPair = (index, field, value) => {
    const updated = [...specPairs];
    updated[index][field] = value;
    setSpecPairs(updated);
  };

  const handleRemoveSpecPair = (index) => {
    setSpecPairs(specPairs.filter((_, i) => i !== index));
  };

  // Save product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      // Build JSON specifications object
      const jsonSpecs = {};
      specPairs.forEach((pair) => {
        if (pair.key.trim()) {
          jsonSpecs[pair.key.trim().toLowerCase()] = pair.val.trim();
        }
      });

      const payload = {
        ...productForm,
        price: Number(productForm.price),
        cost_price: Number(productForm.cost_price || 0),
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        specifications: jsonSpecs
      };

      if (editingProduct) {
        await api.put(`/seller/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/seller/products', payload);
      }

      setIsProductModalOpen(false);
      fetchVendorData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hardware product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      fetchVendorData();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Store className="h-16 w-16 text-indigo-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white font-mono">Seller Access Only</h2>
        <p className="text-xs text-slate-400">You need a registered vendor/seller account to access this management portal.</p>
        <button
          onClick={() => switchDemoUser('seller')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-glow-indigo transition-all"
        >
          Switch to Seller Demo Profile
        </button>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    totalRevenue: 0,
    totalItemsSold: 0,
    lowStockAlert: 0,
    uniqueCustomers: 0,
    totalOrdersCount: 0
  };

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = orderStatusFilter === 'all' || ord.order_status === orderStatusFilter;
    const query = orderSearchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesNumber = ord.order_number?.toLowerCase().includes(query);
    const matchesBuyer = ord.buyer_name?.toLowerCase().includes(query) || ord.buyer_email?.toLowerCase().includes(query);
    const matchesItem = ord.items?.some((it) => it.product_name?.toLowerCase().includes(query));

    return matchesStatus && (matchesNumber || matchesBuyer || matchesItem);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with Store Details */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={shopForm.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
            alt="Store Logo"
            className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-glow-indigo"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono">
                {shopForm.shop_name || 'My Hardware Store'}
              </h1>
              {dashboardData?.shop?.is_approved ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Vendor
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                  Pending Admin Approval
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Owner: {user.name} ({user.email})
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics & Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Customer Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shop Profile
          </button>
        </div>
      </div>

      {/* 1. VENDOR ANALYTICS DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* 4 Required Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: Total Revenue */}
            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Total Revenue ($)</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-emerald-400">
                ${Number(metrics.totalRevenue).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500 font-mono">From paid customer orders</span>
            </div>

            {/* Metric 2: Total Items Sold */}
            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Total Units Sold</span>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-cyan-400">
                {metrics.totalItemsSold} Units
              </p>
              <span className="text-[11px] text-slate-500 font-mono">Hardware dispatched</span>
            </div>

            {/* Metric 3: Low Stock Alert Warning (< 5 units) */}
            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Low Stock Alert</span>
                <div className={`p-2 rounded-lg ${metrics.lowStockAlert > 0 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <p className={`text-2xl font-black font-mono ${metrics.lowStockAlert > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {metrics.lowStockAlert} Items
              </p>
              <span className="text-[11px] text-slate-500 font-mono">Stock level &lt; 5 units</span>
            </div>

            {/* Metric 4: Unique Customers */}
            <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Unique Customers</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-indigo-400">
                {metrics.uniqueCustomers} Buyers
              </p>
              <span className="text-[11px] text-slate-500 font-mono">Distinct customer accounts</span>
            </div>
          </div>

          {/* Customer Purchases & Spending Table with Action Button */}
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer Purchases & Spending at this Shop
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click "View Orders" to inspect detailed product lists, purchase times, and prices for any customer.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('orders')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>View All Store Orders ({orders.length})</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Email / Contact</th>
                    <th className="p-3 text-center">Orders</th>
                    <th className="p-3 text-center">Items Bought</th>
                    <th className="p-3 text-right">Total Spent</th>
                    <th className="p-3 text-right">Last Purchase</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans text-slate-200">
                  {dashboardData?.customers?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">
                        No customer purchases recorded yet.
                      </td>
                    </tr>
                  ) : (
                    dashboardData?.customers?.map((cust) => (
                      <tr key={cust.customer_id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-semibold text-white">{cust.customer_name}</td>
                        <td className="p-3 text-slate-400 font-mono">{cust.customer_email}</td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-400">{cust.orders_count}</td>
                        <td className="p-3 text-center font-mono">{cust.items_bought}</td>
                        <td className="p-3 text-right font-mono font-bold text-cyan-400">
                          ${Number(cust.total_spent).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-400">
                          {new Date(cust.last_order_date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenCustomerHistory(cust.customer_id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 hover:text-white transition-all font-mono font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Orders</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. CUSTOMER ORDERS & ORDER DETAILS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-cyan-400" />
                Store Customer Orders & Details
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                View what customers ordered, ordered timestamps, quantities, unit prices, and manage order fulfillment.
              </p>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search buyer, order #, item..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Order #</th>
                    <th className="p-3.5">Customer & Contact</th>
                    <th className="p-3.5">Order Date & Time</th>
                    <th className="p-3.5">Ordered Products (Items)</th>
                    <th className="p-3.5 text-right">Shop Subtotal</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No customer orders match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const totalUnits = ord.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
                      return (
                        <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-cyan-400">
                              {ord.order_number}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <p className="font-semibold text-white">{ord.buyer_name || 'Customer'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{ord.buyer_email}</p>
                            {ord.buyer_phone && (
                              <p className="text-[10px] text-slate-500 font-mono">{ord.buyer_phone}</p>
                            )}
                          </td>

                          <td className="p-3.5 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Calendar className="h-3 w-3 text-cyan-400" />
                              <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <Clock className="h-3 w-3 text-slate-500" />
                              <span>{new Date(ord.created_at).toLocaleTimeString()}</span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-1 max-w-sm">
                              {ord.items?.slice(0, 2).map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30">
                                    x{it.quantity}
                                  </span>
                                  <span className="truncate">{it.product_name}</span>
                                  <span className="text-slate-500 font-mono text-[10px]">(${it.price_each?.toFixed(2)})</span>
                                </div>
                              ))}
                              {ord.items?.length > 2 && (
                                <span className="text-[10px] font-mono text-slate-500 italic">
                                  +{ord.items.length - 2} more item(s) (Total {totalUnits} units)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-right font-mono">
                            <p className="text-sm font-bold text-cyan-400">
                              ${Number(ord.shop_subtotal || 0).toFixed(2)}
                            </p>
                            <span className="text-[10px] text-slate-500">Paid with {ord.payment_method || 'KHQR'}</span>
                          </td>

                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                ord.order_status === 'delivered'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : ord.order_status === 'shipped'
                                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/40'
                                  : ord.order_status === 'cancelled'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                              }`}
                            >
                              {ord.order_status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-glow-cyan hover:opacity-90 transition-all ml-auto"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCT & INVENTORY MANAGER TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-400" />
                Hardware Inventory & Stock Manager
              </h2>
              <p className="text-xs text-slate-400">
                Manage product details, real-time stock levels, and dynamic technical JSON specs
              </p>
            </div>

            <button
              onClick={() => handleOpenProductModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-glow-cyan hover:opacity-90 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Hardware Item</span>
            </button>
          </div>

          {/* Product Inventory Table */}
          <div className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Product & SKU</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price / Cost</th>
                    <th className="p-3.5 text-center">Stock Level</th>
                    <th className="p-3.5">Key Specs</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {products.map((p) => {
                    const isLow = p.stock_quantity < 5;
                    return (
                      <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100'}
                              alt={p.name}
                              className="h-10 w-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                            />
                            <div>
                              <p className="font-semibold text-white line-clamp-1 max-w-xs">{p.name}</p>
                              <span className="text-[10px] font-mono text-cyan-400">Brand: {p.brand}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-300">
                          {p.category_name}
                        </td>

                        <td className="p-3.5 font-mono">
                          <p className="text-cyan-400 font-bold">${p.price.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-500">Cost: ${p.cost_price?.toFixed(2) || '0.00'}</p>
                        </td>

                        <td className="p-3.5 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/40 inline-flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {p.stock_quantity} (Low)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-200 font-semibold">
                              {p.stock_quantity} units
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Object.entries(p.specifications || {}).slice(0, 2).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHOP REGISTRATION & PROFILE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl rounded-2xl bg-[#0b1120] border border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-400" />
              Vendor Shop Profile & Branding
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Set up your public store name, banner, description, and buyer support channels.
            </p>
          </div>

          {shopSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Shop profile saved and updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveShop} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Store / Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopForm.shop_name}
                  onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })}
                  placeholder="e.g. TechZone Hardware & Gaming"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Support Contact Email</label>
                <input
                  type="email"
                  value={shopForm.contact_email}
                  onChange={(e) => setShopForm({ ...shopForm, contact_email: e.target.value })}
                  placeholder="sales@techzone.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Support Hotline Phone</label>
                <input
                  type="text"
                  value={shopForm.contact_phone}
                  onChange={(e) => setShopForm({ ...shopForm, contact_phone: e.target.value })}
                  placeholder="+855 98 765 432"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Logo Image URL</label>
                <input
                  type="text"
                  value={shopForm.logo}
                  onChange={(e) => setShopForm({ ...shopForm, logo: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Shop Description & Warranties</label>
                <textarea
                  rows={3}
                  value={shopForm.description}
                  onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                  placeholder="Tell buyers about your distributor licenses, warranty terms, and store location..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-glow-indigo transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Shop Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* DETAILED ORDER MODAL (មើលព័ត៌មានលម្អិត Order) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1628] border border-slate-700 shadow-2xl z-10 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">
                      Order {selectedOrder.order_number}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        selectedOrder.order_status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : selectedOrder.order_status === 'shipped'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>Ordered on: {new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Buyer / Customer Info Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Buyer & Delivery Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer Name</span>
                    <span className="text-white font-semibold">{selectedOrder.buyer_name || 'Customer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="text-slate-300 font-mono">{selectedOrder.buyer_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                    <span className="text-slate-300 font-mono">{selectedOrder.buyer_phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Payment Method & Status</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      {selectedOrder.payment_method || 'KHQR'} ({selectedOrder.payment_status?.toUpperCase()})
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Delivery / Shipping Address</span>
                    <span className="text-slate-200 flex items-start gap-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {selectedOrder.shipping_address || 'Phnom Penh, Cambodia'}
                    </span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Customer Order Note:</span>
                      <span className="text-slate-300 italic">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Products Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Ordered Hardware Products ({selectedOrder.items?.length || 0})
                </h4>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden divide-y divide-slate-800/80">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100'}
                          alt={it.product_name}
                          className="h-12 w-12 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{it.product_name}</p>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase">Brand: {it.product_brand || 'Hardware'}</span>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Unit Price: <span className="text-slate-200">${Number(it.price_each).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs text-slate-400">
                          Qty: <strong className="text-white font-bold">{it.quantity}</strong>
                        </div>
                        <div className="text-sm font-bold text-cyan-400 mt-0.5">
                          ${Number(it.line_total || it.price_each * it.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Fulfillment & Status Changer */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">Update Fulfillment Status</span>
                  <span className="text-[11px] text-slate-400">Update the progress of this customer order</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.order_status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Shop Items Subtotal</span>
                  <span className="text-slate-200">${Number(selectedOrder.shop_subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800/60">
                  <span>Shop Net Amount</span>
                  <span className="text-cyan-400">${Number(selectedOrder.shop_subtotal || 0).toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER FULL ORDER HISTORY MODAL (ប្រវត្តិទិញរបស់អតិថិជន) */}
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedCustomerModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

          <div className="relative w-full max-w-3xl rounded-2xl bg-[#0e1628] border border-slate-700 shadow-2xl z-10 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Customer Purchase History: {selectedCustomerModal.customer?.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedCustomerModal.customer?.email} • {selectedCustomerModal.orders?.length || 0} Orders at this store
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Orders list */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {selectedCustomerModal.orders?.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-mono text-xs">
                  No orders recorded for this customer yet.
                </div>
              ) : (
                selectedCustomerModal.orders?.map((ord) => (
                  <div key={ord.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400 text-sm">
                            {ord.order_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              ord.order_status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : ord.order_status === 'shipped'
                                ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {ord.order_status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          Ordered on: {new Date(ord.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Order Total</span>
                        <span className="text-base font-black font-mono text-cyan-400">
                          ${Number(ord.shop_subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                        Purchased Products:
                      </span>
                      <div className="divide-y divide-slate-800/60 bg-slate-950/60 rounded-lg p-2">
                        {ord.items?.map((it, i) => (
                          <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={it.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100'}
                                alt={it.product_name}
                                className="h-9 w-9 rounded object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-white line-clamp-1">{it.product_name}</p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ${Number(it.price_each).toFixed(2)} each
                                </span>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-slate-400 text-xs">x{it.quantity}</span>
                              <p className="font-bold text-cyan-400 text-xs">${Number(it.line_total || it.price_each * it.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery destination */}
                    {ord.shipping_address && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>Address: {ord.shipping_address}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC JSON SPECS ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsProductModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1628] border border-slate-700 shadow-2xl z-10 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                {editingProduct ? 'Edit Hardware Product' : 'Add New Hardware Item'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. ASUS ROG Strix GeForce RTX 4080 OC 16GB"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hardware Category</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="ASUS, AMD, Corsair..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">MSRP Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="1299.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock Quantity Available</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    placeholder="10"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Brief description of product features..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Dynamic JSON Specifications Builder */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" />
                    Dynamic Technical Specs (JSON Key-Values)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecPair}
                    className="text-[11px] font-mono text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Spec Parameter
                  </button>
                </div>

                <div className="space-y-2">
                  {specPairs.map((pair, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. socket, vram)"
                        value={pair.key}
                        onChange={(e) => handleUpdateSpecPair(index, 'key', e.target.value)}
                        className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. AM5, 24GB GDDR6X)"
                        value={pair.val}
                        onChange={(e) => handleUpdateSpecPair(index, 'val', e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecPair(index)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-mono font-bold text-xs shadow-glow-cyan"
                >
                  Save Hardware Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
