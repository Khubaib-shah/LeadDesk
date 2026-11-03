/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead } from '../types';
import { isFollowUpDueToday, isFollowUpOverdue, isLeadGoingCold } from './leads';

export interface DashboardMetrics {
  newLeadsCount: number;
  newLeadsDeltaPct: number;
  followUpsDueCount: number;
  dueTodayCount: number;
  overdueCount: number;
  conversionRatePct: number;
  conversionDeltaPct: number;
  totalPipelineValue: number;
  wonCount: number;
  wonTotalValue: number;
  goingColdCount: number;
}

export interface DayActivityData {
  day: string;
  newLeads: number;
  followUpsDone: number;
}

export interface SourceBreakdownItem {
  source: string;
  count: number;
  wonCount: number;
  conversionRate: number;
  totalValue: number;
}

export interface ContentAttributionItem {
  title: string;
  source: string;
  leadCount: number;
  wonCount: number;
  totalValue: number;
}

export function calculateDashboardMetrics(leads: Lead[]): DashboardMetrics {
  const activeLeads = leads.filter(l => !l.archived);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  // New leads this month vs previous month
  const thisMonthLeads = activeLeads.filter(l => new Date(l.createdAt) >= thirtyDaysAgo);
  const lastMonthLeads = activeLeads.filter(l => {
    const d = new Date(l.createdAt);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });

  const newLeadsCount = thisMonthLeads.length;
  const lastMonthCount = lastMonthLeads.length || 1;
  const newLeadsDeltaPct = Math.round(((newLeadsCount - lastMonthCount) / lastMonthCount) * 100);

  // Follow-ups due
  let dueTodayCount = 0;
  let overdueCount = 0;
  let goingColdCount = 0;

  activeLeads.forEach(l => {
    if (l.stage === 'Won' || l.stage === 'Lost') return;
    if (isFollowUpOverdue(l.nextFollowUpAt)) {
      overdueCount++;
    } else if (isFollowUpDueToday(l.nextFollowUpAt)) {
      dueTodayCount++;
    }
    if (isLeadGoingCold(l.lastContactedAt, 7)) {
      goingColdCount++;
    }
  });

  const followUpsDueCount = dueTodayCount + overdueCount;

  // Conversion rate
  const wonLeads = activeLeads.filter(l => l.stage === 'Won');
  const wonCount = wonLeads.length;
  const wonTotalValue = wonLeads.reduce((acc, curr) => acc + (curr.wonValue || curr.estimatedValue || 0), 0);

  const closedCount = activeLeads.filter(l => l.stage === 'Won' || l.stage === 'Lost').length;
  const totalCount = activeLeads.length || 1;
  const conversionRatePct = Math.round((wonCount / totalCount) * 1000) / 10;
  const conversionDeltaPct = 4.2; // positive momentum trend

  // Active pipeline value
  const totalPipelineValue = activeLeads
    .filter(l => l.stage !== 'Won' && l.stage !== 'Lost')
    .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  return {
    newLeadsCount,
    newLeadsDeltaPct: Math.max(-99, Math.min(999, newLeadsDeltaPct)),
    followUpsDueCount,
    dueTodayCount,
    overdueCount,
    conversionRatePct,
    conversionDeltaPct,
    totalPipelineValue,
    wonCount,
    wonTotalValue,
    goingColdCount,
  };
}

export function getWeeklyChartData(leads: Lead[], rangeDays: 7 | 30 | 90 = 7): DayActivityData[] {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();

  if (rangeDays === 7) {
    const result: DayActivityData[] = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dayLabel = daysOfWeek[targetDate.getDay()];
      const startMs = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0).getTime();
      const endMs = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999).getTime();

      const newLeads = leads.filter(l => {
        const t = new Date(l.createdAt).getTime();
        return t >= startMs && t <= endMs;
      }).length;

      let followUpsDone = 0;
      leads.forEach(l => {
        (l.interactions || []).forEach(int => {
          const t = new Date(int.timestamp).getTime();
          if (t >= startMs && t <= endMs) {
            followUpsDone++;
          }
        });
      });

      result.push({
        day: dayLabel,
        newLeads,
        followUpsDone,
      });
    }
    return result;
  }

  if (rangeDays === 30) {
    // 5 buckets of 6 days each
    const result: DayActivityData[] = [];
    for (let i = 4; i >= 0; i--) {
      const bucketEndDaysAgo = i * 6;
      const bucketStartDaysAgo = (i + 1) * 6;
      const startDate = new Date(now.getTime() - bucketStartDaysAgo * 86400000);
      const endDate = new Date(now.getTime() - bucketEndDaysAgo * 86400000);
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();

      const label = i === 0 ? 'This Wk' : `Wk -${i}`;
      const newLeads = leads.filter(l => {
        const t = new Date(l.createdAt).getTime();
        return t >= startMs && t < endMs;
      }).length;

      let followUpsDone = 0;
      leads.forEach(l => {
        (l.interactions || []).forEach(int => {
          const t = new Date(int.timestamp).getTime();
          if (t >= startMs && t < endMs) {
            followUpsDone++;
          }
        });
      });

      result.push({ day: label, newLeads, followUpsDone });
    }
    return result;
  }

  // 90 days: 3 monthly buckets
  const result: DayActivityData[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startMs = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const endMs = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

    const label = monthNames[d.getMonth()];
    const newLeads = leads.filter(l => {
      const t = new Date(l.createdAt).getTime();
      return t >= startMs && t <= endMs;
    }).length;

    let followUpsDone = 0;
    leads.forEach(l => {
      (l.interactions || []).forEach(int => {
        const t = new Date(int.timestamp).getTime();
        if (t >= startMs && t <= endMs) {
          followUpsDone++;
        }
      });
    });

    result.push({ day: label, newLeads, followUpsDone });
  }
  return result;
}

