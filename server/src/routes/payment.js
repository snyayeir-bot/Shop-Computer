import express from 'express';
import crypto from 'crypto';
import { getOne, execute } from '../db.js';

const router = express.Router();

const KHPAY_BASE_URL = 'https://khpay.site/api/v1';
const API_KEY = process.env.KHPAY_API_KEY || process.env.KHQR_API_KEY || 'ak_e48619172adb718876830c1806f6cdb988852ab60fc662fe';

// Helper: Calculate CRC16-CCITT for standard EMVCo KHQR compliance
function crc16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Generate EMVCo KHQR string
function generateEMVCoKhqr({ amount, currency = 'USD', orderNumber, merchantName = 'CYBERTECH KH', bakongAccountId }) {
  const numAmount = Number(amount).toFixed(2);
  const currCode = currency === 'KHR' ? '116' : '840';
  
  // Format ACLEDA account ID
  let accId = (bakongAccountId || process.env.BAKONG_ACCOUNT_ID || '0978810715@aclb').trim();
  const cleanMerchant = (merchantName || process.env.BAKONG_MERCHANT_NAME || 'CYBERTECH COMPUTER').slice(0, 25);
  const city = process.env.BAKONG_CITY || 'Phnom Penh';
  const acquiringBank = (process.env.BAKONG_ACQUIRING_BANK || 'aclbkhppxxx').trim();

  // Tag 29: Bakong Merchant / Individual Account Information
  // Subtag 00: Bakong Account ID (e.g. 0978810715@aclb or 855978810715@aclb)
  // Subtag 02: Acquiring Bank (aclbkhppxxx for ACLEDA Bank)
  const sub00 = `00${accId.length.toString().padStart(2, '0')}${accId}`;
  const sub02 = `02${acquiringBank.length.toString().padStart(2, '0')}${acquiringBank}`;
  const tag29Content = `${sub00}${sub02}`;
  const tag29 = `29${tag29Content.length.toString().padStart(2, '0')}${tag29Content}`;

  // Tag 62: Additional Data (Reference / Order Number)
  const orderRef = (orderNumber || 'ORD-CYBER').slice(0, 25);
  const tag62_01 = `01${orderRef.length.toString().padStart(2, '0')}${orderRef}`;
  const tag62 = `62${tag62_01.length.toString().padStart(2, '0')}${tag62_01}`;

  const amtStr = numAmount.toString();
  const rawWithoutCrc = 
    `000201` +
    `010212` +
    tag29 +
    `52045999` +
    `5303${currCode}` +
    `54${amtStr.length.toString().padStart(2, '0')}${amtStr}` +
    `5802KH` +
    `59${cleanMerchant.length.toString().padStart(2, '0')}${cleanMerchant}` +
    `60${city.length.toString().padStart(2, '0')}${city}` +
    tag62 +
    `6304`;

  const checksum = crc16(rawWithoutCrc);
  return `${rawWithoutCrc}${checksum}`;
}

// POST /api/payment/khqr/generate
router.post('/khqr/generate', async (req, res, next) => {
  try {
    const { amount, currency = 'USD', orderNumber, merchantName = 'CYBERTECH KH', bakongAccountId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const numAmount = Number(amount).toFixed(2);
    let khpayData = null;
    let isTestMode = false;

    // 1. Attempt official KHPay API request
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
      } else if (responseJson.error_code === 'PAYWAY_NOT_CONFIGURED') {
        // Merchant has not linked ABA PayWay in khpay.site dashboard yet, try with test mode
        console.warn('KHPay PayWay link not set, requesting KHPay with X-Test-Mode: true');
        const testRes = await fetch(`${KHPAY_BASE_URL}/qr/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'X-Test-Mode': 'true'
          },
          body: JSON.stringify({
            amount: '1.00',
            currency: 'USD',
            note: `Test Order ${orderNumber || ''}`
          })
        });
        const testJson = await testRes.json();
        if (testJson.success && testJson.data) {
          khpayData = testJson.data;
          isTestMode = true;
        }
      }
    } catch (apiErr) {
      console.error('KHPay API fetch error:', apiErr.message);
    }

    // 2. Generate EMVCo KHQR string
    const fallbackKhqr = generateEMVCoKhqr({
      amount: numAmount,
      currency,
      orderNumber,
      merchantName,
      bakongAccountId
    });

    const qrString = khpayData?.qr_string && !isTestMode ? khpayData.qr_string : fallbackKhqr;
    const transactionId = khpayData?.transaction_id || `txn_local_${Date.now()}`;
    const md5Hash = crypto.createHash('md5').update(qrString + API_KEY).digest('hex');

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        qr_string: qrString,
        qr_image: khpayData?.qr_image || null,
        payment_url: khpayData?.payment_url || null,
        abapay_deeplink: khpayData?.abapay_deeplink || `bakong://khqr?qr=${encodeURIComponent(qrString)}`,
        expires_in: khpayData?.expires_in || 300,
        amount: numAmount,
        currency,
        orderNumber,
        merchantName,
        md5: md5Hash,
        gateway: 'KHPay / Bakong KHQR',
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
