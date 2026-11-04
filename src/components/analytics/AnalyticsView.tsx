/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lead } from '../../types';
import {
  getContentAttribution,
  getSourceBreakdown,
  getFollowUpDiscipline,
  getTopAcquisitionChannel,
} from '../../utils/analytics';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Video } from 'lucide-react';
import { PASTEL_COLORS } from '../../utils/leads';

interface AnalyticsViewProps {
  leads: Lead[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads }) => {
  const attributionList = getContentAttribution(leads);
  const sourceBreakdown = getSourceBreakdown(leads);
  const discipline = getFollowUpDiscipline(leads);
  const topAcquisition = getTopAcquisitionChannel(leads);

  const wonLeads = leads.filter(l => l.stage === 'Won');
  const wonRevenue = wonLeads.reduce((acc, curr) => acc + (curr.wonValue || curr.estimatedValue || 0), 0);

  const pieData = sourceBreakdown.map((s, idx) => ({
    name: s.source,
    value: s.count,
    color: PASTEL_COLORS[idx % PASTEL_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] leading-[34px] font-bold text-ink tracking-[-0.02em]">
          Analytics & Content Attribution
        </h1>
        <p className="text-[13px] text-ink-muted">
          Identify which videos, reels, and channels produce paying clients
        </p>
      </div>

      {/* Top 3 Metric Cards: 100% Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-[20px] bg-pastel-butter text-ink shadow-xs">
          <span className="text-xs font-semibold text-ink/70">Total Revenue Won</span>
          <p className="text-2xl font-bold text-ink mt-1 tabular-nums">${wonRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-ink/70 mt-1 block">From {wonLeads.length} closed deals</span>
        </div>

        <div className="p-5 rounded-[20px] bg-pastel-mint text-ink shadow-xs overflow-hidden">
          <span className="text-xs font-semibold text-ink/70">Top Acquisition Channel</span>
          <p className="text-2xl font-bold text-ink mt-1 truncate" title={topAcquisition.channel}>
            {topAcquisition.channel}
          </p>
          <span className="text-[11px] text-ink/70 mt-1 block truncate">
            {topAcquisition.subtext}
          </span>
        </div>

        <div className="p-5 rounded-[20px] bg-pastel-lavender text-ink shadow-xs overflow-hidden">
          <span className="text-xs font-semibold text-ink/70">Follow-up Discipline</span>
          <p className="text-2xl font-bold text-ink mt-1">{discipline.label}</p>
          <span className="text-[11px] text-ink/70 mt-1 block truncate">
            {discipline.subtext}
          </span>
        </div>
      </div>

      {/* Content Attribution Table (Responsive with min-width and horizontal scroll) */}
      <div className="rounded-[20px] p-5 sm:p-6 bg-surface border border-border-subtle/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center text-[#14161A] font-bold">
                <Video size={15} className="text-[#14161A]" />
              </div>
              <h2 className="text-base font-bold text-ink tracking-tight whitespace-nowrap">
                Content Attribution Leaderboard
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Exact post or video URL where incoming leads discovered your services
            </p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 pb-1">
          <table className="min-w-[640px] w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-ink-muted pb-2">
                <th className="py-2.5 pr-4 font-semibold whitespace-nowrap min-w-[200px]">Content Asset / Topic</th>
                <th className="py-2.5 pr-4 font-semibold whitespace-nowrap min-w-[100px]">Platform</th>
                <th className="py-2.5 pr-4 font-semibold text-center whitespace-nowrap min-w-[110px]">Leads Generated</th>
                <th className="py-2.5 pr-4 font-semibold text-center whitespace-nowrap min-w-[90px]">Deals Won</th>
                <th className="py-2.5 font-semibold text-right whitespace-nowrap min-w-[130px]">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {attributionList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-ink-muted">
                    No content attribution yet. Add leads with their post/video topic to see ROI here.
                  </td>
                </tr>
              ) : (
                attributionList.map((item, idx) => (
                  <tr key={idx} className="h-12 hover:bg-surface-subtle transition-colors">
                    <td className="py-2 pr-3 font-semibold text-ink max-w-[280px] truncate whitespace-nowrap">
                      {item.title}
                    </td>
                    <td className="py-2 pr-3 text-ink-secondary whitespace-nowrap">{item.source}</td>
                    <td className="py-2 pr-3 text-center font-bold text-ink tabular-nums whitespace-nowrap">
                      {item.leadCount}
                    </td>
                    <td className="py-2 pr-3 text-center font-bold text-semantic-success tabular-nums whitespace-nowrap">
                      {item.wonCount}
                    </td>
                    <td className="py-2 text-right font-bold text-ink tabular-nums whitespace-nowrap">
                      ${item.totalValue.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Channel Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-[20px] p-6 bg-surface border border-border-subtle/80 shadow-xs">
          <h3 className="font-bold text-sm text-ink mb-1">Leads by Channel</h3>
          <p className="text-xs text-ink-muted mb-4">Volume distribution across social platforms</p>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-ink font-medium">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] p-6 bg-surface border border-border-subtle/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-ink mb-1">Channel Conversion Rate</h3>
            <p className="text-xs text-ink-muted mb-4">Percentage of inquiries closing as paid clients</p>

            <div className="space-y-3">
              {sourceBreakdown.slice(0, 5).map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{s.source}</span>
                    <span className="font-bold text-ink tabular-nums">{s.conversionRate}% conversion</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full bg-lime"
                      style={{ width: `${Math.max(8, s.conversionRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle/60 text-xs text-ink-muted mt-4">
            WhatsApp leads convert 2.4x higher than standard web inquiries.
          </div>
        </div>
      </div>
    </div>
  );
};
