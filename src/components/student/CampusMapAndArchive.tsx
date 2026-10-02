import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import { CampusCarousel } from './CampusCarousel';
import { InteractiveCampusMap } from './InteractiveCampusMap';

export const CampusMapAndArchive: React.FC = () => {
  return (
    <div className="w-full pb-24 md:pb-32 bg-white relative overflow-hidden border-t border-[#D5CFC4]">
      {/* Background architectural elements */}
      <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-[#FAF6EE] z-0 hidden lg:block -skew-x-6 origin-top-right transform translate-x-12" />
      
      {/* Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 pt-24">
        <div className="flex flex-col lg:flex-row justify-between items-end border-b-2 border-[#D97706] pb-8">
          <div>
            <h3 className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#D97706] uppercase mb-4 flex items-center gap-3">
              <span className="w-12 h-px bg-[#D97706]"></span>
              Campus & Facilities
            </h3>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#2E2016] font-black tracking-tight leading-[0.9]">
              Explore the <br />Grounds
            </h2>
          </div>
          <p className="text-sm text-[#8C7A68] font-medium max-w-md text-right hidden lg:block mt-6 lg:mt-0 leading-relaxed border-l-2 border-[#D97706] pl-6">
            A comprehensive visual and spatial directory of our historic 140-acre Franciscan Heights campus.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        {/* 1. Visual Showcase Carousel (Overlapping Container) */}
        <div className="relative group">
          {/* Decorative frame */}
          <div className="absolute -inset-4 bg-white border border-[#D5CFC4] shadow-[0_20px_50px_rgba(0,0,0,0.05)] z-0 transition-all duration-700 group-hover:-inset-6 group-hover:bg-[#FAF6EE] hidden md:block" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#EBE3D5] pb-3 mb-6">
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <div className="bg-[#2E2016] p-2">
                <Camera className="w-4 h-4 text-[#D97706]" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#2E2016]">
                Visual Archive
              </span>
            </div>
            <span className="text-[10px] text-[#8C7A68] font-bold tracking-widest uppercase">140 Acres</span>
          </div>
          
          <div className="relative z-10 shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-[#EBE3D5]">
            <CampusCarousel />
          </div>
        </div>

        {/* 2. Interactive Campus Architectural Map & Grounds Blueprint */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-[#FAF6EE] border border-[#EBE3D5] z-0 transition-all duration-700 group-hover:-inset-6 hidden md:block" />
          
          <div className="relative z-10 flex items-center justify-between border-b border-[#D5CFC4] pb-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#D97706] p-2">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#2E2016]">
                Interactive Architecture Map
              </span>
            </div>
          </div>
          
          <div className="relative z-10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] bg-white p-2 md:p-6 border border-[#D5CFC4]">
             <InteractiveCampusMap />
          </div>
        </div>
      </div>
    </div>
  );
};
