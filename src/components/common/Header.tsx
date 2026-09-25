import { GraduationCap, Lock, QrCode, Search, ShieldCheck } from 'lucide-react';
import React from 'react';
import { APP_CONFIG } from '../../config/app.config';

interface HeaderProps {
  activeTab: 'apply' | 'status' | 'admin';
  setActiveTab: (tab: 'apply' | 'status' | 'admin') => void;
  adminUser: { fullName: string; role: string } | null;
  onLogout: () => void;
  activeCampaignName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  adminUser,
  onLogout,
  activeCampaignName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#2E2016] border-b border-[#4A3525] shadow-md select-none">
      {/* Top Office Gold Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#CA8A04] w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Wordmark & Crest */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('apply')}
          >
            <div className="w-8 h-8 bg-[#3D2B1E] flex items-center justify-center text-[#FBBF24] border border-[#543E2C] shadow-xs">
              <GraduationCap className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#FAF6EE] tracking-tight text-sm sm:text-base uppercase">
                  {APP_CONFIG.school.name}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase bg-[#453224] text-[#FDE047] border border-[#6B4F37]">
                  AY {APP_CONFIG.school.academicYear}
                </span>
              </div>
              <span className="text-[11px] text-[#C9B9A6] hidden md:block">
                Admissions & Enrollment Portal
              </span>
            </div>
          </div>

          {/* Microsoft-Style Tab Navigation in Brown Palette */}
          <nav className="flex items-center h-full">
            <button
              onClick={() => setActiveTab('apply')}
              className={`h-14 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'apply'
                  ? 'border-[#F59E0B] text-[#000000] bg-[#422F22]'
                  : 'border-transparent text-[#C9B9A6] hover:text-[#000000] hover:bg-[#3D2B1E]'
              }`}
            >
              <QrCode className={`w-4 h-4 ${activeTab === 'apply' ? 'text-[#F59E0B]' : 'text-[#A89885]'}`} />
              <span>Apply</span>
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`h-14 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'status'
                  ? 'border-[#F59E0B] text-[#000000] bg-[#422F22]'
                  : 'border-transparent text-[#C9B9A6] hover:text-[#000000] hover:bg-[#3D2B1E]'
              }`}
            >
              <Search className={`w-4 h-4 ${activeTab === 'status' ? 'text-[#F59E0B]' : 'text-[#A89885]'}`} />
              <span>Check Status</span>
            </button>

            <div className="h-6 w-px bg-[#543E2C] mx-2" />

            {adminUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`h-9 px-3 text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#F59E0B] text-[#2E2016] border-[#F59E0B]'
                      : 'bg-[#3D2B1E] text-[#FAF6EE] border-[#6B4F37] hover:bg-[#4E3726]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                  <span className="hidden sm:inline">{adminUser.fullName.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 bg-[#F59E0B] text-[#2E2016]">
                    {adminUser.role}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-[#C9B9A6] hover:text-[#F87171] px-2 py-1 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className={`h-9 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-colors cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#F59E0B] text-[#2E2016] border-[#F59E0B]'
                    : 'bg-[#3D2B1E] text-[#FDE047] border-[#6B4F37] hover:bg-[#4E3726] hover:border-[#F59E0B]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Staff Portal</span>
              </button>
            )}
          </nav>
        </div>

        {/* QR Campaign Info Ribbon */}
        {activeCampaignName && (
          <div className="bg-[#FEF9C3] border-t border-b border-[#FDE047] px-4 py-1.5 text-xs text-[#713F12] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#D97706]" />
              <span>
                Enrolling via QR Campaign: <strong>{activeCampaignName}</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#854D0E] uppercase">Campaign Tracking Active</span>
          </div>
        )}
      </div>
    </header>
  );
};
