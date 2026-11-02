/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  Mail,
  Copy,
  Calendar,
  Clock,
  Send,
  Trash2,
  Archive,
  Trophy,
  XCircle,
  Plus,
  Mic,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Lead, LeadStage, LeadTemperature, InteractionType } from '../../types';
import { Avatar } from '../common/Avatar';
import { StageBadge, SourceBadge, TemperatureBadge } from '../common/Badge';
import {
  getLeadDisplayName,
  buildWhatsAppUrl,
  buildGmailComposeUrl,
  buildGoogleCalendarUrl,
  generateIcsContent,
  formatFollowUpDateDisplay,
  fillTemplateVariables,
} from '../../utils/leads';
import { SEED_TEMPLATES } from '../../data/seedTemplates';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onLogInteraction: (leadId: string, interaction: { type: InteractionType; text: string; timestamp: string }, nextDate?: string) => Promise<void>;
}

const STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal sent',
  'Negotiation',
  'Won',
  'Lost',
];

const TEMPERATURES: LeadTemperature[] = ['Hot', 'Warm', 'Cold'];

const LOST_REASONS = [
  'Budget constraints',
  'Unresponsive',
  'Chose competitor',
  'Timeline mismatch',
  'Out of scope',
  'Other',
];

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onLogInteraction,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');
  const [interactionType, setInteractionType] = useState<InteractionType>('WhatsApp');
  const [interactionText, setInteractionText] = useState('');
  const [nextCadenceDays, setNextCadenceDays] = useState<number | null>(3);
  const [showWonModal, setShowWonModal] = useState(false);
  const [wonValueInput, setWonValueInput] = useState('');
  const [showLostModal, setShowLostModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  if (!lead) return null;

  const displayName = getLeadDisplayName(lead);
  const selectedTemplate = SEED_TEMPLATES.find(t => t.id === selectedTemplateId) || SEED_TEMPLATES[0];
  const filledMessage = fillTemplateVariables(selectedTemplate.body, {
    firstName: displayName.split(' ')[0],
    purpose: lead.purpose,
    myName: 'Zubair',
    topic: lead.interestedIn || lead.purpose,
  });

  const waUrl = buildWhatsAppUrl(lead.whatsappNumber, filledMessage);
  const emailUrl = lead.email
    ? buildGmailComposeUrl(
        lead.email,
        selectedTemplate.subject ? fillTemplateVariables(selectedTemplate.subject, { firstName: displayName, purpose: lead.purpose, myName: 'Zubair' }) : `Regarding ${lead.purpose}`,
        filledMessage
      )
    : '';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(lead.whatsappNumber);
    toast.success('WhatsApp number copied to clipboard');
  };

  const handleDownloadIcs = () => {
    const ics = generateIcsContent(
      `Follow-up: ${displayName} (${lead.purpose})`,
      lead.summary || 'Follow up with lead on LeadDesk',
      lead.nextFollowUpAt
    );
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `followup-${lead.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSnooze = async (days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    nextDate.setHours(10, 0, 0, 0);
    await onUpdateLead(lead.id, { nextFollowUpAt: nextDate.toISOString() });
    toast.success(`Follow-up snoozed +${days} days`);
  };

  const handleDoneFollowUp = async () => {
    // Prompt next cadence or set to 5 days
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 5);
    nextDate.setHours(10, 0, 0, 0);

    await onLogInteraction(
      lead.id,
      {
        type: 'Note',
        text: 'Completed scheduled follow-up check.',
        timestamp: new Date().toISOString(),
      },
      nextDate.toISOString()
    );

    if (navigator.vibrate) navigator.vibrate(50);
    toast.success('Follow-up marked Done! Next follow-up scheduled in 5 days.');
  };

  const handleLogInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionText.trim()) return;

    let nextIso: string | undefined = undefined;
    if (nextCadenceDays !== null) {
      const d = new Date();
      d.setDate(d.getDate() + nextCadenceDays);
      d.setHours(10, 0, 0, 0);
      nextIso = d.toISOString();
    }

    await onLogInteraction(
      lead.id,
      {
        type: interactionType,
        text: interactionText.trim(),
        timestamp: new Date().toISOString(),
      },
      nextIso
    );

    setInteractionText('');
    toast.success('Interaction logged');
  };

  const handleMarkWon = async () => {
    const val = parseFloat(wonValueInput) || lead.estimatedValue || 0;
    await onUpdateLead(lead.id, {
      stage: 'Won',
      wonValue: val,
      closedAt: new Date().toISOString(),
    });
    setShowWonModal(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success(`🎉 Lead marked WON at $${val.toLocaleString()}!`);
  };

  const handleMarkLost = async (reason: string) => {
    await onUpdateLead(lead.id, {
      stage: 'Lost',
      lostReason: reason,
      closedAt: new Date().toISOString(),
    });
    setShowLostModal(false);
    toast('Lead marked as Lost');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative z-50 w-full max-w-[560px] bg-surface text-ink h-full shadow-2xl flex flex-col border-l border-border-subtle"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar
              name={lead.fullName}
              phone={lead.whatsappNumber}
              avatarColor={lead.avatarColor}
              size={48}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-ink tracking-tight">{displayName}</h2>
                <SourceBadge source={lead.source} />
              </div>

              {/* Stage & Temperature Switchers */}
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={lead.stage}
                  onChange={e => onUpdateLead(lead.id, { stage: e.target.value as LeadStage })}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-subtle border border-border-subtle text-ink cursor-pointer focus:outline-none"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <div className="flex items-center p-0.5 bg-surface-subtle rounded-md border border-border-subtle">
                  {TEMPERATURES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onUpdateLead(lead.id, { temperature: t })}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                        lead.temperature === t
                          ? t === 'Hot'
                            ? 'bg-[#FF7A59] text-white font-bold'
                            : t === 'Warm'
                            ? 'bg-[#F5B544] text-white font-bold'
                            : 'bg-[#7BB2F9] text-white font-bold'
                          : 'text-ink-secondary hover:text-ink'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink-secondary hover:text-ink cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Bar (1-Click rule) */}
          <div className="grid grid-cols-4 gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 rounded-xl bg-button-dark hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <FaWhatsapp size={15} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            {lead.email ? (
              <a
                href={emailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 rounded-xl bg-surface-subtle hover:bg-border-subtle border border-border-subtle text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail size={14} />
                <span>Email</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="h-10 rounded-xl bg-surface-subtle opacity-40 text-ink-disabled text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Mail size={14} />
                <span>Email</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyPhone}
              className="h-10 rounded-xl bg-surface-subtle hover:bg-border-subtle border border-border-subtle text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={14} />
              <span>Copy #</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="h-10 rounded-xl bg-surface-subtle hover:bg-border-subtle border border-border-subtle text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar size={14} />
              <span>Cal (.ics)</span>
            </button>
          </div>

          {/* WhatsApp Template Picker & Live Preview */}
          <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Choose Message Template:</span>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="px-2 py-1 rounded-md text-xs font-semibold bg-surface border border-border-subtle text-ink cursor-pointer"
              >
                {SEED_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-ink-secondary bg-surface p-3 rounded-xl border border-border-subtle/60 italic leading-relaxed">
              "{filledMessage}"
            </p>
          </div>

          {/* Next Follow-up Section */}
          <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-semantic-overdue" />
                <span className="text-xs font-bold text-ink">Next Follow-up</span>
              </div>
              <span className="text-xs font-semibold text-ink-secondary">
                {formatFollowUpDateDisplay(lead.nextFollowUpAt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDoneFollowUp}
                className="flex-1 h-9 rounded-xl bg-lime hover:bg-lime-hover text-ink font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>Mark Done</span>
              </button>

              <div className="flex items-center gap-1">
                {[
                  { label: '+1d', days: 1 },
                  { label: '+3d', days: 3 },
                  { label: '+1w', days: 7 },
                ].map(s => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleSnooze(s.days)}
                    className="h-9 px-2.5 rounded-xl bg-surface-subtle hover:bg-border-subtle border border-border-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Details Accordion / Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Lead Details</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle">
                <span className="text-ink-muted block text-[11px]">Purpose / Scope</span>
                <span className="font-semibold text-ink mt-0.5 block">{lead.purpose}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle">
                <span className="text-ink-muted block text-[11px]">Estimated Value</span>
                <span className="font-semibold text-ink mt-0.5 block">
                  {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()} USD` : 'Not specified'}
                </span>
              </div>
            </div>

            {lead.sourceDetail && (
              <div className="p-3 rounded-xl bg-surface-subtle text-xs">
                <span className="text-ink-muted block text-[11px]">Content Attribution</span>
                <span className="font-semibold text-ink mt-0.5 block">{lead.sourceDetail}</span>
              </div>
            )}

            {lead.summary && (
              <div className="p-3 rounded-xl bg-surface-subtle text-xs">
                <span className="text-ink-muted block text-[11px]">Discussion Summary</span>
                <p className="font-medium text-ink mt-0.5 leading-relaxed">{lead.summary}</p>
              </div>
            )}

            {lead.tags && lead.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {lead.tags.map(t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-active-chip text-ink text-[11px] font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Log Interaction Composer */}
          <form onSubmit={handleLogInteractionSubmit} className="space-y-3 pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Log Interaction</h3>
              <div className="flex items-center gap-1">
                {(['WhatsApp', 'Email', 'Call', 'Meeting', 'Note'] as InteractionType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInteractionType(type)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      interactionType === type
                        ? 'bg-ink text-white dark:bg-white dark:text-ink font-bold'
                        : 'bg-surface-subtle text-ink-secondary hover:text-ink'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={2}
                dir="auto"
                value={interactionText}
                onChange={e => setInteractionText(e.target.value)}
                placeholder={`Summary of ${interactionType}...`}
                className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                <span>Next follow-up:</span>
                <select
                  value={nextCadenceDays === null ? 'none' : nextCadenceDays}
                  onChange={e =>
                    setNextCadenceDays(e.target.value === 'none' ? null : parseInt(e.target.value))
                  }
                  className="px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle text-ink cursor-pointer"
                >
                  <option value={2}>+2 days</option>
                  <option value={3}>+3 days</option>
                  <option value={5}>+5 days</option>
                  <option value={10}>+10 days</option>
                  <option value="none">None</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!interactionText.trim()}
                className="h-8 px-3 rounded-lg bg-lime hover:bg-lime-hover disabled:opacity-40 text-ink text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send size={12} />
                <span>Log</span>
              </button>
            </div>
          </form>

          {/* Activity Timeline (Newest first) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Activity Timeline</h3>
            {lead.interactions && lead.interactions.length > 0 ? (
              <div className="space-y-2.5">
                {lead.interactions.map(int => (
                  <div
                    key={int.id}
                    className="p-3 rounded-xl bg-surface-subtle/80 border border-border-subtle text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <span className="font-bold text-ink">{int.type}</span>
                      <span>{format(new Date(int.timestamp), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-ink-secondary leading-relaxed">{int.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-disabled italic">No interactions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer Actions: Mark Won / Mark Lost / Delete */}
        <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowWonModal(true)}
              className="h-9 px-3 rounded-xl bg-[#92E2B3] hover:opacity-90 text-[#14161A] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trophy size={14} />
              <span>Mark Won</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLostModal(true)}
              className="h-9 px-3 rounded-xl bg-surface-subtle hover:bg-border-subtle text-ink-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle size={14} />
              <span>Mark Lost</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onDeleteLead(lead.id);
                onClose();
              }}
              title="Delete lead"
              className="w-9 h-9 rounded-xl hover:bg-semantic-overdue/10 text-semantic-overdue flex items-center justify-center cursor-pointer transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Won Dialog Modal */}
      {showWonModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-surface p-6 rounded-2xl shadow-2xl text-ink space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pastel-mint flex items-center justify-center text-ink">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-ink">Congratulations!</h3>
                <p className="text-xs text-ink-muted">What was the final closed value?</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Final Deal Value ($ USD)</label>
              <input
                type="number"
                value={wonValueInput}
                onChange={e => setWonValueInput(e.target.value)}
                placeholder={lead.estimatedValue ? String(lead.estimatedValue) : '5000'}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWonModal(false)}
                className="px-3.5 h-9 rounded-xl text-xs font-semibold hover:bg-surface-subtle text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkWon}
                className="px-4 h-9 rounded-xl bg-lime hover:bg-lime-hover text-ink font-bold text-xs cursor-pointer"
              >
                Confirm Won Deal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lost Dialog Modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-surface p-6 rounded-2xl shadow-2xl text-ink space-y-4"
          >
            <div>
              <h3 className="font-bold text-base text-ink">Mark Lead as Lost</h3>
              <p className="text-xs text-ink-muted">Select reason to improve future conversion:</p>
            </div>

            <div className="flex flex-col gap-1.5">
              {LOST_REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleMarkLost(r)}
                  className="w-full p-2.5 rounded-xl text-xs font-semibold bg-surface-subtle hover:bg-border-subtle text-ink text-left transition-colors cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowLostModal(false)}
              className="w-full h-9 rounded-xl text-xs font-semibold hover:bg-surface-subtle text-ink cursor-pointer"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
