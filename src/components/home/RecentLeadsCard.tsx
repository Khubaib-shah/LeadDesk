/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lead } from '../../types';
import { Avatar } from '../common/Avatar';
import { SourceBadge, StageBadge } from '../common/Badge';
import { getLeadDisplayName, formatFollowUpDateDisplay, isFollowUpOverdue, buildWhatsAppUrl } from '../../utils/leads';
import { ArrowRight, MessageSquare, ExternalLink } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

interface RecentLeadsCardProps {
  leads: Lead[];
  onViewAll: () => void;
  onOpenLead: (lead: Lead) => void;
}

export const RecentLeadsCard: React.FC<RecentLeadsCardProps> = ({
  leads,
  onViewAll,
  onOpenLead,
}) => {
  const displayLeads = leads.slice(0, 5);

  return (
    <div className="rounded-[20px] p-6 bg-surface border border-border-subtle/80 flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-ink tracking-tight">Recent Leads</h3>
          <p className="text-xs text-ink-muted">Latest contacts captured across all channels</p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="h-8 px-3.5 rounded-[10px] bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
        >
          <span className="text-[#14161A] whitespace-nowrap">View all</span>
          <ArrowRight size={13} strokeWidth={2.5} className="text-[#14161A] shrink-0" />
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="min-w-[560px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-[12px] font-medium text-ink-muted pb-2">
              <th className="py-2.5 font-medium whitespace-nowrap">Lead</th>
              <th className="py-2.5 font-medium whitespace-nowrap">Source</th>
              <th className="py-2.5 font-medium hidden md:table-cell whitespace-nowrap">Purpose</th>
              <th className="py-2.5 font-medium whitespace-nowrap">Next Follow-up</th>
              <th className="py-2.5 font-medium text-right whitespace-nowrap">Stage</th>
              <th className="py-2.5 font-medium text-right pr-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {displayLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-ink-muted">
                  No leads captured yet. Click <span className="font-bold text-ink">+</span> or press <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle font-mono text-[10px]">N</kbd> to add your first lead!
                </td>
              </tr>
            ) : (
              displayLeads.map(lead => {
                const name = getLeadDisplayName(lead);
                const isOverdue = isFollowUpOverdue(lead.nextFollowUpAt);
                const waUrl = buildWhatsAppUrl(lead.whatsappNumber);

              return (
                <tr
                  key={lead.id}
                  onClick={() => onOpenLead(lead)}
                  className="h-[52px] hover:bg-[#F7F9F9] dark:hover:bg-surface-subtle transition-colors cursor-pointer group"
                >
                  {/* Lead avatar & name */}
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={lead.fullName}
                        phone={lead.whatsappNumber}
                        avatarColor={lead.avatarColor}
                        size={32}
                      />
                      <div className="overflow-hidden max-w-[140px] sm:max-w-[180px]">
                        <span className="text-sm font-semibold text-ink truncate block">
                          {name}
                        </span>
                        <span className="text-[11px] text-ink-muted truncate block">
                          {lead.whatsappNumber}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="py-2 pr-3">
                    <SourceBadge source={lead.source} />
                  </td>

                  {/* Purpose */}
                  <td className="py-2 pr-3 hidden md:table-cell text-xs text-ink-secondary truncate max-w-[140px]">
                    {lead.purpose}
                  </td>

                  {/* Next Follow-up */}
                  <td className="py-2 pr-3 text-xs whitespace-nowrap">
                    <span
                      className={
                        isOverdue
                          ? 'font-bold text-semantic-overdue-text flex items-center gap-1'
                          : 'text-ink-secondary'
                      }
                    >
                      {formatFollowUpDateDisplay(lead.nextFollowUpAt)}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="py-2 pr-3 text-right">
                    <StageBadge stage={lead.stage} />
                  </td>

                  {/* Quick Action Button */}
                  <td className="py-2 text-right pr-2" onClick={e => e.stopPropagation()}>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-surface-subtle text-ink-secondary hover:text-[#25D366] transition-colors"
                      title="Direct WhatsApp"
                    >
                      <FaWhatsapp size={15} />
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};
