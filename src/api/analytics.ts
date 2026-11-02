/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { LeadSource } from '../types';

export interface AnalyticsSummary {
  totalLeads: number;
  followUpsDue: number;
  dueTodayCount: number;
  overdueCount: number;
  wonCount: number;
  lostCount: number;
  conversionRate: number;
  totalWonValue: number;
  pipelineValue: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  sourceBreakdown: Record<LeadSource, number>;
  topContent: Array<{
    title: string;
    count: number;
    wonCount: number;
    wonValue: number;
  }>;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>('/api/analytics/summary');
}
