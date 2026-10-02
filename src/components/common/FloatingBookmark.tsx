"use client";

import React, { useState } from 'react';
import { Bookmark, ChevronRight, X, GraduationCap, Calendar, MapPin, Search } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const FloatingBookmark: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Bookmark Tab */}
      <div 
        className={`fixed top-1/3 right-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center bg-[#1C0E07] shadow-[-8px_0_20px_rgba(0,0,0,0.3)] border-2 border-[#D97706] border-r-0 rounded-l-sm hover:bg-[#2A150D] transition-all group w-12 h-16 hover:-translate-x-1"
          aria-label="Open Dashboard"
        >
          <Bookmark className="w-5 h-5 text-[#D97706] group-hover:scale-110 transition-transform group-hover:fill-[#D97706]/20" />
        </button>
      </div>

      {/* Side Dashboard Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Dashboard Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-[#FAF6EE] shadow-2xl z-[60] border-l-4 border-[#1C0E07] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="bg-[#1C0E07] text-[#FFFDF7] p-6 flex items-center justify-between border-b-2 border-[#D97706] shrink-0">
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-[#D97706]" />
            <h2 className="font-serif text-xl font-bold tracking-widest uppercase">
              Dashboard
            </h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div>
            <h3 className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest mb-4">
              Quick Links
            </h3>
            <div className="space-y-3">
              {[
                { icon: Search, label: "Find a Program" },
                { icon: Calendar, label: "Academic Calendar" },
                { icon: MapPin, label: "Campus Map & Tours" },
                { icon: GraduationCap, label: "Alumni Network" },
              ].map((link, idx) => (
                <button key={idx} className="w-full flex items-center gap-3 p-3 bg-white border border-[#EBE3D5] hover:border-[#D97706] group transition-colors text-left">
                  <div className="w-8 h-8 bg-[#FAF6EE] flex items-center justify-center border border-[#EBE3D5] group-hover:bg-[#1C0E07] transition-colors shrink-0">
                    <link.icon className="w-4 h-4 text-[#8C7A68] group-hover:text-[#D97706] transition-colors" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#2E2016]">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#D97706] ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-[#1C0E07] border border-[#D97706]">
            <h3 className="font-serif text-lg text-white mb-2">Need Assistance?</h3>
            <p className="text-xs text-[#C9B9A6] mb-4 leading-relaxed">
              Our admissions counselors are available Monday through Friday, 9:00 AM to 5:00 PM EST.
            </p>
            <button className="w-full py-2.5 bg-[#D97706] hover:bg-[#F59E0B] text-[#1E0F08] font-bold text-xs uppercase tracking-widest transition-colors">
              Contact Admissions
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
