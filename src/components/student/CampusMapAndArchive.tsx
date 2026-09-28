import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import { CampusCarousel } from './CampusCarousel';
import { InteractiveCampusMap } from './InteractiveCampusMap';

export const CampusMapAndArchive: React.FC = () => {
  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. Visual Showcase Carousel */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D5CFC4] pb-2">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#855D1E]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#855D1E]">
              Campus Visual Archive & Grounds
            </span>
          </div>
          <span className="text-xs text-[#A89885] font-mono">140 Acres in Franciscan Heights</span>
        </div>
        <CampusCarousel />
      </div>

      {/* 2. Interactive Campus Architectural Map & Grounds Blueprint */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-16">
        <div className="flex items-center justify-between border-b border-[#D5CFC4] pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#855D1E]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#855D1E]">
              Interactive Campus Map & Building Directory
            </span>
          </div>
        </div>
        <div className="bg-[#FAF8F5] p-2 border border-[#EBE3D5] shadow-lg">
           <InteractiveCampusMap />
        </div>
      </div>
    </div>
  );
};
