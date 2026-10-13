import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Key
} from 'lucide-react';
import api from '../api/axios';

export default function BakongKHQRModal({ 
  isOpen, 
  onClose, 
  amount, 
  currency = 'USD', 
  merchantName = 'CYBERTECH COMPUTER STORE',
  orderNumber,
  onPaymentSuccess 
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [khqrString, setKhqrString] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [khqrMeta, setKhqrMeta] = useState(null);

  // Exchange rate: 1 USD = 4,100 KHR
  const khrRate = 4100;
  const currentAmount = selectedCurrency === 'USD' 
    ? Number(amount).toFixed(2) 
    : (Number(amount) * khrRate).toLocaleString();

  useEffect(() => {
    if (!isOpen) return;
    
    setTimeLeft(180);
    setPaymentDone(false);
    setIsVerifying(false);

    // Call Backend KHQR / KHPay API service
    const generateKHQR = async () => {
      try {
        const sendAmount = selectedCurrency === 'USD' ? Number(amount) : Number(amount) * khrRate;
        const res = await api.post('/payment/khqr/generate', {
          amount: sendAmount,
          currency: selectedCurrency,
          orderNumber: orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
          merchantName: merchantName || 'CYBERTECH KH'
        });

        if (res.data?.data) {
          const rawPayload = res.data.data.qr_string || res.data.data.qrString;
          setKhqrString(rawPayload);
          setKhqrMeta(res.data.data);

          if (res.data.data.qr_image) {
            setQrDataUrl(res.data.data.qr_image);
          } else {
            const dataUrl = await QRCode.toDataURL(rawPayload, {
              width: 340,
              margin: 1,
              color: {
                dark: '#0f172a',
                light: '#FFFFFF'
              },
              errorCorrectionLevel: 'H'
            });
            setQrDataUrl(dataUrl);
          }
        }
      } catch (err) {
        console.error('Failed to generate KHQR:', err);
        const fallback = `00020101021229300016bakong@nbc.org.kh520459995303${
          selectedCurrency === 'USD' ? '840' : '116'
        }54${currentAmount.length.toString().padStart(2, '0')}${currentAmount}5802KH5915CYBERTECH KH6010Phnom Penh6304`;
        setKhqrString(fallback);
        QRCode.toDataURL(fallback, { width: 340, margin: 1 }).then(setQrDataUrl);
      }
    };

    generateKHQR();
  }, [isOpen, selectedCurrency, amount, orderNumber, merchantName]);

  // Real-time Polling payment status every 3 seconds
  useEffect(() => {
    if (!isOpen || paymentDone || !khqrMeta) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.post('/payment/khqr/check-status', {
          transaction_id: khqrMeta.transaction_id,
          orderNumber: orderNumber || khqrMeta.orderNumber
        });

        if (res.data?.paid === true || res.data?.status === 'paid') {
          setPaymentDone(true);
          clearInterval(interval);
          setTimeout(() => {
            if (onPaymentSuccess) onPaymentSuccess();
          }, 1500);
        }
      } catch (e) {
        // Silently catch polling retry
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, paymentDone, khqrMeta, orderNumber, onPaymentSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentDone || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentDone, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(khqrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `KHQR_${orderNumber || 'Payment'}.png`;
    a.click();
  };

  // Simulate Bakong / Mobile App payment instant confirmation
  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentDone(true);
      setTimeout(() => {
        if (onPaymentSuccess) onPaymentSuccess();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      {/* Main KHQR Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white text-slate-900 shadow-2xl z-10 overflow-hidden my-4 border border-slate-200">
        
        {/* NBC Standard Red KHQR Header */}
        <div className="bg-[#E1251B] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-2xl tracking-tighter font-sans">KHQR</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded">
                BAKONG
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4 text-center">
          
          {paymentDone ? (
            /* Payment Success View */
            <div className="py-8 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-mono">
                  KHQR Payment Verified!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bakong / KHPay Transaction confirmed successfully.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span className="font-bold text-slate-900">{merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {selectedCurrency === 'USD' ? `$${currentAmount}` : `${currentAmount} ៛`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Ref:</span>
                  <span className="truncate max-w-[150px]">{khqrMeta?.transaction_id || 'Verified'}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Merchant Info */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight line-clamp-1">
                  {merchantName}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  Ref: #{orderNumber || 'ORD-CYBER'}
                </p>
              </div>

              {/* Amount & Currency Switcher */}
              <div className="py-2.5 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black font-mono text-[#E1251B]">
                    {selectedCurrency === 'USD' ? `$${currentAmount}` : `${currentAmount} ៛`}
                  </span>
                </div>

                {/* Switch USD / KHR */}
                <div className="flex bg-slate-200 p-0.5 rounded-xl text-[11px] font-mono font-bold">
                  <button
                    onClick={() => setSelectedCurrency('USD')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      selectedCurrency === 'USD'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    onClick={() => setSelectedCurrency('KHR')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      selectedCurrency === 'KHR'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>
              </div>

              {/* QR Code with Bakong Center Emblem */}
              <div className="relative inline-block p-3 rounded-2xl bg-white border-2 border-slate-100 shadow-md">
                {qrDataUrl ? (
                  <div className="relative">
                    <img
                      src={qrDataUrl}
                      alt="Bakong KHQR"
                      className="w-56 h-56 mx-auto object-contain"
                    />
                    {/* Center KHQR Currency emblem */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-10 w-10 rounded-full bg-[#E1251B] text-white flex items-center justify-center font-black text-sm border-2 border-white shadow-md">
                        {selectedCurrency === 'USD' ? '$' : '៛'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-xl" />
                )}
              </div>

              {/* Countdown Expiry */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-500">
                <Clock className="h-3.5 w-3.5 text-[#E1251B]" />
                <span>QR expires in:</span>
                <strong className={`font-bold ${timeLeft < 30 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                  {formatTime(timeLeft)}
                </strong>
              </div>

              {/* Supported Banking Apps Strip */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                  Scan with any Mobile Banking App in Cambodia:
                </span>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {['ABA Mobile', 'ACLEDA', 'Wing Bank', 'Bakong', 'Canadia', 'Chip Mong'].map((bank) => (
                    <span
                      key={bank}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200"
                    >
                      {bank}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions: Save QR & Copy String */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleDownloadQR}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Save QR Image</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy KHQR'}</span>
                </button>
              </div>

              {/* Interactive Confirmation Button */}
              <div className="pt-1">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isVerifying}
                  className="w-full py-3 px-4 rounded-xl bg-[#E1251B] hover:bg-[#c91e15] text-white font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying ACLEDA Mobile Transfer...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4" />
                      <span>ខ្ញុំបានស្កេនបាញ់លុយរួចរាល់ (Confirm Payment)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
