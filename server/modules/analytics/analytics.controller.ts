/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { LeadRepository } from '../leads/lead.model';
import { LeadSource } from '../leads/lead.types';

export const getAnalyticsSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leads = (await LeadRepository.getAll()).filter(l => !l.archived);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let dueTodayCount = 0;
    let overdueCount = 0;
    let totalWonValue = 0;
    let wonCount = 0;
    let lostCount = 0;
    let pipelineValue = 0;
    let hotCount = 0;
    let warmCount = 0;
    let coldCount = 0;

    const sourceCounts: Record<LeadSource, number> = {
      WhatsApp: 0,
      TikTok: 0,
      Instagram: 0,
      YouTube: 0,
      LinkedIn: 0,
      X: 0,
      Facebook: 0,
      Email: 0,
      Referral: 0,
      Website: 0,
      Other: 0,
    };

    const contentAttributionMap: Record<string, { count: number; wonCount: number; wonValue: number }> = {};

    leads.forEach(lead => {
      // Follow-up status
      if (lead.nextFollowUpAt) {
        const leadDateStr = lead.nextFollowUpAt.slice(0, 10);
        const leadTime = new Date(lead.nextFollowUpAt).getTime();
        if (leadTime < now.getTime() && leadDateStr !== todayStr) {
          overdueCount++;
        } else if (leadDateStr === todayStr) {
          dueTodayCount++;
        }
      }

      // Stage & Revenue
      if (lead.stage === 'Won') {
        wonCount++;
        totalWonValue += lead.wonValue || lead.estimatedValue || 0;
      } else if (lead.stage === 'Lost') {
        lostCount++;
      } else {
        pipelineValue += lead.estimatedValue || 0;
      }

      // Temperature
      if (lead.temperature === 'Hot') hotCount++;
      else if (lead.temperature === 'Warm') warmCount++;
      else if (lead.temperature === 'Cold') coldCount++;

      // Source
      if (lead.source in sourceCounts) {
        sourceCounts[lead.source]++;
      }

      // Content attribution
      if (lead.sourceDetail && lead.sourceDetail.trim() !== '') {
        const key = lead.sourceDetail.trim();
        if (!contentAttributionMap[key]) {
          contentAttributionMap[key] = { count: 0, wonCount: 0, wonValue: 0 };
        }
        contentAttributionMap[key].count++;
        if (lead.stage === 'Won') {
          contentAttributionMap[key].wonCount++;
          contentAttributionMap[key].wonValue += lead.wonValue || lead.estimatedValue || 0;
        }
      }
    });

    const closedCount = wonCount + lostCount;
    const conversionRate = closedCount > 0 ? (wonCount / closedCount) * 100 : (wonCount / (leads.length || 1)) * 100;

    const topContent = Object.entries(contentAttributionMap)
      .map(([title, data]) => ({ title, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalLeads: leads.length,
        followUpsDue: dueTodayCount + overdueCount,
        dueTodayCount,
        overdueCount,
        wonCount,
        lostCount,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalWonValue,
        pipelineValue,
        hotCount,
        warmCount,
        coldCount,
        sourceBreakdown: sourceCounts,
        topContent,
      },
    });
  } catch (error) {
    next(error);
  }
};
