import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  Edit2,
  ExternalLink,
  Landmark,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { BankAccount, BankAccountType, SettlementGatewayConfig } from '../../modules/banking/domain/bank-account.entity';

interface AdminBankingTabProps {
  sessionToken: string;
}

const COMMON_PH_BANKS = [
  'BDO Unibank, Inc.',
  'Bank of the Philippine Islands (BPI)',
  'Land Bank of the Philippines',
  'Metropolitan Bank & Trust Company (Metrobank)',
  'Security Bank Corporation',
  'Rizal Commercial Banking Corporation (RCBC)',
  'Philippine National Bank (PNB)',
  'Union Bank of the Philippines',
  'GCash Enterprise Merchant QR',
  'Maya Business',
  'Other / Custom Bank',
];

const ACCOUNT_TYPE_LABELS: Record<BankAccountType, { label: string; color: string; desc: string }> = {
  TUITION_MATRICULATION: {
    label: 'Tuition & Matriculation',
    color: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    desc: 'Primary depository for student tuition payments and downpayment reservations.',
  },
  APPLICATION_FEES: {
    label: 'Admissions & Assessment Fees',
    color: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
    desc: 'Receives initial ₱500 entrance exam and application processing fees.',
  },
  SCHOLARSHIP_ESCROW: {
    label: 'Scholarship & TES Subsidy',
    color: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
    desc: 'Dedicated escrow account for CHED/TES grants, UniFAST, and private donors.',
  },
  GENERAL_OPERATING: {
    label: 'General Operating Fund',
    color: 'bg-[#FAF4EA] text-[#855D1E] border-[#E5D7BE]',
    desc: 'General school administration operations, facilities, and auxiliary services.',
  },
};

