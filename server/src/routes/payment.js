import express from 'express';
import crypto from 'crypto';
import { getOne, execute } from '../db.js';
import { generateAcledaKHQR } from '../utils/khqrGenerator.js';

const router = express.Router();

const KHPAY_BASE_URL = 'https://khpay.site/api/v1';
const API_KEY = process.env.KHPAY_API_KEY || process.env.KHQR_API_KEY || 'ak_e48619172adb718876830c1806f6cdb988852ab60fc662fe';

// POST /api/payment/khqr/generate
router.post('/khqr/generate', async (req, res, next) => {
  try {
    const { amount, currency = 'USD', orderNumber, merchantName = 'CYBERTECH COMPUTER', bakongAccountId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const numAmount = Number(amount).toFixed(2);
    let khpayData = null;
    let isTestMode = false;

    // 1. Attempt official KHPay API request if configured
    try {
      const khpayRes = await fetch(`${KHPAY_BASE_URL}/qr/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          amount: numAmount,
          currency: currency === 'KHR' ? 'KHR' : 'USD',
          note: `Order ${orderNumber || 'Online'} - Cybertech`,
          metadata: { order_number: orderNumber || '' }
        })
      });

      const responseJson = await khpayRes.json();

      if (responseJson.success && responseJson.data) {
        khpayData = responseJson.data;
      }
    } catch (apiErr) {
      console.warn('KHPay API fetch notice:', apiErr.message);
    }

    // 2. Generate direct ACLEDA Mobile KHQR with phone 015650751
    const acledaQr = generateAcledaKHQR({
      amount: numAmount,
      currency,
      merchantName: merchantName || process.env.BAKONG_MERCHANT_NAME || 'CYBERTECH COMPUTER',
      orderNumber,
      phone: process.env.BAKONG_PHONE || '015650751'
    });

    const qrString = khpayData?.qr_string && !isTestMode ? khpayData.qr_string : acledaQr.qrString;
    const transactionId = khpayData?.transaction_id || `txn_aclb_${Date.now()}`;
    const md5Hash = acledaQr.md5 || crypto.createHash('md5').update(qrString + API_KEY).digest('hex');

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        qr_string: qrString,
        qr_image: khpayData?.qr_image || null,
        payment_url: khpayData?.payment_url || null,
        abapay_deeplink: `bakong://khqr?qr=${encodeURIComponent(qrString)}`,
        expires_in: khpayData?.expires_in || 300,
        amount: numAmount,
        currency,
        orderNumber,
        merchantName: merchantName || 'CYBERTECH COMPUTER',
        account: acledaQr.account || '85515650751@aclb',
        md5: md5Hash,
        gateway: 'ACLEDA Mobile KHQR (Bakong)',
        is_test_mode: isTestMode,
        apiKeyUsed: `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payment/khqr/check-status or GET /api/payment/khqr/check/:transactionId
router.post('/khqr/check-status', async (req, res, next) => {
  try {
    const { transaction_id, md5, orderNumber } = req.body;

    // 1. If we have orderNumber, check database
    if (orderNumber) {
      const order = await getOne('SELECT id, payment_status, order_status FROM orders WHERE order_number = ?', [orderNumber]);
      if (order && order.payment_status === 'paid') {
        return res.json({
          success: true,
          status: 'paid',
          paid: true,
          message: 'Payment confirmed in database'
        });
      }
    }

    // 2. If we have a KHPay transaction ID, check remote status on KHPay
    if (transaction_id && !transaction_id.startsWith('txn_local_')) {
      try {
        const checkRes = await fetch(`${KHPAY_BASE_URL}/qr/check/${encodeURIComponent(transaction_id)}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        });
        const checkJson = await checkRes.json();
        if (checkJson.success && checkJson.data) {
          const isPaid = checkJson.data.paid === true || checkJson.data.status === 'paid' || checkJson.data.action === 'approved';

          if (isPaid && orderNumber) {
            await execute(
              `UPDATE orders SET payment_status = 'paid', order_status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE order_number = ?`,
              [orderNumber]
            );
          }

          return res.json({
            success: true,
            status: isPaid ? 'paid' : (checkJson.data.status || 'pending'),
            paid: isPaid,
            data: checkJson.data
          });
        }
      } catch (err) {
        console.warn('KHPay check API call error:', err.message);
      }
    }

    // Default pending status
    res.json({
      success: true,
      status: 'pending',
      paid: false,
      message: 'Waiting for scan & payment'
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

    if (transactionId && !transactionId.startsWith('txn_local_')) {
      const checkRes = await fetch(`${KHPAY_BASE_URL}/qr/check/${encodeURIComponent(transactionId)}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      const checkJson = await checkRes.json();
      if (checkJson.success && checkJson.data) {
        const isPaid = checkJson.data.paid === true || checkJson.data.status === 'paid' || checkJson.data.action === 'approved';
        if (isPaid && orderNumber) {
          await execute(
            `UPDATE orders SET payment_status = 'paid', order_status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE order_number = ?`,
            [orderNumber]
          );
        }
        return res.json(checkJson);
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

// GET /api/payment/account-info (Check KHPay merchant & quota)
router.get('/account-info', async (req, res, next) => {
  try {
    const accountRes = await fetch(`${KHPAY_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    const accountJson = await accountRes.json();
    res.json(accountJson);
  } catch (error) {
    next(error);
  }
});

export default router;
