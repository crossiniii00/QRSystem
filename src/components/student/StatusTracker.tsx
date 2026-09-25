import { AlertCircle, AlertTriangle, CheckCircle, Clock, CreditCard, ExternalLink, FileText, Loader2, Receipt, RefreshCw, Search, ShieldCheck, Upload, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ApplicationStatusView } from '../../modules/applications/application/track-application-status.use-case';
import { ApplicationStatus } from '../../modules/applications/domain/application-status.enum';
import { PaymentTransaction, PaymentType } from '../../modules/payments/domain/payment.entity';
import { PaymentCheckoutModal } from '../payments/PaymentCheckoutModal';
import { StatusBadge } from '../common/Badge';

interface StatusTrackerProps {
  initialReference?: string;
  initialToken?: string;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  initialReference = '',
  initialToken = '',
}) => {
  const [reference, setReference] = useState(initialReference);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [reuploading, setReuploading] = useState<string | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<ApplicationStatusView | null>(null);

  // Payment states
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activePaymentType, setActivePaymentType] = useState<PaymentType>('APPLICATION_ASSESSMENT');

  const fetchPayments = async (refNum = reference, tok = token) => {
    try {
      const res = await fetch(`/api/payments/application?reference=${encodeURIComponent(refNum.trim())}&token=${encodeURIComponent(tok.trim())}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments', err);
    }
  };

  const fetchStatus = async (refNum = reference, tok = token) => {
    if (!refNum.trim() || !tok.trim()) {
      setError('Please provide both the Application Reference Number and your Access Token.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch(
        `/api/applications/status?reference=${encodeURIComponent(refNum.trim())}&token=${encodeURIComponent(tok.trim())}`
      );
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Could not locate application record.');
      }
      setStatusData(json.data);
      await fetchPayments(refNum, tok);
    } catch (err: any) {
      console.error('Status fetch error', err);
      setError(err.message || 'Failed to retrieve application status. Please check your credentials.');
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference && initialToken) {
      fetchStatus(initialReference, initialToken);
    }
  }, [initialReference, initialToken]);

  // Handle re-upload of rejected document
  const handleReupload = async (requirementId: string, file: File) => {
    if (!statusData) return;
    setReuploading(requirementId);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch(`/api/applications/${statusData.application.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: token,
            requirementId,
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileData: base64,
          }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message || 'Failed to upload revised document.');
        }

        setSuccessNotice(`Revised document "${file.name}" uploaded successfully.`);
        fetchStatus(reference, token);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to re-upload document.');
    } finally {
      setReuploading(null);
    }
  };

  // Re-submit application after revising documents
  const handleResubmit = async () => {
    if (!statusData) return;
    setResubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${statusData.application.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token,
          applicantNotes: 'Re-uploaded required revisions.',
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to resubmit application.');
      }
      setSuccessNotice('Application re-submitted for review! Admissions officers have been notified.');
      fetchStatus(reference, token);
    } catch (err: any) {
      setError(err.message || 'Failed to resubmit application.');
    } finally {
      setResubmitting(false);
    }
  };

  const hasPaidAssessment = transactions.some((t) => t.paymentType === 'APPLICATION_ASSESSMENT' && (t.status === 'PAID' || t.status === 'VERIFIED'));
  const hasPaidMatriculation = transactions.some((t) => t.paymentType === 'MATRICULATION_DEPOSIT' && (t.status === 'PAID' || t.status === 'VERIFIED'));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Lookup Header */}
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-6 text-center mb-6 shadow-xs">
        <div className="w-12 h-1 bg-[#D97706] mx-auto mb-3" />
        <h1 className="text-xl sm:text-2xl font-black text-[#261F18] uppercase tracking-tight">
          Admissions Status Portal
        </h1>
        <p className="text-[#665646] text-xs sm:text-sm max-w-lg mx-auto mt-1 leading-relaxed">
          Query the institutional registrar ledger using your official Reference Number and authentication token.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStatus();
          }}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. ENR-2026-000101"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] font-mono focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
              Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your 64-character token"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] font-mono focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 px-4 bg-[#382B20] text-[#FFFBEB] hover:bg-[#231A12] border border-[#F59E0B] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" /> : <Search className="w-4 h-4 text-[#F59E0B]" />}
              <span>Query Status</span>
            </button>
          </div>
        </form>

        {/* Demo Quick Fills for Evaluation */}
        <div className="mt-4 pt-3 border-t border-[#EBE3D5] flex flex-wrap items-center gap-2 text-xs text-[#7A6A59]">
          <span className="font-bold text-[#382B20] uppercase text-[11px]">Evaluation Presets:</span>
          <button
            type="button"
            onClick={() => {
              setReference('ENR-2026-000101');
              setToken('sample-demo-token-applicant-001');
              fetchStatus('ENR-2026-000101', 'sample-demo-token-applicant-001');
            }}
            className="px-2.5 py-1 bg-[#FAF6EE] border border-[#D8CEBE] hover:border-[#D97706] hover:bg-[#F0E8DC] text-[#4A3B2C] text-[11px] font-mono transition-colors cursor-pointer"
          >
            ENR-2026-000101 (Under Review)
          </button>
          <button
            type="button"
            onClick={() => {
              setReference('ENR-2026-000102');
              setToken('sample-demo-token-applicant-002');
              fetchStatus('ENR-2026-000102', 'sample-demo-token-applicant-002');
            }}
            className="px-2.5 py-1 bg-[#FAF6EE] border border-[#D8CEBE] hover:border-[#D97706] hover:bg-[#F0E8DC] text-[#4A3B2C] text-[11px] font-mono transition-colors cursor-pointer"
          >
            ENR-2026-000102 (Needs Revision)
          </button>
          <button
            type="button"
            onClick={() => {
              setReference('ENR-2026-000103');
              setToken('sample-demo-token-applicant-003');
              fetchStatus('ENR-2026-000103', 'sample-demo-token-applicant-003');
            }}
            className="px-2.5 py-1 bg-[#FAF6EE] border border-[#D8CEBE] hover:border-[#D97706] hover:bg-[#F0E8DC] text-[#4A3B2C] text-[11px] font-mono transition-colors cursor-pointer"
          >
            ENR-2026-000103 (Approved)
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="mb-6 p-4 bg-[#F0FDF4] border-l-4 border-[#16A34A] text-[#166534] text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Application Status Details View */}
      {statusData && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D5] pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#261F18] tracking-wider">
                    {statusData.application.referenceNumber}
                  </span>
                  <StatusBadge status={statusData.application.status} size="lg" />
                </div>
                <h2 className="text-base font-bold text-[#382B20] mt-1">
                  {statusData.applicant.firstName} {statusData.applicant.lastName}
                </h2>
                <p className="text-xs text-[#7A6A59]">
                  Program: <strong>{statusData.program.name}</strong> · Academic Year {statusData.application.academicYear}
                </p>
              </div>

              <button
                onClick={() => fetchStatus()}
                className="self-start sm:self-auto px-3 py-2 bg-[#EBE3D5] border border-[#D8CEBE] text-[#382B20] hover:bg-[#FAF6EE] hover:border-[#D97706] transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Status Explanation Banner */}
            <div className="mt-5 space-y-4">
              {statusData.application.status === ApplicationStatus.SUBMITTED && (
                <div className="p-4 bg-[#FAF6EE] border-l-4 border-[#D97706] text-[#713F12] text-xs flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider">Application Successfully Received</h4>
                    <p className="mt-0.5 leading-relaxed">
                      Your application has been received and is queued for registrar credential audit. You will receive an official notification when evaluation commences.
                    </p>
                  </div>
                </div>
              )}

              {statusData.application.status === ApplicationStatus.UNDER_REVIEW && (
                <div className="p-4 bg-[#FAF4EA] border-l-4 border-[#B45309] text-[#78350F] text-xs flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider">Active Admissions Review In Progress</h4>
                    <p className="mt-0.5 leading-relaxed">
                      The admissions committee is actively evaluating your academic credentials, identity certificates, and transcript eligibility.
                    </p>
                  </div>
                </div>
              )}

              {statusData.application.status === ApplicationStatus.NEEDS_REVISION && (
                <div className="p-5 bg-[#FEF9C3] border-l-4 border-[#D97706] text-[#713F12] text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-[#854D0E]">
                        Credential Revision Required
                      </h4>
                      <p className="mt-1 font-medium bg-[#EBE3D5] p-3 border border-[#FDE047] text-[#713F12] leading-relaxed">
                        {statusData.application.revisionNotes ||
                          'Please review the document checklist below and re-upload the flagged files.'}
                      </p>
                    </div>
                  </div>

                  {/* Re-submit action button */}
                  <div className="flex justify-end pt-2 border-t border-[#FDE047]">
                    <button
                      onClick={handleResubmit}
                      disabled={resubmitting}
                      className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {resubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>Commit Revised Application for Review</span>
                    </button>
                  </div>
                </div>
              )}

              {statusData.application.status === ApplicationStatus.APPROVED && (
                <div className="p-5 bg-[#F0FDF4] border-l-4 border-[#16A34A] text-[#14532D] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-[#166534]">
                        Congratulations! Application Approved
                      </h4>
                      <p className="mt-1 text-[#15803D] leading-relaxed">
                        Your application for admission to <strong>{statusData.program.name}</strong> has been officially approved. Settle the matriculation deposit to reserve your slot and generate your official Certificate of Matriculation.
                      </p>
                    </div>
                  </div>

                  {!hasPaidMatriculation && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePaymentType('MATRICULATION_DEPOSIT');
                        setShowCheckout(true);
                      }}
                      className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs uppercase tracking-wider border border-[#86EFAC] shadow-xs flex items-center gap-2 shrink-0 cursor-pointer transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Settle Matriculation (₱3,500)</span>
                    </button>
                  )}
                </div>
              )}

              {statusData.application.status === ApplicationStatus.REJECTED && (
                <div className="p-4 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] text-xs flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-[#991B1B]">Application Decision Notice</h4>
                    <p className="mt-1 leading-relaxed">
                      We regret to inform you that we are unable to accept your application for this admissions cycle. Reason:{' '}
                      <strong>{statusData.application.rejectionReason || 'Institutional intake criteria not satisfied.'}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dragonpay & Fee Collection Station */}
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3D5] pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#D97706]" />
                  <h3 className="text-xs font-bold text-[#261F18] uppercase tracking-wider">
                    Dragonpay & Tuition Cashier Ledger
                  </h3>
                </div>
                <p className="text-xs text-[#7A6A59] mt-0.5">
                  Track admissions assessment fees, matriculation deposits, and official electronic receipts (OR).
                </p>
              </div>

              {!hasPaidAssessment && (
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentType('APPLICATION_ASSESSMENT');
                    setShowCheckout(true);
                  }}
                  className="px-4 py-2 bg-[#2E2016] hover:bg-[#3D2B1E] text-[#FFFBEB] border border-[#F59E0B] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Pay Assessment Fee (₱500)</span>
                </button>
              )}
            </div>

            {/* Transactions Table or Empty Notice */}
            {transactions.length === 0 ? (
              <div className="p-4 bg-[#FAF8F5] border border-[#D8CEBE] text-center text-xs text-[#7A6A59] space-y-2">
                <p>No fee transactions logged yet for this application.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentType('APPLICATION_ASSESSMENT');
                    setShowCheckout(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBE3D5] border border-[#D8CEBE] text-[#382B20] hover:bg-[#FAF6EE] font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Open Dragonpay Cashier Portal (₱500)</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#D8CEBE]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] border-b border-[#D8CEBE] text-[#523F2D] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Date</th>
                      <th className="px-3.5 py-2.5">Gateway Ref</th>
                      <th className="px-3.5 py-2.5">Description</th>
                      <th className="px-3.5 py-2.5">Channel</th>
                      <th className="px-3.5 py-2.5">Amount</th>
                      <th className="px-3.5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3D5]">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAF8F5]">
                        <td className="px-3.5 py-2.5 font-mono text-[#7A6A59]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#261F18]">
                          {tx.gatewayRefNo}
                        </td>
                        <td className="px-3.5 py-2.5 text-[#382B20] font-medium">
                          {tx.description}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono uppercase text-[11px] text-[#7A6A59]">
                          {tx.channel.replace(/_/g, ' ')}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#855D1E]">
                          ₱{tx.amount.toLocaleString()}.00
                        </td>
                        <td className="px-3.5 py-2.5">
                          {tx.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F0FDF4] text-[#166534] border border-[#86EFAC] text-[10px] font-bold font-mono uppercase">
                              <CheckCircle className="w-3 h-3 text-[#16A34A]" /> Verified
                            </span>
                          ) : tx.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-bold font-mono uppercase">
                              <Clock className="w-3 h-3" /> Paid / Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] text-[10px] font-bold font-mono uppercase">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Document Verification Checklist */}
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6">
            <div className="border-b border-[#EBE3D5] pb-3 mb-4">
              <h3 className="text-xs font-bold text-[#261F18] uppercase tracking-wider">
                Document Requirement Verification Station
              </h3>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Authenticity status for all submitted certificates and credentials.
              </p>
            </div>

            <div className="divide-y divide-[#EBE3D5]">
              {statusData.requirements.map(({ requirement, uploadedDocument }) => {
                const isRejected = uploadedDocument?.verificationStatus === 'REJECTED';
                const isVerified = uploadedDocument?.verificationStatus === 'VERIFIED';
                const isPending = uploadedDocument?.verificationStatus === 'PENDING';

                return (
                  <div key={requirement.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#261F18] text-sm">{requirement.title}</h4>
                          {requirement.isMandatory ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE] uppercase">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5EFE6] text-[#7A6A59] border border-[#D8CEBE] uppercase">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#665646] mt-0.5">{requirement.description}</p>
                      </div>

                      {/* Verification Status Badge */}
                      <div className="flex items-center gap-3">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#86EFAC]">
                            <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
                            Verified
                          </span>
                        )}

                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#FAF6EE] text-[#855D1E] border border-[#E5D7BE]">
                            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                            Pending Review
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]">
                            <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                            Needs Revision
                          </span>
                        )}

                        {!uploadedDocument && (
                          <span className="text-xs text-[#A89885] font-mono uppercase">Not Attached</span>
                        )}
                      </div>
                    </div>

                    {/* Rejection Details & Re-upload Input */}
                    {isRejected && (
                      <div className="mt-3 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-xs space-y-2">
                        <p className="text-[#991B1B]">
                          <strong>Admissions Officer Feedback:</strong> {uploadedDocument.rejectionReason}
                        </p>

                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBE3D5] border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEE2E2] font-bold text-xs uppercase tracking-wider transition-colors shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-[#DC2626]" />
                            <span>Upload Replacement File</span>
                            <input
                              type="file"
                              accept={requirement.allowedMimeTypes.join(',')}
                              className="hidden"
                              disabled={reuploading === requirement.id}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReupload(requirement.id, file);
                              }}
                            />
                          </label>
                          {reuploading === requirement.id && (
                            <span className="text-[#991B1B] flex items-center gap-1 font-bold text-xs uppercase">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Replacement...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview document file if available */}
                    {uploadedDocument?.signedUrl && (
                      <div className="mt-2">
                        <a
                          href={uploadedDocument.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#855D1E] hover:text-[#523F2D] font-bold uppercase tracking-wider"
                        >
                          <FileText className="w-3 h-3 text-[#D97706]" />
                          <span>Inspect Attached File ({uploadedDocument.originalFilename})</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dragonpay Checkout Modal Drawer */}
      {showCheckout && statusData && (
        <PaymentCheckoutModal
          applicationId={statusData.application.id}
          referenceNumber={statusData.application.referenceNumber}
          accessToken={token}
          applicantName={`${statusData.applicant.firstName} ${statusData.applicant.lastName}`}
          applicantEmail={statusData.applicant.email}
          applicantMobile={statusData.applicant.mobileNumber}
          paymentType={activePaymentType}
          defaultAmount={activePaymentType === 'APPLICATION_ASSESSMENT' ? 500 : 3500}
          onClose={() => setShowCheckout(false)}
          onPaymentSuccess={(tx) => {
            fetchPayments(reference, token);
          }}
        />
      )}
    </div>
  );
};
