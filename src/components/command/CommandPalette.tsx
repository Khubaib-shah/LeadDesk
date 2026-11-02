/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Home, Users, Kanban, Clock, BarChart3, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Lead, ViewTab } from '../../types';
import { Avatar } from '../common/Avatar';
import { getLeadDisplayName, buildWhatsAppUrl } from '../../utils/leads';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenQuickAdd: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  leads,
  onOpenLead,
  onNavigateTab,
  onOpenQuickAdd,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLeads = query.trim()
    ? leads
        .filter(l => {
          const q = query.toLowerCase();
          return (
            (l.fullName || '').toLowerCase().includes(q) ||
            l.whatsappNumber.includes(q) ||
            (l.purpose || '').toLowerCase().includes(q) ||
            (l.company || '').toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: -10 }}
        className="w-full max-w-xl bg-surface text-ink rounded-3xl shadow-2xl border border-border-subtle overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-3">
          <Search size={18} className="text-ink-muted shrink-0" />
          <input
            autoFocus
            type="text"
            dir="auto"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search leads..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-disabled focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-[10px] font-mono border border-border-subtle text-ink-muted">
            ESC
          </kbd>
        </div>

        {/* Results / Commands */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
          {/* Quick Leads Match */}
          {filteredLeads.length > 0 && (
            <div className="mb-2">
              <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                Matching Leads
              </span>
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onClose();
                    onOpenLead(lead);
                  }}
                  className="px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Avatar
                      name={lead.fullName}
                      phone={lead.whatsappNumber}
                      avatarColor={lead.avatarColor}
                      size={28}
                    />
                    <div className="overflow-hidden">
                      <span className="font-bold text-ink block truncate">
                        {getLeadDisplayName(lead)}
                      </span>
                      <span className="text-[10px] text-ink-muted block truncate font-mono">
                        {lead.whatsappNumber} · {lead.purpose}
                      </span>
                    </div>
                  </div>

                  <ArrowRight size={14} className="text-ink-disabled group-hover:text-ink shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {/* Core Navigation Commands */}
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
            Navigation & Actions
          </span>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenQuickAdd();
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 text-ink">
              <Plus size={16} className="text-lime" />
              <span className="font-semibold">Quick Add New Lead</span>
            </div>
            <kbd className="text-[10px] text-ink-muted font-mono">N</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('HOME');
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 text-ink">
              <Home size={16} className="text-ink-secondary" />
              <span className="font-semibold">Jump to Dashboard</span>
            </div>
            <kbd className="text-[10px] text-ink-muted font-mono">G H</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('LEADS');
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 text-ink">
              <Users size={16} className="text-ink-secondary" />
              <span className="font-semibold">Jump to Leads Directory</span>
            </div>
            <kbd className="text-[10px] text-ink-muted font-mono">G L</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('FOLLOW-UPS');
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 text-ink">
              <Clock size={16} className="text-ink-secondary" />
              <span className="font-semibold">Jump to Follow-ups Queue</span>
            </div>
            <kbd className="text-[10px] text-ink-muted font-mono">G F</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('PIPELINE');
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 text-ink">
              <Kanban size={16} className="text-ink-secondary" />
              <span className="font-semibold">Jump to Deal Pipeline</span>
            </div>
            <kbd className="text-[10px] text-ink-muted font-mono">G P</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('ANALYTICS');
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-surface-subtle flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 text-ink">
              <BarChart3 size={16} className="text-ink-secondary" />
              <span className="font-semibold">Jump to Analytics & Content Attribution</span>
            </div>
            <kbd className="text-[10px] text-ink-muted font-mono">G A</kbd>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
