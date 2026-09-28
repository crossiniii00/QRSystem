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
        dark: '#2E2016',
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
      if (!json.success || !json.data.paymentUrl) {
        throw new Error(json.error?.message || 'Payment initiation failed.');
      }

      // Redirect to real Dragonpay gateway
      window.location.href = json.data.paymentUrl;
      
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please retry.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-2xl max-w-2xl w-full my-auto flex flex-col overflow-hidden">
        {/* Top Gold Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#CA8A04] w-full" />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#2E2016] text-white flex items-center justify-between border-b border-[#4A3525]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#3D2B1E] border border-[#6B4F37] flex items-center justify-center text-[#F59E0B]">
              <Receipt className="w-4 h-4 text-[#F59E0B]" />
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
                <h3 className="text-lg font-black text-[#261F18] uppercase tracking-tight mt-2">
                  Official Electronic Receipt (E-OR)
                </h3>
                <p className="text-xs text-[#665646]">
                  Transaction record registered for <strong>{referenceNumber}</strong>.
                </p>
              </div>

              {/* Receipt Summary Voucher Card */}
              <div className="p-5 bg-[#FAF6EE] border-2 border-[#D8CEBE] max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#7A6A59] uppercase font-bold text-[10px]">Gateway Ref No.</span>
                  <span className="font-mono font-black text-[#261F18]">{completedTx.gatewayRefNo}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#7A6A59] uppercase font-bold text-[10px]">Application Dossier</span>
                  <span className="font-mono font-bold text-[#855D1E]">{completedTx.referenceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#7A6A59] uppercase font-bold text-[10px]">Payment Classification</span>
                  <span className="font-semibold text-[#261F18]">{completedTx.description}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5D7BE] pb-2">
                  <span className="text-[#7A6A59] uppercase font-bold text-[10px]">Payer</span>
                  <span className="text-[#261F18]">{completedTx.payerName} ({completedTx.payerEmail})</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black">
                  <span className="text-[#2E2016] uppercase">Amount Settled</span>
                  <span className="text-[#855D1E] font-mono">₱{completedTx.amount.toLocaleString()}.00 PHP</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#2E2016] hover:bg-[#3D2B1E] text-white border border-[#D97706] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Return to Application Status
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <div className="space-y-6">
              {/* Order Assessment Summary Card */}
              <div className="p-4 bg-[#FAF6EE] border-2 border-[#E5D7BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#855D1E] bg-[#FAF4EA] px-2 py-0.5 border border-[#E5D7BE]">
                    Fee Assessment
                  </span>
                  <h4 className="text-sm font-bold text-[#261F18] mt-1">
                    {isAssessment ? 'Admissions Entrance & Assessment Processing Fee' : 'Official Matriculation & Downpayment Fee'}
                  </h4>
                  <p className="text-xs text-[#7A6A59] mt-0.5">
                    Account: <strong>{applicantName}</strong> · Ref: <span className="font-mono">{referenceNumber}</span>
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-[#D8CEBE] sm:pl-4">
                  <div className="text-xs text-[#7A6A59] uppercase font-bold">Total Due</div>
                  <div className="text-2xl font-black font-mono text-[#855D1E]">₱{amount.toLocaleString()}.00</div>
                  <div className="text-[10px] text-[#A89885] font-mono">PHP (VAT Exempt)</div>
                </div>
              </div>

              <div className="p-4 border border-[#D8CEBE] bg-[#FAF8F5]">
                <h4 className="font-bold text-[#261F18] uppercase text-sm mb-2">PayMongo Secure Checkout</h4>
                <p className="text-xs text-[#665646]">
                  You will be redirected to the secure PayMongo gateway where you can choose to pay via <strong>GCash, Maya, GrabPay, Credit/Debit Card, or InstaPay (QR Ph)</strong>.
                </p>
              </div>

              {/* Payer Information Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Payer Name <span className="text-[#B45309]">*</span>
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] text-xs text-[#261F18] focus:outline-none focus:border-[#D97706]"
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
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] text-xs text-[#261F18] focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EBE3D5]">
                <div className="text-[11px] text-[#7A6A59] text-left">
                  Secured by PayMongo Checkout
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#EBE3D5] border border-[#D8CEBE] text-xs font-bold uppercase text-[#382B20] hover:bg-[#FAF6EE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleProcessPayment}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#17C172] hover:bg-[#139E5C] text-white border border-[#0F804B] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    <span>Proceed to PayMongo (₱{amount.toLocaleString()}.00)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
