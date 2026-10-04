import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle, Clock, CreditCard, Eye, FileText, Filter, Heart, History, Landmark, Mail, QrCode, RefreshCw, Search, ShieldCheck, UserCheck, Users, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AuditLog } from '../../modules/audit/domain/audit-log.entity';
import { StatusBadge } from '../common/Badge';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { EmailPreviewModal } from './EmailPreviewModal';
import { QRCampaignManager } from './QRCampaignManager';
import { AdminLibraryTab } from './AdminLibraryTab';
import { AdminPaymentsTab } from './AdminPaymentsTab';
import { AdminBankingTab } from './AdminBankingTab';

interface EnrichedApplication {
  id: string;
  referenceNumber: string;
  applicantId: string;
  programId: string;
  programName: string;
  programCode: string;
  applicantName: string;
  applicantEmail: string;
  applicantMobile: string;
  status: string;
  applicantType: string;
  academicYear: string;
  createdAt: string;
  submittedAt?: string;
}

interface AdminDashboardProps {
  token: string;
  user: { id: string; email: string; fullName: string; role: string };
  onLogout: () => void;
  onReturnHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  user,
  onLogout,
  onReturnHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'payments' | 'banking_campaigns' | 'audit' | 'library' | 'donations'>('applications');
  const [innerBankingTab, setInnerBankingTab] = useState<'banking' | 'campaigns'>('banking');
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Load stats and application list
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson.data);

      // 2. Fetch Applications
      let url = '/api/admin/applications?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const appsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsJson = await appsRes.json();
      if (appsJson.success) setApplications(appsJson.data.applications);

      // 3. Fetch Audit Logs
      const auditRes = await fetch('/api/admin/audit?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const auditJson = await auditRes.json();
      if (auditJson.success) setAuditLogs(auditJson.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, statusFilter]);

  const counts = stats?.counts || {};

  return (
    <div className="flex h-screen overflow-hidden animate-slide-up">
      {/* Fixed Left Sidebar */}
      <aside className="w-64 shrink-0 bg-[#1C0E07] border-r-2 border-[#D97706] flex flex-col h-full">
        {/* Sidebar Header - Branding */}
        <div className="p-5 border-b border-[#2C150B]">
          <h1 className="font-display text-base font-bold tracking-widest text-[#FFFDF7] uppercase leading-tight">
            Admissions Console
          </h1>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#D97706] uppercase mt-0.5 block">
            Evaluation & Operations
          </span>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-[#2C150B]">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span className="text-xs font-bold text-[#FFFDF7] uppercase tracking-wider truncate">{user.fullName}</span>
          </div>
          <p className="text-[10px] text-[#8A7968] truncate">{user.email}</p>
          <span className="inline-block mt-1.5 text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#D97706] text-[#1C0E07] rounded-sm">
            {user.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <p className="px-3 py-2 text-[9px] font-bold text-[#665646] uppercase tracking-[0.2em]">Navigation</p>
          
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`w-full px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer rounded-sm ${
              activeSubTab === 'applications'
                ? 'text-[#FFFDF7] bg-[#D97706]/15 border-l-3 border-[#D97706]'
                : 'text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className={`w-4 h-4 ${activeSubTab === 'applications' ? 'text-[#D97706]' : 'text-[#665646]'}`} />
              <span>Applications</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono ${activeSubTab === 'applications' ? 'bg-[#D97706] text-[#1C0E07]' : 'bg-[#2C150B] text-[#8A7968]'}`}>{applications.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payments')}
            className={`w-full px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer rounded-sm ${
              activeSubTab === 'payments'
                ? 'text-[#FFFDF7] bg-[#D97706]/15 border-l-3 border-[#D97706]'
                : 'text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B]'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeSubTab === 'payments' ? 'text-[#D97706]' : 'text-[#665646]'}`} />
            <span>PayMongo & Collections</span>
          </button>

          <button
            onClick={() => setActiveSubTab('banking_campaigns')}
            className={`w-full px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer rounded-sm ${
              activeSubTab === 'banking_campaigns'
                ? 'text-[#FFFDF7] bg-[#D97706]/15 border-l-3 border-[#D97706]'
                : 'text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B]'
            }`}
          >
            <Landmark className={`w-4 h-4 ${activeSubTab === 'banking_campaigns' ? 'text-[#D97706]' : 'text-[#665646]'}`} />
            <span>Banking & QR Campaigns</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`w-full px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer rounded-sm ${
              activeSubTab === 'audit'
                ? 'text-[#FFFDF7] bg-[#D97706]/15 border-l-3 border-[#D97706]'
                : 'text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B]'
            }`}
          >
            <History className={`w-4 h-4 ${activeSubTab === 'audit' ? 'text-[#D97706]' : 'text-[#665646]'}`} />
            <span>Audit Ledger</span>
          </button>

          <p className="px-3 py-2 mt-3 text-[9px] font-bold text-[#665646] uppercase tracking-[0.2em]">Management</p>

          <button
            onClick={() => setActiveSubTab('library')}
            className={`w-full px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer rounded-sm ${
              activeSubTab === 'library'
                ? 'text-[#FFFDF7] bg-[#D97706]/15 border-l-3 border-[#D97706]'
                : 'text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B]'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeSubTab === 'library' ? 'text-[#D97706]' : 'text-[#665646]'}`} />
            <span>Library Management</span>
          </button>

          <button
            onClick={() => setActiveSubTab('donations')}
            className={`w-full px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer rounded-sm ${
              activeSubTab === 'donations'
                ? 'text-[#FFFDF7] bg-[#D97706]/15 border-l-3 border-[#D97706]'
                : 'text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B]'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeSubTab === 'donations' ? 'text-[#D97706]' : 'text-[#665646]'}`} />
            <span>Donations & Support</span>
          </button>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-[#2C150B] space-y-1.5">
          <button
            onClick={() => setShowEmailModal(true)}
            className="w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B] flex items-center gap-2.5 transition-colors cursor-pointer rounded-sm"
          >
            <Mail className="w-3.5 h-3.5 text-[#665646]" />
            <span>Outbound Logs</span>
          </button>
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#A89885] hover:text-[#FFFDF7] hover:bg-[#2C150B] flex items-center gap-2.5 transition-colors cursor-pointer rounded-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#665646]" />
              <span>Return to Site</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#DC2626] hover:text-[#EF4444] hover:bg-[#2C150B] flex items-center gap-2.5 transition-colors cursor-pointer rounded-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF6EE] overflow-y-auto">


        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

      {/* SUBTAB 1: Applications Data Table */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
            <div>
              <h3 className="text-base font-black text-[#261F18] uppercase tracking-wide">
                Applications Directory
              </h3>
              <p className="text-xs text-[#7A6A59]">
                Review, manage, and process student applications.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
              Academic Year 2026-2027
            </span>
          </div>

          {/* KPI Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#EBE3D5] p-4 border border-[#D8CEBE] shadow-xs">
              <div className="flex items-center justify-between text-[#8A7968] mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                <Users className="w-4 h-4 text-[#8A7968]" />
              </div>
              <div className="text-2xl font-black text-[#261F18] font-mono tabular-nums">{stats?.totalApplications || 0}</div>
              <p className="text-[10px] text-[#A89885] mt-0.5 uppercase">All Apps</p>
            </div>

            <div className="bg-[#EBE3D5] p-4 border border-[#D8CEBE] shadow-xs">
              <div className="flex items-center justify-between text-[#855D1E] mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">New</span>
                <Clock className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="text-2xl font-black text-[#855D1E] font-mono tabular-nums">{counts.SUBMITTED || 0}</div>
              <p className="text-[10px] text-[#855D1E] mt-0.5 uppercase">To Review</p>
            </div>

            <div className="bg-[#EBE3D5] p-4 border border-[#FED7AA] bg-[#FFFBF5] shadow-xs">
              <div className="flex items-center justify-between text-[#C2410C] mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Incomplete</span>
                <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
              </div>
              <div className="text-2xl font-black text-[#C2410C] font-mono tabular-nums">{counts.NEEDS_REVISION || 0}</div>
              <p className="text-[10px] text-[#C2410C] mt-0.5 uppercase">Needs Fix</p>
            </div>

            <div className="bg-[#EBE3D5] p-4 border border-[#86EFAC] bg-[#F0FDF4] shadow-xs">
              <div className="flex items-center justify-between text-[#166534] mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Accepted</span>
                <CheckCircle className="w-4 h-4 text-[#15803D]" />
              </div>
              <div className="text-2xl font-black text-[#166534] font-mono tabular-nums">{counts.APPROVED || 0}</div>
              <p className="text-[10px] text-[#15803D] mt-0.5 uppercase">Admitted</p>
            </div>
          </div>

          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs space-y-4 p-5">
          {/* Table Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Search reference or student name (e.g. ENR-2026-000101)..."
                className="w-full pl-9 pr-3.5 py-2 bg-[#EBE3D5] border border-[#D8CEBE] text-xs text-[#261F18] placeholder-[#A89885] font-mono focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8A7968]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#EBE3D5] border border-[#D8CEBE] text-xs text-[#382B20] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ENROLLED">Enrolled</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto border border-[#D8CEBE]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] border-b border-[#D8CEBE] text-[#523F2D] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Academic Program</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D5]">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#8A7968]">
                      No admissions records matching current search parameters.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#261F18]">
                        {app.referenceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#261F18]">{app.applicantName}</div>
                        <div className="text-[11px] font-mono text-[#8A7968]">{app.applicantEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#382B20]">{app.programCode}</div>
                        <div className="text-[11px] text-[#665646] max-w-[200px] truncate">{app.programName}</div>
                      </td>
                      <td className="px-4 py-3 text-[#523F2D] font-medium uppercase text-[11px]">
                        {app.applicantType}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-[#7A6A59] font-mono">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6EE] text-[#382B20] hover:bg-[#382B20] hover:text-[#FFFBEB] border border-[#D8CEBE] hover:border-[#F59E0B] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* SUBTAB 2: Dragonpay & Fee Collections */}
      {activeSubTab === 'payments' && (
        <AdminPaymentsTab adminToken={token} adminRole={user.role} />
      )}

      {/* COMBINED TAB: Banking & Campaigns */}
      {activeSubTab === 'banking_campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
            <div>
              <h3 className="text-base font-black text-[#261F18] uppercase tracking-wide">
                Banking, Vault & Campaigns
              </h3>
              <p className="text-xs text-[#7A6A59]">
                Manage offline collections and track marketing attribution.
              </p>
            </div>
          </div>
          <div className="flex border-b border-[#D8CEBE]">
            <button
              onClick={() => setInnerBankingTab('banking')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                innerBankingTab === 'banking'
                  ? 'border-[#D97706] text-[#261F18]'
                  : 'border-transparent text-[#8A7968] hover:text-[#261F18]'
              }`}
            >
              Banking & Vault
            </button>
            <button
              onClick={() => setInnerBankingTab('campaigns')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                innerBankingTab === 'campaigns'
                  ? 'border-[#D97706] text-[#261F18]'
                  : 'border-transparent text-[#8A7968] hover:text-[#261F18]'
              }`}
            >
              QR Campaigns
            </button>
          </div>

          <div className="pt-2">
            {innerBankingTab === 'banking' && (
              <AdminBankingTab sessionToken={token} />
            )}
            {innerBankingTab === 'campaigns' && (
              <QRCampaignManager adminToken={token} adminRole={user.role} />
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: System Audit Log */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
            <div>
              <h3 className="text-base font-black text-[#261F18] uppercase tracking-wide">
                System Audit Ledger
              </h3>
              <p className="text-xs text-[#7A6A59]">
                Immutable, tamper-evident records of status transitions, evaluations, and uploads.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
              {auditLogs.length} Records
            </span>
          </div>
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs">

          <div className="overflow-x-auto border border-[#D8CEBE]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] border-b border-[#D8CEBE] text-[#523F2D] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Actor</th>
                  <th className="px-4 py-2.5">Action Executed</th>
                  <th className="px-4 py-2.5">Entity</th>
                  <th className="px-4 py-2.5">Audit Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D5]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#8A7968]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5]">
                      <td className="px-4 py-2.5 font-mono text-[#7A6A59]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 font-bold uppercase text-[#382B20]">
                        {log.actorType}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-[#FAF6EE] text-[#855D1E] border border-[#E5D7BE]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[#7A6A59]">
                        {log.entityType} ({log.entityId.slice(0, 8)}...)
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[#665646] text-[11px]">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: Library Management */}
      {activeSubTab === 'library' && (
        <AdminLibraryTab adminToken={token} adminRole={user.role} />
      )}

      {/* SUBTAB 7: Donations & Support */}
      {activeSubTab === 'donations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
            <div>
              <h3 className="text-base font-black text-[#261F18] uppercase tracking-wide">
                Donations & Support Tracker
              </h3>
              <p className="text-xs text-[#7A6A59]">
                Track donations, manage support campaigns, and generate contribution reports.
              </p>
            </div>
          </div>
          <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6">
            <div className="py-16 text-center text-[#8A7968]">
              <Heart className="w-12 h-12 mx-auto mb-4 text-[#D8CEBE]" />
              <p className="text-sm font-bold uppercase tracking-wider">Donations Module Coming Soon</p>
              <p className="text-xs mt-1">Donation tracking, campaign management, and reporting tools will appear here.</p>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Application Detail Modal Drawer */}
      {selectedAppId && (
        <ApplicationDetailModal
          applicationId={selectedAppId}
          adminToken={token}
          adminRole={user.role}
          onClose={() => setSelectedAppId(null)}
          onStatusChanged={loadData}
        />
      )}

      {/* Outbound Email Inspector Modal */}
      {showEmailModal && (
        <EmailPreviewModal
          adminToken={token}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};
