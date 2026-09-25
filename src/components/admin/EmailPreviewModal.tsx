import { CheckCircle, Clock, Mail, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SentEmailRecord } from '../../lib/email/email.service';

interface EmailPreviewModalProps {
  adminToken: string;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  adminToken,
  onClose,
}) => {
  const [emails, setEmails] = useState<SentEmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmailRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmails() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/emails', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const json = await res.json();
        if (json.success) {
          setEmails(json.data);
          if (json.data.length > 0) {
            setSelectedEmail(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load sent emails', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmails();
  }, [adminToken]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Top Gold Accent Line */}
        <div className="h-1 bg-[#D97706] w-full" />

        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#D8CEBE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#D97706]" />
            <div>
              <h3 className="font-black text-[#261F18] text-sm uppercase tracking-wide">
                Outbound Transactional Email Log
              </h3>
              <p className="text-[11px] text-[#7A6A59]">
                Simulated institutional SMTP delivery audit records and rendered HTML templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A7968] hover:text-[#261F18] hover:bg-[#EBE3D5] border border-transparent hover:border-[#D8CEBE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* List */}
          <div className="w-full md:w-80 border-r border-[#D8CEBE] overflow-y-auto bg-[#FAF8F5]">
            {loading ? (
              <div className="p-8 text-center text-[#8A7968] text-xs uppercase font-bold">Querying dispatch ledger...</div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center text-[#8A7968] text-xs">
                No outbound notifications logged yet in this session. Submit an application or trigger status changes to test!
              </div>
            ) : (
              <div className="divide-y divide-[#EBE3D5]">
                {emails.map((e) => {
                  const isSelected = selectedEmail?.id === e.id;
                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedEmail(e)}
                      className={`p-3.5 cursor-pointer text-xs space-y-1 transition-colors ${
                        isSelected ? 'bg-[#EBE3D5] border-l-4 border-[#D97706]' : 'hover:bg-[#EBE3D5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#261F18] truncate max-w-[170px]">
                          {e.recipientEmail}
                        </span>
                        <span className="text-[10px] text-[#15803D] font-mono font-bold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> SENT
                        </span>
                      </div>
                      <p className="font-bold text-[#382B20] truncate">{e.subject}</p>
                      <p className="text-[10px] font-mono text-[#8A7968] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D97706]" />
                        <span>{new Date(e.sentAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rendered Email Inspector */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#EBE3D5] flex flex-col">
            {selectedEmail ? (
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-[#FAF8F5] border border-[#D8CEBE] text-xs space-y-1">
                  <div className="grid grid-cols-6 gap-2">
                    <span className="font-bold text-[#7A6A59] uppercase">Recipient:</span>
                    <span className="col-span-5 font-mono font-bold text-[#261F18]">{selectedEmail.recipientEmail}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <span className="font-bold text-[#7A6A59] uppercase">Subject:</span>
                    <span className="col-span-5 font-bold text-[#382B20]">{selectedEmail.subject}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <span className="font-bold text-[#7A6A59] uppercase">Dispatched:</span>
                    <span className="col-span-5 font-mono text-[#8A7968]">{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border border-[#D8CEBE] p-4 bg-[#EBE3D5] flex-1 overflow-auto">
                  <h4 className="text-[11px] font-bold text-[#7A6A59] uppercase tracking-wider mb-2 border-b border-[#EBE3D5] pb-1">
                    Rendered Email Body
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#8A7968] text-xs uppercase font-bold">
                Select an outbound notification from the ledger to view content.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
