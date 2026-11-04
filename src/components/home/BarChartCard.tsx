/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DayActivityData, getWeeklyChartData } from '../../utils/analytics';
import { Lead } from '../../types';
import { Download } from 'lucide-react';

interface BarChartCardProps {
  leads: Lead[];
  onExportCsv: () => void;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({ leads, onExportCsv }) => {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const rangeDays = range === '7D' ? 7 : range === '30D' ? 30 : 90;
  const chartData = React.useMemo(() => getWeeklyChartData(leads, rangeDays), [leads, rangeDays]);

  return (
    <div className="rounded-[20px] p-5 sm:p-6 bg-surface border border-border-subtle/80 flex flex-col justify-between shadow-xs">
      {/* Header row: flexible wrap for any grid column width */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-fit">
          <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight whitespace-nowrap">
            Leads Activity
          </h3>
          <p className="text-xs text-ink-muted">Inbound leads vs completed follow-ups</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Timeframe Selector */}
          <div className="flex items-center p-0.5 bg-surface-subtle rounded-lg border border-border-subtle text-[11px] font-semibold text-ink-secondary shrink-0">
            {(['7D', '30D', '90D'] as const).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  range === item ? 'bg-surface text-ink shadow-xs font-bold' : 'hover:text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Lime Export Button */}
          <button
            type="button"
            onClick={onExportCsv}
            className="h-8 px-3 rounded-[10px] bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
          >
            <Download size={13} strokeWidth={2.5} className="text-[#14161A]" />
            <span className="text-[#14161A] whitespace-nowrap">Export</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[200px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E6E8" opacity={0.6} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#636B76', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#636B76', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-surface border border-border-subtle p-2.5 rounded-xl shadow-lg text-xs">
                      <p className="font-bold text-ink mb-1">{label}</p>
                      <div className="flex items-center gap-2 text-ink">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C9C3F5]" />
                        <span>New Leads: {payload[0]?.value}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink mt-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#92E2B3]" />
                        <span>Follow-ups Done: {payload[1]?.value}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* 8px bars with rounded tops */}
            <Bar
              dataKey="newLeads"
              fill="#C9C3F5"
              radius={[6, 6, 0, 0]}
              barSize={10}
              name="New Leads"
            />
            <Bar
              dataKey="followUpsDone"
              fill="#92E2B3"
              radius={[6, 6, 0, 0]}
              barSize={10}
              name="Follow-ups Done"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9C3F5]" />
          <span>New Leads</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#92E2B3]" />
          <span>Follow-ups Done</span>
        </div>
      </div>
    </div>
  );
};
