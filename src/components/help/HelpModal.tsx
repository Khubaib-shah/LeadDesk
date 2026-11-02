/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Keyboard, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Quick Add new lead in 10 seconds' },
    { key: '⌘K or /', desc: 'Open Command Palette & fast search' },
    { key: 'G then L', desc: 'Jump to Leads directory' },
    { key: 'G then F', desc: 'Jump to Follow-ups queue' },
    { key: 'G then P', desc: 'Jump to Deal Pipeline' },
    { key: 'G then A', desc: 'Jump to Analytics & attribution' },
    { key: '?', desc: 'Show this shortcuts & tips dialog' },
    { key: 'Esc', desc: 'Close any active drawer or modal' },
  ];

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-surface text-ink rounded-3xl shadow-2xl border border-border-subtle p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime text-[#14161A] flex items-center justify-center font-bold">
              <Keyboard size={18} className="text-[#14161A]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Shortcuts & Speed Tips</h2>
              <p className="text-xs text-ink-muted">Master LeadDesk with one-hand and keyboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle text-xs"
            >
              <span className="text-ink-secondary">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-surface border border-border-subtle font-mono text-[11px] font-bold text-ink shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* 1-2 click philosophy */}
        <div className="p-3.5 rounded-2xl bg-lime/20 border border-lime/40 text-xs text-ink space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>The 1-or-2 Click Rule</span>
          </p>
          <p className="text-ink-secondary leading-relaxed">
            Message on WhatsApp in 1 click. Schedule next follow-up in 2 clicks. No slow admin templates or endless modal clicks.
          </p>
        </div>

        {/* Attributions */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted">
          <span>LeadDesk v1.0 (Solo Creator Edition)</span>
          <a
            href="https://icons8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink flex items-center gap-1"
          >
            <span>Animated icons by Icons8</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </motion.div>
    </div>
  );
};
