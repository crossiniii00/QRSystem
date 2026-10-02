"use client";

import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

interface CalendarPageProps {
  onBack: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onBack }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const events = [
    {
      month: "October 2026",
      items: [
        { date: "Oct 15", title: "Fall Open House & Campus Tour", time: "9:00 AM - 2:00 PM", location: "Main Quad & Admissions Center", type: "Admissions" },
        { date: "Oct 22", title: "Distinguished Alumni Lecture Series", time: "6:30 PM - 8:30 PM", location: "Grand Auditorium", type: "Academic" },
        { date: "Oct 28", title: "Midterm Examinations Begin", time: "All Day", location: "Campus Wide", type: "Academic" },
      ]
    },
    {
      month: "November 2026",
      items: [
        { date: "Nov 05", title: "International Student Mixer", time: "4:00 PM - 7:00 PM", location: "Student Union Hall", type: "Social" },
        { date: "Nov 12", title: "Winter Gala Registration Deadline", time: "5:00 PM", location: "Online Portal", type: "Administrative" },
        { date: "Nov 25", title: "Thanksgiving Recess", time: "Nov 25 - Nov 29", location: "No Classes", type: "Holiday" },
      ]
    },
    {
      month: "December 2026",
      items: [
        { date: "Dec 10", title: "Final Examinations Begin", time: "All Day", location: "Campus Wide", type: "Academic" },
        { date: "Dec 18", title: "Winter Commencement Ceremony", time: "10:00 AM - 1:00 PM", location: "University Stadium", type: "Graduation" },
        { date: "Dec 20", title: "Winter Recess Begins", time: "All Day", location: "Campus Wide", type: "Holiday" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Header Section */}
      <div className="bg-[#1C0E07] relative py-20 px-4 md:px-8 overflow-hidden border-b-4 border-[#D97706]">
        <div className="absolute inset-0 bg-[url('/school-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C0E07] to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <button 
            onClick={onBack}
            className="self-start flex items-center gap-2 text-[#D97706] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706] text-[10px] font-bold uppercase tracking-[0.25em] mb-6">
            <CalendarIcon className="w-4 h-4" />
            AY {APP_CONFIG.school.academicYear}
          </div>
          <h1 className={`text-4xl md:text-6xl font-serif font-medium text-white tracking-widest uppercase mb-6 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Academic Calendar <br />
            <span className="text-[#D97706]">& Events</span>
          </h1>
          <p className="text-[#C9B9A6] max-w-2xl text-lg md:text-xl font-serif italic">
            Stay informed with the latest academic schedules, collegiate events, and important administrative deadlines.
          </p>
        </div>
      </div>

      {/* Calendar Grid View (Google Calendar Style) */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        
        {/* Calendar Controls Header */}
        <div className={`flex flex-col sm:flex-row items-center justify-between mb-8 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <h2 className="text-3xl font-serif font-medium text-[#1C0E07]">October 2026</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-[#EBE3D5] text-[#2E2016] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF6EE] transition-colors">
              Today
            </button>
            <div className="flex items-center bg-white border border-[#EBE3D5] rounded-sm overflow-hidden">
              <button className="px-3 py-2 hover:bg-[#FAF6EE] text-[#8C7A68] hover:text-[#D97706] transition-colors border-r border-[#EBE3D5]">
                &lt;
              </button>
              <button className="px-3 py-2 hover:bg-[#FAF6EE] text-[#8C7A68] hover:text-[#D97706] transition-colors">
                &gt;
              </button>
            </div>
            <select className="ml-4 px-4 py-2 bg-white border border-[#EBE3D5] text-[#2E2016] text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:border-[#D97706]">
              <option>Month</option>
              <option>Week</option>
              <option>Day</option>
            </select>
          </div>
        </div>

        {/* The Grid */}
        <div className={`bg-white border border-[#EBE3D5] shadow-xl transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#EBE3D5] bg-[#FAF6EE]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold text-[#8C7A68] uppercase tracking-widest border-r border-[#EBE3D5] last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body (October 2026 - starts on Thursday) */}
          <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-[#EBE3D5] gap-[1px] border-b border-[#EBE3D5]">
            
            {/* Empty slots for Mon, Tue, Wed */}
            {['28', '29', '30'].map((day, i) => (
              <div key={`empty-${i}`} className="bg-[#FCFBF9] p-2 opacity-50">
                <span className="text-xs text-[#A69B8F] font-serif">{day}</span>
              </div>
            ))}

            {/* Actual Days of October */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              // Dummy Events Mapping
              const events = [];
              if (day === 15) events.push({ title: "Open House", color: "bg-[#D97706] text-white" });
              if (day === 22) events.push({ title: "Alumni Lecture", color: "bg-[#4A2818] text-white" });
              if (day === 28) events.push({ title: "Midterms", color: "bg-[#E5A910]/20 text-[#4A2818] border border-[#E5A910]" });
              if (day === 31) events.push({ title: "Halloween Gala", color: "bg-[#2E2016] text-white" });

              const isToday = day === 12; // Just a dummy "today" marker

              return (
                <div key={day} className="bg-white p-2 flex flex-col group hover:bg-[#FAF6EE] transition-colors cursor-pointer relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-serif flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-[#D97706] text-white font-bold' : 'text-[#2E2016]'}`}>
                      {day}
                    </span>
                  </div>
                  
                  {/* Event Chips */}
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
                    {events.map((ev, i) => (
                      <div key={i} className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 truncate rounded-sm shadow-sm ${ev.color}`}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty slots for end of month (Nov 1) */}
            <div className="bg-[#FCFBF9] p-2 opacity-50">
              <span className="text-xs text-[#A69B8F] font-serif">1</span>
            </div>
          </div>
        </div>

        {/* Academic Catalog Download */}
        <div className={`mt-24 p-10 bg-[#1C0E07] border border-[#D97706] text-center transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h3 className="font-serif text-2xl text-white mb-4">Download Academic Calendar</h3>
          <p className="text-[#C9B9A6] max-w-lg mx-auto mb-8 text-sm">
            Access the complete academic catalog and events schedule for the {APP_CONFIG.school.academicYear} academic year in PDF format.
          </p>
          <button className="bg-[#D97706] hover:bg-[#F59E0B] text-[#1C0E07] font-bold text-xs uppercase tracking-widest py-3 px-8 transition-colors">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
