import express from 'express';
import crypto from 'crypto';
import { getOne, execute } from '../db.js';
import { generateAcledaKHQR } from '../utils/khqrGenerator.js';

const router = express.Router();

// POST /api/payment/khqr/generate - Generate ACLEDA Mobile KHQR directly (YAI SORNYA)
router.post('/khqr/generate', async (req, res, next) => {
  try {
    const { amount, currency = 'USD', orderNumber, merchantName = 'YAI SORNYA' } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const numAmount = Number(amount).toFixed(2);
    const merchant = merchantName || process.env.BAKONG_MERCHANT_NAME || 'YAI SORNYA';
    const phone = process.env.BAKONG_PHONE || '0978810715';

    // Generate direct ACLEDA Mobile KHQR
    const acledaQr = generateAcledaKHQR({
      amount: numAmount,
      currency,
      merchantName: merchant,
      orderNumber: orderNumber || `ORD-${Date.now()}`,
      phone
    });

    const transactionId = `txn_acleda_${Date.now()}`;

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        qr_string: acledaQr.qrString,
        qr_image: '/saniya-Qrcode.jpg',
        payment_url: null,
        abapay_deeplink: `bakong://khqr?qr=${encodeURIComponent(acledaQr.qrString)}`,
        expires_in: 1800,
        amount: numAmount,
        currency,
        orderNumber,
        merchantName: merchant,
        account: acledaQr.account,
        md5: acledaQr.md5,
        gateway: 'ACLEDA Mobile KHQR (Direct)'
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payment/khqr/check-status - Check status for orders
router.post('/khqr/check-status', async (req, res, next) => {
  try {
    const { orderNumber } = req.body;

    if (orderNumber) {
      const order = await getOne('SELECT id, payment_status, order_status FROM orders WHERE order_number = ?', [orderNumber]);
      if (order && order.payment_status === 'paid') {
        return res.json({
          success: true,
          status: 'paid',
          paid: true,
          message: 'Payment confirmed'
        });
      }
    }

    res.json({
      success: true,
      status: 'pending',
      paid: false,
      message: 'Waiting for payment confirmation'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payment/khqr/check/:transactionId
router.get('/khqr/check/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { orderNumber } = req.query;

    if (orderNumber) {
      const order = await getOne('SELECT id, payment_status, order_status FROM orders WHERE order_number = ?', [orderNumber]);
      if (order && order.payment_status === 'paid') {
        return res.json({
          success: true,
          data: {
            transaction_id: transactionId,
            paid: true,
            status: 'paid'
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        paid: false,
        status: 'pending'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
