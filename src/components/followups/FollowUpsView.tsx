/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { format, isToday, addDays, startOfDay } from 'date-fns';
import { Clock, Check, AlertCircle, Calendar, ArrowRight, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Lead } from '../../types';
import { Avatar } from '../common/Avatar';
import { SourceBadge } from '../common/Badge';
import {
  getLeadDisplayName,
  buildWhatsAppUrl,
  formatFollowUpDateDisplay,
  isFollowUpDueToday,
  isFollowUpOverdue,
} from '../../utils/leads';
import { toast } from 'sonner';

interface FollowUpsViewProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onLogInteraction: (leadId: string, interaction: { type: any; text: string; timestamp: string }, nextDate?: string) => Promise<void>;
  onStartFocusMode: () => void;
}

type TabType = 'overdue' | 'today' | 'upcoming' | 'done';

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  leads,
  onOpenLead,
  onUpdateLead,
  onLogInteraction,
  onStartFocusMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [activeInlineSchedulerId, setActiveInlineSchedulerId] = useState<string | null>(null);

  // Group leads into categories
  const activeLeads = leads.filter(l => !l.archived && l.stage !== 'Won' && l.stage !== 'Lost');

  const overdueLeads = activeLeads.filter(l => isFollowUpOverdue(l.nextFollowUpAt));
  const todayLeads = activeLeads.filter(l => isFollowUpDueToday(l.nextFollowUpAt));
  const upcomingLeads = activeLeads.filter(
    l => l.nextFollowUpAt && !isFollowUpOverdue(l.nextFollowUpAt) && !isFollowUpDueToday(l.nextFollowUpAt)
  );
  const doneLeads = leads.filter(l => (l.followUpCount || 0) > 0 || l.stage === 'Won');

  // Generate 7-day strip counts
  const next7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = addDays(new Date(), idx);
    const dayStr = format(d, 'yyyy-MM-dd');
    const count = activeLeads.filter(l => {
      if (!l.nextFollowUpAt) return false;
      return format(new Date(l.nextFollowUpAt), 'yyyy-MM-dd') === dayStr;
    }).length;
    return {
      date: d,
      label: idx === 0 ? 'Today' : format(d, 'EEE'),
      dayNum: format(d, 'd'),
      count,
    };
  });

  const currentList =
    activeTab === 'overdue'
      ? overdueLeads
      : activeTab === 'today'
      ? todayLeads
      : activeTab === 'upcoming'
      ? upcomingLeads
      : doneLeads;

  const handleMarkDoneInline = async (lead: Lead, cadence: 'none' | '2d' | '1w') => {
    let nextDate: string | undefined = undefined;
    if (cadence === '2d') {
      const d = addDays(new Date(), 2);
      d.setHours(10, 0, 0, 0);
      nextDate = d.toISOString();
    } else if (cadence === '1w') {
      const d = addDays(new Date(), 7);
      d.setHours(10, 0, 0, 0);
      nextDate = d.toISOString();
    }

    await onLogInteraction(
      lead.id,
      {
        type: 'Note',
        text: 'Follow-up marked complete.',
        timestamp: new Date().toISOString(),
      },
      nextDate
    );

    setActiveInlineSchedulerId(null);
    if (navigator.vibrate) navigator.vibrate(40);
    toast.success(`Follow-up done! Next set to ${cadence === 'none' ? 'None' : '+' + cadence}`);
  };

  const handleSnooze = async (leadId: string, days: number) => {
    const nextDate = addDays(new Date(), days);
    nextDate.setHours(10, 0, 0, 0);
    await onUpdateLead(leadId, { nextFollowUpAt: nextDate.toISOString() });
    toast.success(`Snoozed for ${days} day(s)`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Start Focus Mode CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-ink tracking-[-0.02em]">
            Follow-up Queue
          </h1>
          <p className="text-[13px] text-ink-muted">
            {todayLeads.length} due today · {overdueLeads.length} overdue need urgent response
          </p>
        </div>

        <button
          type="button"
          onClick={onStartFocusMode}
          className="h-10 px-4 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Zap size={15} strokeWidth={2.8} className="text-[#14161A]" />
          <span className="text-[#14161A]">Start Follow-ups (Focus Mode)</span>
        </button>
      </div>

      {/* 7-Day Calendar Strip - Fully Responsive (Smooth scroll on narrow mobile, clean 7-col grid on >= sm) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:grid sm:grid-cols-7">
        {next7Days.map((day, idx) => (
          <div
            key={idx}
            className={`flex-1 min-w-[58px] sm:min-w-0 p-2 sm:p-3 rounded-2xl border text-center transition-all shrink-0 sm:shrink ${
              idx === 0
                ? 'bg-active-chip/60 border-border-strong shadow-xs'
                : 'bg-surface border-border-subtle/80'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] font-bold text-ink-muted uppercase block truncate tracking-wide">
              {day.label}
            </span>
            <span className="text-base sm:text-lg font-bold text-ink mt-0.5 block tabular-nums">
              {day.dayNum}
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px] font-bold ${
                  day.count > 0 ? 'bg-lime text-[#14161A]' : 'text-ink-disabled'
                }`}
              >
                {day.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Segmented Tabs: Overdue, Today, Upcoming, Done */}
      <div className="flex items-center p-1 bg-surface-subtle rounded-2xl border border-border-subtle max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-surface text-semantic-overdue-text shadow-xs'
              : 'text-ink-secondary hover:text-ink'
          }`}
        >
          <span>Overdue</span>
          {overdueLeads.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-semantic-overdue/15 font-bold">
              {overdueLeads.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'today'
              ? 'bg-surface text-ink shadow-xs'
              : 'text-ink-secondary hover:text-ink'
          }`}
        >
          <span>Today</span>
          {todayLeads.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-lime text-[#14161A] font-bold">
              {todayLeads.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-surface text-ink shadow-xs'
              : 'text-ink-secondary hover:text-ink'
          }`}
        >
          <span>Upcoming</span>
          <span className="text-[11px] text-ink-muted">({upcomingLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('done')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'done'
              ? 'bg-surface text-ink shadow-xs'
              : 'text-ink-secondary hover:text-ink'
          }`}
        >
          Done
        </button>
      </div>

      {/* Follow-up Items List */}
      <div className="space-y-3">
        {currentList.map(lead => {
          const displayName = getLeadDisplayName(lead);
          const isOverdue = isFollowUpOverdue(lead.nextFollowUpAt);
          const waUrl = buildWhatsAppUrl(
            lead.whatsappNumber,
            `Hi ${displayName.split(' ')[0]}, following up on our conversation!`
          );
          const showScheduler = activeInlineSchedulerId === lead.id;

          return (
            <div
              key={lead.id}
              className="p-5 rounded-[20px] bg-surface border border-border-subtle/80 shadow-xs hover:border-ink/20 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Lead Profile */}
                <div
                  onClick={() => onOpenLead(lead)}
                  className="flex items-center gap-3 cursor-pointer group min-w-0"
                >
                  <Avatar
                    name={lead.fullName}
                    phone={lead.whatsappNumber}
                    avatarColor={lead.avatarColor}
                    size={42}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-ink group-hover:text-ink truncate">{displayName}</h3>
                      <SourceBadge source={lead.source} />
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 truncate">{lead.purpose}</p>
                  </div>
                </div>

                {/* Due Time & Quick Action Buttons (Responsive toolbar: nicely spaced on mobile, aligned right on desktop) */}
                <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/40">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0 ${
                      isOverdue
                        ? 'bg-semantic-overdue/10 text-semantic-overdue-text font-bold'
                        : 'bg-surface-subtle text-ink-secondary'
                    }`}
                  >
                    {formatFollowUpDateDisplay(lead.nextFollowUpAt)}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg bg-button-dark hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      <FaWhatsapp size={13} className="text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveInlineSchedulerId(showScheduler ? null : lead.id)}
                      className="h-8 px-3 rounded-lg bg-lime hover:bg-lime-hover text-[#14161A] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs whitespace-nowrap shrink-0"
                    >
                      <Check size={14} strokeWidth={2.8} className="text-[#14161A]" />
                      <span className="text-[#14161A]">Done</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSnooze(lead.id, 1)}
                      className="h-8 px-2.5 rounded-lg bg-surface-subtle hover:bg-border-subtle text-ink-secondary text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0"
                      title="Snooze 1 day"
                    >
                      +1d
                    </button>
                  </div>
                </div>
              </div>

              {/* Discussion / Note snippet */}
              {lead.summary && (
                <div className="p-3 rounded-xl bg-surface-subtle/80 text-xs text-ink-secondary italic">
                  "{lead.summary}"
                </div>
              )}

              {/* Inline Schedule Next Follow-up Picker */}
              {showScheduler && (
                <div className="p-3 rounded-xl bg-active-chip border border-border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in">
                  <span className="font-semibold text-ink">Schedule next follow-up?</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleMarkDoneInline(lead, 'none')}
                      className="px-2.5 py-1.5 rounded-lg bg-surface text-ink hover:bg-surface-subtle font-semibold cursor-pointer"
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkDoneInline(lead, '2d')}
                      className="px-2.5 py-1.5 rounded-lg bg-lime text-[#14161A] font-bold cursor-pointer"
                    >
                      +2 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkDoneInline(lead, '1w')}
                      className="px-2.5 py-1.5 rounded-lg bg-surface text-ink hover:bg-surface-subtle font-semibold cursor-pointer"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {currentList.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-surface border border-border-subtle/60 text-ink-muted">
            <CheckCircle2 size={32} className="mx-auto text-semantic-success mb-2" />
            <h3 className="font-bold text-sm text-ink">Nothing pending here!</h3>
            <p className="text-xs text-ink-muted mt-1">All follow-ups for this tab are complete.</p>
          </div>
        )}
      </div>
    </div>
  );
};
