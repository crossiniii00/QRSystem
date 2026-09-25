import { AlertCircle, Building2, Check, CheckCircle, CreditCard, DollarSign, Download, ExternalLink, Loader2, QrCode, Receipt, Smartphone, Store, Upload, X } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { PaymentChannel, PaymentTransaction, PaymentType } from '../../modules/payments/domain/payment.entity';

interface PaymentCheckoutModalProps {
  applicationId: string;
  referenceNumber: string;
  accessToken: string;
  applicantName: string;
  applicantEmail: string;
  applicantMobile?: string;
  paymentType: PaymentType;
  defaultAmount?: number;
  onClose: () => void;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  applicationId,
  referenceNumber,
  accessToken,
  applicantName,
  applicantEmail,
  applicantMobile = '',
  paymentType,
  defaultAmount,
  onClose,
  onPaymentSuccess,
}) => {
  const isAssessment = paymentType === 'APPLICATION_ASSESSMENT';
  const amount = defaultAmount || (isAssessment ? 500 : 3500);

  const [channel, setChannel] = useState<PaymentChannel>('GCASH');
  const [payerName, setPayerName] = useState(applicantName);
  const [payerEmail, setPayerEmail] = useState(applicantEmail);
  const [payerMobile, setPayerMobile] = useState(applicantMobile);

  const [depositSlipFile, setDepositSlipFile] = useState<File | null>(null);
  const [depositSlipBase64, setDepositSlipBase64] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [qrPhDataUrl, setQrPhDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR Ph payload for simulated scanning
    const qrString = `00020101021226600016PH.DRAGONPAY.WWW0115DRP-${referenceNumber}520460115303608540${amount}.005802PH5918ST.FRANCIS COLLEGE6007MANILA6304`;
    QRCode.toDataURL(qrString, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#6366f1',
        light: '#FFFFFF',
      },
    })
      .then(setQrPhDataUrl)
      .catch(console.error);
  }, [referenceNumber, amount]);

  const handleDepositFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDepositSlipFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      setDepositSlipBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessPayment = async () => {
    if (!payerName.trim() || !payerEmail.trim()) {
      setError('Please provide payer name and email.');
      return;
    }

    if (channel === 'BANK_TRANSFER_MANUAL' && !depositSlipBase64) {
      setError('Please attach the scanned deposit slip or transaction screenshot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber,
          accessToken,
          paymentType,
          channel,
          amount,
          payerName,
          payerEmail,
          payerMobile,
          depositSlipFilename: depositSlipFile?.name,
          depositSlipData: depositSlipBase64 || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Payment initiation failed.');
      }

      setCompletedTx(json.data);
      onPaymentSuccess(json.data);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-2xl max-w-2xl w-full my-auto flex flex-col overflow-hidden">
        {/* Top Gold Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#CA8A04] w-full" />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#6366f1] text-white flex items-center justify-between border-b border-[#4A3525]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#3D2B1E] border border-[#6B4F37] flex items-center justify-center text-[#a855f7]">
              <Receipt className="w-4 h-4 text-[#a855f7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm uppercase tracking-wide text-[#FAF6EE]">
                  Dragonpay & Multi-Channel Cashier
                </h3>
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase bg-[#453224] text-[#FDE047] border border-[#6B4F37]">
                  Secured
                </span>
              </div>
              <p className="text-[11px] text-[#C9B9A6]">
                St. Francis College Official Fee Collection Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#C9B9A6] hover:text-white hover:bg-[#3D2B1E] border border-transparent hover:border-[#6B4F37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {completedTx ? (
            /* PAYMENT COMPLETED / VOUCHER VIEW */
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-[#F0FDF4] border-2 border-[#86EFAC] text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-8 h-8 text-[#16A34A]" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 border border-[#86EFAC]">
                  {completedTx.status === 'PAID' ? 'Transaction Confirmed' : 'Payment Awaiting Settlement'}
                </span>
                <h3 className="text-lg font-black text-[#f8fafc] uppercase tracking-tight mt-2">
                  Official Electronic Receipt (E-OR)
                </h3>
                <p className="text-xs text-[#665646]">
                  Transaction record registered for <strong>{referenceNumber}</strong>.
                </p>
              </div>

              {/* Receipt Summary Voucher Card */}
              <div className="p-5 bg-[#FAF6EE] border-2 border-[#1e293b] max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#94a3b8] uppercase font-bold text-[10px]">Gateway Ref No.</span>
                  <span className="font-mono font-black text-[#f8fafc]">{completedTx.gatewayRefNo}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#94a3b8] uppercase font-bold text-[10px]">Application Dossier</span>
                  <span className="font-mono font-bold text-[#855D1E]">{completedTx.referenceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#94a3b8] uppercase font-bold text-[10px]">Payment Classification</span>
                  <span className="font-semibold text-[#f8fafc]">{completedTx.description}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#94a3b8] uppercase font-bold text-[10px]">Payment Channel</span>
                  <span className="font-bold text-[#6366f1] uppercase">{completedTx.channel.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#94a3b8] uppercase font-bold text-[10px]">Payer</span>
                  <span className="text-[#f8fafc]">{completedTx.payerName} ({completedTx.payerEmail})</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black">
                  <span className="text-[#6366f1] uppercase">Amount Settled</span>
                  <span className="text-[#855D1E] font-mono">₱{completedTx.amount.toLocaleString()}.00 PHP</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#3D2B1E] text-white border border-[#8b5cf6] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Return to Application Status
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <>
              {/* Order Assessment Summary Card */}
              <div className="p-4 bg-[#FAF6EE] border-2 border-[#E5D7BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#855D1E] bg-[#FAF4EA] px-2 py-0.5 border border-[#E5D7BE]">
                    Fee Assessment
                  </span>
                  <h4 className="text-sm font-bold text-[#f8fafc] mt-1">
                    {isAssessment ? 'Admissions Entrance & Assessment Processing Fee' : 'Official Matriculation & Downpayment Fee'}
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Account: <strong>{applicantName}</strong> · Ref: <span className="font-mono">{referenceNumber}</span>
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-[#1e293b] sm:pl-4">
                  <div className="text-xs text-[#94a3b8] uppercase font-bold">Total Due</div>
                  <div className="text-2xl font-black font-mono text-[#855D1E]">₱{amount.toLocaleString()}.00</div>
                  <div className="text-[10px] text-[#A89885] font-mono">PHP (VAT Exempt)</div>
                </div>
              </div>

              {/* Step 1: Channel Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-2">
                  Select Payment Option (Dragonpay Verified)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* GCash */}
                  <div
                    onClick={() => setChannel('GCASH')}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      channel === 'GCASH'
                        ? 'border-[#8b5cf6] bg-[#0f172a] shadow-xs'
                        : 'border-[#1e293b] bg-[#0f172a] hover:border-[#334155] hover:bg-[#020617]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#007DFE] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] uppercase">GCash / QR Ph</div>
                      <div className="text-[10px] text-[#94a3b8]">Instant mobile e-wallet</div>
                    </div>
                  </div>

                  {/* Maya */}
                  <div
                    onClick={() => setChannel('MAYA')}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      channel === 'MAYA'
                        ? 'border-[#8b5cf6] bg-[#0f172a] shadow-xs'
                        : 'border-[#1e293b] bg-[#0f172a] hover:border-[#334155] hover:bg-[#020617]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#00D632] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] uppercase">Maya Wallet</div>
                      <div className="text-[10px] text-[#94a3b8]">Instant mobile e-wallet</div>
                    </div>
                  </div>

                  {/* Online Banking */}
                  <div
                    onClick={() => setChannel('DRAGONPAY_ONLINE_BANKING')}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      channel === 'DRAGONPAY_ONLINE_BANKING'
                        ? 'border-[#8b5cf6] bg-[#0f172a] shadow-xs'
                        : 'border-[#1e293b] bg-[#0f172a] hover:border-[#334155] hover:bg-[#020617]'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#B45309] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] uppercase">Online Banking</div>
                      <div className="text-[10px] text-[#94a3b8]">BDO, BPI, UnionBank, Metrobank</div>
                    </div>
                  </div>

                  {/* 7-Eleven OTC */}
                  <div
                    onClick={() => setChannel('DRAGONPAY_7ELEVEN')}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      channel === 'DRAGONPAY_7ELEVEN'
                        ? 'border-[#8b5cf6] bg-[#0f172a] shadow-xs'
                        : 'border-[#1e293b] bg-[#0f172a] hover:border-[#334155] hover:bg-[#020617]'
                    }`}
                  >
                    <Store className="w-5 h-5 text-[#EA580C] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] uppercase">7-Eleven CLiQQ</div>
                      <div className="text-[10px] text-[#94a3b8]">Cash payment barcode</div>
                    </div>
                  </div>

                  {/* Over the Counter Bayad / Cebuana */}
                  <div
                    onClick={() => setChannel('DRAGONPAY_OTC_NON_BANK')}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      channel === 'DRAGONPAY_OTC_NON_BANK'
                        ? 'border-[#8b5cf6] bg-[#0f172a] shadow-xs'
                        : 'border-[#1e293b] bg-[#0f172a] hover:border-[#334155] hover:bg-[#020617]'
                    }`}
                  >
                    <Store className="w-5 h-5 text-[#CA8A04] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] uppercase">Bayad / Cebuana</div>
                      <div className="text-[10px] text-[#94a3b8]">MLhuillier, SM Bills</div>
                    </div>
                  </div>

                  {/* Bank Deposit Slip Upload */}
                  <div
                    onClick={() => setChannel('BANK_TRANSFER_MANUAL')}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      channel === 'BANK_TRANSFER_MANUAL'
                        ? 'border-[#8b5cf6] bg-[#0f172a] shadow-xs'
                        : 'border-[#1e293b] bg-[#0f172a] hover:border-[#334155] hover:bg-[#020617]'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-[#855D1E] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] uppercase">Bank Slip Upload</div>
                      <div className="text-[10px] text-[#94a3b8]">Teller deposit / wire receipt</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Instructions per Channel */}
              <div className="p-4 border border-[#1e293b] bg-[#020617] space-y-3">
                {(channel === 'GCASH' || channel === 'MAYA') && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                    {qrPhDataUrl && (
                      <div className="p-2 border border-[#1e293b] bg-[#0f172a] shrink-0">
                        <img src={qrPhDataUrl} alt="QR Ph" className="w-32 h-32" />
                        <div className="text-[10px] font-mono font-bold text-center text-[#855D1E] mt-1">QR Ph Verified</div>
                      </div>
                    )}
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-[#f8fafc] uppercase">Instant E-Wallet Checkout</h4>
                      <p className="text-[#665646]">
                        Scan the National Standard <strong>QR Ph code</strong> with your {channel} application, or click the simulated instant settlement button below.
                      </p>
                      <p className="text-[11px] text-[#64748b] font-mono">
                        Merchant: St. Francis College Admissions · Fee: ₱{amount}.00
                      </p>
                    </div>
                  </div>
                )}

                {channel === 'DRAGONPAY_ONLINE_BANKING' && (
                  <div className="text-xs space-y-1.5 text-left text-[#5C4D3E]">
                    <h4 className="font-bold text-[#f8fafc] uppercase">Online Banking Instructions</h4>
                    <p>Dragonpay supports direct debit with BDO, BPI Express Online, Metrobank Direct, UnionBank, RCBC, and Landbank.</p>
                    <p className="font-mono text-[11px] bg-[#0f172a] p-2 border border-[#1e293b]">
                      School Biller Name: <strong>ST. FRANCIS COLLEGE ADMISSIONS</strong><br />
                      Reference Code: <strong>{referenceNumber}</strong>
                    </p>
                  </div>
                )}

                {channel === 'DRAGONPAY_7ELEVEN' && (
                  <div className="text-xs space-y-1.5 text-left text-[#5C4D3E]">
                    <h4 className="font-bold text-[#f8fafc] uppercase">7-Eleven CLiQQ Machine / App</h4>
                    <p>1. Go to any 7-Eleven CLiQQ kiosk or open your CLiQQ app.</p>
                    <p>2. Select Bills Payment → Dragonpay → Enter your student reference: <strong>{referenceNumber}</strong>.</p>
                    <p>3. Present barcode slip to cashier and settle exactly <strong>₱{amount}.00</strong>.</p>
                  </div>
                )}

                {channel === 'DRAGONPAY_OTC_NON_BANK' && (
                  <div className="text-xs space-y-1.5 text-left text-[#5C4D3E]">
                    <h4 className="font-bold text-[#f8fafc] uppercase">Over-the-Counter Remittance & Bills Centers</h4>
                    <p>Settle payment at any Bayad Center, Cebuana Lhuillier, M Lhuillier, SM Department Store Bills Counter, or Robinsons Department Store.</p>
                    <p className="font-mono text-[11px] bg-[#0f172a] p-2 border border-[#1e293b]">
                      Partner: DRAGONPAY / ST. FRANCIS COLLEGE · Ref: <strong>{referenceNumber}</strong>
                    </p>
                  </div>
                )}

                {channel === 'BANK_TRANSFER_MANUAL' && (
                  <div className="text-xs space-y-3 text-left">
                    <div className="p-3 bg-[#0f172a] border border-[#1e293b] space-y-1 text-[#5C4D3E]">
                      <h4 className="font-bold text-[#f8fafc] uppercase">Institutional Depository Account</h4>
                      <p><strong>Bank:</strong> Bank of the Philippine Islands (BPI)</p>
                      <p><strong>Account Name:</strong> St. Francis College Inc.</p>
                      <p><strong>Account Number:</strong> 0042-8921-55</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                        Attach Proof of Deposit (JPG, PNG, or PDF) <span className="text-[#B45309]">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleDepositFileChange}
                        className="text-xs text-[#f8fafc] border border-[#1e293b] p-2 w-full bg-[#0f172a] cursor-pointer"
                      />
                      {depositSlipFile && (
                        <p className="text-[11px] text-[#166534] font-bold mt-1">
                          ✓ File selected: {depositSlipFile.name} ({(depositSlipFile.size / 1024).toFixed(0)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payer Information Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Payer Name <span className="text-[#B45309]">*</span>
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Receipt Email <span className="text-[#B45309]">*</span>
                  </label>
                  <input
                    type="email"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Contact Mobile
                  </label>
                  <input
                    type="tel"
                    value={payerMobile}
                    onChange={(e) => setPayerMobile(e.target.value)}
                    placeholder="+63 917 000 0000"
                    className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#0f172a]">
                <div className="text-[11px] text-[#94a3b8] text-left">
                  Secured by 256-bit encryption · Dragonpay Partner Institution
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#0f172a] border border-[#1e293b] text-xs font-bold uppercase text-[#382B20] hover:bg-[#FAF6EE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleProcessPayment}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#6366f1] hover:bg-[#3D2B1E] text-white border border-[#8b5cf6] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#a855f7]" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-[#a855f7]" />
                    )}
                    <span>Authorize ₱{amount.toLocaleString()}.00</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
