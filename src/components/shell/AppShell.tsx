/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogoTile } from './LogoTile';
import { NavPill } from './NavPill';
import { TopRightCluster } from './TopRightCluster';
import { LeftRail } from './LeftRail';
import { BottomLeftButtons } from './BottomLeftButtons';
import { MobileNav } from './MobileNav';
import { ViewTab, RailFilter } from '../../types';
import { X } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  activeFilter: RailFilter;
  onFilterChange: (filter: RailFilter) => void;
  dueTodayCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  userName?: string;
  userRole?: string;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onOpenHelp: () => void;
  onClearDemoData: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onTabChange,
  activeFilter,
  onFilterChange,
  dueTodayCount,
  isDark,
  onToggleTheme,
  userName,
  userRole,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenTemplates,
  onOpenHelp,
  onClearDemoData,
}) => {
  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors duration-200 relative">
      {/* Desktop Floating Shell Components */}
      <LogoTile onClick={() => onTabChange('HOME')} />

      <NavPill
        activeTab={activeTab}
        onTabChange={onTabChange}
        followUpsCount={dueTodayCount}
      />

      <TopRightCluster
        dueTodayCount={dueTodayCount}
        userName={userName}
        userRole={userRole}
        onNavigateFollowUps={() => onTabChange('FOLLOW-UPS')}
        onOpenQuickAdd={onOpenQuickAdd}
        onOpenSettings={onOpenSettings}
        onOpenTemplates={onOpenTemplates}
        onOpenHelp={onOpenHelp}
        onClearDemoData={onClearDemoData}
      />

      <LeftRail activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <BottomLeftButtons
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onOpenHelp={onOpenHelp}
      />

      {/* Mobile & Tablet Shell Component */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        followUpsCount={dueTodayCount}
        onOpenQuickAdd={onOpenQuickAdd}
        onOpenSettings={onOpenSettings}
        onOpenTemplates={onOpenTemplates}
        onOpenHelp={onOpenHelp}
        onClearDemoData={onClearDemoData}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Content Area: fluid width without arbitrary max-w restriction */}
      <main className="w-full min-h-screen pt-[76px] sm:pt-[84px] xl:pt-[96px] pb-24 xl:pb-12 px-4 sm:px-6 md:px-8 xl:pl-[104px] xl:pr-10">
        {/* Soft top gradient fade mask so content scrolls gracefully under floating pills */}
        <div className="hidden xl:block pointer-events-none fixed top-0 inset-x-0 h-14 bg-gradient-to-b from-canvas via-canvas/90 to-transparent z-30" />

        {/* Global Active Filter Banner if not ALL */}
        {activeFilter !== 'ALL' && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-ink-muted">Filtered by:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lime text-[#14161A] shadow-xs">
              <span className="text-[#14161A]">{activeFilter.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => onFilterChange('ALL')}
                className="hover:opacity-75 cursor-pointer ml-1 text-[#14161A]"
                aria-label="Clear quick filter"
              >
                <X size={12} strokeWidth={3} className="text-[#14161A]" />
              </button>
            </span>
          </div>
        )}

        {children}
      </main>
    </div>
  );
};
