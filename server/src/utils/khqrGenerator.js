import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';
import crypto from 'crypto';

/**
 * បង្កើត KHQR Payload សម្រាប់គណនី ACLEDA Mobile (លេខទូរស័ព្ទ: 015650751)
 * @param {Object} params
 * @param {number|string} params.amount - ចំនួនទឹកប្រាក់
 * @param {'USD' | 'KHR'} [params.currency='USD'] - រូបិយប័ណ្ណ
 * @param {string} [params.merchantName='YAI SORNYA'] - ឈ្មោះម្ចាស់គណនី
 * @param {string} [params.orderNumber='TOPUP-CYBER'] - លេខសម្គាល់ Order
 * @param {string} [params.phone='015650751'] - លេខទូរស័ព្ទគណនី ACLEDA
 * @returns {{ qrString: string, md5: string, account: string }}
 */
export function generateAcledaKHQR({
  amount,
  currency = 'USD',
  merchantName = process.env.BAKONG_MERCHANT_NAME || 'YAI SORNYA',
  orderNumber = 'TOPUP-CYBER',
  phone = process.env.BAKONG_PHONE || '015650751'
}) {
  try {
    // សម្អាតលេខទូរស័ព្ទ 015650751 ទៅជាទម្រង់ 85515650751@aclb
    const rawPhone = phone.trim();
    const cleanPhone = rawPhone.startsWith('0')
      ? '855' + rawPhone.slice(1)
      : rawPhone.startsWith('855')
      ? rawPhone
      : '855' + rawPhone;

    const acledaBakongId = `${cleanPhone}@aclb`; // 85515650751@aclb
    const numAmount = parseFloat(amount);

    // កំណត់រូបិយប័ណ្ណ Bakong Currency Code (USD: 840, KHR: 116)
    const selectedCurrency =
      currency === 'KHR'
        ? (khqrData?.currency?.khr || '116')
        : (khqrData?.currency?.usd || '840');

    // Dynamic KHQR requires expiration timestamp (30 mins from now)
    const expirationTimestamp = Date.now() + 30 * 60 * 1000;

    const optionalData = {
      currency: selectedCurrency,
      amount: numAmount,
      mobileNumber: cleanPhone,
      storeLabel: (merchantName || 'YAI SORNYA').slice(0, 25),
      terminalLabel: 'Online-Web',
      billNumber: (orderNumber || 'TOPUP-001').slice(0, 25),
      expirationTimestamp
    };

    const individualInfo = new IndividualInfo(
      acledaBakongId,
      (merchantName || 'YAI SORNYA').trim().toUpperCase().slice(0, 25),
      process.env.BAKONG_CITY || 'Phnom Penh',
      optionalData
    );

    const khqr = new BakongKHQR();
    const response = khqr.generateIndividual(individualInfo);

    if (response && response.data && response.data.qr) {
      return {
        qrString: response.data.qr,
        md5: response.data.md5 || crypto.createHash('md5').update(response.data.qr).digest('hex'),
        account: acledaBakongId
      };
    }
  } catch (err) {
    console.warn('BakongKHQR lib notice:', err.message);
  }

  // Standalone fallback EMVCo CRC16 calculation if required
  return generateFallbackKHQR({
    amount,
    currency,
    merchantName,
    orderNumber,
    phone
  });
}

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

function generateFallbackKHQR({ amount, currency = 'USD', merchantName, orderNumber, phone = '015650751' }) {
  const numAmount = Number(amount).toFixed(2);
  const currCode = currency === 'KHR' ? '116' : '840';

  const rawPhone = phone.trim();
  const cleanPhone = rawPhone.startsWith('0') ? '855' + rawPhone.slice(1) : rawPhone;
  const accId = `${cleanPhone}@aclb`;
  const cleanMerchant = (merchantName || 'CYBERTECH COMPUTER').toUpperCase().slice(0, 25);
  const city = 'Phnom Penh';
  const acquiringBank = 'aclbkhppxxx';

  const sub00 = `00${accId.length.toString().padStart(2, '0')}${accId}`;
  const sub02 = `02${acquiringBank.length.toString().padStart(2, '0')}${acquiringBank}`;
  const tag29Content = `${sub00}${sub02}`;
  const tag29 = `29${tag29Content.length.toString().padStart(2, '0')}${tag29Content}`;

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
  const qrString = `${rawWithoutCrc}${checksum}`;

  return {
    qrString,
    md5: crc16(qrString).toLowerCase(),
    account: accId
  };
}

export default generateAcledaKHQR;
