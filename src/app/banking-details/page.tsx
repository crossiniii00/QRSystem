"use client";

import React, { useState } from 'react';
import { ArrowLeft, Building2, Landmark, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { CollegeCrest } from '../../components/common/Crest';

export default function BankingDetailsPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#1C0E07] relative font-sans text-[#FFFDF7]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1548625361-ec8590bfcfb7?q=80&w=1600" 
          alt="Chapel Background" 
          className="w-full h-full object-cover opacity-10 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C0E07]/90 via-[#1C0E07]/80 to-[#1C0E07]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b-2 border-[#D97706] py-5 px-4 sm:px-6 lg:px-8 bg-[#1C0E07]/90 backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-4 group">
            <CollegeCrest size={50} className="group-hover:opacity-95 transition-opacity drop-shadow-md shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-widest text-[#FFFDF7] group-hover:text-[#D97706] transition-colors leading-[1.1] uppercase">
                St. Francis College
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-[#D97706] uppercase font-sans mt-0.5 opacity-90">
                Endowments & Giving
              </span>
            </div>
          </Link>

          {/* Action Button */}
          <Link 
            href="/" 
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#D97706]/50 text-[#D97706] hover:bg-[#D97706] hover:text-[#1C0E07] text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Main Site</span>
          </Link>

        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-12 px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#FFFDF7] mb-6 tracking-tight drop-shadow-lg">
            Banking & Endowment
          </h2>
          <p className="text-[#C4B59D] max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Your generosity makes a profound difference. Course your donations through our official channels and submit your details below for proper acknowledgment.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Banking Details */}
          <div className="space-y-6">
            <div className="bg-[#FAF6EE] p-8 md:p-10 shadow-2xl border-l-4 border-[#D97706] rounded-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBE7E0] rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-md shadow-sm p-1.5 flex items-center justify-center shrink-0 border border-[#EBE7E0]">
                    <img 
                      src="/bdo-logo.svg" 
                      alt="BDO Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#2E2016] uppercase tracking-wider">Local Bank Transfer</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#54483C]">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[#8C7A68] mb-1">Bank Name</span>
                    <strong className="text-base text-[#2E2016]">BDO Unibank, Inc.</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[#8C7A68] mb-1">Account Number</span>
                    <strong className="text-base text-[#2E2016] font-mono tracking-widest">0012-3456-7890</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] uppercase tracking-widest text-[#8C7A68] mb-1">Account Name</span>
                    <strong className="text-base text-[#2E2016]">St. Francis College (Allen) Inc.</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] uppercase tracking-widest text-[#8C7A68] mb-1">Branch</span>
                    <strong className="text-base text-[#2E2016]">Allen, Northern Samar Branch</strong>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column: Donation Form */}
          <div className="bg-[#FAF6EE] p-8 md:p-10 shadow-2xl border border-[#EBE7E0] rounded-sm">
            <h3 className="text-2xl font-serif font-black text-[#2E2016] mb-2 uppercase tracking-wide">
              Remittance Form
            </h3>
            <p className="text-sm text-[#8C7A68] mb-8">
              Please fill up this form and attach your proof of remittance so we can properly acknowledge your gift.
            </p>

            {isSubmitted ? (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-8 text-center rounded-sm flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-[#16A34A] mb-4" />
                <h4 className="text-xl font-bold text-[#166534] mb-2">Thank You for Your Generosity!</h4>
                <p className="text-[#15803D] text-sm leading-relaxed">
                  Your donation details and proof of remittance have been successfully submitted. Our finance office will review and send you an official acknowledgment soon.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-sm font-bold text-[#16A34A] hover:underline uppercase tracking-wider"
                >
                  Submit Another Document
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest">Full Name / Org</label>
                    <input required type="text" className="w-full bg-white border border-[#D5CFC4] p-3 text-sm text-[#2E2016] focus:outline-none focus:border-[#D97706] transition-colors" placeholder="e.g. Juan Dela Cruz" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest">Email Address</label>
                    <input required type="email" className="w-full bg-white border border-[#D5CFC4] p-3 text-sm text-[#2E2016] focus:outline-none focus:border-[#D97706] transition-colors" placeholder="juan@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest">Alumni Batch Year</label>
                    <input type="text" className="w-full bg-white border border-[#D5CFC4] p-3 text-sm text-[#2E2016] focus:outline-none focus:border-[#D97706] transition-colors" placeholder="e.g. 1987 (Optional)" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest">Ref / Trx Number</label>
                    <input required type="text" className="w-full bg-white border border-[#D5CFC4] p-3 text-sm text-[#2E2016] focus:outline-none focus:border-[#D97706] transition-colors" placeholder="Transaction ID" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest">Proof of Remittance</label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-[#D5CFC4] border-dashed bg-[#FFFDF7] hover:bg-white transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-[#D97706] mb-2 group-hover:scale-110 transition-transform" />
                      <p className="mb-1 text-xs text-[#8C7A68]"><span className="font-semibold text-[#D97706]">Click to upload</span> or drag and drop</p>
                      <p className="text-[10px] text-[#A89885]">PNG, JPG or PDF (MAX. 5MB)</p>
                    </div>
                    <input required type="file" className="hidden" />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest">Remarks / Note</label>
                  <textarea rows={3} className="w-full bg-white border border-[#D5CFC4] p-3 text-sm text-[#2E2016] focus:outline-none focus:border-[#D97706] transition-colors" placeholder="Any special instructions or dedications for this gift?"></textarea>
                </div>

                <button type="submit" className="w-full bg-[#D97706] hover:bg-[#F59E0B] text-white py-4 font-bold uppercase tracking-[0.2em] text-sm transition-all shadow-[0_10px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_15px_30px_rgba(217,119,6,0.5)]">
                  Submit Details
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