export const AdminBankingTab: React.FC<AdminBankingTabProps> = ({ sessionToken }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [gatewayConfig, setGatewayConfig] = useState<SettlementGatewayConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRData, setSelectedQRData] = useState<{ bankName: string; accountName: string; accountNumber: string; qrUrl: string } | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Add / Edit Account
  const [formData, setFormData] = useState<{
    bankName: string;
    customBankName: string;
    accountName: string;
    accountNumber: string;
    accountType: BankAccountType;
    branchName: string;
    swiftCode: string;
    depositInstructions: string;
    isDefault: boolean;
  }>({
    bankName: COMMON_PH_BANKS[0],
    customBankName: '',
    accountName: 'St. Francis College, Inc.',
    accountNumber: '',
    accountType: 'TUITION_MATRICULATION',
    branchName: 'Academic Heights - Remsen Branch',
    swiftCode: '',
    depositInstructions: 'Indicate your Student Reference Number on the transfer remarks or deposit slip.',
    isDefault: false,
  });

  // Form State for Gateway Config
  const [gatewayForm, setGatewayForm] = useState<Partial<SettlementGatewayConfig>>({});

  const fetchBankingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/banking/admin/accounts', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load bank accounts and settlement settings.');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setGatewayConfig(data.gatewayConfig || null);
      if (data.gatewayConfig) {
        setGatewayForm(data.gatewayConfig);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching banking details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankingData();
  }, [sessionToken]);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setFormData({
      bankName: COMMON_PH_BANKS[0],
      customBankName: '',
      accountName: 'St. Francis College, Inc.',
      accountNumber: '',
      accountType: 'TUITION_MATRICULATION',
      branchName: 'Academic Heights - Remsen Branch',
      swiftCode: '',
      depositInstructions: 'Indicate your Student Reference Number on the transfer remarks or deposit slip.',
      isDefault: accounts.length === 0,
    });
    setIsAccountModalOpen(true);
  };

  const handleOpenEditModal = (account: BankAccount) => {
    setEditingAccount(account);
    const isCustom = !COMMON_PH_BANKS.includes(account.bankName);
    setFormData({
      bankName: isCustom ? 'Other / Custom Bank' : account.bankName,
      customBankName: isCustom ? account.bankName : '',
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      branchName: account.branchName || '',
      swiftCode: account.swiftCode || '',
      depositInstructions: account.depositInstructions || '',
      isDefault: account.isDefault,
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const finalBankName =
        formData.bankName === 'Other / Custom Bank'
          ? formData.customBankName.trim() || 'Custom Bank'
          : formData.bankName;

      const payload = {
        bankName: finalBankName,
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountType: formData.accountType,
        branchName: formData.branchName.trim() || undefined,
        swiftCode: formData.swiftCode.trim() || undefined,
        depositInstructions: formData.depositInstructions.trim() || undefined,
        isDefault: formData.isDefault,
      };

      const url = editingAccount
        ? `/api/banking/admin/accounts/${editingAccount.id}`
        : '/api/banking/admin/accounts';
      const method = editingAccount ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save account details.');
      }

      setSuccessMsg(
        editingAccount
          ? `Updated ${finalBankName} account successfully.`
          : `Added new depository account ${finalBankName} successfully.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsAccountModalOpen(false);
      await fetchBankingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving bank account');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (account: BankAccount) => {
    try {
      const newStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch(`/api/banking/admin/accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update account status.');
      setSuccessMsg(`Marked ${account.bankName} as ${newStatus}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchBankingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating account status');
    }
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${account.bankName} (${account.accountNumber})? Existing payment references will remain intact in the audit trail.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/banking/admin/accounts/${account.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete account.');
      setSuccessMsg(`Removed ${account.bankName} depository account.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchBankingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting account');
    }
  };

  const handleSaveGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/banking/admin/gateway-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(gatewayForm),
      });
      if (!res.ok) throw new Error('Failed to save settlement settings.');
      setSuccessMsg('Dragonpay settlement and depository routing updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsGatewayModalOpen(false);
      await fetchBankingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating gateway configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateSettlement = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/banking/admin/simulate-settlement', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (!res.ok) throw new Error('Settlement simulation failed.');
      const data = await res.json();
      setSuccessMsg(data.message || 'Settlement sweep simulated successfully.');
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchBankingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error simulating settlement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowQR = async (account: BankAccount) => {
    try {
      const qrPayload =
        account.qrPhData ||
        `00020101021226580015ph.ppmi.qrph0111${account.bankName.slice(0, 6).toUpperCase()}0215${account.accountNumber.replace(/\D/g, '')}5204601653036085802PH5924ST FRANCIS COLLEGE INC6007MANILA6304`;
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#261F18',
          light: '#FFFFFF',
        },
      });
      setSelectedQRData({
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        qrUrl: dataUrl,
      });
      setIsQRModalOpen(true);
    } catch (e) {
      console.error('Failed to generate QR code', e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const primarySettlementAccount = accounts.find((a) => a.id === gatewayConfig?.primarySettlementBankId) || accounts.find((a) => a.isDefault);

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border-l-4 border-[#EF4444] text-[#991B1B] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#F0FDF4] border-l-4 border-[#22C55E] text-[#166534] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#855D1E]" />
            <h2 className="text-base font-bold text-[#261F18] uppercase tracking-wide">
              Institutional Depository Accounts & Settlement Routing
            </h2>
          </div>
          <p className="text-xs text-[#7A6A59] mt-1 max-w-2xl leading-relaxed">
            Manage official school bank accounts where student payments, tuition, downpayments, and Dragonpay automated settlement sweeps are credited.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchBankingData}
            disabled={isLoading}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#EBE3D5] border border-[#D8CEBE] text-[#261F18] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh bank details"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsGatewayModalOpen(true)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#EBE3D5] border border-[#D8CEBE] text-[#261F18] hover:bg-[#FAF6EE] hover:border-[#D97706] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Settlement Config</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#2E2016] text-[#FAF8F5] hover:bg-[#422F22] border border-[#2E2016] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Institutional Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6A59] text-xs font-bold uppercase tracking-wider">
            <span>Active Accounts</span>
            <Building2 className="w-4 h-4 text-[#855D1E]" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-[#261F18]">
            {accounts.filter((a) => a.status === 'ACTIVE').length} / {accounts.length}
          </div>
          <p className="text-[11px] text-[#8A7968] mt-1">Verified depository endpoints</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6A59] text-xs font-bold uppercase tracking-wider">
            <span>Primary Payout Target</span>
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2 text-sm font-bold text-[#261F18] truncate">
            {primarySettlementAccount?.bankName || 'Not Assigned'}
          </div>
          <p className="text-[11px] font-mono text-[#855D1E] mt-1 truncate">
            {primarySettlementAccount?.accountNumber || 'Default Bank Account'}
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6A59] text-xs font-bold uppercase tracking-wider">
            <span>Gateway Sweep Cadence</span>
            <Zap className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-2 text-sm font-black font-mono text-[#261F18] uppercase">
            {gatewayConfig?.autoSettlementFrequency || 'DAILY'} (18:00 PHT)
          </div>
          <p className="text-[11px] text-[#8A7968] mt-1">Dragonpay automated merchant payout</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6A59] text-xs font-bold uppercase tracking-wider">
            <span>Merchant Gateway ID</span>
            <CreditCard className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-[#261F18] truncate">
            {gatewayConfig?.merchantId || 'SFC_DRAGONPAY_LIVE'}
          </div>
          <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            STATUS: CONNECTED
          </span>
        </div>
      </div>

      {/* Settlement Sweep Trigger Card */}
      <div className="bg-[#FAF6EE] border-2 border-[#E5D7BE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#EBE3D5] border border-[#D8CEBE] text-[#855D1E] shrink-0">
            <Zap className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-[#261F18] tracking-wider">
              Automated Dragonpay Settlement & Depository Sweeper
            </h4>
            <p className="text-xs text-[#7A6A59] mt-0.5">
              Online fees collected through Dragonpay are credited to the primary depository account (
              <strong>{primarySettlementAccount?.bankName}</strong>).
              {gatewayConfig?.lastSettlementAt && (
                <span className="ml-1 text-[11px] font-mono text-[#855D1E]">
                  Last swept: {new Date(gatewayConfig.lastSettlementAt).toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateSettlement}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#EBE3D5] border-2 border-[#D8CEBE] text-[#261F18] hover:border-[#D97706] hover:bg-[#FAF4EA] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-[#D97706]" />}
          <span>Run Immediate Settlement Sweep</span>
        </button>
      </div>

      {/* Main Depository Accounts Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8CEBE] pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#261F18] flex items-center gap-2">
            <span>Configured Depository Bank Accounts</span>
            <span className="px-2 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE] font-mono text-[11px]">
              {accounts.length} Total
            </span>
          </h3>
          <span className="text-xs text-[#7A6A59]">
            Active accounts automatically populate student payment instructions
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-[#EBE3D5] border-2 border-[#D8CEBE]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#855D1E]" />
            <p className="text-xs text-[#7A6A59] mt-2 font-mono">Loading banking registry...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center bg-[#EBE3D5] border-2 border-[#D8CEBE]">
            <Landmark className="w-10 h-10 text-[#A89885] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#261F18] uppercase">No Bank Accounts Configured</h4>
            <p className="text-xs text-[#7A6A59] mt-1 max-w-md mx-auto">
              Add your institution&apos;s first depository account so students can view payment details and receive official receipts.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#2E2016] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Add First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              const typeMeta = ACCOUNT_TYPE_LABELS[acc.accountType] || {
                label: acc.accountType,
                color: 'bg-[#FAF4EA] text-[#855D1E] border-[#E5D7BE]',
                desc: '',
              };
              const isPrimary = acc.id === gatewayConfig?.primarySettlementBankId;

              return (
                <div
                  key={acc.id}
                  className={`bg-[#EBE3D5] border-2 transition-all shadow-xs flex flex-col justify-between ${
                    acc.isDefault
                      ? 'border-[#D97706]'
                      : acc.status === 'ACTIVE'
                      ? 'border-[#D8CEBE]'
                      : 'border-[#E5D7BE] opacity-75'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#EBE3D5] bg-[#FAF8F5] flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#EBE3D5] border border-[#D8CEBE] flex items-center justify-center text-[#855D1E] shrink-0 font-black text-sm">
                        {acc.bankName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#261F18] leading-snug">{acc.bankName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase font-bold ${typeMeta.color}`}>
                            {typeMeta.label}
                          </span>
                          {acc.isDefault && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#D97706] text-white font-bold uppercase">
                              Default Depository
                            </span>
                          )}
                          {isPrimary && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#166534] text-white font-bold uppercase">
                              Settlement Target
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                        acc.status === 'ACTIVE'
                          ? 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC]'
                          : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 text-xs flex-1">
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#FAF4EA]">
                      <span className="text-[#7A6A59] font-medium">Account Name:</span>
                      <span className="col-span-2 font-bold text-[#261F18]">{acc.accountName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#FAF4EA] items-center">
                      <span className="text-[#7A6A59] font-medium">Account Number:</span>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#855D1E] tracking-wider">
                          {acc.accountNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(acc.accountNumber, acc.id)}
                          className="p-1 hover:bg-[#FAF6EE] text-[#7A6A59] hover:text-[#261F18] transition-colors cursor-pointer"
                          title="Copy account number"
                        >
                          {copiedId === acc.id ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {acc.branchName && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#FAF4EA]">
                        <span className="text-[#7A6A59] font-medium">Branch:</span>
                        <span className="col-span-2 text-[#261F18]">{acc.branchName}</span>
                      </div>
                    )}

                    {acc.swiftCode && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#FAF4EA]">
                        <span className="text-[#7A6A59] font-medium">SWIFT / BIC:</span>
                        <span className="col-span-2 font-mono text-[#261F18]">{acc.swiftCode}</span>
                      </div>
                    )}

                    {acc.depositInstructions && (
                      <div className="p-2.5 bg-[#FAF6EE] border border-[#E5D7BE] text-[11px] text-[#7A6A59] leading-relaxed">
                        <span className="font-bold text-[#261F18] block mb-0.5 uppercase tracking-wide text-[10px]">
                          Student Instructions:
                        </span>
                        {acc.depositInstructions}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-[#FAF8F5] border-t border-[#EBE3D5] flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => handleShowQR(acc)}
                      className="px-2.5 py-1.5 bg-[#EBE3D5] border border-[#D8CEBE] text-[#261F18] hover:bg-[#FAF4EA] transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#855D1E]" />
                      <span>QR Ph</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(acc)}
                        className={`px-2.5 py-1.5 border text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                          acc.status === 'ACTIVE'
                            ? 'bg-[#EBE3D5] border-[#D8CEBE] text-[#7A6A59] hover:text-[#991B1B] hover:border-[#FECACA]'
                            : 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                        }`}
                      >
                        {acc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(acc)}
                        className="p-1.5 bg-[#EBE3D5] border border-[#D8CEBE] text-[#261F18] hover:border-[#D97706] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
                        title="Edit details"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#855D1E]" />
                      </button>

                      <button
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-1.5 bg-[#EBE3D5] border border-[#D8CEBE] text-[#991B1B] hover:bg-[#FEF2F2] hover:border-[#EF4444] transition-colors cursor-pointer"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT ACCOUNT MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-1 bg-gradient-to-r from-[#D97706] to-[#F59E0B]" />
            <div className="p-4 bg-[#FAF6EE] border-b border-[#D8CEBE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#855D1E]" />
                <h3 className="font-bold text-sm uppercase text-[#261F18]">
                  {editingAccount ? 'Edit Depository Bank Account' : 'Add Institutional Bank Account'}
                </h3>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-[#7A6A59] hover:text-[#261F18] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                  Bank / E-Wallet Institution <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                  required
                >
                  {COMMON_PH_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {formData.bankName === 'Other / Custom Bank' && (
                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    Custom Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customBankName}
                    onChange={(e) => setFormData({ ...formData, customBankName: e.target.value })}
                    placeholder="e.g., Union Bank of the Philippines"
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="St. Francis College, Inc."
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="0045-8812-9901"
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] font-mono font-bold focus:border-[#D97706] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                  Account Depository Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as BankAccountType })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                  required
                >
                  <option value="TUITION_MATRICULATION">Tuition & Matriculation (Downpayment & Semestral Fees)</option>
                  <option value="APPLICATION_FEES">Admissions & Assessment Fees (₱500 Entry Exam)</option>
                  <option value="SCHOLARSHIP_ESCROW">Scholarship, TES Subsidy & Grants</option>
                  <option value="GENERAL_OPERATING">General Operating & Auxiliary Services</option>
                </select>
                <p className="text-[11px] text-[#7A6A59] mt-1">
                  {ACCOUNT_TYPE_LABELS[formData.accountType]?.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="Academic Heights Branch"
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={formData.swiftCode}
                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                    placeholder="e.g. BNORPHMM"
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] font-mono focus:border-[#D97706] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                  Student Transfer Instructions & Notes
                </label>
                <textarea
                  value={formData.depositInstructions}
                  onChange={(e) => setFormData({ ...formData, depositInstructions: e.target.value })}
                  rows={2}
                  placeholder="e.g. Write student reference number in the deposit slip remarks."
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-[#D8CEBE] flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#D97706] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isDefault" className="font-bold text-[#261F18] cursor-pointer">
                  Set as Default Depository Account
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EBE3D5]">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 border border-[#D8CEBE] text-[#7A6A59] hover:bg-[#FAF8F5] font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#2E2016] text-[#FAF8F5] font-bold uppercase tracking-wider hover:bg-[#422F22] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  <span>{editingAccount ? 'Update Account' : 'Save Bank Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATEWAY SETTLEMENT SETTINGS MODAL */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="h-1 bg-gradient-to-r from-[#D97706] to-[#F59E0B]" />
            <div className="p-4 bg-[#FAF6EE] border-b border-[#D8CEBE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#855D1E]" />
                <h3 className="font-bold text-sm uppercase text-[#261F18]">
                  Dragonpay Settlement & Merchant Routing
                </h3>
              </div>
              <button
                onClick={() => setIsGatewayModalOpen(false)}
                className="text-[#7A6A59] hover:text-[#261F18] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGatewayConfig} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                  Dragonpay Merchant ID
                </label>
                <input
                  type="text"
                  value={gatewayForm.merchantId || ''}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, merchantId: e.target.value })}
                  placeholder="SFC_DRAGONPAY_LIVE_092"
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] font-mono focus:border-[#D97706] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                  Target Depository Account for Payout Sweeps
                </label>
                <select
                  value={gatewayForm.primarySettlementBankId || ''}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, primarySettlementBankId: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} — {a.accountNumber} ({a.accountName})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#7A6A59] mt-1">
                  Where Dragonpay daily collections are automatically deposited by the clearinghouse.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    Auto-Settlement Cadence
                  </label>
                  <select
                    value={gatewayForm.autoSettlementFrequency || 'DAILY'}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        autoSettlementFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY',
                      })
                    }
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                  >
                    <option value="DAILY">Daily (End of Day 18:00)</option>
                    <option value="WEEKLY">Weekly (Every Friday)</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                    Minimum Payout (₱)
                  </label>
                  <input
                    type="number"
                    value={gatewayForm.minimumPayoutThreshold ?? 1000}
                    onChange={(e) =>
                      setGatewayForm({ ...gatewayForm, minimumPayoutThreshold: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] font-mono focus:border-[#D97706] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#261F18] uppercase tracking-wider mb-1">
                  Finance Notification Email
                </label>
                <input
                  type="email"
                  value={gatewayForm.notifyFinanceEmail || 'finance@stfrancis.edu'}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, notifyFinanceEmail: e.target.value })}
                  placeholder="finance@stfrancis.edu"
                  className="w-full p-2.5 bg-white border border-[#D8CEBE] text-[#261F18] focus:border-[#D97706] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EBE3D5]">
                <button
                  type="button"
                  onClick={() => setIsGatewayModalOpen(false)}
                  className="px-4 py-2 border border-[#D8CEBE] text-[#7A6A59] hover:bg-[#FAF8F5] font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#2E2016] text-[#FAF8F5] font-bold uppercase tracking-wider hover:bg-[#422F22] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR PH PREVIEW MODAL */}
      {isQRModalOpen && selectedQRData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] max-w-sm w-full shadow-2xl p-5 text-center">
            <div className="flex items-center justify-between border-b border-[#D8CEBE] pb-2 mb-3">
              <span className="text-xs font-bold text-[#855D1E] uppercase tracking-wider">
                Official QR Ph Merchant Standee
              </span>
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="text-[#7A6A59] hover:text-[#261F18] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#D8CEBE] inline-block mb-3">
              <img
                src={selectedQRData.qrUrl}
                alt="QR Ph Code"
                className="w-56 h-56 mx-auto border border-[#E5D7BE]"
              />
            </div>

            <h4 className="font-bold text-sm text-[#261F18]">{selectedQRData.bankName}</h4>
            <p className="font-mono font-bold text-xs text-[#855D1E] mt-0.5">{selectedQRData.accountNumber}</p>
            <p className="text-[11px] text-[#7A6A59] mt-0.5">{selectedQRData.accountName}</p>
            <p className="text-[10px] text-[#8A7968] mt-2 bg-[#FAF6EE] p-2 border border-[#E5D7BE]">
              Compatible with GCash, Maya, ShopeePay, BDO, BPI, UnionBank and all InstaPay member institutions.
            </p>

            <button
              onClick={() => setIsQRModalOpen(false)}
              className="mt-4 w-full py-2 bg-[#2E2016] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
