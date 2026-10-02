import React from 'react';

interface CrestProps {
  className?: string;
  size?: number;
  showMotto?: boolean;
}

export const CollegeCrest: React.FC<CrestProps> = ({ 
  className = "w-12 h-12", 
  size = 48,
  showMotto = false 
}) => {
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <div 
        className="rounded-full overflow-hidden bg-white shadow-sm border border-[#FFFDF7]/10"
        style={{ width: size, height: size }}
      >
        <img
          src="/logo.jpg"
          alt="St. Francis College Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showMotto && (
        <span className="mt-1 font-collegiate-display text-[9px] uppercase tracking-widest text-[#E5A910] font-semibold">
          Veritas et Caritas
        </span>
      )}
    </div>
  );
};
