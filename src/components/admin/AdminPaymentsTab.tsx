import { Check, CheckCircle, Clock, ExternalLink, Eye, Filter, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PaymentTransaction } from '../../modules/payments/domain/payment.entity';

interface AdminPaymentsTabProps {
  adminToken: string;
  adminRole: string;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  adminToken,
  adminRole,
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [previewSlip, setPreviewSlip] = useState<{ filename: string; data: string } | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/admin/all', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [adminToken]);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/payments/admin/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        await loadTransactions();
      }
    } catch (err) {
      console.error('Failed to verify payment', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterChannel && t.channel !== filterChannel) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.referenceNumber.toLowerCase().includes(q) ||
        t.gatewayRefNo.toLowerCase().includes(q) ||
        t.payerName.toLowerCase().includes(q) ||
        t.payerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCollected = transactions
    .filter((t) => t.status === 'PAID' || t.status === 'VERIFIED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#EBE3D5] p-4 border border-[#D8CEBE] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A7968]">Gross Collections</span>
          <div className="text-2xl font-black text-[#15803D] font-mono mt-1">₱{totalCollected.toLocaleString()}.00</div>
          <p className="text-[10px] text-[#A89885] mt-0.5 uppercase">PHP Cleared / Verified</p>
        </div>

        <div className="bg-[#EBE3D5] p-4 border border-[#D8CEBE] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#855D1E]">Transactions</span>
          <div className="text-2xl font-black text-[#261F18] font-mono mt-1">{transactions.length}</div>
          <p className="text-[10px] text-[#7A6A59] mt-0.5 uppercase">All Settlement Attempts</p>
        </div>

        <div className="bg-[#EBE3D5] p-4 border border-[#86EFAC] bg-[#F0FDF4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534]">Verified Cash</span>
          <div className="text-2xl font-black text-[#166534] font-mono mt-1">
            {transactions.filter((t) => t.status === 'VERIFIED').length}
          </div>
          <p className="text-[10px] text-[#15803D] mt-0.5 uppercase">Audited by Cashier</p>
        </div>

        <div className="bg-[#EBE3D5] p-4 border border-[#FED7AA] bg-[#FFFBF5] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">Pending Verification</span>
          <div className="text-2xl font-black text-[#C2410C] font-mono mt-1">
            {transactions.filter((t) => t.status === 'PAID').length}
          </div>
          <p className="text-[10px] text-[#C2410C] mt-0.5 uppercase">Requires Cashier Review</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-5 space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, gateway DRP-xxxx, payer name..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#EBE3D5] border border-[#D8CEBE] text-xs text-[#261F18] placeholder-[#A89885] font-mono focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="px-3 py-2 bg-[#EBE3D5] border border-[#D8CEBE] text-xs text-[#382B20] focus:outline-none focus:border-[#D97706]"
            >
              <option value="">All Channels</option>
              <option value="GCASH">GCash / QR Ph</option>
              <option value="MAYA">Maya Wallet</option>
              <option value="DRAGONPAY_ONLINE_BANKING">Online Banking</option>
              <option value="DRAGONPAY_7ELEVEN">7-Eleven CLiQQ</option>
              <option value="DRAGONPAY_OTC_NON_BANK">OTC / Bayad Center</option>
              <option value="BANK_TRANSFER_MANUAL">Bank Slip Upload</option>
            </select>

            <button
              onClick={loadTransactions}
              className="px-3 py-2 bg-[#EBE3D5] border border-[#D8CEBE] hover:bg-[#FAF6EE] text-xs font-bold text-[#382B20] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-[#D8CEBE]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] border-b border-[#D8CEBE] text-[#523F2D] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Gateway Ref</th>
                <th className="px-4 py-3">Application Ref</th>
                <th className="px-4 py-3">Payer Details</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#8A7968]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
                      <span>Synchronizing Dragonpay collection ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#8A7968]">
                    No payment transactions matching filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-4 py-3 font-mono text-[#7A6A59]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#261F18]">
                      {tx.gatewayRefNo}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#855D1E]">
                      {tx.referenceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#261F18]">{tx.payerName}</div>
                      <div className="text-[11px] font-mono text-[#7A6A59]">{tx.payerEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-mono uppercase text-[11px] text-[#4A3B2C]">
                      {tx.channel.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-[#855D1E]">
                      ₱{tx.amount.toLocaleString()}.00
                    </td>
                    <td className="px-4 py-3">
                      {tx.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0FDF4] text-[#166534] border border-[#86EFAC] text-[10px] font-mono font-bold uppercase">
                          <CheckCircle className="w-3 h-3 text-[#16A34A]" /> Verified
                        </span>
                      ) : tx.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-mono font-bold uppercase">
                          <Clock className="w-3 h-3" /> Paid / Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] text-[10px] font-mono font-bold uppercase">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.depositSlipData && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewSlip({
                                filename: tx.depositSlipFilename || 'deposit-receipt.png',
                                data: tx.depositSlipData!,
                              })
                            }
                            className="p-1.5 bg-[#FAF6EE] text-[#855D1E] border border-[#E5D7BE] hover:bg-[#F5EFE6] text-xs font-bold uppercase cursor-pointer"
                            title="Inspect deposit slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {tx.status === 'PAID' && (
                          <button
                            type="button"
                            disabled={verifyingId === tx.id}
                            onClick={() => handleVerify(tx.id)}
                            className="px-2.5 py-1 bg-[#15803D] hover:bg-[#166534] text-[#000000] text-[11px] font-bold uppercase tracking-wider border border-[#86EFAC] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {verifyingId === tx.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {previewSlip && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-[#EBE3D5] pb-2">
              <h4 className="text-xs font-bold uppercase text-[#261F18]">
                Proof of Payment Slip: {previewSlip.filename}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewSlip(null)}
                className="text-xs text-[#8A7968] font-bold hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-auto border border-[#D8CEBE] bg-[#FAF8F5] p-2 flex justify-center">
              <img
                src={`data:image/png;base64,${previewSlip.data}`}
                alt="Deposit Slip"
                className="max-h-80 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
