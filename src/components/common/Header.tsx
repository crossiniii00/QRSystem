"use client";

import { GraduationCap, Lock, Search, ShieldCheck, BookOpen, Library, ChevronRight } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { APP_CONFIG } from '../../config/app.config';

interface HeaderProps {
  activeTab: 'home' | 'apply' | 'status' | 'admin' | 'library' | 'about' | 'academics';
  setActiveTab: (tab: 'home' | 'apply' | 'status' | 'admin' | 'library' | 'about' | 'academics') => void;
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
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveTab('home');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#17100B] shadow-2xl select-none border-b-2 border-[#D97706]">
      {/* Top micro-bar for alerts or campaigns */}
      {activeCampaignName && (
        <div className="bg-[#D97706] text-[#2E2016] text-[10px] font-black uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-2">
          <span>Priority Admissions Enabled</span>
          <span className="hidden sm:inline-block">— via {activeCampaignName}</span>
        </div>
      )}

      {/* Main Header Tier */}
      <div className="w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-8 h-8 bg-[#2E2016] flex items-center justify-center text-[#F59E0B] border border-[#543E2C] group-hover:bg-[#3D2B1E] transition-colors">
              <GraduationCap className="w-5 h-5 text-[#D97706]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-[#F8F6F2] tracking-wide text-lg uppercase group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                  {APP_CONFIG.school.name}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center h-full text-[10px] font-bold uppercase tracking-widest text-[#F8F6F2] ml-8 mr-auto">
            <button 
              onClick={() => handleNavClick('about')} 
              className="h-full px-5 flex items-center hover:bg-[#332318] border-b-2 border-transparent hover:border-[#D97706] transition-all"
            >
              Overview
            </button>
            <button 
              onClick={() => handleNavClick('academics')} 
              className="h-full px-5 flex items-center hover:bg-[#332318] border-b-2 border-transparent hover:border-[#D97706] transition-all"
            >
              Academics
            </button>
            <button 
              onClick={() => handleNavClick('campus-life')} 
              className="h-full px-5 flex items-center hover:bg-[#332318] border-b-2 border-transparent hover:border-[#D97706] transition-all"
            >
              Campus Life
            </button>
            <button 
              onClick={() => setActiveTab('library')} 
              className="h-full px-5 flex items-center hover:bg-[#332318] border-b-2 border-transparent hover:border-[#D97706] transition-all"
            >
              Library
            </button>
          </nav>

          {/* Action Dropdown Button */}
          <div className="relative h-full flex items-center" ref={dropdownRef}>
            <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className="bg-[#D97706] hover:bg-[#F59E0B] text-[#17100B] h-9 px-6 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-md"
            >
              Portals & Admissions
            </button>
            
            {/* Dropdown Menu */}
            {isPortalOpen && (
              <div className="absolute top-14 right-0 w-64 bg-white border border-[#EBE7E0] shadow-2xl flex flex-col py-2 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => { setActiveTab('apply'); setIsPortalOpen(false); }}
                  className="px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAF6EE] group transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[#2E2016] uppercase text-xs tracking-wider">Enroll Now</span>
                    <span className="text-[10px] text-[#8C7A68]">New student application</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => { setActiveTab('status'); setIsPortalOpen(false); }}
                  className="px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAF6EE] group transition-colors border-t border-[#F8F6F2]"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[#2E2016] uppercase text-xs tracking-wider">Check Status</span>
                    <span className="text-[10px] text-[#8C7A68]">Track your application</span>
                  </div>
                  <Search className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="border-t-4 border-[#F8F6F2] my-1" />
                
                {adminUser ? (
                  <div className="px-6 py-4 flex flex-col gap-3 bg-[#FAF6EE]">
                    <div className="flex items-center gap-2 text-[#2E2016]">
                      <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                      <span className="text-xs font-bold uppercase tracking-wider">{adminUser.fullName.split(' ')[0]}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#D97706] text-white rounded-sm">
                        {adminUser.role}
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('admin'); setIsPortalOpen(false); }}
                      className="text-left text-xs font-bold text-[#2E2016] hover:text-[#D97706] uppercase tracking-wider"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { onLogout(); setIsPortalOpen(false); }}
                      className="text-left text-[10px] font-bold text-[#DC2626] hover:text-[#B91C1C] uppercase tracking-wider mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setActiveTab('admin'); setIsPortalOpen(false); }}
                    className="px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAF6EE] group transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[#2E2016] uppercase text-xs tracking-wider">Staff Portal</span>
                      <span className="text-[10px] text-[#8C7A68]">Admin & Faculty login</span>
                    </div>
                    <Lock className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
