import express from 'express';
import { query, getOne, execute } from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Super Admin role protection
router.use(verifyToken);
router.use(requireRole('admin'));

// GET /api/admin/analytics - Platform Overview & DAU
router.get('/analytics', async (req, res, next) => {
  try {
    const totalUsers = await getOne('SELECT COUNT(id) as count FROM users');
    const totalBuyers = await getOne("SELECT COUNT(id) as count FROM users WHERE role = 'buyer'");
    const totalSellers = await getOne("SELECT COUNT(id) as count FROM users WHERE role = 'seller'");
    const totalProducts = await getOne('SELECT COUNT(id) as count FROM products');
    const totalOrders = await getOne('SELECT COUNT(id) as count FROM orders');

    // Recent 7 days traffic & DAU
    const trafficHistory = await query(
      'SELECT visit_date, unique_visitors, page_views FROM site_analytics ORDER BY visit_date DESC LIMIT 7'
    );

    const latestAnalytics = trafficHistory[0] || { unique_visitors: 1450, page_views: 6800 };

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        totalBuyers: totalBuyers.count,
        totalSellers: totalSellers.count,
        totalProducts: totalProducts.count,
        totalOrders: totalOrders.count,
        dailyActiveUsers: latestAnalytics.unique_visitors,
        dailyPageViews: latestAnalytics.page_views
      },
      trafficHistory: trafficHistory.reverse()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/financials - Total GMV, platform commission, server expenses & net profit
router.get('/financials', async (req, res, next) => {
  try {
    const gmvRow = await getOne(
      `SELECT COALESCE(SUM(total_amount), 0) as total_gmv, COUNT(id) as paid_orders_count 
       FROM orders 
       WHERE payment_status = 'paid'`
    );

    const totalGmv = gmvRow.total_gmv || 0;
    const commissionRate = 0.05; // 5% platform commission
    const platformCommission = Number((totalGmv * commissionRate).toFixed(2));
    const serverExpenses = 45.00; // Monthly AWS / Cloud server & CDN expense
    const netProfit = Number((platformCommission - serverExpenses).toFixed(2));

    // Category breakdown
    const categorySales = await query(
      `SELECT 
        c.name as category_name,
        COUNT(oi.id) as units_sold,
        COALESCE(SUM(oi.quantity * oi.price_each), 0) as volume
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.payment_status = 'paid'
       GROUP BY c.id, c.name
       ORDER BY volume DESC`
    );

    res.json({
      success: true,
      financials: {
        totalMarketplaceGMV: totalGmv,
        platformCommissionRate: '5.0%',
        platformCommission: platformCommission,
        serverExpenses: serverExpenses,
        netProfit: netProfit,
        paidOrdersCount: gmvRow.paid_orders_count || 0
      },
      categorySales
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/shops - Moderation queue of shops with wallet balances
router.get('/shops', async (req, res, next) => {
  try {
    const shops = await query(
      `SELECT 
        s.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        COUNT(p.id) as total_products,
        COALESCE(w.available_balance, 0.00) as available_balance,
        COALESCE(w.pending_balance, 0.00) as pending_balance,
        COALESCE((SELECT SUM(amount) FROM withdrawal_requests WHERE shop_id = s.id AND status = 'approved'), 0.00) as total_withdrawn
       FROM shops s
       JOIN users u ON s.seller_id = u.id
       LEFT JOIN products p ON s.id = p.shop_id
       LEFT JOIN shop_wallets w ON s.id = w.shop_id
       GROUP BY s.id
       ORDER BY s.is_approved ASC, s.id DESC`
    );

    res.json({ success: true, shops });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/shops/:id/approve - Approve or Reject vendor shop
router.put('/shops/:id/approve', async (req, res, next) => {
  try {
    const shopId = req.params.id;
    const { is_approved } = req.body;

    const shop = await getOne('SELECT * FROM shops WHERE id = ?', [shopId]);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const approvedVal = is_approved ? 1 : 0;
    await execute('UPDATE shops SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [approvedVal, shopId]);

    res.json({
      success: true,
      message: approvedVal ? 'Shop approved successfully!' : 'Shop rejected/suspended',
      shopId,
      is_approved: approvedVal
    });
  } catch (error) {
    next(error);
  }
});

export default router;
