/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { format } from 'date-fns';
import { Lead, ViewTab, RailFilter } from '../../types';
import { calculateDashboardMetrics, getWeeklyChartData } from '../../utils/analytics';
import { KpiCard } from './KpiCard';
import { TodayFollowUpsCard } from './TodayFollowUpsCard';
import { BarChartCard } from './BarChartCard';
import { MoreInsightsCard } from './MoreInsightsCard';
import { NextUpCard } from './NextUpCard';
import { RecentLeadsCard } from './RecentLeadsCard';
import { HotLeadsCard } from './HotLeadsCard';
import { Search, Bell, Users, Clock, Target } from 'lucide-react';

interface HomeViewProps {
  leads: Lead[];
  onNavigateTab: (tab: ViewTab) => void;
  onFilterChange: (filter: RailFilter) => void;
  onOpenQuickAdd: () => void;
  onOpenLead: (lead: Lead) => void;
  onOpenCommandPalette: () => void;
  onStartFocusMode: () => void;
  onDoneFollowUp: (lead: Lead) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  leads,
  onNavigateTab,
  onFilterChange,
  onOpenQuickAdd,
  onOpenLead,
  onOpenCommandPalette,
  onStartFocusMode,
  onDoneFollowUp,
}) => {
  const metrics = calculateDashboardMetrics(leads);

  // Next up lead: either due today or earliest overdue
  const nextUpLead = leads.find(
    l => (l.stage !== 'Won' && l.stage !== 'Lost') && l.nextFollowUpAt
  );

  const hotLeads = leads.filter(l => l.temperature === 'Hot' && l.stage !== 'Won');
  const recentLeads = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formattedDate = format(new Date(), "do MMM yyyy");

  const handleExportCsv = () => {
    const headers = ['Full Name', 'WhatsApp', 'Source', 'Purpose', 'Stage', 'Value', 'Next Follow-up'];
    const rows = leads.map(l => [
      `"${l.fullName || 'Lead'}"`,
      `"${l.whatsappNumber}"`,
      `"${l.source}"`,
      `"${l.purpose}"`,
      `"${l.stage}"`,
      `"${l.estimatedValue || ''}"`,
      `"${l.nextFollowUpAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leaddesk-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Row matching Screenshot 2: Dashboard, date, right: search & bell buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-ink tracking-[-0.02em]">
            Dashboard
          </h1>
          <p className="text-[13px] leading-[18px] text-ink-muted mt-0.5">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* 44x44 Search Button with ⌘K */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title="Search Leads & Actions (⌘K or /)"
            aria-label="Search"
            className="w-11 h-11 rounded-[14px] bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-xs hover:border-ink/20 cursor-pointer transition-colors"
          >
            <Search size={18} strokeWidth={2.2} />
          </button>

          {/* 44x44 Notification Button with dot */}
          <button
            type="button"
            onClick={() => onNavigateTab('FOLLOW-UPS')}
            title="Follow-ups and notifications"
            aria-label="Notifications"
            className="relative w-11 h-11 rounded-[14px] bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-xs hover:border-ink/20 cursor-pointer transition-colors"
          >
            <Bell size={18} strokeWidth={2.2} />
            {metrics.followUpsDueCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-semantic-overdue ring-2 ring-surface" />
            )}
          </button>
        </div>
      </div>

      {/* Main 12-Column Grid (9 columns main + 3 columns right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAIN COLUMN (9 Columns) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Row 1: 3 Pastel KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Lavender: New leads */}
            <KpiCard
              title="New Leads"
              value={metrics.newLeadsCount}
              caption="From current month"
              delta={metrics.newLeadsDeltaPct}
              bgHex="#C9C3F5"
              icon={<Users size={15} strokeWidth={2.4} />}
              onClick={() => onNavigateTab('LEADS')}
            />

            {/* Sky: Follow-ups due */}
            <KpiCard
              title="Follow-ups Due"
              value={metrics.followUpsDueCount}
              caption={`${metrics.dueTodayCount} today · ${metrics.overdueCount} overdue`}
              bgHex="#A9C8FA"
              icon={<Clock size={15} strokeWidth={2.4} />}
              onClick={() => onNavigateTab('FOLLOW-UPS')}
            />

            {/* Mint: Conversion rate */}
            <KpiCard
              title="Conversion Rate"
              value={`${metrics.conversionRatePct}%`}
              caption={`Won ${metrics.wonCount} leads · $${metrics.wonTotalValue.toLocaleString()}`}
              delta={metrics.conversionDeltaPct}
              bgHex="#92E2B3"
              icon={<Target size={15} strokeWidth={2.4} />}
              onClick={() => onNavigateTab('PIPELINE')}
            />
          </div>

          {/* Row 2: Bar Chart + More Insights */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <BarChartCard leads={leads} onExportCsv={handleExportCsv} />
            </div>
            <div className="md:col-span-5">
              <MoreInsightsCard
                onNavigateTab={onNavigateTab}
                onFilterChange={onFilterChange}
                goingColdCount={metrics.goingColdCount}
              />
            </div>
          </div>

          {/* Row 3: Recent Leads Table */}
          <RecentLeadsCard
            leads={recentLeads}
            onViewAll={() => onNavigateTab('LEADS')}
            onOpenLead={onOpenLead}
          />
        </div>

        {/* RIGHT COLUMN (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Teal Feature Card: Today's follow-ups */}
          <TodayFollowUpsCard
            dueTodayCount={metrics.dueTodayCount}
            overdueCount={metrics.overdueCount}
            onStartFocusMode={onStartFocusMode}
          />

          {/* Next Up Meeting/Lead card */}
          <NextUpCard
            lead={nextUpLead}
            onDone={onDoneFollowUp}
            onOpenLead={onOpenLead}
          />

          {/* Hot Leads card styled like Team Member */}
          <HotLeadsCard
            hotLeads={hotLeads}
            onOpenLead={onOpenLead}
            onOpenQuickAdd={onOpenQuickAdd}
          />
        </div>
      </div>
    </div>
  );
};
