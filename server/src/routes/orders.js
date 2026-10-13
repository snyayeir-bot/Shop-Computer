import express from 'express';
import { query, getOne, execute } from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders (Atomic Checkout with Stock Verification & Decrement)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { items, shippingAddress, paymentMethod = 'KHQR', notes = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Begin simulated transaction
    await execute('BEGIN TRANSACTION');

    try {
      let subtotal = 0;
      const verifiedItems = [];

      // 1. Verify stock and calculate exact server-side pricing
      for (const item of items) {
        const product = await getOne(
          'SELECT id, name, price, stock_quantity, shop_id FROM products WHERE id = ?',
          [item.productId || item.id]
        );

        if (!product) {
          throw new Error(`Product #${item.productId || item.id} no longer exists in our catalog.`);
        }

        const requestedQty = parseInt(item.quantity) || 1;
        if (product.stock_quantity < requestedQty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested: ${requestedQty}, Available: ${product.stock_quantity}`
          );
        }

        const lineTotal = product.price * requestedQty;
        subtotal += lineTotal;

        verifiedItems.push({
          productId: product.id,
          shopId: product.shop_id,
          quantity: requestedQty,
          priceEach: product.price,
          name: product.name
        });
      }

      // Calculate VAT & Shipping
      const taxAmount = Number((subtotal * 0.10).toFixed(2)); // 10% VAT
      const shippingFee = 0.01; 
      const grandTotal = Number((subtotal + taxAmount + shippingFee).toFixed(2));

      // Enforce Wallet Credits Payment:
      // Combines personal wallet balance and shop available credits (for shop owners)
      let personalWallet = await getOne('SELECT id, balance FROM user_wallets WHERE user_id = ?', [buyerId]);
      if (!personalWallet) {
        await execute('INSERT OR IGNORE INTO user_wallets (user_id, balance) VALUES (?, 0.00)', [buyerId]);
        personalWallet = await getOne('SELECT id, balance FROM user_wallets WHERE user_id = ?', [buyerId]);
      }
      const personalBalance = personalWallet ? Number(personalWallet.balance || 0) : 0;

      // Check shop(s) owned by buyer
      const buyerShops = await query('SELECT id FROM shops WHERE seller_id = ?', [buyerId]);
      const shopWalletsList = [];
      let totalShopAvailable = 0;
      for (const bs of buyerShops) {
        let sw = await getOne('SELECT id, available_balance FROM shop_wallets WHERE shop_id = ?', [bs.id]);
        if (!sw) {
          await execute('INSERT OR IGNORE INTO shop_wallets (shop_id, available_balance, pending_balance) VALUES (?, 0.00, 0.00)', [bs.id]);
          sw = await getOne('SELECT id, available_balance FROM shop_wallets WHERE shop_id = ?', [bs.id]);
        }
        if (sw) {
          shopWalletsList.push(sw);
          totalShopAvailable += Number(sw.available_balance || 0);
        }
      }

      const totalAvailable = Number((personalBalance + totalShopAvailable).toFixed(2));
      if (totalAvailable < grandTotal) {
        throw new Error(
          `សមតុល្យ Credits មិនគ្រប់គ្រាន់ទេ! អ្នកមាន ${totalAvailable.toFixed(2)} Credits (សមតុល្យផ្ទាល់ខ្លួន: ${personalBalance.toFixed(2)}, ចំណូលហាង: ${totalShopAvailable.toFixed(2)}), ត្រូវការ ${grandTotal.toFixed(2)} Credits សម្រាប់ការកុម្ម៉ង់នេះ។ សូមបញ្ចូលលុយ (Top-Up) បន្ថែម។`
        );
      }

      // Deduct Credits: Deduct from personal wallet first, then remaining from shop wallet(s)
      let remainingToDeduct = grandTotal;
      if (personalBalance > 0) {
        const deductFromPersonal = Math.min(personalBalance, remainingToDeduct);
        await execute(
          `UPDATE user_wallets SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
          [deductFromPersonal, buyerId]
        );
        remainingToDeduct = Number((remainingToDeduct - deductFromPersonal).toFixed(2));
      }

      if (remainingToDeduct > 0) {
        for (const sw of shopWalletsList) {
          if (remainingToDeduct <= 0) break;
          const currentShopBal = Number(sw.available_balance || 0);
          if (currentShopBal > 0) {
            const deductFromShop = Math.min(currentShopBal, remainingToDeduct);
            await execute(
              `UPDATE shop_wallets SET available_balance = available_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [deductFromShop, sw.id]
            );
            remainingToDeduct = Number((remainingToDeduct - deductFromShop).toFixed(2));
          }
        }
      }

      // 2. Insert into orders table
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const orderResult = await execute(
        `INSERT INTO orders (order_number, buyer_id, total_amount, tax_amount, shipping_fee, payment_method, payment_status, order_status, shipping_address, notes)
         VALUES (?, ?, ?, ?, ?, 'wallet_credits', 'paid', 'processing', ?, ?)`,
        [orderNumber, buyerId, grandTotal, taxAmount, shippingFee, shippingAddress.trim(), notes]
      );

      const orderId = orderResult.lastID;

      // 3. Insert order_items and decrement product stock atomically, and credit shop wallets
      for (const vi of verifiedItems) {
        await execute(
          `INSERT INTO order_items (order_id, product_id, shop_id, quantity, price_each)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, vi.productId, vi.shopId, vi.quantity, vi.priceEach]
        );

        await execute(
          `UPDATE products 
           SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [vi.quantity, vi.productId]
        );

        // Credit seller shop wallet available balance
        const lineTotal = vi.priceEach * vi.quantity;
        const shopWallet = await getOne('SELECT id FROM shop_wallets WHERE shop_id = ?', [vi.shopId]);
        if (shopWallet) {
          await execute(
            `UPDATE shop_wallets SET available_balance = available_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE shop_id = ?`,
            [lineTotal, vi.shopId]
          );
        } else {
          await execute(
            `INSERT INTO shop_wallets (shop_id, available_balance, pending_balance) VALUES (?, ?, 0.00)`,
            [vi.shopId, lineTotal]
          );
        }
      }

      // Commit transaction
      await execute('COMMIT');

      res.status(201).json({
        success: true,
        message: paymentMethod === 'wallet_credits'
          ? 'Order placed successfully and paid via Wallet Credits!'
          : 'Order created successfully and payment processed!',
        order: {
          id: orderId,
          orderNumber,
          totalAmount: grandTotal,
          taxAmount,
          shippingFee,
          paymentMethod,
          paymentStatus: 'paid',
          orderStatus: 'processing',
          items: verifiedItems
        }
      });
    } catch (txError) {
      await execute('ROLLBACK');
      return res.status(400).json({ success: false, message: txError.message || 'Checkout failed' });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', verifyToken, async (req, res, next) => {
  try {
    const buyerId = req.user.id;

    const orders = await query(
      `SELECT * FROM orders WHERE buyer_id = ? ORDER BY id DESC`,
      [buyerId]
    );

    // Fetch items for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          `SELECT oi.*, p.name as product_name, p.image_url, s.shop_name 
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           JOIN shops s ON oi.shop_id = s.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return {
          ...order,
          items
        };
      })
    );

    // Calculate total spent metric
    const totalSpentRow = await getOne(
      `SELECT COALESCE(SUM(total_amount), 0) as total_spent, COUNT(id) as total_orders 
       FROM orders 
       WHERE buyer_id = ? AND payment_status = 'paid'`,
      [buyerId]
    );

    res.json({
      success: true,
      metrics: {
        totalSpent: totalSpentRow.total_spent || 0,
        totalOrders: totalSpentRow.total_orders || 0
      },
      orders: populatedOrders
    });
  } catch (error) {
    next(error);
  }
});

export default router;
