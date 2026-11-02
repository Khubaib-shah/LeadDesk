/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ViewTab, RailFilter } from '../../types';
import { Home, Users, Plus, Clock, Kanban, Flame, Trophy } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa6';

interface MobileNavProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  activeFilter: RailFilter;
  onFilterChange: (filter: RailFilter) => void;
  followUpsCount: number;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

const MOBILE_FILTERS: Array<{ id: RailFilter; label: string; icon: React.ReactNode }> = [
  { id: 'ALL', label: 'All', icon: <Users size={12} /> },
  { id: 'DUE_TODAY', label: 'Due Today', icon: <Clock size={12} /> },
  { id: 'HOT', label: 'Hot', icon: <Flame size={12} /> },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: <FaWhatsapp size={12} /> },
  { id: 'INSTAGRAM', label: 'Instagram', icon: <FaInstagram size={12} /> },
  { id: 'TIKTOK', label: 'TikTok', icon: <FaTiktok size={11} /> },
  { id: 'WON', label: 'Won', icon: <Trophy size={12} /> },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  activeFilter,
  onFilterChange,
  followUpsCount,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenHelp,
}) => {
  return (
    <>
      {/* Mobile Top Floating Bar */}
      <header className="fixed top-3 inset-x-3 z-40 lg:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 h-12 bg-surface/90 backdrop-blur-md border border-border-subtle/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-ink font-bold shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M9 11.5L11.5 14L15.5 9.5" stroke="#D4F56B" strokeWidth="2.4" />
              </svg>
            </div>
            <span className="text-sm font-bold text-ink tracking-tight uppercase">{activeTab}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-full bg-pastel-butter text-ink flex items-center justify-center font-bold text-xs cursor-pointer"
              aria-label="Open User Settings"
            >
              Z
            </button>
          </div>
        </div>

        {/* Scrollable quick filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 snap-x">
          {MOBILE_FILTERS.map(f => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(isActive && f.id !== 'ALL' ? 'ALL' : f.id)}
                className={`snap-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-lime text-[#14161A] font-bold shadow-xs'
                    : 'bg-surface/90 text-ink-secondary border border-border-subtle/80 backdrop-blur-sm'
                }`}
              >
                {f.icon}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-0 mx-auto z-40 lg:hidden w-[min(92%,400px)] h-16 bg-surface/95 backdrop-blur-md border border-border-subtle/80 rounded-full shadow-[0_8px_32px_rgba(20,22,26,0.12)] px-3 flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => onTabChange('HOME')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-colors ${
            activeTab === 'HOME' ? 'text-ink font-bold' : 'text-ink-secondary'
          }`}
          aria-label="Home"
        >
          <Home size={20} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('LEADS')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-colors ${
            activeTab === 'LEADS' ? 'text-ink font-bold' : 'text-ink-secondary'
          }`}
          aria-label="Leads"
        >
          <Users size={20} strokeWidth={activeTab === 'LEADS' ? 2.5 : 2} />
          <span className="text-[10px] mt-0.5">Leads</span>
        </button>

        {/* Center Lime + Button */}
        <motion.button
          type="button"
          onClick={onOpenQuickAdd}
          whileTap={{ scale: 0.92 }}
          className="w-12 h-12 rounded-full bg-lime text-[#14161A] flex items-center justify-center shadow-md -translate-y-2 cursor-pointer font-bold"
          aria-label="Quick Add Lead"
        >
          <Plus size={24} strokeWidth={3} className="text-[#14161A]" />
        </motion.button>

        <button
          type="button"
          onClick={() => onTabChange('FOLLOW-UPS')}
          className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-colors ${
            activeTab === 'FOLLOW-UPS' ? 'text-ink font-bold' : 'text-ink-secondary'
          }`}
          aria-label="Follow-ups"
        >
          <Clock size={20} strokeWidth={activeTab === 'FOLLOW-UPS' ? 2.5 : 2} />
          <span className="text-[10px] mt-0.5">Follow-ups</span>
          {followUpsCount > 0 && (
            <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-lime text-[#14161A] font-bold text-[9px] flex items-center justify-center">
              {followUpsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('PIPELINE')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-colors ${
            activeTab === 'PIPELINE' ? 'text-ink font-bold' : 'text-ink-secondary'
          }`}
          aria-label="Pipeline"
        >
          <Kanban size={20} strokeWidth={activeTab === 'PIPELINE' ? 2.5 : 2} />
          <span className="text-[10px] mt-0.5">Pipeline</span>
        </button>
      </nav>
    </>
  );
};
