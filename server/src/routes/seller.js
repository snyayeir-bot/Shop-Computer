import express from 'express';
import { query, getOne, execute } from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth & seller role check to all seller endpoints
router.use(verifyToken);
router.use(requireRole(['seller', 'admin']));

// Helper to get seller's shop
const getSellerShop = async (sellerId) => {
  return await getOne('SELECT * FROM shops WHERE seller_id = ?', [sellerId]);
};

// GET /api/seller/shop - Retrieve seller shop profile
router.get('/shop', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found for this seller' });
    }
    res.json({ success: true, shop });
  } catch (error) {
    next(error);
  }
});

// POST /api/seller/shop - Create or Update shop profile
router.post('/shop', async (req, res, next) => {
  try {
    const { shop_name, description, logo, banner, contact_email, contact_phone } = req.body;
    if (!shop_name) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }

    const existing = await getSellerShop(req.user.id);
    if (existing) {
      await execute(
        `UPDATE shops 
         SET shop_name = ?, description = ?, logo = ?, banner = ?, contact_email = ?, contact_phone = ?, updated_at = CURRENT_TIMESTAMP
         WHERE seller_id = ?`,
        [shop_name, description, logo, banner, contact_email, contact_phone, req.user.id]
      );
    } else {
      await execute(
        `INSERT INTO shops (seller_id, shop_name, description, logo, banner, contact_email, contact_phone, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [req.user.id, shop_name, description, logo, banner, contact_email, contact_phone]
      );
    }

    const updatedShop = await getSellerShop(req.user.id);
    res.json({ success: true, message: 'Shop profile saved successfully', shop: updatedShop });
  } catch (error) {
    next(error);
  }
});

// GET /api/seller/products - Get all products for seller's shop
router.get('/products', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Seller shop not registered' });
    }

    const products = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.shop_id = ?
       ORDER BY p.id DESC`,
      [shop.id]
    );

    const formatted = products.map(p => {
      let specs = {};
      try {
        specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
      } catch (e) {
        specs = {};
      }
      return { ...p, specifications: specs, is_low_stock: p.stock_quantity < 5 };
    });

    res.json({ success: true, products: formatted });
  } catch (error) {
    next(error);
  }
});

