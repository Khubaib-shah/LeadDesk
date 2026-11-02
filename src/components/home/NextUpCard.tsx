/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Lead } from '../../types';
import { Avatar } from '../common/Avatar';
import { getLeadDisplayName, buildWhatsAppUrl, formatFollowUpDateDisplay } from '../../utils/leads';
import { FaWhatsapp } from 'react-icons/fa6';
import { Clock, Check } from 'lucide-react';

interface NextUpCardProps {
  lead?: Lead;
  onDone: (lead: Lead) => void;
  onOpenLead: (lead: Lead) => void;
}

export const NextUpCard: React.FC<NextUpCardProps> = ({ lead, onDone, onOpenLead }) => {
  if (!lead) {
    return (
      <div className="rounded-[20px] p-5 bg-surface border border-border-subtle/80 flex flex-col items-center justify-center text-center min-h-[170px] shadow-xs">
        <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mb-2">
          <Check size={20} strokeWidth={2.5} />
        </div>
        <p className="text-sm font-bold text-ink">All caught up!</p>
        <p className="text-xs text-ink-muted">No pending follow-ups right now.</p>
      </div>
    );
  }

  const displayName = getLeadDisplayName(lead);
  const waUrl = buildWhatsAppUrl(lead.whatsappNumber, `Hi ${displayName.split(' ')[0]}, following up!`);

  return (
    <div className="rounded-[20px] p-5 bg-surface border border-border-subtle/80 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header: Title and Time Chip */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pastel-sky/60 flex items-center justify-center text-ink">
              <Clock size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-ink tracking-tight">Next Follow-up</span>
          </div>

          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-border-subtle">
            {formatFollowUpDateDisplay(lead.nextFollowUpAt)}
          </span>
        </div>

        {/* Lead profile row */}
        <div
          onClick={() => onOpenLead(lead)}
          className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-surface-subtle cursor-pointer transition-colors"
        >
          <Avatar name={lead.fullName} phone={lead.whatsappNumber} avatarColor={lead.avatarColor} size={38} />
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-ink truncate">{displayName}</h4>
            <p className="text-xs text-ink-muted truncate">{lead.purpose || 'Follow-up'}</p>
          </div>
        </div>

        {/* Note preview if any */}
        {lead.followUpNote && (
          <p className="text-[11px] text-ink-secondary italic mt-2 line-clamp-2 bg-surface-subtle/70 p-2 rounded-lg">
            "{lead.followUpNote}"
          </p>
        )}
      </div>

      {/* Action buttons: Dark button "Message on WhatsApp", Text button "Done" */}
      <div className="pt-4 flex items-center gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-9 rounded-[10px] bg-button-dark hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <FaWhatsapp size={14} className="text-[#25D366]" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => onDone(lead)}
          className="h-9 px-3 rounded-[10px] hover:bg-surface-subtle text-ink-secondary hover:text-ink text-xs font-semibold transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
