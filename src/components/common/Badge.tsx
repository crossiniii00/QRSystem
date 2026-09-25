import React from 'react';
import { ApplicationStatus, APPLICATION_STATUS_METADATA } from '../../modules/applications/domain/application-status.enum';

interface BadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const meta = APPLICATION_STATUS_METADATA[status as ApplicationStatus] || {
    label: status,
    color: 'slate',
  };

  // Microsoft-style sharp enterprise status styling: light brown, yellow, white base with crisp borders
  const statusStyles: Record<string, { container: string; indicator: string }> = {
    slate: {
      container: 'bg-[#F4EFE6] text-[#4A3E31] border-[#D6C7B2]',
      indicator: 'bg-[#8C7A65]',
    },
    blue: {
      container: 'bg-[#FDF8EE] text-[#785412] border-[#E8D4A2]',
      indicator: 'bg-[#D97706]', // Yellow/gold accent
    },
    amber: {
      container: 'bg-[#FEF9C3] text-[#713F12] border-[#FDE047]',
      indicator: 'bg-[#CA8A04]',
    },
    orange: {
      container: 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
      indicator: 'bg-[#EA580C]',
    },
    emerald: {
      container: 'bg-[#F2F8F0] text-[#1E5627] border-[#C8E1C2]',
      indicator: 'bg-[#22863A]',
    },
    rose: {
      container: 'bg-[#FDF2F2] text-[#991B1B] border-[#F8C4C4]',
      indicator: 'bg-[#DC2626]',
    },
    purple: {
      container: 'bg-[#F9F5FB] text-[#581C87] border-[#E9D5FF]',
      indicator: 'bg-[#9333EA]',
    },
  };

  const current = statusStyles[meta.color] || statusStyles.slate;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
    md: 'px-2.5 py-0.5 text-xs font-semibold tracking-wide',
    lg: 'px-3 py-1 text-xs font-bold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase font-mono ${current.container} ${sizeStyles[size]}`}
    >
      <span className={`w-1.5 h-1.5 shrink-0 ${current.indicator}`} />
      <span>{meta.label}</span>
    </span>
  );
};
