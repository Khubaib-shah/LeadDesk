/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Settings, FileText, Download, RotateCcw, Keyboard, HelpCircle } from 'lucide-react';
import { ViewTab } from '../../types';

interface TopRightClusterProps {
  dueTodayCount: number;
  onNavigateFollowUps: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onOpenHelp: () => void;
  onClearDemoData: () => void;
}

export const TopRightCluster: React.FC<TopRightClusterProps> = ({
  dueTodayCount,
  onNavigateFollowUps,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenTemplates,
  onOpenHelp,
  onClearDemoData,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="fixed top-5 right-5 lg:right-10 z-40 flex items-center gap-3">
      {/* Due Today / All Clear Badge link */}
      <button
        type="button"
        onClick={onNavigateFollowUps}
        className="hidden md:flex items-center gap-2 px-3.5 h-[40px] rounded-full bg-surface border border-border-subtle/80 text-[11px] font-bold tracking-[0.08em] uppercase text-ink-muted hover:text-ink hover:border-ink/20 shadow-[0_1px_2px_rgba(20,22,26,0.04)] transition-all cursor-pointer"
        aria-label="View follow-ups due today"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            dueTodayCount > 0 ? 'bg-semantic-overdue' : 'bg-semantic-success'
          }`}
        />
        <span>{dueTodayCount > 0 ? `DUE TODAY · ${dueTodayCount}` : 'ALL CLEAR'}</span>
      </button>

      {/* 48px Circular + Button (Quick Add) */}
      <motion.button
        type="button"
        onClick={onOpenQuickAdd}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        aria-label="Quick Add Lead (Shortcut: N)"
        title="Quick Add Lead (N)"
        className="w-12 h-12 rounded-full bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)] cursor-pointer hover:border-ink/20 transition-colors"
      >
        <Plus size={22} strokeWidth={2.4} />
      </motion.button>

      {/* 48px Circular User Button & Dropdown Menu */}
      <div className="relative" ref={menuRef}>
        <motion.button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          aria-label="User account and settings menu"
          aria-expanded={menuOpen}
          className="w-12 h-12 rounded-full bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)] cursor-pointer hover:border-ink/20 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-pastel-butter text-ink flex items-center justify-center font-bold text-xs select-none">
            Z
          </div>
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 p-1.5 bg-surface border border-border-subtle rounded-2xl shadow-xl z-50 text-ink"
            >
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-xs font-bold text-ink">Zubair</p>
                <p className="text-[11px] text-ink-muted">Software Engineer & Creator</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-surface-subtle transition-colors cursor-pointer text-left"
              >
                <Settings size={15} className="text-ink-secondary" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenTemplates();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-surface-subtle transition-colors cursor-pointer text-left"
              >
                <FileText size={15} className="text-ink-secondary" />
                <span>Message Templates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHelp();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-surface-subtle transition-colors cursor-pointer text-left"
              >
                <Keyboard size={15} className="text-ink-secondary" />
                <span>Shortcuts & Tips (?)</span>
              </button>

              <div className="h-px bg-border-subtle my-1" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onClearDemoData();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-semantic-overdue hover:bg-semantic-overdue/10 transition-colors cursor-pointer text-left"
              >
                <RotateCcw size={15} />
                <span>Reset / Clear Demo Data</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
