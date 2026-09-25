import { AlertTriangle, CheckCircle, Clock, CreditCard, Eye, FileText, Filter, History, Landmark, Mail, QrCode, RefreshCw, Search, ShieldCheck, UserCheck, Users, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AuditLog } from '../../modules/audit/domain/audit-log.entity';
import { StatusBadge } from '../common/Badge';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { EmailPreviewModal } from './EmailPreviewModal';
import { QRCampaignManager } from './QRCampaignManager';
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
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  user,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'payments' | 'banking' | 'campaigns' | 'audit'>('applications');
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] p-6 border-2 border-[#1e293b] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#f8fafc] uppercase tracking-tight">
              Admissions Evaluation Console
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE] uppercase">
              {user.role} Authorization
            </span>
          </div>
          <p className="text-xs text-[#665646] mt-1">
            Logged in as <strong>{user.fullName}</strong> ({user.email}) · Academic Year 2026–2027 Admissions Operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-3.5 py-2 border border-[#1e293b] bg-[#0f172a] hover:bg-[#FAF6EE] hover:border-[#334155] text-[#382B20] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Mail className="w-4 h-4 text-[#8b5cf6]" />
            <span>Outbound Logs</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-[#382B20] hover:bg-[#231A12] text-[#FFFBEB] border border-[#a855f7] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Synchronize</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-[#0f172a] p-4 border border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-[#64748b]" />
          </div>
          <div className="text-2xl font-black text-[#f8fafc] font-mono tabular-nums">{stats?.totalApplications || 0}</div>
          <p className="text-[10px] text-[#A89885] mt-0.5 uppercase">Registered</p>
        </div>

        <div className="bg-[#0f172a] p-4 border border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-[#855D1E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Submitted</span>
            <Clock className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-2xl font-black text-[#855D1E] font-mono tabular-nums">{counts.SUBMITTED || 0}</div>
          <p className="text-[10px] text-[#855D1E] mt-0.5 uppercase">Pending Intake</p>
        </div>

        <div className="bg-[#0f172a] p-4 border border-[#E8D4A2] bg-[#0f172a] shadow-xs">
          <div className="flex items-center justify-between text-[#B45309] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Review</span>
            <FileText className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-2xl font-black text-[#B45309] font-mono tabular-nums">{counts.UNDER_REVIEW || 0}</div>
          <p className="text-[10px] text-[#B45309] mt-0.5 uppercase">Under Audit</p>
        </div>

        <div className="bg-[#0f172a] p-4 border border-[#FED7AA] bg-[#FFFBF5] shadow-xs">
          <div className="flex items-center justify-between text-[#C2410C] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Needs Rev.</span>
            <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl font-black text-[#C2410C] font-mono tabular-nums">{counts.NEEDS_REVISION || 0}</div>
          <p className="text-[10px] text-[#C2410C] mt-0.5 uppercase">Student Action</p>
        </div>

        <div className="bg-[#0f172a] p-4 border border-[#86EFAC] bg-[#F0FDF4] shadow-xs">
          <div className="flex items-center justify-between text-[#166534] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-2xl font-black text-[#166534] font-mono tabular-nums">{counts.APPROVED || 0}</div>
          <p className="text-[10px] text-[#15803D] mt-0.5 uppercase">Admitted</p>
        </div>

        <div className="bg-[#0f172a] p-4 border border-[#FCA5A5] bg-[#FEF2F2] shadow-xs">
          <div className="flex items-center justify-between text-[#991B1B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="text-2xl font-black text-[#991B1B] font-mono tabular-nums">{counts.REJECTED || 0}</div>
          <p className="text-[10px] text-[#991B1B] mt-0.5 uppercase">Ineligible</p>
        </div>

        <div className="bg-[#0f172a] p-4 border border-[#1e293b] shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#382B20] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">QR Scans</span>
            <QrCode className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-2xl font-black text-[#382B20] font-mono tabular-nums">{stats?.totalScans || 0}</div>
          <p className="text-[10px] text-[#94a3b8] mt-0.5 uppercase">
            {stats?.activeCampaignsCount || 0} Campaigns
          </p>
        </div>
      </div>

      {/* Microsoft-Style Tab Navigation */}
      <div className="flex items-center border-b-2 border-[#1e293b] bg-[#0f172a]">
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'applications'
              ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
              : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#020617]'
          }`}
        >
          <UserCheck className={`w-4 h-4 ${activeSubTab === 'applications' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
          <span>Applications Directory ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'payments'
              ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
              : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#020617]'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeSubTab === 'payments' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
          <span>Dragonpay & Collections</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banking')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'banking'
              ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
              : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#020617]'
          }`}
        >
          <Landmark className={`w-4 h-4 ${activeSubTab === 'banking' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
          <span>Banking & Depository</span>
        </button>

        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
              : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#020617]'
          }`}
        >
          <QrCode className={`w-4 h-4 ${activeSubTab === 'campaigns' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
          <span>QR Campaign Manager</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'audit'
              ? 'border-[#8b5cf6] text-[#f8fafc] bg-[#FAF6EE]'
              : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#020617]'
          }`}
        >
          <History className={`w-4 h-4 ${activeSubTab === 'audit' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
          <span>System Audit Ledger</span>
        </button>
      </div>

      {/* SUBTAB 1: Applications Data Table */}
      {activeSubTab === 'applications' && (
        <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-xs space-y-4 p-5">
          {/* Table Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Search reference or student name (e.g. ENR-2026-000101)..."
                className="w-full pl-9 pr-3.5 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] placeholder-[#A89885] font-mono focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#64748b]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#382B20] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]"
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
          <div className="overflow-x-auto border border-[#1e293b]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] border-b border-[#1e293b] text-[#523F2D] font-bold uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#0f172a]">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#64748b]">
                      No admissions records matching current search parameters.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#020617] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#f8fafc]">
                        {app.referenceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#f8fafc]">{app.applicantName}</div>
                        <div className="text-[11px] font-mono text-[#64748b]">{app.applicantEmail}</div>
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
                      <td className="px-4 py-3 text-[#94a3b8] font-mono">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6EE] text-[#382B20] hover:bg-[#382B20] hover:text-[#FFFBEB] border border-[#1e293b] hover:border-[#a855f7] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
      )}

      {/* SUBTAB 2: Dragonpay & Fee Collections */}
      {activeSubTab === 'payments' && (
        <AdminPaymentsTab adminToken={token} adminRole={user.role} />
      )}

      {/* SUBTAB 3: QR Campaigns Manager */}
      {activeSubTab === 'campaigns' && (
        <QRCampaignManager adminToken={token} adminRole={user.role} />
      )}

      {/* SUBTAB 4: System Audit Log */}
      {activeSubTab === 'audit' && (
        <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#0f172a] pb-3">
            <div>
              <h3 className="text-base font-black text-[#f8fafc] uppercase tracking-wide">
                Institutional Audit Ledger
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Immutable, tamper-evident audit records logging status transitions, evaluations, and uploads.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
              {auditLogs.length} Records
            </span>
          </div>

          <div className="overflow-x-auto border border-[#1e293b]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] border-b border-[#1e293b] text-[#523F2D] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Actor</th>
                  <th className="px-4 py-2.5">Action Executed</th>
                  <th className="px-4 py-2.5">Entity</th>
                  <th className="px-4 py-2.5">Audit Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f172a]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#020617]">
                      <td className="px-4 py-2.5 font-mono text-[#94a3b8]">
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
                      <td className="px-4 py-2.5 font-mono text-[#94a3b8]">
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
      )}

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
