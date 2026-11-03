/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Save,
  RotateCcw,
  Download,
  User,
  Sliders,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Share2,
} from 'lucide-react';
import { AppSettings } from '../../types';
import { CustomSelect } from '../common/Select';
import { getInitials } from '../../utils/leads';
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

type SettingsTab = 'profile' | 'preferences' | 'appearance';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearDemoData,
  onExportJson,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile fields
  const [userName, setUserName] = useState(settings.userName || '');
  const [userRole, setUserRole] = useState(settings.userRole || '');
  const [userEmail, setUserEmail] = useState(settings.userEmail || '');
  const [userPhone, setUserPhone] = useState(settings.userPhone || '');
  const [userBio, setUserBio] = useState(settings.userBio || '');
  const [userSignature, setUserSignature] = useState(settings.userSignature || '');

  // Social & Channels
  const [instagramHandle, setInstagramHandle] = useState(settings.instagramHandle || '');
  const [tiktokHandle, setTiktokHandle] = useState(settings.tiktokHandle || '');
  const [youtubeHandle, setYoutubeHandle] = useState(settings.youtubeHandle || '');
  const [websiteUrl, setWebsiteUrl] = useState(settings.websiteUrl || '');

  // Preferences
  const [defaultCountryCode, setDefaultCountryCode] = useState(settings.defaultCountryCode || 'US');
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency || 'USD');
  const [defaultFollowUpTime, setDefaultFollowUpTime] = useState(settings.defaultFollowUpTime || '10:00');
  const [goingColdDays, setGoingColdDays] = useState(settings.goingColdDays || 7);
  const [cadenceStr, setCadenceStr] = useState((settings.cadenceDays || [2, 5, 10]).join(', '));
  const [reducedMotion, setReducedMotion] = useState(Boolean(settings.reducedMotion));

  // Sync state whenever settings change
  useEffect(() => {
    setUserName(settings.userName || '');
    setUserRole(settings.userRole || '');
    setUserEmail(settings.userEmail || '');
    setUserPhone(settings.userPhone || '');
    setUserBio(settings.userBio || '');
    setUserSignature(settings.userSignature || '');
    setInstagramHandle(settings.instagramHandle || '');
    setTiktokHandle(settings.tiktokHandle || '');
    setYoutubeHandle(settings.youtubeHandle || '');
    setWebsiteUrl(settings.websiteUrl || '');
    setDefaultCountryCode(settings.defaultCountryCode || 'US');
    setDefaultCurrency(settings.defaultCurrency || 'USD');
    setDefaultFollowUpTime(settings.defaultFollowUpTime || '10:00');
    setGoingColdDays(settings.goingColdDays || 7);
    setCadenceStr((settings.cadenceDays || [2, 5, 10]).join(', '));
    setReducedMotion(Boolean(settings.reducedMotion));
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedCadence = cadenceStr
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0);

      await onSaveSettings({
        userName: userName.trim() || 'Creator',
        userRole: userRole.trim(),
        userEmail: userEmail.trim(),
        userPhone: userPhone.trim(),
        userBio: userBio.trim(),
        userSignature: userSignature.trim(),
        instagramHandle: instagramHandle.trim(),
        tiktokHandle: tiktokHandle.trim(),
        youtubeHandle: youtubeHandle.trim(),
        websiteUrl: websiteUrl.trim(),
        defaultCountryCode,
        defaultCurrency,
        defaultFollowUpTime,
        goingColdDays: Number(goingColdDays) || 7,
        cadenceDays: parsedCadence.length > 0 ? parsedCadence : [2, 5, 10],
        reducedMotion,
      });

      toast.success('Profile and settings updated in database!');
      onClose();
    } catch (err) {
      toast.error(`Save failed: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = getInitials(userName || 'Creator');

  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-surface text-ink rounded-3xl shadow-2xl border border-border-subtle flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-lime/20 text-[#14161A] dark:text-lime flex items-center justify-center font-bold text-base shadow-xs">
              {userInitials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink tracking-tight">Profile & Settings</h2>
              <p className="text-xs text-ink-muted">Personal brand identity and database preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink cursor-pointer transition-colors"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-border-subtle/80 gap-2 bg-surface-subtle/30 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <User size={15} />
            <span>Profile & Identity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Sliders size={15} />
            <span>CRM & Follow-ups</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Palette size={15} />
            <span>Theme & Storage</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: PROFILE & IDENTITY */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-ink-muted" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-ink-muted" />
                    <span>Professional Headline / Role</span>
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    placeholder="e.g. Software Engineer & Creator"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1.5">
                    <Mail size={14} className="text-ink-muted" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1.5">
                    <Phone size={14} className="text-ink-muted" />
                    <span>WhatsApp / Direct Mobile</span>
                  </label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={e => setUserPhone(e.target.value)}
                    placeholder="e.g. +14155552671"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Short Bio / Pitch</label>
                <textarea
                  rows={2}
                  value={userBio}
                  onChange={e => setUserBio(e.target.value)}
                  placeholder="e.g. Helping high-growth startups build and scale web apps in React, Node & TypeScript."
                  className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Default Message Signature</label>
                <textarea
                  rows={2}
                  value={userSignature}
                  onChange={e => setUserSignature(e.target.value)}
                  placeholder="e.g. Best regards,&#10;Alex Rivers"
                  className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 transition-colors"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  Replaces <code className="text-ink font-semibold">{"{{my_name}}"}</code> in your outreach templates.
                </p>
              </div>

              {/* Social Channels */}
              <div className="pt-3 border-t border-border-subtle">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-1.5">
                  <Share2 size={13} />
                  <span>Your Content Channels (For Lead Attribution)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Instagram Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted font-bold">@</span>
                      <input
                        type="text"
                        value={instagramHandle}
                        onChange={e => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                        placeholder="yourhandle"
                        className="w-full h-9 pl-7 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">TikTok Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted font-bold">@</span>
                      <input
                        type="text"
                        value={tiktokHandle}
                        onChange={e => setTiktokHandle(e.target.value.replace(/^@/, ''))}
                        placeholder="yourhandle"
                        className="w-full h-9 pl-7 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">YouTube Channel</label>
                    <input
                      type="text"
                      value={youtubeHandle}
                      onChange={e => setYoutubeHandle(e.target.value)}
                      placeholder="e.g. @YourChannel"
                      className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Personal Website / Portfolio</label>
                    <div className="relative">
                      <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourdomain.com"
                        className="w-full h-9 pl-8 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES & CRM */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Default Country Code</label>
                  <CustomSelect
                    value={defaultCountryCode}
                    onChange={val => setDefaultCountryCode(val)}
                    className="w-full"
                    options={[
                      { value: 'US', label: 'United States (+1)' },
                      { value: 'IN', label: 'India (+91)' },
                      { value: 'GB', label: 'United Kingdom (+44)' },
                      { value: 'AE', label: 'UAE (+971)' },
                      { value: 'PK', label: 'Pakistan (+92)' },
                      { value: 'SG', label: 'Singapore (+65)' },
                      { value: 'CA', label: 'Canada (+1)' },
                      { value: 'DE', label: 'Germany (+49)' },
                      { value: 'FR', label: 'France (+33)' },
                      { value: 'AU', label: 'Australia (+61)' },
                      { value: 'SA', label: 'Saudi Arabia (+966)' },
                    ]}
                  />
                  <p className="text-[11px] text-ink-muted mt-1">Pre-selected when quickly adding phone numbers.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Default Currency</label>
                  <CustomSelect
                    value={defaultCurrency}
                    onChange={val => setDefaultCurrency(val)}
                    className="w-full"
                    options={[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' },
                      { value: 'INR', label: 'INR (₹)' },
                      { value: 'AED', label: 'AED (AED)' },
                      { value: 'CAD', label: 'CAD ($)' },
                      { value: 'AUD', label: 'AUD ($)' },
                      { value: 'SAR', label: 'SAR (SAR)' },
                    ]}
                  />
                  <p className="text-[11px] text-ink-muted mt-1">Currency used for deal estimates and won revenue.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Daily Follow-up Hour</label>
                  <input
                    type="time"
                    value={defaultFollowUpTime}
                    onChange={e => setDefaultFollowUpTime(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                  <p className="text-[11px] text-ink-muted mt-1">Default scheduled time when you set follow-ups.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Going Cold Alert (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={goingColdDays}
                    onChange={e => setGoingColdDays(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                  <p className="text-[11px] text-ink-muted mt-1">Flags leads not contacted for this many days.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Follow-up Cadence Preset Days</label>
                <input
                  type="text"
                  value={cadenceStr}
                  onChange={e => setCadenceStr(e.target.value)}
                  placeholder="2, 5, 10"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  Comma-separated days shown on the 1-click follow-up reschedule bar (e.g. +2d, +5d, +10d).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & DATABASE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">Color Theme</p>
                  <p className="text-[11px] text-ink-muted">Switch between light canvas and high-contrast dark mode</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="h-9 px-4 rounded-xl bg-surface border border-border-subtle hover:border-ink/20 text-xs font-bold text-ink transition-colors cursor-pointer shadow-xs"
                >
                  {settings.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">Reduced Motion</p>
                  <p className="text-[11px] text-ink-muted">Disable spring transitions for faster navigation</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={e => setReducedMotion(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-lime"
                />
              </div>

              {/* Database & Data Management */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-semantic-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <span>Database Storage Connected</span>
                      <CheckCircle2 size={13} className="text-semantic-success" />
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Settings and lead mutations are fetched and saved directly in your backend database.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle/80 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={onExportJson}
                    className="flex-1 h-9 px-3 rounded-xl bg-surface border border-border-subtle hover:border-ink/20 text-xs font-semibold text-ink flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download size={14} />
                    <span>Export Data (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all leads to start completely fresh? This cannot be undone.')) {
                        onClearDemoData();
                        onClose();
                      }
                    }}
                    className="h-9 px-3 rounded-xl bg-semantic-overdue/10 hover:bg-semantic-overdue/20 text-semantic-overdue text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span>Wipe All Leads</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-xl text-xs font-semibold hover:bg-surface-subtle text-ink cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 h-10 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
            >
              <Save size={14} className="text-[#14161A]" />
              <span className="text-[#14161A]">{isSaving ? 'Saving...' : 'Save Profile & Settings'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
