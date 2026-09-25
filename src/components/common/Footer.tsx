import { Building2, Mail, Phone, Shield } from 'lucide-react';
import React from 'react';
import { APP_CONFIG } from '../../config/app.config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#261E16] text-[#D4C5B3] text-xs py-8 mt-auto border-t border-[#3D3024]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 bg-[#F59E0B]" />
              <h4 className="text-white font-bold text-sm tracking-wide uppercase">{APP_CONFIG.school.name}</h4>
            </div>
            <p className="text-[#A89885] mb-3 text-xs leading-relaxed">{APP_CONFIG.school.tagline}</p>
            <div className="flex items-center gap-2 text-[#C2B29F] text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{APP_CONFIG.school.address}</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-2 border-b border-[#3D3024] pb-1">
              Admissions Office
            </h4>
            <div className="space-y-1.5 text-xs text-[#C2B29F]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                <a href={`mailto:${APP_CONFIG.school.contactEmail}`} className="hover:text-[#FBBF24] transition-colors">
                  {APP_CONFIG.school.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{APP_CONFIG.school.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>FERPA & Institutional Privacy Standards</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-2 border-b border-[#3D3024] pb-1">
              Data Privacy & Security
            </h4>
            <p className="text-[#A89885] leading-relaxed text-[11px]">
              {APP_CONFIG.privacyPolicyNotice}
            </p>
          </div>
        </div>

        <div className="border-t border-[#3D3024] pt-4 flex flex-col sm:flex-row items-center justify-between text-[#8A7967] text-[11px]">
          <p>© {new Date().getFullYear()} {APP_CONFIG.school.name}. All institutional rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
            <span>Terms of Admission</span>
            <span>·</span>
            <span>Security Statement</span>
            <span>·</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
