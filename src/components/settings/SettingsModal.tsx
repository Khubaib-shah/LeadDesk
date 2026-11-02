/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, RotateCcw, Download, Moon, Sun, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../../types';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (updates: Partial<AppSettings>) => Promise<void>;
  onClearDemoData: () => void;
  onExportJson: () => void;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearDemoData,
  onExportJson,
  onToggleTheme,
}) => {
  const [userName, setUserName] = useState(settings.userName || 'Zubair');
  const [userSignature, setUserSignature] = useState(settings.userSignature || '');
  const [defaultCountryCode, setDefaultCountryCode] = useState(settings.defaultCountryCode || 'US');
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency || 'USD');
  const [defaultFollowUpTime, setDefaultFollowUpTime] = useState(settings.defaultFollowUpTime || '10:00');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      userName,
      userSignature,
      defaultCountryCode,
      defaultCurrency,
      defaultFollowUpTime,
    });
    toast.success('Settings saved successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-surface text-ink rounded-3xl shadow-2xl border border-border-subtle flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight">LeadDesk Settings</h2>
            <p className="text-xs text-ink-muted">Personal defaults and local storage configuration</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* User Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Profile & Signature</h3>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Default Signature</label>
              <textarea
                rows={2}
                value={userSignature}
                onChange={e => setUserSignature(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
              />
            </div>
          </div>

          {/* Regional & Time Defaults */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Defaults</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Default Country</label>
                <select
                  value={defaultCountryCode}
                  onChange={e => setDefaultCountryCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink cursor-pointer"
                >
                  <option value="US">United States (+1)</option>
                  <option value="IN">India (+91)</option>
                  <option value="PK">Pakistan (+92)</option>
                  <option value="AE">UAE (+971)</option>
                  <option value="GB">United Kingdom (+44)</option>
                  <option value="SG">Singapore (+65)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Default Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={e => setDefaultCurrency(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED (AED)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Default Follow-up Time</label>
              <input
                type="time"
                value={defaultFollowUpTime}
                onChange={e => setDefaultFollowUpTime(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
              />
            </div>
          </div>

          {/* Data Backup & Reset */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Data & Privacy</h3>
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink-secondary flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-semantic-success shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Local-First Storage</p>
                <p className="mt-0.5">Your lead data is stored in your browser's IndexedDB.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportJson}
                className="flex-1 h-9 px-3 rounded-xl border border-border-subtle hover:bg-surface-subtle text-xs font-semibold text-ink flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all demo leads?')) {
                    onClearDemoData();
                    onClose();
                  }
                }}
                className="h-9 px-3 rounded-xl bg-semantic-overdue/10 hover:bg-semantic-overdue/20 text-semantic-overdue text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-xl text-xs font-semibold hover:bg-surface-subtle text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 rounded-xl bg-lime hover:bg-lime-hover text-ink font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