// POST /api/seller/products - Add product with dynamic JSON specs
router.post('/products', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(403).json({ success: false, message: 'Must create a shop profile before adding products' });
    }

    const { category_id, name, brand = 'Generic', description, specifications = {}, price, cost_price = 0, stock_quantity = 0, image_url, is_featured = 0 } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Category, product name, and price are required' });
    }

    const jsonSpecs = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications;

    const result = await execute(
      `INSERT INTO products (shop_id, category_id, name, brand, description, specifications, price, cost_price, stock_quantity, image_url, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [shop.id, category_id, name, brand, description || '', jsonSpecs, price, cost_price, stock_quantity, image_url || '', is_featured ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.lastID
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/seller/products/:id - Update product details & stock
router.put('/products/:id', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    const productId = req.params.id;

    const product = await getOne('SELECT id FROM products WHERE id = ? AND shop_id = ?', [productId, shop.id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied' });
    }

    const { category_id, name, brand, description, specifications, price, cost_price, stock_quantity, image_url, is_featured } = req.body;
    const jsonSpecs = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications;

    await execute(
      `UPDATE products 
       SET category_id = COALESCE(?, category_id),
           name = COALESCE(?, name),
           brand = COALESCE(?, brand),
           description = COALESCE(?, description),
           specifications = COALESCE(?, specifications),
           price = COALESCE(?, price),
           cost_price = COALESCE(?, cost_price),
           stock_quantity = COALESCE(?, stock_quantity),
           image_url = COALESCE(?, image_url),
           is_featured = COALESCE(?, is_featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [category_id, name, brand, description, jsonSpecs, price, cost_price, stock_quantity, image_url, is_featured !== undefined ? (is_featured ? 1 : 0) : null, productId]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/seller/products/:id - Remove product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    const productId = req.params.id;

    const result = await execute('DELETE FROM products WHERE id = ? AND shop_id = ?', [productId, shop.id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/seller/dashboard - Aggregated stats & purchase table
router.get('/dashboard', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    // 1. Total Revenue from paid orders
    const revenueRow = await getOne(
      `SELECT COALESCE(SUM(oi.quantity * oi.price_each), 0) as total_revenue,
              COALESCE(SUM(oi.quantity), 0) as total_items_sold
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.shop_id = ? AND o.payment_status = 'paid'`,
      [shop.id]
    );

    // 2. Low stock alert count (< 5 units)
    const lowStockRow = await getOne(
      `SELECT COUNT(id) as low_stock_count FROM products WHERE shop_id = ? AND stock_quantity < 5`,
      [shop.id]
    );

    // 3. Unique Customers
    const uniqueCustomersRow = await getOne(
      `SELECT COUNT(DISTINCT o.buyer_id) as unique_customers
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.shop_id = ? AND o.payment_status = 'paid'`,
      [shop.id]
    );

    // 4. Distinct customer purchases table
    const customers = await query(
      `SELECT 
        u.id as customer_id,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        COUNT(DISTINCT o.id) as orders_count,
        SUM(oi.quantity) as items_bought,
        SUM(oi.quantity * oi.price_each) as total_spent,
        MAX(o.created_at) as last_order_date
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN users u ON o.buyer_id = u.id
       WHERE oi.shop_id = ? AND o.payment_status = 'paid'
       GROUP BY u.id, u.name, u.email, u.phone
       ORDER BY total_spent DESC`,
      [shop.id]
    );

    // 5. Full Orders list with populated items for this shop
    const shopOrders = await query(
      `SELECT DISTINCT 
        o.id,
        o.order_number,
        o.buyer_id,
        o.total_amount,
        o.tax_amount,
        o.shipping_fee,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.notes,
        o.created_at,
        u.name as buyer_name,
        u.email as buyer_email,
        u.phone as buyer_phone
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN users u ON o.buyer_id = u.id
       WHERE oi.shop_id = ?
       ORDER BY o.id DESC`,
      [shop.id]
    );

    const populatedShopOrders = await Promise.all(
      shopOrders.map(async (order) => {
        const items = await query(
          `SELECT 
            oi.id as item_id,
            oi.product_id,
            oi.quantity,
            oi.price_each,
            (oi.quantity * oi.price_each) as line_total,
            p.name as product_name,
            p.brand as product_brand,
            p.image_url
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ? AND oi.shop_id = ?`,
          [order.id, shop.id]
        );

        const shopSubtotal = items.reduce((sum, it) => sum + (it.line_total || 0), 0);

        return {
          ...order,
          items,
          shop_subtotal: shopSubtotal
        };
      })
    );

    res.json({
      success: true,
      shop,
      metrics: {
        totalRevenue: revenueRow.total_revenue || 0,
        totalItemsSold: revenueRow.total_items_sold || 0,
        lowStockAlert: lowStockRow.low_stock_count || 0,
        uniqueCustomers: uniqueCustomersRow.unique_customers || 0,
        totalOrdersCount: populatedShopOrders.length
      },
      customers,
      recentOrders: populatedShopOrders.slice(0, 10),
      allOrders: populatedShopOrders
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/seller/orders - Detailed list of all orders for this seller
router.get('/orders', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    const shopOrders = await query(
      `SELECT DISTINCT 
        o.id,
        o.order_number,
        o.buyer_id,
        o.total_amount,
        o.tax_amount,
        o.shipping_fee,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.notes,
        o.created_at,
        u.name as buyer_name,
        u.email as buyer_email,
        u.phone as buyer_phone
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN users u ON o.buyer_id = u.id
       WHERE oi.shop_id = ?
       ORDER BY o.id DESC`,
      [shop.id]
    );

    const populatedOrders = await Promise.all(
      shopOrders.map(async (order) => {
        const items = await query(
          `SELECT 
            oi.id as item_id,
            oi.product_id,
            oi.quantity,
            oi.price_each,
            (oi.quantity * oi.price_each) as line_total,
            p.name as product_name,
            p.brand as product_brand,
            p.image_url
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ? AND oi.shop_id = ?`,
          [order.id, shop.id]
        );

        const shopSubtotal = items.reduce((sum, it) => sum + (it.line_total || 0), 0);

        return {
          ...order,
          items,
          shop_subtotal: shopSubtotal
        };
      })
    );

    res.json({
      success: true,
      orders: populatedOrders
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/seller/customers/:id/orders - Get all orders by a specific customer for this seller
router.get('/customers/:id/orders', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    const customerId = req.params.id;
    const customer = await getOne('SELECT id, name, email, phone FROM users WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await query(
      `SELECT DISTINCT 
        o.id,
        o.order_number,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.notes,
        o.created_at
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.shop_id = ? AND o.buyer_id = ?
       ORDER BY o.id DESC`,
      [shop.id, customerId]
    );

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          `SELECT 
            oi.id as item_id,
            oi.product_id,
            oi.quantity,
            oi.price_each,
            (oi.quantity * oi.price_each) as line_total,
            p.name as product_name,
            p.brand as product_brand,
            p.image_url
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ? AND oi.shop_id = ?`,
          [order.id, shop.id]
        );

        const shopSubtotal = items.reduce((sum, it) => sum + (it.line_total || 0), 0);

        return {
          ...order,
          items,
          shop_subtotal: shopSubtotal
        };
      })
    );

    res.json({
      success: true,
      customer,
      orders: populatedOrders
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/seller/orders/:id/status - Update order status (processing / shipped / delivered / cancelled)
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const shop = await getSellerShop(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop profile not found' });
    }

    const { order_status } = req.body;
    const orderId = req.params.id;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order_status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    // Verify order contains seller's items
    const check = await getOne(
      'SELECT id FROM order_items WHERE order_id = ? AND shop_id = ?',
      [orderId, shop.id]
    );

    if (!check) {
      return res.status(403).json({ success: false, message: 'Order not associated with your shop' });
    }

    await execute(
      'UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [order_status, orderId]
    );

    res.json({ success: true, message: `Order status updated to ${order_status}` });
  } catch (error) {
    next(error);
  }
});

export default router;
