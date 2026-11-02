/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Clock, ChevronRight, Zap } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Lead } from '../../types';
import { Avatar } from '../common/Avatar';
import { SourceBadge } from '../common/Badge';
import { getLeadDisplayName, buildWhatsAppUrl, formatFollowUpDateDisplay } from '../../utils/leads';
import { toast } from 'sonner';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onMarkDone: (lead: Lead) => Promise<void>;
  onSnooze: (lead: Lead, days: number) => Promise<void>;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  leads,
  onMarkDone,
  onSnooze,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentLead = leads[currentIndex];
  const hasFinished = !currentLead || currentIndex >= leads.length;

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleActionDone = async () => {
    if (!currentLead) return;
    await onMarkDone(currentLead);
    handleNext();
  };

  const handleActionSnooze = async () => {
    if (!currentLead) return;
    await onSnooze(currentLead, 1);
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-xl w-full mx-auto text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-lime text-[#14161A] flex items-center justify-center font-bold">
            <Zap size={16} className="text-[#14161A]" strokeWidth={2.8} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Focus Follow-up Mode</h2>
            <p className="text-[11px] text-white/70">
              {hasFinished ? 'Complete' : `${currentIndex + 1} of ${leads.length} due`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Card Stack */}
      <div className="flex-1 flex items-center justify-center max-w-md w-full mx-auto my-6">
        <AnimatePresence mode="wait">
          {!hasFinished ? (
            <motion.div
              key={currentLead.id}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-surface text-ink rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[380px] border border-border-subtle"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <SourceBadge source={currentLead.source} />
                  <span className="text-xs font-bold text-semantic-overdue-text flex items-center gap-1">
                    <Clock size={13} />
                    <span>{formatFollowUpDateDisplay(currentLead.nextFollowUpAt)}</span>
                  </span>
                </div>

                {/* Lead Profile */}
                <div className="flex flex-col items-center text-center my-4">
                  <Avatar
                    name={currentLead.fullName}
                    phone={currentLead.whatsappNumber}
                    avatarColor={currentLead.avatarColor}
                    size={64}
                  />
                  <h3 className="text-xl font-bold text-ink mt-3">
                    {getLeadDisplayName(currentLead)}
                  </h3>
                  <p className="text-xs text-ink-muted font-mono">{currentLead.whatsappNumber}</p>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    {currentLead.purpose}
                  </p>
                </div>

                {/* Last note snippet */}
                {currentLead.summary && (
                  <div className="p-3.5 rounded-xl bg-surface-subtle text-xs text-ink-secondary italic text-center">
                    "{currentLead.summary}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <a
                  href={buildWhatsAppUrl(currentLead.whatsappNumber, `Hi ${getLeadDisplayName(currentLead).split(' ')[0]}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-2xl bg-button-dark hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <FaWhatsapp size={18} className="text-[#25D366]" />
                  <span>Open in WhatsApp</span>
                </a>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleActionSnooze}
                    className="flex-1 h-11 rounded-xl bg-surface-subtle hover:bg-border-subtle text-ink font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock size={15} />
                    <span>Snooze +1 Day</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleActionDone}
                    className="flex-1 h-11 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Check size={16} strokeWidth={2.8} className="text-[#14161A]" />
                    <span className="text-[#14161A]">Mark Done</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-surface text-ink rounded-3xl p-8 shadow-2xl text-center space-y-4 max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-lime text-[#14161A] mx-auto flex items-center justify-center font-bold shadow-sm">
                <Check size={32} strokeWidth={3} className="text-[#14161A]" />
              </div>
              <h3 className="text-xl font-bold text-ink">You're All Caught Up!</h3>
              <p className="text-xs text-ink-muted">
                Great job maintaining follow-up discipline. No more pending items for today.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-button-dark text-white font-bold text-xs cursor-pointer hover:bg-black transition-colors"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-white/50 max-w-md mx-auto">
        Tap button to message · Mark Done or Snooze to advance
      </div>
    </div>
  );
};
