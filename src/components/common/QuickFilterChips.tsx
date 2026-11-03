/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { RailFilter, Lead } from '../../types';
import { Users, Clock, Flame, Trophy } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { isFollowUpDueToday } from '../../utils/leads';

interface QuickFilterChipsProps {
  leads: Lead[];
  activeFilter: RailFilter;
  onFilterChange: (filter: RailFilter) => void;
  className?: string;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  leads,
  activeFilter,
  onFilterChange,
  className = '',
}) => {
  const counts = useMemo(() => {
    const active = leads.filter(l => !l.archived);
    return {
      ALL: active.length,
      DUE_TODAY: active.filter(l => isFollowUpDueToday(l.nextFollowUpAt)).length,
      HOT: active.filter(l => l.temperature === 'Hot').length,
      WHATSAPP: active.filter(l => l.source === 'WhatsApp').length,
      INSTAGRAM: active.filter(l => l.source === 'Instagram').length,
      TIKTOK: active.filter(l => l.source === 'TikTok').length,
      WON: active.filter(l => l.stage === 'Won').length,
    };
  }, [leads]);

  const items: Array<{ id: RailFilter; label: string; icon: React.ReactNode; count: number }> = [
    { id: 'ALL', label: 'All Leads', icon: <Users size={13} strokeWidth={2.2} />, count: counts.ALL },
    { id: 'DUE_TODAY', label: 'Due Today', icon: <Clock size={13} strokeWidth={2.2} className="text-amber-500" />, count: counts.DUE_TODAY },
    { id: 'HOT', label: 'Hot Leads', icon: <Flame size={13} strokeWidth={2.4} className="text-orange-500" />, count: counts.HOT },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: <FaWhatsapp size={13} className="text-[#25D366]" />, count: counts.WHATSAPP },
    { id: 'INSTAGRAM', label: 'Instagram', icon: <FaInstagram size={13} className="text-[#E4405F]" />, count: counts.INSTAGRAM },
    { id: 'TIKTOK', label: 'TikTok', icon: <FaTiktok size={12} />, count: counts.TIKTOK },
    { id: 'WON', label: 'Won Deals', icon: <Trophy size={13} strokeWidth={2.2} className="text-emerald-500" />, count: counts.WON },
  ];

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
        {items.map(item => {
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange(isActive && item.id !== 'ALL' ? 'ALL' : item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-lime text-[#14161A] font-bold shadow-xs'
                  : 'bg-surface hover:bg-surface-subtle text-ink-secondary hover:text-ink border border-border-subtle/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-[#14161A]/10 text-[#14161A]' : 'bg-surface-subtle text-ink-muted'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
