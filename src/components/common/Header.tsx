"use client";

import { GraduationCap, Lock, Search, ShieldCheck, BookOpen, Library, ChevronRight, User, Menu, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { CollegeCrest } from './Crest';

interface HeaderProps {
  activeTab: 'home' | 'apply' | 'status' | 'admin' | 'library' | 'about' | 'academics' | 'calendar';
  setActiveTab: (tab: 'home' | 'apply' | 'status' | 'admin' | 'library' | 'about' | 'academics' | 'calendar') => void;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const navItems = [
    { 
      id: 'about', 
      label: 'About Us',
      dropdown: [
        { id: 'about', label: 'Vision & Mission' },
        { id: 'spiritual-formation', label: 'Spiritual Formation' },
        { id: 'legacy', label: 'Our Legacy' },
        { id: 'leadership', label: 'Leadership' }
      ]
    },
    { id: 'academics', label: 'Our Academic Life' },
    { 
      id: 'campus-life', 
      label: 'Our Campus Life',
      dropdown: [
        { id: 'campus-life', label: 'Events & Media' },
        { id: 'campus-map', label: 'Campus Map' },
        { id: 'projects', label: 'On Going Projects' }
      ]
    },
    { id: 'library', label: 'Our Library' },
    { id: 'spiritual-formation', label: 'Our Spiritual Life' }
  ];

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    setActiveTab('home');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1C0E07] border-b-2 border-[#D97706] shadow-xl select-none">
      {/* 1. Top Academic Utility Ribbon (Clean, Centered, Proportional) */}
      <div className="bg-[#120905] text-[#A89885] text-[10px] px-4 sm:px-6 lg:px-8 h-8 border-b border-[#2C150B]/50 flex items-center shadow-inner">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Crest Motto */}
          <div className="flex items-center gap-3 font-medium whitespace-nowrap">
            <span className="font-serif text-[#D97706] tracking-[0.2em] uppercase font-bold">
              {APP_CONFIG.school.name}
            </span>
            <span className="text-[#3A2216] hidden sm:inline">|</span>
            <span className="font-serif italic text-[#C4B59D] hidden sm:inline">
              Veritas et Caritas • Established 1948
            </span>
            <span className="text-[#3A2216] hidden md:inline">|</span>
            <span className="text-[#A89885] hidden md:inline tracking-wider">
              Campus Heights, MA • Fall Term in Session
            </span>
          </div>

          {/* Right: Staff Portal / Admin Actions */}
          <div className="flex items-center gap-4 whitespace-nowrap">
            {adminUser ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                  <span className="font-bold uppercase tracking-wider text-[#C4B59D]">{adminUser.fullName.split(' ')[0]}</span>
                  <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#D97706] text-[#1C0E07] rounded-sm">
                    {adminUser.role}
                  </span>
                </div>
                <span className="text-[#3A2216]">|</span>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="font-bold hover:text-[#FFFDF7] uppercase tracking-wider transition-colors text-[#C4B59D]"
                >
                  Dashboard
                </button>
                <span className="text-[#3A2216]">|</span>
                <button
                  onClick={onLogout}
                  className="font-bold text-[#DC2626] hover:text-[#EF4444] uppercase tracking-wider transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1.5 font-bold hover:text-[#FFFDF7] uppercase tracking-wider transition-colors text-[#C4B59D]"
              >
                <Lock className="w-3 h-3 text-[#D97706]" />
                Staff Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Collegiate Navigation Bar (Exact Proportional Alignment) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 xl:gap-6">
          {/* Brand Identity (Left Column - Locked & Vertically Centered) */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group py-1 shrink-0 whitespace-nowrap"
          >
            <CollegeCrest size={46} className="group-hover:opacity-95 transition-opacity drop-shadow-md shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-display text-xl sm:text-2xl xl:text-[26px] font-semibold tracking-widest text-[#FFFDF7] group-hover:text-[#D97706] transition-colors leading-[1.1] uppercase">
                {APP_CONFIG.school.name}
              </span>
              <span className="text-[8.5px] xl:text-[9.5px] font-bold tracking-[0.25em] text-[#D97706] uppercase font-sans mt-0.5 opacity-90">
                Liberal Arts • Sciences • Governance
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center space-x-0.5 2xl:space-x-1 shrink-0 ml-auto mr-4">
            {navItems.map(item => (
              <div key={item.id} className="relative h-full flex items-center group/nav">
                <button 
                  onClick={() => item.id === 'library' ? setActiveTab('library') : handleNavClick(item.id)} 
                  className="relative h-full flex items-center justify-center px-4 2xl:px-5 text-[11px] 2xl:text-[12px] font-bold uppercase tracking-[0.15em] whitespace-nowrap text-[#C4B59D] hover:text-[#FFFDF7] transition-colors"
                >
                  {item.label}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#D97706] transition-all duration-300 group-hover/nav:w-1/2"></div>
                </button>
                
                {item.dropdown && (
                  <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-48 bg-[#1C0E07] border border-[#2C150B] shadow-2xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 flex flex-col py-2 z-50 transform translate-y-2 group-hover/nav:translate-y-0 before:content-[''] before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                    {item.dropdown.map(subItem => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavClick(subItem.id)}
                        className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#C4B59D] hover:text-[#FFFDF7] hover:bg-[#2C150B] transition-colors whitespace-nowrap"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Action Dropdown Button & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0" ref={dropdownRef}>
            <button
              onClick={() => handleNavClick('support')}
              className="hidden md:flex group relative overflow-hidden bg-[#D97706] text-[#1C0E07] hover:text-[#FFFDF7] px-6 py-2.5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all duration-500 items-center gap-2"
            >
              <div className="absolute inset-0 w-full h-full bg-[#B45309] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Support Us</span>
            </button>
            <div className="relative h-full hidden md:flex items-center">
              <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className="group relative overflow-hidden bg-transparent border border-[#D97706]/80 text-[#D97706] hover:text-[#1C0E07] px-6 py-2.5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2"
            >
              <div className="absolute inset-0 w-full h-full bg-[#D97706] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Enroll Now</span>
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
              </div>
            )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="xl:hidden flex items-center justify-center p-2 text-[#C4B59D] hover:text-[#FFFDF7] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`xl:hidden absolute top-full left-0 w-full bg-[#1C0E07] border-b-2 border-[#D97706] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-6">
          {navItems.map(item => (
            <div key={item.id} className="flex flex-col">
              <button 
                onClick={() => {
                  if (!item.dropdown) {
                    item.id === 'library' ? setActiveTab('library') : handleNavClick(item.id);
                  }
                }}
                className={`text-left text-lg font-bold uppercase tracking-widest ${item.dropdown ? 'text-[#D97706]' : 'text-[#FFFDF7]'}`}
              >
                {item.label}
              </button>
              {item.dropdown && (
                <div className="flex flex-col gap-3 mt-3 pl-4 border-l-2 border-[#2C150B]">
                  {item.dropdown.map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavClick(subItem.id)}
                      className="text-left text-sm font-medium uppercase tracking-wider text-[#C4B59D] hover:text-[#FFFDF7] transition-colors"
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="h-px bg-[#2C150B] my-2 w-full" />
          
          {/* Mobile Portals Action */}
          <button
            onClick={() => { setActiveTab('apply'); setIsMobileMenuOpen(false); }}
            className="w-full bg-[#D97706] text-white py-4 font-bold text-sm tracking-[0.2em] uppercase rounded-sm"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </header>
  );
};
