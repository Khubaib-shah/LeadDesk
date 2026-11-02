/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Share2, Video, Snowflake, AlertOctagon } from 'lucide-react';
import { ViewTab, RailFilter } from '../../types';

interface MoreInsightsCardProps {
  onNavigateTab: (tab: ViewTab) => void;
  onFilterChange: (filter: RailFilter) => void;
  goingColdCount: number;
}

export const MoreInsightsCard: React.FC<MoreInsightsCardProps> = ({
  onNavigateTab,
  onFilterChange,
  goingColdCount,
}) => {
  const items = [
    {
      label: 'Leads by Source',
      sub: 'WhatsApp, TikTok, IG breakdown',
      icon: <Share2 size={15} className="text-ink-secondary" />,
      action: () => onNavigateTab('ANALYTICS'),
    },
    {
      label: 'Top-Performing Content',
      sub: 'Videos & posts generating deals',
      icon: <Video size={15} className="text-ink-secondary" />,
      action: () => onNavigateTab('ANALYTICS'),
    },
    {
      label: 'Going Cold Leads',
      sub: `${goingColdCount} uncontacted >7 days`,
      badge: goingColdCount > 0 ? `${goingColdCount}` : undefined,
      icon: <Snowflake size={15} className="text-semantic-cold" />,
      action: () => onNavigateTab('LEADS'),
    },
    {
      label: 'Lost Reasons Analysis',
      sub: 'Pricing, timing, scope gaps',
      icon: <AlertOctagon size={15} className="text-ink-secondary" />,
      action: () => onNavigateTab('ANALYTICS'),
    },
  ];

  return (
    <div className="rounded-[20px] p-6 bg-surface border border-border-subtle/80 flex flex-col justify-between shadow-xs">
      <div>
        <h3 className="text-lg font-semibold text-ink tracking-tight">More Insights</h3>
        <p className="text-xs text-ink-muted mb-4">Deep analytics and channel performance</p>

        <div className="flex flex-col gap-2.5">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={item.action}
              className="w-full h-11 px-3 bg-surface hover:bg-[#F7F9F9] dark:hover:bg-surface-subtle border border-border-subtle/60 rounded-[14px] flex items-center justify-between transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F3F5F6] dark:bg-canvas flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-ink group-hover:text-ink transition-colors block leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-ink-muted leading-tight">{item.sub}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-semantic-cold/20 text-[#2B6CB0]">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} className="text-ink-disabled group-hover:text-ink transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle/50 mt-4 text-[11px] text-ink-muted flex items-center justify-between">
        <span>Analysis updated live</span>
        <button
          type="button"
          onClick={() => onNavigateTab('ANALYTICS')}
          className="font-bold text-ink hover:underline cursor-pointer"
        >
          View all metrics →
        </button>
      </div>
    </div>
  );
};
