"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CAMPUS_GALLERY_PHOTOS } from '../../data/mockData';
import { CampusPhotoSlide } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MapPin,
  Maximize2,
  Calendar,
  Sparkles,
  Camera,
  X
} from 'lucide-react';

interface CampusCarouselProps {
  onExploreCampus?: () => void;
  className?: string;
}

export const CampusCarousel: React.FC<CampusCarouselProps> = ({
  onExploreCampus,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = CAMPUS_GALLERY_PHOTOS[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % CAMPUS_GALLERY_PHOTOS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + CAMPUS_GALLERY_PHOTOS.length) % CAMPUS_GALLERY_PHOTOS.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (isPlaying && !isFullscreen) {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPlaying, isFullscreen]);

  return (
    <div className={`relative bg-[#1A0E08] border-2 border-[#E5A910] text-[#FFFDF7] shadow-xl overflow-hidden ${className}`}>
      {/* Top Banner Tag */}
      <div className="bg-[#23120B] px-4 py-2 border-b border-[#3D2314] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-[#E5A910]" />
          <span className="font-collegiate-display text-xs uppercase font-bold tracking-wider text-[#E5A910]">
            The Franciscan Campus Experience
          </span>
          <span className="text-stone-500 hidden sm:inline">•</span>
          <span className="text-stone-400 hidden sm:inline text-[11px]">
            140 Historic Acres in Franciscan Heights
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-400 font-mono text-[11px]">
            {currentIndex + 1} / {CAMPUS_GALLERY_PHOTOS.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-stone-400 hover:text-[#E5A910] transition-colors p-1"
            title={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="text-stone-400 hover:text-white transition-colors p-1 hidden sm:inline-block"
            title="Inspect in full view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div
        className="relative h-[320px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden bg-black"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Current Image */}
        <img
          key={currentSlide.id}
          src={currentSlide.imageUrl}
          alt={currentSlide.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-700 ease-out transform scale-100"
        />

        {/* Ambient Gradient Overlays for Harvard/Collegiate Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140804] via-[#140804]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#140804]/60 via-transparent to-transparent pointer-events-none" />

        {/* Left / Right Nav Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#23120B]/80 hover:bg-[#E5A910] text-stone-200 hover:text-[#1E0F08] border border-stone-600 hover:border-[#E5A910] flex items-center justify-center transition-all backdrop-blur-xs"
          aria-label="Previous campus photograph"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#23120B]/80 hover:bg-[#E5A910] text-stone-200 hover:text-[#1E0F08] border border-stone-600 hover:border-[#E5A910] flex items-center justify-center transition-all backdrop-blur-xs"
          aria-label="Next campus photograph"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Floating Slide Details & Captions */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 pointer-events-none">
          <div className="max-w-2xl space-y-2 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#E5A910] text-[#1E0F08] font-bold text-[10px] uppercase tracking-wider">
                {currentSlide.category}
              </span>
              <span className="px-2.5 py-0.5 bg-[#23120B]/90 text-stone-300 border border-stone-700 text-[10px] font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#E5A910]" />
                <span>{currentSlide.location}</span>
              </span>
              {currentSlide.seasonTag && (
                <span className="px-2 py-0.5 bg-black/50 text-stone-300 text-[10px] border border-stone-700 hidden sm:inline-block">
                  {currentSlide.seasonTag}
                </span>
              )}
            </div>

            <h3 className="font-collegiate-display text-xl sm:text-3xl font-bold text-[#FFFDF7] drop-shadow-md leading-tight">
              {currentSlide.title}
            </h3>

            <p className="font-collegiate-serif text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed max-w-xl drop-shadow-xs">
              {currentSlide.description}
            </p>

            {onExploreCampus && (
              <div className="pt-1">
                <button
                  onClick={onExploreCampus}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-[#E5A910] hover:text-[#1E0F08] text-white border border-stone-400 hover:border-[#E5A910] font-bold text-[11px] uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Blueprint & Map</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip (Microsoft Sharp Grid Layout) */}
      <div className="bg-[#140804] p-3 border-t border-[#331A0F] grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CAMPUS_GALLERY_PHOTOS.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(idx)}
            className={`group relative h-14 sm:h-16 overflow-hidden border text-left transition-all ${currentIndex === idx
                ? 'border-[#E5A910] ring-1 ring-[#E5A910] opacity-100'
                : 'border-stone-800 opacity-60 hover:opacity-90'
              }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-1 left-1 right-1">
              <p className="text-[9px] font-bold text-white truncate drop-shadow-xs">
                {slide.title}
              </p>
            </div>
            {currentIndex === idx && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E5A910]" />
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen Inspector Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#E5A910] tracking-widest block">
                St. Francis College Quadrangle Visual Archive
              </span>
              <h2 className="font-collegiate-display text-lg sm:text-xl font-bold">
                {currentSlide.title}
              </h2>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] max-w-full object-contain border border-stone-800 shadow-2xl"
            />
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-[#E5A910] hover:text-black text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-[#E5A910] hover:text-black text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-[#1C0E07] p-4 border border-[#3D2314] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[#E5A910] font-bold block">{currentSlide.subtitle}</span>
              <p className="text-stone-300">{currentSlide.description}</p>
            </div>
            <span className="text-stone-400 font-mono text-[11px] shrink-0">
              Location: {currentSlide.location}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
