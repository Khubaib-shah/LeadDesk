/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewTab, RailFilter } from '../../types';
import {
  Menu,
  X,
  Home,
  Users,
  Plus,
  Clock,
  Kanban,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Flame,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa6';

interface MobileNavProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  activeFilter: RailFilter;
  onFilterChange: (filter: RailFilter) => void;
  followUpsCount: number;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onOpenHelp: () => void;
  onClearDemoData: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const NAV_ITEMS: Array<{ id: ViewTab; label: string }> = [
  { id: 'HOME', label: 'HOME' },
  { id: 'LEADS', label: 'LEADS' },
  { id: 'PIPELINE', label: 'PIPELINE' },
  { id: 'FOLLOW-UPS', label: 'FOLLOW-UPS' },
  { id: 'ANALYTICS', label: 'ANALYTICS' },
];

const QUICK_FILTERS: Array<{ id: RailFilter; label: string; icon: React.ReactNode }> = [
  { id: 'ALL', label: 'All Leads', icon: <Users size={14} /> },
  { id: 'DUE_TODAY', label: 'Due Today', icon: <Clock size={14} /> },
  { id: 'HOT', label: 'Hot Leads', icon: <Flame size={14} /> },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: <FaWhatsapp size={14} /> },
  { id: 'INSTAGRAM', label: 'Instagram', icon: <FaInstagram size={14} /> },
  { id: 'TIKTOK', label: 'TikTok', icon: <FaTiktok size={13} /> },
  { id: 'WON', label: 'Won Deals', icon: <Trophy size={14} /> },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  activeFilter,
  onFilterChange,
  followUpsCount,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenTemplates,
  onOpenHelp,
  onClearDemoData,
  isDark,
  onToggleTheme,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const handleNavClick = (tab: ViewTab) => {
    onTabChange(tab);
    setIsDrawerOpen(false);
  };

  const handleFilterSelect = (filter: RailFilter) => {
    onFilterChange(filter);
    if (activeTab !== 'LEADS' && activeTab !== 'HOME') {
      onTabChange('LEADS');
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* 1. Mobile & Tablet Minimal Top Header: Logo on left, [+] & [☰] on right */}
      <header className="fixed top-3 inset-x-3 sm:top-4 sm:inset-x-6 z-40 xl:hidden flex items-center justify-between pointer-events-none">
        {/* Logo Tile Button */}
        <motion.button
          type="button"
          onClick={() => onTabChange('HOME')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          aria-label="LeadDesk Home"
          className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-[16px] bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_20px_rgba(20,22,26,0.06)] cursor-pointer transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-ink"
          >
            <path
              d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 11.5L11.5 14L15.5 9.5"
              stroke="#D4F56B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
          {/* Circular + Button (Quick Add) */}
          <motion.button
            type="button"
            onClick={onOpenQuickAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Quick Add Lead"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_20px_rgba(20,22,26,0.06)] cursor-pointer hover:border-ink/20 transition-colors"
          >
            <Plus size={21} strokeWidth={2.4} />
          </motion.button>

          {/* Circular Hamburger Button */}
          <motion.button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open Navigation Menu"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_20px_rgba(20,22,26,0.06)] cursor-pointer hover:border-ink/20 transition-colors"
          >
            <Menu size={20} strokeWidth={2.2} />
          </motion.button>
        </div>
      </header>

      {/* 2. Floating Bottom Tab Bar: ICONS ONLY (No text labels) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3.5 inset-x-0 mx-auto z-40 xl:hidden w-[min(90%,360px)] h-14 bg-surface/95 backdrop-blur-md border border-border-subtle/80 rounded-full shadow-[0_8px_32px_rgba(20,22,26,0.12)] px-3 flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => onTabChange('HOME')}
          className={`flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors ${
            activeTab === 'HOME' ? 'text-ink bg-surface-subtle font-bold' : 'text-ink-secondary hover:text-ink'
          }`}
          aria-label="Home"
        >
          <Home size={20} strokeWidth={activeTab === 'HOME' ? 2.4 : 1.8} />
        </button>

        <button
          type="button"
          onClick={() => onTabChange('LEADS')}
          className={`flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors ${
            activeTab === 'LEADS' ? 'text-ink bg-surface-subtle font-bold' : 'text-ink-secondary hover:text-ink'
          }`}
          aria-label="Leads"
        >
          <Users size={20} strokeWidth={activeTab === 'LEADS' ? 2.4 : 1.8} />
        </button>

        {/* Center Lime + Button */}
        <motion.button
          type="button"
          onClick={onOpenQuickAdd}
          whileTap={{ scale: 0.92 }}
          className="w-11 h-11 rounded-full bg-lime text-[#14161A] flex items-center justify-center shadow-md cursor-pointer font-bold"
          aria-label="Quick Add Lead"
        >
          <Plus size={22} strokeWidth={3} className="text-[#14161A]" />
        </motion.button>

        <button
          type="button"
          onClick={() => onTabChange('FOLLOW-UPS')}
          className={`relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors ${
            activeTab === 'FOLLOW-UPS' ? 'text-ink bg-surface-subtle font-bold' : 'text-ink-secondary hover:text-ink'
          }`}
          aria-label="Follow-ups"
        >
          <Clock size={20} strokeWidth={activeTab === 'FOLLOW-UPS' ? 2.4 : 1.8} />
          {followUpsCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-lime text-[#14161A] font-bold text-[9px] flex items-center justify-center shadow-xs">
              {followUpsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('PIPELINE')}
          className={`flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors ${
            activeTab === 'PIPELINE' ? 'text-ink bg-surface-subtle font-bold' : 'text-ink-secondary hover:text-ink'
          }`}
          aria-label="Pipeline"
        >
          <Kanban size={20} strokeWidth={activeTab === 'PIPELINE' ? 2.4 : 1.8} />
        </button>
      </nav>

      {/* 3. Slide-over Sidebar Drawer: Left-to-right, 40% width on tablet/small screen */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
              aria-hidden="true"
            />

            {/* Drawer Panel: 40% width on tablet/screens (w-[80%] sm:w-[50%] md:w-[40%] max-w-[360px]) */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 h-full w-[80%] sm:w-[50%] md:w-[40%] max-w-[360px] bg-surface border-r border-border-subtle shadow-2xl flex flex-col justify-between p-6 sm:p-7 overflow-y-auto z-10"
              aria-label="Sidebar Navigation"
            >
              {/* Top Section: Header & Nav Links matching reference */}
              <div>
                {/* Header row: Logo & Close Button */}
                <div className="flex items-center justify-between pb-6 border-b border-border-subtle/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-surface-subtle border border-border-subtle flex items-center justify-center text-ink font-bold shadow-xs">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 11.5L11.5 14L15.5 9.5"
                          stroke="#D4F56B"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">LeadDesk</p>
                      <p className="text-[11px] text-ink-muted">Personal CRM</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-ink-secondary hover:text-ink transition-colors cursor-pointer"
                    aria-label="Close navigation menu"
                  >
                    <X size={18} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Uppercase Navigation links matching image_657d0ac3.png */}
                <nav className="mt-6 space-y-4" aria-label="Main Pages">
                  {NAV_ITEMS.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between text-left py-2 px-1 text-sm font-bold tracking-[0.12em] uppercase transition-colors cursor-pointer ${
                          isActive
                            ? 'text-ink font-extrabold'
                            : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-lime ring-2 ring-lime/20" />
                          )}
                          {item.label}
                        </span>
                        {item.id === 'FOLLOW-UPS' && followUpsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-lime text-[#14161A] text-[11px] font-bold">
                            {followUpsCount}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Templates Nav Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenTemplates();
                    }}
                    className="w-full flex items-center justify-between text-left py-2 px-1 text-sm font-bold tracking-[0.12em] uppercase text-ink-secondary hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>TEMPLATES</span>
                  </button>
                </nav>

                {/* Quick Lead Filters Section */}
                <div className="mt-8 pt-6 border-t border-border-subtle/80">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-ink-muted mb-3 px-1">
                    Quick Filters
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_FILTERS.map(f => {
                      const isFilterActive = activeFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleFilterSelect(isFilterActive && f.id !== 'ALL' ? 'ALL' : f.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            isFilterActive
                              ? 'bg-lime text-[#14161A] font-bold shadow-xs'
                              : 'bg-surface-subtle text-ink-secondary hover:text-ink border border-border-subtle/60'
                          }`}
                        >
                          {f.icon}
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Section: 3 Pill Buttons matching image_657d0ac3.png */}
              <div className="pt-6 border-t border-border-subtle/80 space-y-2.5">
                {/* Pill 1: Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full h-11 rounded-full border border-border-subtle flex items-center justify-center gap-2 text-xs font-bold tracking-[0.08em] uppercase text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  <Settings size={15} className="text-ink-secondary" />
                  <span>SETTINGS</span>
                </button>

                {/* Pill 2: Help & Shortcuts */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenHelp();
                  }}
                  className="w-full h-11 rounded-full border border-border-subtle flex items-center justify-center gap-2 text-xs font-bold tracking-[0.08em] uppercase text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  <HelpCircle size={15} className="text-ink-secondary" />
                  <span>HELP & SHORTCUTS</span>
                </button>

                {/* Pill 3: Theme Toggle Pill with centered Sun/Moon icon */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                  className="w-full h-11 rounded-full border border-border-subtle flex items-center justify-center text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  {isDark ? (
                    <div className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase">
                      <Sun size={17} strokeWidth={2} />
                      <span>LIGHT MODE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase">
                      <Moon size={17} strokeWidth={2} />
                      <span>DARK MODE</span>
                    </div>
                  )}
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
