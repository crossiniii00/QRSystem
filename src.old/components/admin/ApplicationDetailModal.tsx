import { AlertCircle, AlertTriangle, Check, CheckCircle, Clock, CreditCard, ExternalLink, Eye, FileText, History, Loader2, Receipt, ShieldCheck, UserCheck, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AdminApplicationDetailView } from '../../modules/applications/application/get-application-details.use-case';
import { ApplicationStatus } from '../../modules/applications/domain/application-status.enum';
import { PaymentTransaction } from '../../modules/payments/domain/payment.entity';
import { StatusBadge } from '../common/Badge';

interface ApplicationDetailModalProps {
  applicationId: string;
  adminToken: string;
  adminRole: string;
  onClose: () => void;
  onStatusChanged: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  adminToken,
  adminRole,
  onClose,
  onStatusChanged,
}) => {
  const [details, setDetails] = useState<AdminApplicationDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'payments' | 'audit'>('documents');
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  // Rejection modal prompt
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');

  // Status transition prompt
  const [transitionPrompt, setTransitionPrompt] = useState<{
    targetStatus: ApplicationStatus;
    title: string;
    requiresNotes: boolean;
    notesLabel: string;
  } | null>(null);
  const [transitionNotes, setTransitionNotes] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to load application details.');
      setDetails(json.data);

      // Also fetch payments for this application
      if (json.data?.application?.referenceNumber) {
        const payRes = await fetch(`/api/payments/application?reference=${json.data.application.referenceNumber}`);
        const payJson = await payRes.json();
        if (payJson.success) {
          setPayments(payJson.data.transactions || []);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [applicationId]);

  // Handle document verification
  const handleVerifyDocument = async (documentId: string, action: 'VERIFY' | 'REJECT', reason?: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/documents/${documentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action, reason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Verification action failed.');
      setRejectingDocId(null);
      setDocRejectionReason('');
      await loadDetails();
      onStatusChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle application state transition
  const handleExecuteTransition = async () => {
    if (!transitionPrompt) return;
    setActionLoading(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        targetStatus: transitionPrompt.targetStatus,
      };
      if (transitionPrompt.targetStatus === ApplicationStatus.NEEDS_REVISION) {
        payload.notes = transitionNotes;
      } else if (transitionPrompt.targetStatus === ApplicationStatus.REJECTED) {
        payload.rejectionReason = transitionNotes;
      }

      const res = await fetch(`/api/admin/applications/${applicationId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to update application status.');

      setTransitionPrompt(null);
      setTransitionNotes('');
      await loadDetails();
      onStatusChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Gold Accent Stripe */}
        <div className="h-1 bg-[#8b5cf6] w-full" />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#f8fafc] text-base sm:text-lg tracking-wider">
                  {details?.application.referenceNumber || 'Loading Dossier...'}
                </span>
                {details && <StatusBadge status={details.application.status} />}
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {details?.applicant.firstName} {details?.applicant.lastName} · {details?.program.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#f8fafc] hover:bg-[#0f172a] border border-transparent hover:border-[#1e293b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Navigation Tabs */}
        <div className="px-6 bg-[#0f172a] border-b border-[#1e293b] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'documents'
                ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
                : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#8b5cf6]" />
            <span>Document Verification</span>
            {details && (
              <span className="ml-1 px-1.5 py-0.2 font-mono text-[10px] bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
                {details.requirements.filter((r) => r.uploadedDocument).length}/{details.requirements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
                : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#8b5cf6]" />
            <span>Applicant Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
                : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#8b5cf6]" />
            <span>Dragonpay Fees</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
                : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <History className="w-4 h-4 text-[#8b5cf6]" />
            <span>Audit Timeline</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-[#64748b] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#8b5cf6]" />
              <span className="text-xs uppercase font-bold">Retrieving complete application ledger...</span>
            </div>
          ) : details ? (
            <>
              {/* TAB 1: Document Verification Station */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#0f172a] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#382B20]">
                      Required Credentials Verification Station
                    </h3>
                    <span className="text-xs text-[#94a3b8]">Audit and certify uploaded records</span>
                  </div>

                  <div className="space-y-3">
                    {details.requirements.map(({ requirement, uploadedDocument }) => {
                      const isVerified = uploadedDocument?.verificationStatus === 'VERIFIED';
                      const isRejected = uploadedDocument?.verificationStatus === 'REJECTED';

                      return (
                        <div
                          key={requirement.id}
                          className="p-4 border border-[#1e293b] bg-[#020617] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[#f8fafc] text-sm">{requirement.title}</h4>
                              {requirement.isMandatory && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE] uppercase">
                                  Required
                                </span>
                              )}
                            </div>

                            {uploadedDocument ? (
                              <div className="flex items-center gap-3 text-xs text-[#665646]">
                                <span className="font-bold text-[#f8fafc]">{uploadedDocument.originalFilename}</span>
                                <span className="font-mono">({(uploadedDocument.fileSizeBytes / 1024).toFixed(0)} KB)</span>
                                {uploadedDocument.signedUrl && (
                                  <a
                                    href={uploadedDocument.signedUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[#855D1E] hover:text-[#523F2D] font-bold uppercase tracking-wider"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#8b5cf6]" />
                                    <span>Inspect Document</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-[#855D1E] font-medium uppercase">Document not yet attached by student.</p>
                            )}

                            {isRejected && uploadedDocument?.rejectionReason && (
                              <p className="text-xs text-[#991B1B] font-medium mt-1">
                                Rejection Notice: {uploadedDocument.rejectionReason}
                              </p>
                            )}
                          </div>

                          {/* Verification Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isVerified && (
                              <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#166534] border border-[#86EFAC] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" /> Verified
                              </span>
                            )}

                            {uploadedDocument && !isVerified && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleVerifyDocument(uploadedDocument.id, 'VERIFY')}
                                  className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold uppercase tracking-wider border border-[#86EFAC] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => {
                                    setRejectingDocId(uploadedDocument.id);
                                    setDocRejectionReason('');
                                  }}
                                  className="px-3 py-1.5 bg-[#0f172a] border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEF2F2] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Flag Rejection</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reject Document Reason Input Prompt */}
                  {rejectingDocId && (
                    <div className="p-4 bg-[#FEF2F2] border-2 border-[#FCA5A5] mt-4 space-y-3">
                      <h4 className="text-xs font-bold text-[#991B1B] uppercase tracking-wider">
                        Specify Formal Rationale for Credential Rejection
                      </h4>
                      <textarea
                        rows={2}
                        value={docRejectionReason}
                        onChange={(e) => setDocRejectionReason(e.target.value)}
                        placeholder="e.g. Scanned document is obscured, seal unreadable, or transcript lacks registrar signature."
                        className="w-full p-2.5 bg-[#0f172a] border border-[#FCA5A5] text-xs text-[#f8fafc] focus:outline-none focus:border-[#DC2626]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingDocId(null)}
                          className="px-3 py-1.5 bg-[#0f172a] border border-[#1e293b] text-xs font-bold uppercase text-[#382B20] hover:bg-[#FAF6EE]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading || !docRejectionReason.trim()}
                          onClick={() => handleVerifyDocument(rejectingDocId, 'REJECT', docRejectionReason)}
                          className="px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Applicant Profile Dossier */}
              {activeTab === 'profile' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-[#1e293b] bg-[#020617] space-y-2">
                      <h4 className="font-bold text-[#f8fafc] text-xs uppercase tracking-wider border-b border-[#E5D7BE] pb-2">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Full Name:</span>
                        <span className="col-span-2 font-bold text-[#f8fafc]">
                          {details.applicant.firstName} {details.applicant.middleName} {details.applicant.lastName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Date of Birth:</span>
                        <span className="col-span-2 text-[#f8fafc] font-mono">{details.applicant.dateOfBirth}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Sex / Civil:</span>
                        <span className="col-span-2 text-[#f8fafc]">{details.applicant.sex} ({details.applicant.civilStatus || 'Single'})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Email:</span>
                        <span className="col-span-2 font-mono text-[#f8fafc]">{details.applicant.email}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Phone:</span>
                        <span className="col-span-2 font-mono text-[#f8fafc]">{details.applicant.mobileNumber}</span>
                      </div>
                    </div>

                    <div className="p-4 border border-[#1e293b] bg-[#020617] space-y-2">
                      <h4 className="font-bold text-[#f8fafc] text-xs uppercase tracking-wider border-b border-[#E5D7BE] pb-2">
                        Academic Classification
                      </h4>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Program:</span>
                        <span className="col-span-2 font-bold text-[#855D1E]">{details.program.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Type:</span>
                        <span className="col-span-2 font-semibold text-[#f8fafc]">{details.application.applicantType}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Term:</span>
                        <span className="col-span-2 text-[#f8fafc]">AY {details.application.academicYear} ({details.application.semesterTerm})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Previous:</span>
                        <span className="col-span-2 text-[#f8fafc]">{details.application.previousSchool || 'N/A'} {details.application.previousGpa && `(GPA: ${details.application.previousGpa})`}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-[#94a3b8]">Campaign:</span>
                        <span className="col-span-2 font-mono text-[#855D1E]">{details.application.qrCampaignId || 'Direct Organic'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Dragonpay Fees */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#0f172a] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#382B20]">
                      Dragonpay & Tuition Fee Records
                    </h3>
                    <span className="text-xs text-[#94a3b8]">{payments.length} transactions on file</span>
                  </div>

                  {payments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#64748b] bg-[#020617] border border-[#1e293b]">
                      No fee payments recorded yet for this student.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((p) => (
                        <div key={p.id} className="p-4 border border-[#1e293b] bg-[#020617] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-[#f8fafc]">{p.gatewayRefNo}</span>
                              <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
                                {p.channel.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="font-semibold text-[#f8fafc] mt-1">{p.description}</p>
                            <p className="text-[11px] text-[#94a3b8]">Payer: {p.payerName} ({p.payerEmail})</p>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black font-mono text-[#855D1E]">₱{p.amount.toLocaleString()}.00</div>
                            <div className="mt-1">
                              {p.status === 'VERIFIED' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F0FDF4] text-[#166534] border border-[#86EFAC] text-[10px] font-mono font-bold uppercase">
                                  <CheckCircle className="w-3 h-3 text-[#16A34A]" /> Verified
                                </span>
                              ) : p.status === 'PAID' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-mono font-bold uppercase">
                                  <Clock className="w-3 h-3" /> Paid / Review
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] text-[10px] font-mono font-bold uppercase">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Audit Timeline */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <div className="border-b border-[#0f172a] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#382B20]">
                      Application Activity & Audit Trail
                    </h3>
                  </div>

                  <div className="divide-y divide-[#0f172a] border border-[#1e293b]">
                    {(details.auditHistory || []).map((log) => (
                      <div key={log.id} className="p-3 bg-[#0f172a] hover:bg-[#020617] text-xs flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
                            {log.action}
                          </span>
                          <span className="ml-2 font-bold text-[#f8fafc] uppercase text-[11px]">{log.actorType}</span>
                          <p className="font-mono text-[11px] text-[#94a3b8] mt-1">
                            {JSON.stringify(log.metadata || {})}
                          </p>
                        </div>
                        <span className="font-mono text-[11px] text-[#A89885]">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Action Controls Footer */}
        {details && (
          <div className="px-6 py-4 bg-[#FAF6EE] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#94a3b8]">
              Application Status: <strong className="text-[#f8fafc] font-mono">{details.application.status}</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Transition to UNDER_REVIEW */}
              {details.application.status === ApplicationStatus.SUBMITTED && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    setTransitionPrompt({
                      targetStatus: ApplicationStatus.UNDER_REVIEW,
                      title: 'Initiate Admissions Audit',
                      requiresNotes: false,
                      notesLabel: 'Optional evaluation note',
                    })
                  }
                  className="px-3.5 py-2 bg-[#382B20] hover:bg-[#231A12] text-[#FFFBEB] border border-[#a855f7] font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Begin Review</span>
                </button>
              )}

              {/* Transition to NEEDS_REVISION */}
              {details.application.status === ApplicationStatus.UNDER_REVIEW && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    setTransitionPrompt({
                      targetStatus: ApplicationStatus.NEEDS_REVISION,
                      title: 'Request Student Document Revision',
                      requiresNotes: true,
                      notesLabel: 'Specify required revision instructions (will be dispatched via email)',
                    })
                  }
                  className="px-3.5 py-2 bg-[#FAF4EA] text-[#855D1E] hover:bg-[#FDFBF7] border border-[#E5D7BE] font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>Request Revisions</span>
                </button>
              )}

              {/* Transition to APPROVED (Admin only) */}
              {details.application.status === ApplicationStatus.UNDER_REVIEW && adminRole === 'ADMIN' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    setTransitionPrompt({
                      targetStatus: ApplicationStatus.APPROVED,
                      title: 'Grant Formal Admission Approval',
                      requiresNotes: false,
                      notesLabel: 'Optional admission remarks',
                    })
                  }
                  className="px-3.5 py-2 bg-[#8b5cf6] hover:bg-[#B45309] text-white border border-[#FBBF24] font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Application</span>
                </button>
              )}

              {/* Transition to REJECTED (Admin only) */}
              {details.application.status === ApplicationStatus.UNDER_REVIEW && adminRole === 'ADMIN' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    setTransitionPrompt({
                      targetStatus: ApplicationStatus.REJECTED,
                      title: 'Formal Disqualification Notice',
                      requiresNotes: true,
                      notesLabel: 'Formal rejection rationale (communicated to applicant)',
                    })
                  }
                  className="px-3.5 py-2 bg-[#0f172a] border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEF2F2] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Application</span>
                </button>
              )}

              {/* Transition to ENROLLED (Admin only) */}
              {details.application.status === ApplicationStatus.APPROVED && adminRole === 'ADMIN' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    setTransitionPrompt({
                      targetStatus: ApplicationStatus.ENROLLED,
                      title: 'Finalize Official Matriculation',
                      requiresNotes: false,
                      notesLabel: 'Matriculation remarks / Section assignment',
                    })
                  }
                  className="px-3.5 py-2 bg-[#382B20] hover:bg-[#231A12] text-[#FBBF24] border border-[#a855f7] font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Matriculate Student</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transition Dialog Modal */}
        {transitionPrompt && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-2xl p-6 max-w-md w-full space-y-4">
              <div className="border-b border-[#0f172a] pb-2">
                <h3 className="font-black text-[#f8fafc] text-sm uppercase tracking-wide">
                  {transitionPrompt.title}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Confirm status transition to <strong>{transitionPrompt.targetStatus}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  {transitionPrompt.notesLabel} {transitionPrompt.requiresNotes && <span className="text-[#B45309]">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Enter remarks or instructions for applicant and audit ledger..."
                  className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#0f172a]">
                <button
                  type="button"
                  onClick={() => {
                    setTransitionPrompt(null);
                    setTransitionNotes('');
                  }}
                  className="px-3.5 py-2 bg-[#0f172a] border border-[#1e293b] text-xs font-bold uppercase text-[#382B20] hover:bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || (transitionPrompt.requiresNotes && !transitionNotes.trim())}
                  onClick={handleExecuteTransition}
                  className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#B45309] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Transition'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
