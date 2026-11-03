/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lead } from '../../types';
import { Avatar } from '../common/Avatar';
import { getLeadDisplayName } from '../../utils/leads';
import { ChevronRight, Plus, Flame } from 'lucide-react';

interface HotLeadsCardProps {
  hotLeads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onOpenQuickAdd: () => void;
}

export const HotLeadsCard: React.FC<HotLeadsCardProps> = ({
  hotLeads,
  onOpenLead,
  onOpenQuickAdd,
}) => {
  const displayLeads = hotLeads.slice(0, 4);

  return (
    <div className="rounded-[20px] p-5 bg-surface border border-border-subtle/80 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF7A59]/20 flex items-center justify-center text-semantic-hot">
              <Flame size={16} strokeWidth={2.4} />
            </div>
            <span className="text-[13px] font-semibold text-ink tracking-tight">Hot Leads</span>
          </div>
          <span className="text-[11px] font-bold text-semantic-hot">High Intent</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {displayLeads.length === 0 ? (
            <p className="text-xs text-ink-muted py-4 text-center">No hot leads right now.</p>
          ) : (
            displayLeads.map(lead => {
            const name = getLeadDisplayName(lead);
            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => onOpenLead(lead)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Avatar
                    name={lead.fullName}
                    phone={lead.whatsappNumber}
                    avatarColor={lead.avatarColor}
                    size={32}
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-ink truncate block group-hover:text-ink">
                      {name}
                    </span>
                    <span className="text-[10px] text-ink-muted truncate block">
                      {lead.purpose} {lead.estimatedValue ? `· $${lead.estimatedValue}` : ''}
                    </span>
                  </div>
                </div>

                <ChevronRight size={15} className="text-ink-disabled group-hover:text-ink shrink-0 ml-1" />
              </button>
            );
          })
        )}
        </div>
      </div>

      {/* Soft-blue Button: + Add lead */}
      <div className="pt-4 mt-2 border-t border-border-subtle/50">
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="w-full h-8 px-3 rounded-[10px] bg-button-softblue/30 hover:bg-button-softblue/50 text-[#1F4A99] dark:text-[#B7CEFA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add lead</span>
        </button>
      </div>
    </div>
  );
};
