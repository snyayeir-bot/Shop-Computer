import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Coins,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Upload,
  Scan,
  AlertTriangle,
  History,
  Building,
  Hash,
  Zap,
  CheckCircle,
  XCircle,
  FileCheck2,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import api from '../api/axios';
import { useWallet } from '../context/WalletContext';

export default function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, balance, fetchBalance } = useWallet();
  const [activeTab, setActiveTab] = useState('scan_pay'); // 'scan_pay' | 'history'

  // Slip upload & verification states
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Standee and copy state
  const [copied, setCopied] = useState(false);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isTopUpOpen && activeTab === 'history') {
      loadHistory();
    }
  }, [isTopUpOpen, activeTab]);

  if (!isTopUpOpen) return null;

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/wallet/transactions');
      if (res.data?.topups) {
        setHistoryList(res.data.topups);
      }
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle Slip Upload & Trigger Verification
  const handleSlipFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFile(file);
    setScannedData(null);
    setVerificationResult(null);
    setIsDuplicate(false);
    setSuccessData(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setSlipPreview(base64);
      triggerSlipVerification(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const triggerSlipVerification = async (base64Img, filename) => {
    setIsScanning(true);
    try {
      const res = await api.post('/wallet/topup/scan-slip', {
        slipImage: base64Img,
        filename: filename || 'bank_slip.jpg'
      });

      if (res.data?.success && res.data?.data) {
        setScannedData(res.data.data);
        setIsDuplicate(Boolean(res.data.isDuplicate));
        setVerificationResult(res.data.verification || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ការស្គែនវិក្កយបត្របរាជ័យ សូមសាកល្បងម្ដងទៀត');
    } finally {
      setIsScanning(false);
    }
  };

  // Switch/toggle currency manually if user needs to adjust
  const handleToggleCurrency = (newCurrency) => {
    if (!scannedData) return;
    const rawAmt = Number(scannedData.amount) || 0;
    const newCredits = newCurrency === 'KHR'
      ? Number((rawAmt / 4000).toFixed(2))
      : Number(rawAmt.toFixed(2));
    
    setScannedData(prev => ({
      ...prev,
      currency: newCurrency,
      credits: newCredits,
      rateExplanation: newCurrency === 'KHR'
        ? `អត្រាប្តូរប្រាក់៖ ៤,០០០ ៛ = ១ Credit (${rawAmt.toLocaleString()} ៛ = ${newCredits.toFixed(2)} Credits)`
        : `អត្រាប្តូរប្រាក់៖ $1 USD = ១ Credit ($${rawAmt.toFixed(2)} = ${newCredits.toFixed(2)} Credits)`
    }));
  };

  // Adjust amount manually if receipt was blurry or static QR
  const handleAmountChange = (newAmount) => {
    if (!scannedData) return;
    const rawAmt = Math.max(0, parseFloat(newAmount) || 0);
    const newCredits = scannedData.currency === 'KHR'
      ? Number((rawAmt / 4000).toFixed(2))
      : Number(rawAmt.toFixed(2));
    
    setScannedData(prev => ({
      ...prev,
      amount: rawAmt,
      credits: newCredits,
      rateExplanation: prev.currency === 'KHR'
        ? `អត្រាប្តូរប្រាក់៖ ៤,០០០ ៛ = ១ Credit (${rawAmt.toLocaleString()} ៛ = ${newCredits.toFixed(2)} Credits)`
        : `អត្រាប្តូរប្រាក់៖ $1 USD = ១ Credit ($${rawAmt.toFixed(2)} = ${newCredits.toFixed(2)} Credits)`
    }));
  };

  // Confirm and Credit account
  const handleConfirmTopUp = async () => {
    if (!scannedData || isDuplicate) return;

    setIsSubmitting(true);
    try {
      const payload = {
        transaction_id: scannedData.transaction_id,
        amount: scannedData.amount,
        credits: scannedData.credits,
        bank_name: scannedData.bank_name,
        sender_name: scannedData.sender_name,
        receiver_name: scannedData.receiver_name,
        slipImageUrl: slipPreview,
        raw_slip_data: scannedData
      };

      const res = await api.post('/wallet/topup/confirm-slip', payload);
      if (res.data?.success) {
        await fetchBalance();
        setSuccessData({
          credits: Number(res.data.credits || scannedData.credits),
          newBalance: res.data.newBalance,
          bank: scannedData.bank_name,
          trxId: scannedData.transaction_id,
          currency: scannedData.currency,
          originalAmount: scannedData.amount
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to credit account from slip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsTopUpOpen(false);
    setSlipFile(null);
    setSlipPreview('');
    setScannedData(null);
    setVerificationResult(null);
    setSuccessData(null);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('85515650751@aclb');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div onClick={handleClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      <div className="relative w-full max-w-xl rounded-3xl bg-[#0b1220] border border-cyan-500/30 text-white shadow-2xl z-10 overflow-hidden my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                Top-Up Credits
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  តាមវិក្កយបត្រ (By Slip)
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                សមតុល្យបច្ចុប្បន្ន: <strong className="text-amber-400 font-black">{balance.toFixed(2)} Credits</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-slate-950/80 p-1.5 border-b border-slate-800/80 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('scan_pay')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'scan_pay'
                ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4 text-amber-400" />
            <span>ស្កេន KHQR & Upload វិក្កយបត្រ</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4 text-slate-400" />
            <span>ប្រវត្តិ Top-up (History)</span>
          </button>
        </div>

        {/* TAB 1: Standee Scan First + Upload Slip Verification */}
        {activeTab === 'scan_pay' && (
          <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {successData ? (
              /* Success Screen */
              <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in">
                <div className="h-20 w-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="text-xl font-black font-mono text-white">បញ្ចូល Credits ជោគជ័យ!</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    បានផ្ទៀងផ្ទាត់វិក្កយបត្រត្រឹមត្រូវ ({successData.bank})
                  </p>
                </div>

                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-mono space-y-2 text-left">
                  <div className="flex justify-between text-slate-400">
                    <span>ទឹកប្រាក់ផ្ទេរដើម:</span>
                    <span className="text-white font-bold">
                      {successData.currency === 'KHR'
                        ? `${Number(successData.originalAmount).toLocaleString()} ៛ (អត្រា ៤,០០០៛ = ១ Credit)`
                        : `$${Number(successData.originalAmount).toFixed(2)} USD (អត្រា $1 = ១ Credit)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Credits ទទួលបាន:</span>
                    <span className="text-emerald-400 font-black text-sm">+{successData.credits.toFixed(2)} Credits</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>សមតុល្យថ្មី (New Balance):</span>
                    <span className="text-amber-400 font-bold text-sm">{successData.newBalance.toFixed(2)} Credits</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>លេខប្រតិបត្តិការ (Ref ID):</span>
                    <span className="text-slate-200">{successData.trxId}</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-mono font-black text-xs hover:opacity-95 transition-all shadow-glow-cyan"
                >
                  រួចរាល់ / ត្រឡប់ទៅទិញទំនិញ
                </button>
              </div>
            ) : (
              <>
                {/* 1. Currency Exchange Rate Strip */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-slate-300 font-bold">អត្រាប្តូរ Credits តាមវិក្កយបត្រ៖</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      💵 $1 USD = 1 Credit
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      🇰🇭 4,000 ៛ = 1 Credit
                    </span>
                  </div>
                </div>

                {/* 2. KHQR Code Display Area (លោតកន្លែងសម្រាប់ស្កេនមកសិន) */}
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                      <Scan className="h-4 w-4" />
                      ជំហានទី ១៖ ស្កេនបាញ់លុយតាម ACLEDA KHQR
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      បាញ់ចំនួនប៉ុន្មានក៏បាន (៛ ឬ $)
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-xl border-2 border-slate-200 text-center max-w-[280px] mx-auto">
                    <img
                      src="/saniya-Qrcode.jpg"
                      alt="ACLEDA KHQR YAI SORNYA"
                      className="w-full object-contain rounded-xl"
                    />
                  </div>

                  {/* Account details */}
                  <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[11px] block">គណនីទទួល (Receiver):</span>
                      <strong className="text-cyan-300">YAI SORNYA (85515650751@aclb)</strong>
                    </div>
                    <button
                      onClick={handleCopyAccount}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? 'បានចម្លង' : 'Copy ID'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Upload Slip Section (បន្ថែមកន្លែង Upload វិក្កយបត្រ) */}
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <Upload className="h-4 w-4" />
                      ជំហានទី ២៖ Upload រូបភាពវិក្កយបត្រ (Payment Slip)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ប្រព័ន្ធគណនា Credits តាម Slip ផ្ទាល់
                    </span>
                  </div>

                  {/* File Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      slipPreview
                        ? 'border-cyan-500/50 bg-slate-950/80'
                        : 'border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 hover:bg-slate-950/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSlipFileSelect}
                      className="hidden"
                    />

                    {slipPreview ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-800 mx-auto bg-black flex items-center justify-center">
                          <img
                            src={slipPreview}
                            alt="Bank Slip Preview"
                            className="w-full h-full object-contain max-h-48"
                          />
                          {isScanning && (
                            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                              <RefreshCw className="h-7 w-7 text-cyan-400 animate-spin" />
                              <span className="text-xs font-mono text-cyan-300 font-bold animate-pulse">
                                ប្រព័ន្ធកំពុងស្គែន និងគណនា Credits តាមវិក្កយបត្រ...
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 hover:text-cyan-400 font-mono block">
                          📸 ចុចទីនេះដើម្បីប្ដូររូបវិក្កយបត្រផ្សេង
                        </span>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2">
                        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-200 font-mono">
                            ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពវិក្កយបត្រ (Upload Slip)
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1">
                            គាំទ្របង្កាន់ដៃផ្ទេរប្រាក់គ្រប់ធនាគារ (ACLEDA, ABA, Wing, Bakong, Canadia...)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Automated Verification Results (ប្រព័ន្ធត្រួតពិនិត្យភាពត្រឹមត្រូវ) */}
                  {scannedData && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-slate-300 font-bold flex items-center gap-1.5">
                            <FileCheck2 className="h-4 w-4 text-cyan-400" />
                            ព័ត៌មានស្រង់ចេញពីវិក្កយបត្រ:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                              !isDuplicate
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {!isDuplicate ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>ផ្ទៀងផ្ទាត់ត្រឹមត្រូវ</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                <span>វិក្កយបត្រស្ទួន</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Extraction Details */}
                        <div className="space-y-2 pt-1">
                          {/* 1. Bank Name */}
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 text-slate-500" />
                              ធនាគារ:
                            </span>
                            <span className="font-bold text-white">
                              {scannedData.bank_name}
                            </span>
                          </div>

                          {/* 2. Detected Amount & Currency */}
                          <div className="flex items-center justify-between text-slate-400">
                            <span>ទឹកប្រាក់ក្នុង Slip:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={scannedData.amount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className="w-28 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white font-bold text-sm text-right font-mono"
                              />
                              <span className="font-bold text-cyan-400 text-xs">
                                {scannedData.currency === 'KHR' ? '៛ (KHR)' : '$ (USD)'}
                              </span>
                            </div>
                          </div>

                          {Number(scannedData.amount) <= 0 && (
                            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                              <div>
                                <strong className="text-amber-300">មិនទាន់រកឃើញទឹកប្រាក់លើរូបភាពនេះទេ៖</strong>
                                <span className="block text-slate-300 text-[10px] mt-0.5">
                                  សូមបញ្ចូលចំនួនទឹកប្រាក់ដែលបានផ្ទេរក្នុងប្រអប់ខាងលើ ឬ Upload បង្កាន់ដៃផ្ទេរប្រាក់ (Payment Slip) ដែលធនាគារចេញឱ្យក្រោយពេលផ្ទេររួច។
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Currency Selector Toggle (ផ្ទៀងផ្ទាត់ / ប្ដូររូបិយប័ណ្ណ) */}
                          <div className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[11px] text-slate-300 font-medium">
                              រូបិយប័ណ្ណ (Currency):
                            </span>
                            <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                              <button
                                type="button"
                                onClick={() => handleToggleCurrency('KHR')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  scannedData.currency === 'KHR'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                                }`}
                              >
                                <span>🇰🇭 ៛ (KHR)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleCurrency('USD')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  scannedData.currency === 'USD'
                                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                                }`}
                              >
                                <span>💵 $ (USD)</span>
                              </button>
                            </div>
                          </div>

                          {/* 3. Credits Calculation with Formula */}
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-amber-300 font-bold block">
                                Credits ទទួលបាន (Calculated):
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {scannedData.currency === 'KHR'
                                  ? `អត្រា ៤,០០០ ៛ = ១ Credit (${Number(scannedData.amount).toLocaleString()} ÷ 4,000)`
                                  : `អត្រា $1 USD = ១ Credit`}
                              </span>
                            </div>
                            <span className="text-base font-black text-amber-400">
                              +{scannedData.credits.toFixed(2)} Credits
                            </span>
                          </div>

                          {/* 4. Receiver */}
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              អ្នកទទួល:
                            </span>
                            <span className="font-bold text-cyan-300">
                              {scannedData.receiver_name}
                            </span>
                          </div>

                          {/* 5. Duplicate Ref Check */}
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Hash className="h-3.5 w-3.5 text-slate-500" />
                              លេខយោងប្រតិបត្តិការ (Ref ID):
                            </span>
                            <span className="text-slate-300 font-bold">
                              {scannedData.transaction_id}
                            </span>
                          </div>
                        </div>

                        {isDuplicate && (
                          <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px] font-mono flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                            <span>វិក្កយបត្រនេះធ្លាប់បានបញ្ចូលរួចហើយ មិនអាចប្រើស្ទួនបានទេ!</span>
                          </div>
                        )}
                      </div>

                      {/* Confirm and Credit Action Button */}
                      <button
                        onClick={handleConfirmTopUp}
                        disabled={isSubmitting || isDuplicate}
                        className={`w-full py-3.5 rounded-2xl font-mono font-black text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                          isDuplicate
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-glow-emerald cursor-pointer'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>កំពុងបញ្ចូល Credits ទៅក្នុងគណនី...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            <span>ផ្ទៀងផ្ទាត់ជោគជ័យ! បញ្ចូល +{scannedData.credits.toFixed(2)} Credits ទៅក្នុងគណនី</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Top-up History */}
        {activeTab === 'history' && (
          <div className="p-5 sm:p-6 space-y-3 max-h-96 overflow-y-auto">
            {loadingHistory ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
                <span>កំពុងទាញយកប្រវត្តិ Top-Up...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                <span>មិនទាន់មានប្រវត្តិ Top-up នៅឡើយទេ។</span>
              </div>
            ) : (
              historyList.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {tx.bank_name || 'ACLEDA Bank / KHQR'}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tx.transaction_ref || `ID: #${tx.id}`} • {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-amber-400 font-black text-sm">
                    +{Number(tx.credits_issued || tx.amount).toFixed(2)} Credits
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
