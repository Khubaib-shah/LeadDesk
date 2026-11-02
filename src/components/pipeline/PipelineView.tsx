/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lead, LeadStage } from '../../types';
import { Avatar } from '../common/Avatar';
import { SourceBadge } from '../common/Badge';
import { getLeadDisplayName, formatFollowUpDateDisplay, isFollowUpOverdue } from '../../utils/leads';
import { Clock } from 'lucide-react';

interface PipelineViewProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
}

const COLUMNS: Array<{ id: LeadStage; title: string; color: string }> = [
  { id: 'New', title: 'New', color: 'border-t-[#A9C8FA]' },
  { id: 'Contacted', title: 'Contacted', color: 'border-t-[#C9C3F5]' },
  { id: 'Qualified', title: 'Qualified', color: 'border-t-[#F6E7A1]' },
  { id: 'Proposal sent', title: 'Proposal Sent', color: 'border-t-[#F8CDB0]' },
  { id: 'Negotiation', title: 'Negotiation', color: 'border-t-[#F5B8C4]' },
  { id: 'Won', title: 'Won', color: 'border-t-[#92E2B3]' },
  { id: 'Lost', title: 'Lost', color: 'border-t-[#D7DBDF]' },
];

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onOpenLead,
  onUpdateStage,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-ink tracking-[-0.02em]">
            Deal Pipeline
          </h1>
          <p className="text-[13px] text-ink-muted">
            Visual stages from initial WhatsApp contact to signed contract
          </p>
        </div>
      </div>

      {/* Kanban Board with snap scrolling */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x no-scrollbar">
        {COLUMNS.map(col => {
          const columnLeads = leads.filter(l => !l.archived && l.stage === col.id);
          const colTotalValue = columnLeads.reduce(
            (acc, curr) => acc + (curr.wonValue || curr.estimatedValue || 0),
            0
          );

          return (
            <div
              key={col.id}
              className={`w-[290px] shrink-0 bg-surface border border-border-subtle/80 border-t-4 ${col.color} rounded-[20px] p-4 flex flex-col max-h-[calc(100vh-220px)] shadow-xs snap-start`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-ink">{col.title}</h3>
                  <span className="w-5 h-5 rounded-full bg-surface-subtle text-ink-secondary text-[11px] font-bold flex items-center justify-center">
                    {columnLeads.length}
                  </span>
                </div>
                {colTotalValue > 0 && (
                  <span className="text-[11px] font-bold text-ink tabular-nums">
                    ${colTotalValue.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                {columnLeads.map(lead => {
                  const displayName = getLeadDisplayName(lead);
                  const isOverdue = isFollowUpOverdue(lead.nextFollowUpAt);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onOpenLead(lead)}
                      className="p-3.5 rounded-2xl bg-surface-subtle hover:bg-border-subtle/60 border border-border-subtle/60 cursor-pointer transition-all hover:shadow-xs group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={lead.fullName}
                            phone={lead.whatsappNumber}
                            avatarColor={lead.avatarColor}
                            size={28}
                          />
                          <span className="font-bold text-xs text-ink truncate max-w-[130px]">
                            {displayName}
                          </span>
                        </div>
                        <SourceBadge source={lead.source} />
                      </div>

                      <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed">
                        {lead.purpose}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-border-subtle/40 text-[11px]">
                        <span className="font-bold text-ink">
                          {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '—'}
                        </span>

                        {lead.nextFollowUpAt && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? 'text-semantic-overdue-text font-bold' : 'text-ink-muted'
                            }`}
                          >
                            <Clock size={11} />
                            <span>{formatFollowUpDateDisplay(lead.nextFollowUpAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {columnLeads.length === 0 && (
                  <div className="py-8 text-center text-ink-disabled text-xs">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
