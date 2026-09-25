import { Check, CheckSquare, Copy, CreditCard, ExternalLink, Mail, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { PaymentCheckoutModal } from '../payments/PaymentCheckoutModal';

interface ConfirmationScreenProps {
  result: {
    referenceNumber: string;
    accessToken: string;
    applicationId: string;
    programName: string;
    studentName: string;
    studentEmail: string;
  };
  onViewStatus: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  result,
  onViewStatus,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paidOnline, setPaidOnline] = useState(false);

  const statusUrl = `${window.location.origin}/?tab=status&ref=${result.referenceNumber}&token=${result.accessToken}`;

  useEffect(() => {
    QRCode.toDataURL(statusUrl, {
      width: 220,
      margin: 1.5,
      color: {
        dark: '#f8fafc',
        light: '#ffffff',
      },
    }).then(setQrDataUrl).catch(console.error);
  }, [statusUrl]);

  const copyReference = () => {
    navigator.clipboard.writeText(result.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const copyMagicLink = () => {
    navigator.clipboard.writeText(statusUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-xs text-center p-6 sm:p-10">
        {/* Top Gold Accent Stripe */}
        <div className="w-16 h-1.5 bg-[#8b5cf6] mx-auto mb-6" />

        <div className="w-12 h-12 bg-[#FAF4EA] text-[#B45309] border border-[#E8D4A2] flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-6 h-6 text-[#8b5cf6]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#f8fafc] tracking-tight uppercase">
          Application Successfully Received
        </h1>
        <p className="text-[#665646] text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
          Application dossier for <strong>{result.studentName}</strong> has been logged for{' '}
          <strong>{result.programName}</strong>. Official review is queued.
        </p>

        {/* Reference Number Banner */}
        <div className="mt-6 p-5 bg-[#FAF6EE] border-2 border-[#E5D7BE] max-w-md mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#855D1E]">
            Official Tracking Reference
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#f8fafc] tracking-wider select-all">
              {result.referenceNumber}
            </span>
            <button
              onClick={copyReference}
              className="h-9 px-3 bg-[#0f172a] border border-[#1e293b] text-[#4A3B2C] hover:bg-[#F5EFE6] hover:border-[#334155] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy reference number"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5 text-[#855D1E]" />}
              <span>{copiedRef ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-2">
            Keep this reference code accessible. It is required to track admission progress and submit revisions.
          </p>
        </div>

        {/* QR Code & Magic Link Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-xl mx-auto text-left">
          {/* QR Code Box */}
          <div className="p-4 border border-[#1e293b] bg-[#FBF9F5] flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#382B20] uppercase tracking-wider mb-2">
              <QrCode className="w-4 h-4 text-[#8b5cf6]" />
              <span>Mobile QR Pass</span>
            </div>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Status Link"
                className="w-36 h-36 border border-[#1e293b] p-1 bg-[#0f172a]"
              />
            ) : (
              <div className="w-36 h-36 bg-[#0f172a] animate-pulse" />
            )}
            <p className="text-[11px] text-[#94a3b8] mt-2 leading-tight">
              Scan with phone camera to instantly access and bookmark your application on mobile.
            </p>
          </div>

          {/* Direct Link Box */}
          <div className="p-4 border border-[#1e293b] bg-[#FBF9F5] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#382B20] uppercase tracking-wider mb-2">
                <Mail className="w-4 h-4 text-[#8b5cf6]" />
                <span>Notice Dispatch</span>
              </div>
              <p className="text-xs text-[#5C4D3E] leading-relaxed">
                An acknowledgment notice has been generated for <strong>{result.studentEmail}</strong>.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5D7BE]">
              <button
                onClick={copyMagicLink}
                className="w-full py-2 px-3 bg-[#0f172a] border border-[#1e293b] text-xs font-bold text-[#382B20] hover:bg-[#FAF4EA] hover:border-[#8b5cf6] flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    <span>Copy Direct Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Next Steps List */}
        <div className="mt-6 pt-6 border-t border-[#E5D7BE] max-w-lg mx-auto text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">
            Admissions Processing Timeline
          </h3>
          <div className="space-y-2.5 text-xs text-[#5C4D3E]">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-[#382B20] text-[#FBBF24] font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <span>
                <strong>Document Verification:</strong> Registrar and admissions officers authenticate uploaded certificates.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-[#382B20] text-[#FBBF24] font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <span>
                <strong>Status Update:</strong> You will be notified if document revision is required or upon approval.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-[#382B20] text-[#FBBF24] font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <span>
                <strong>Matriculation:</strong> Approved candidates receive the official student enrollment certificate.
              </span>
            </div>
          </div>
        </div>

        {/* View Status Action */}
        <div className="mt-8">
          <button
            onClick={onViewStatus}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#382B20] text-[#FFFBEB] font-bold text-xs uppercase tracking-wider hover:bg-[#231A12] border border-[#a855f7] shadow-xs transition-all cursor-pointer"
          >
            <span>Proceed to Application Status Portal</span>
            <ExternalLink className="w-4 h-4 text-[#a855f7]" />
          </button>
        </div>
      </div>
    </div>
  );
};
