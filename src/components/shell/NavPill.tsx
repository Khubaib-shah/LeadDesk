/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ViewTab } from '../../types';

interface NavPillProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  followUpsCount: number;
}

const TABS: Array<{ id: ViewTab; label: string }> = [
  { id: 'HOME', label: 'HOME' },
  { id: 'LEADS', label: 'LEADS' },
  { id: 'PIPELINE', label: 'PIPELINE' },
  { id: 'FOLLOW-UPS', label: 'FOLLOW-UPS' },
  { id: 'ANALYTICS', label: 'ANALYTICS' },
];

export const NavPill: React.FC<NavPillProps> = ({ activeTab, onTabChange, followUpsCount }) => {
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed top-5 left-[84px] z-40 hidden lg:flex items-center h-[48px] p-1 bg-surface border border-border-subtle/80 rounded-full shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)]"
    >
      <div className="flex items-center gap-0.5">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="relative px-4 h-10 flex items-center justify-center rounded-full text-[13px] font-semibold tracking-[0.08em] select-none cursor-pointer text-ink transition-colors focus-visible:outline-2 focus-visible:outline-ink"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-active-chip rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-ink font-bold' : 'text-ink-secondary hover:text-ink'}`}>
                {tab.label}
                {tab.id === 'FOLLOW-UPS' && followUpsCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold rounded-full bg-lime text-ink"
                    aria-label={`${followUpsCount} follow-ups due`}
                  >
                    {followUpsCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