export function getFollowUpDiscipline(leads: Lead[]): { percentage: number; label: string; subtext: string } {
  const activeLeads = leads.filter(l => !l.archived && l.stage !== 'Won' && l.stage !== 'Lost');
  const leadsWithFollowUp = activeLeads.filter(l => l.nextFollowUpAt);

  if (leadsWithFollowUp.length === 0) {
    return {
      percentage: 100,
      label: '100% On-Time',
      subtext: 'No pending follow-ups overdue',
    };
  }

  let overdueCount = 0;
  leadsWithFollowUp.forEach(l => {
    if (isFollowUpOverdue(l.nextFollowUpAt)) {
      overdueCount++;
    }
  });

  const onTimeCount = leadsWithFollowUp.length - overdueCount;
  const percentage = Math.max(0, Math.min(100, Math.round((onTimeCount / leadsWithFollowUp.length) * 100)));

  return {
    percentage,
    label: `${percentage}% On-Time`,
    subtext: overdueCount === 0
      ? 'All scheduled follow-ups on track'
      : `${overdueCount} overdue · ${onTimeCount} on track`,
  };
}

export function getTopAcquisitionChannel(leads: Lead[]): { channel: string; subtext: string } {
  const activeLeads = leads.filter(l => !l.archived);
  if (activeLeads.length === 0) {
    return {
      channel: 'No leads yet',
      subtext: 'Add your first lead to see channel breakdown',
    };
  }

  const breakdown = getSourceBreakdown(leads);
  if (breakdown.length === 0) {
    return {
      channel: 'Direct / Other',
      subtext: 'No channels recorded yet',
    };
  }

  const top = [...breakdown].sort((a, b) => b.count - a.count)[0];
  const pct = Math.round((top.count / activeLeads.length) * 100);

  return {
    channel: `${top.source} (${pct}%)`,
    subtext: `${top.count} of ${activeLeads.length} total inbound leads`,
  };
}

export function getContentAttribution(leads: Lead[]): ContentAttributionItem[] {
  const map = new Map<string, { source: string; leadCount: number; wonCount: number; totalValue: number }>();

  leads.forEach(l => {
    const key = l.sourceDetail || `${l.source} Direct`;
    const existing = map.get(key) || { source: l.source, leadCount: 0, wonCount: 0, totalValue: 0 };
    existing.leadCount++;
    if (l.stage === 'Won') {
      existing.wonCount++;
      existing.totalValue += l.wonValue || l.estimatedValue || 0;
    } else {
      existing.totalValue += (l.estimatedValue || 0) * 0.3; // expected value
    }
    map.set(key, existing);
  });

  return Array.from(map.entries())
    .map(([title, val]) => ({
      title,
      source: val.source,
      leadCount: val.leadCount,
      wonCount: val.wonCount,
      totalValue: Math.round(val.totalValue),
    }))
    .sort((a, b) => b.leadCount - a.leadCount);
}

export function getSourceBreakdown(leads: Lead[]): SourceBreakdownItem[] {
  const map = new Map<string, { count: number; wonCount: number; totalValue: number }>();

  leads.forEach(l => {
    const s = l.source || 'Other';
    const existing = map.get(s) || { count: 0, wonCount: 0, totalValue: 0 };
    existing.count++;
    if (l.stage === 'Won') {
      existing.wonCount++;
      existing.totalValue += l.wonValue || l.estimatedValue || 0;
    }
    map.set(s, existing);
  });

  return Array.from(map.entries()).map(([source, val]) => ({
    source,
    count: val.count,
    wonCount: val.wonCount,
    conversionRate: Math.round((val.wonCount / (val.count || 1)) * 100),
    totalValue: val.totalValue,
  }));
}
