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
  Bell,
  Send,
  Check,
  AlertTriangle,
  Loader2,
  Clock,
  Timer,
  Zap,
  Target,
  Server,
  Key,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { AppSettings } from '../../types';
import { CustomSelect } from '../common/Select';
import { getInitials } from '../../utils/leads';
import { requestPushPermission, triggerPushNotification, playNotificationChime } from '../../utils/notifications';
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

type SettingsTab = 'profile' | 'preferences' | 'notifications' | 'appearance';

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

  // Push & Email Notification Settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(settings.pushNotificationsEnabled ?? true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(settings.emailNotificationsEnabled ?? true);
  const [remind2HoursBefore, setRemind2HoursBefore] = useState(settings.remind2HoursBefore ?? true);
  const [remind1HourBefore, setRemind1HourBefore] = useState(settings.remind1HourBefore ?? true);
  const [remind10MinBefore, setRemind10MinBefore] = useState(settings.remind10MinBefore ?? true);
  const [remindAtTime, setRemindAtTime] = useState(settings.remindAtTime ?? true);
  const [remindOverdue, setRemindOverdue] = useState(settings.remindOverdue ?? true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [lastEmailPreviewUrl, setLastEmailPreviewUrl] = useState<string | null>(null);

  // Dynamic Custom SMTP Server
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState<number | string>(settings.smtpPort || 587);
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState(settings.smtpPass || '');
  const [smtpSecure, setSmtpSecure] = useState(Boolean(settings.smtpSecure));
  const [smtpFromEmail, setSmtpFromEmail] = useState(settings.smtpFromEmail || '');
  const [smtpFromName, setSmtpFromName] = useState(settings.smtpFromName || 'LeadDesk CRM');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);
  const [smtpVerificationMsg, setSmtpVerificationMsg] = useState<{ success: boolean; text: string } | null>(null);

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
    setPushNotificationsEnabled(settings.pushNotificationsEnabled ?? true);
    setEmailNotificationsEnabled(settings.emailNotificationsEnabled ?? true);
    setRemind2HoursBefore(settings.remind2HoursBefore ?? true);
    setRemind1HourBefore(settings.remind1HourBefore ?? true);
    setRemind10MinBefore(settings.remind10MinBefore ?? true);
    setRemindAtTime(settings.remindAtTime ?? true);
    setRemindOverdue(settings.remindOverdue ?? true);
    setSmtpHost(settings.smtpHost || '');
    setSmtpPort(settings.smtpPort || 587);
    setSmtpUser(settings.smtpUser || '');
    setSmtpPass(settings.smtpPass || '');
    setSmtpSecure(Boolean(settings.smtpSecure));
    setSmtpFromEmail(settings.smtpFromEmail || '');
    setSmtpFromName(settings.smtpFromName || 'LeadDesk CRM');
    if (typeof Notification !== 'undefined') {
      setPushPermissionStatus(Notification.permission);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    const res = await requestPushPermission();
    setPushPermissionStatus(res);
  };

  const handleSendTestPush = async () => {
    playNotificationChime();
    await triggerPushNotification(
      '🎯 Test Push: Alex Rivera',
      'Follow-up due right now for Software Project ($5k). WhatsApp direct link ready.',
      'test-lead',
      'at_time'
    );
    toast.success('Test push alert triggered! (Audio chime + Native push)');
  };

  const handleVerifySmtp = async () => {
    if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) {
      toast.error('Please enter SMTP Host, Username/Email, and Password.');
      return;
    }

    setIsVerifyingSmtp(true);
    setSmtpVerificationMsg(null);
    try {
      const res = await fetch('/api/notifications/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          user: smtpUser.trim(),
          pass: smtpPass.trim(),
          secure: smtpSecure,
          fromEmail: smtpFromEmail.trim() || smtpUser.trim(),
          fromName: smtpFromName.trim() || 'LeadDesk CRM',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpVerificationMsg({
          success: true,
          text: data.message || 'SMTP server connection verified successfully!',
        });
        toast.success('SMTP server connection verified! Ready for production delivery.');
      } else {
        setSmtpVerificationMsg({
          success: false,
          text: data.message || 'Failed to authenticate with SMTP server.',
        });
        toast.error(`SMTP error: ${data.message}`);
      }
    } catch (err) {
      const msg = (err as Error).message;
      setSmtpVerificationMsg({ success: false, text: msg });
      toast.error(`Connection failed: ${msg}`);
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!userEmail || !userEmail.trim() || !userEmail.includes('@')) {
      toast.error('Please enter a valid email address first in Profile & Identity.');
      setActiveTab('profile');
      return;
    }

    setIsSendingTestEmail(true);
    setLastEmailPreviewUrl(null);
    try {
      const currentSmtpConfig = smtpHost.trim() && smtpUser.trim() && smtpPass.trim() ? {
        host: smtpHost.trim(),
        port: Number(smtpPort) || 587,
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
        secure: smtpSecure,
        fromEmail: smtpFromEmail.trim() || smtpUser.trim(),
        fromName: smtpFromName.trim() || 'LeadDesk CRM',
      } : undefined;

      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: userEmail.trim(),
          smtpConfig: currentSmtpConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Test email sent to ${userEmail}!`);
        if (data.previewUrl) {
          setLastEmailPreviewUrl(data.previewUrl);
        }
      } else {
        toast.error(`Email delivery error: ${data.message}`);
      }
    } catch (err) {
      toast.error(`Failed to send test email: ${(err as Error).message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

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
        pushNotificationsEnabled,
        emailNotificationsEnabled,
        remind2HoursBefore,
        remind1HourBefore,
        remind10MinBefore,
        remindAtTime,
        remindOverdue,
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim(),
        smtpSecure,
        smtpFromEmail: smtpFromEmail.trim(),
        smtpFromName: smtpFromName.trim(),
      });

      toast.success('Profile, push & email notification settings updated!');
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
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Bell size={15} />
            <span>Push & Email Alerts</span>
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

          {/* TAB 3: PUSH NOTIFICATIONS & EMAIL ALERTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              {/* Push Notifications Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center text-[#14161A] font-bold shrink-0">
                      <Bell size={16} className="text-[#14161A]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink flex items-center gap-2">
                        <span>Browser & Push Notifications</span>
                        <span className="text-[10px] font-semibold text-ink-muted">· Firebase Connected</span>
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Receive instant sound and desktop push alerts for scheduled lead follow-ups.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      pushPermissionStatus === 'granted'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : pushPermissionStatus === 'denied'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {pushPermissionStatus === 'granted'
                      ? 'Push Enabled'
                      : pushPermissionStatus === 'denied'
                      ? 'Blocked in Browser'
                      : 'Permission Needed'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-subtle/70">
                  {pushPermissionStatus !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestPush}
                      className="h-9 px-4 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Bell size={13} className="text-[#14161A]" />
                      <span>Enable Push Notifications</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendTestPush}
                      className="h-9 px-4 rounded-xl bg-surface border border-border-subtle hover:bg-surface-subtle text-ink font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Send size={13} />
                      <span>Send Test Push Notification</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Fallback Email Notification Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pastel-lavender flex items-center justify-center text-[#14161A] font-bold shrink-0">
                      <Mail size={16} className="text-[#14161A]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">Fallback Email Notifications</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        If you miss or don&apos;t see the push alert, LeadDesk drops an automated reminder directly to your email.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Recipient Email (from Profile Setting)</span>
                    <span className="text-xs font-bold text-ink font-mono">
                      {userEmail && userEmail.trim() ? userEmail : <em className="text-semantic-overdue font-normal">Not configured — set your email in Profile & Identity</em>}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSendingTestEmail || !userEmail}
                    onClick={handleSendTestEmail}
                    className="h-8 px-3 rounded-lg bg-surface-subtle hover:bg-border-subtle disabled:opacity-50 text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {isSendingTestEmail ? <Loader2 size={13} className="animate-spin text-ink" /> : <Send size={13} />}
                    <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
                  </button>
                </div>

                {lastEmailPreviewUrl && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Email delivered! View message preview:</span>
                    <a
                      href={lastEmailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:opacity-80"
                    >
                      Open Email Preview ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Dynamic Custom SMTP Server Configuration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
                      <Server size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink flex items-center gap-2">
                        <span>Outgoing SMTP Mail Server</span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Dynamic (No Env Vars Needed)
                        </span>
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Configure your custom SMTP credentials here to send emails from your own domain or Gmail without restarting the server.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={e => setSmtpHost(e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      className="w-full h-9 px-3 rounded-xl bg-surface border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">SMTP Port</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={e => setSmtpPort(e.target.value)}
                        placeholder="587"
                        className="w-24 h-9 px-3 rounded-xl bg-surface border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 font-mono"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={smtpSecure}
                          onChange={e => setSmtpSecure(e.target.checked)}
                          className="w-3.5 h-3.5 rounded cursor-pointer accent-lime"
                        />
                        <span>SSL / Port 465</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">SMTP Username / Email</label>
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={e => setSmtpUser(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full h-9 px-3 rounded-xl bg-surface border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">SMTP Password / App Password</label>
                    <div className="relative">
                      <input
                        type={showSmtpPass ? 'text' : 'password'}
                        value={smtpPass}
                        onChange={e => setSmtpPass(e.target.value)}
                        placeholder="e.g. 16-character app password"
                        className="w-full h-9 pl-3 pr-9 rounded-xl bg-surface border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(p => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                        title={showSmtpPass ? 'Hide password' : 'Show password'}
                      >
                        {showSmtpPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Sender From Email (Optional)</label>
                    <input
                      type="email"
                      value={smtpFromEmail}
                      onChange={e => setSmtpFromEmail(e.target.value)}
                      placeholder="Defaults to SMTP Username"
                      className="w-full h-9 px-3 rounded-xl bg-surface border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Sender Display Name</label>
                    <input
                      type="text"
                      value={smtpFromName}
                      onChange={e => setSmtpFromName(e.target.value)}
                      placeholder="e.g. LeadDesk CRM"
                      className="w-full h-9 px-3 rounded-xl bg-surface border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface border border-border-subtle text-[11px] text-ink-muted leading-relaxed">
                  <span className="font-semibold text-ink">Gmail Tip:</span> Use Host <code className="text-ink font-mono font-semibold">smtp.gmail.com</code>, Port <code className="text-ink font-mono font-semibold">587</code>, and generate a 16-character App Password under your <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-ink">Google Account &gt; Security &gt; App Passwords</a>.
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    disabled={isVerifyingSmtp || !smtpHost || !smtpUser}
                    onClick={handleVerifySmtp}
                    className="h-8 px-3 rounded-lg bg-surface border border-border-subtle hover:bg-surface-subtle disabled:opacity-50 text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isVerifyingSmtp ? <Loader2 size={13} className="animate-spin text-ink" /> : <ShieldCheck size={13} />}
                    <span>{isVerifyingSmtp ? 'Verifying SMTP...' : 'Test SMTP Connection'}</span>
                  </button>

                  {smtpVerificationMsg && (
                    <span className={`text-xs font-semibold flex items-center gap-1 ${
                      smtpVerificationMsg.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {smtpVerificationMsg.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      <span>{smtpVerificationMsg.text}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Stage Alert Thresholds */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-ink-secondary" />
                  <p className="text-xs font-bold text-ink">Automated Reminder Schedule</p>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Choose the timeline milestones when LeadDesk will trigger push and fallback email alerts:
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Clock size={13} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">2 Hours Left</span>
                        <span className="text-[11px] text-ink-muted">Early heads-up 2 hours before scheduled time</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind2HoursBefore}
                      onChange={e => setRemind2HoursBefore(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-lime"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                        <Timer size={13} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">1 Hour Left</span>
                        <span className="text-[11px] text-ink-muted">Reminder 1 hour before scheduled time</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind1HourBefore}
                      onChange={e => setRemind1HourBefore(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-lime"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Zap size={13} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">10 Minutes Left</span>
                        <span className="text-[11px] text-ink-muted">High-priority urgent nudge 10 minutes before</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind10MinBefore}
                      onChange={e => setRemind10MinBefore(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-lime"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Target size={13} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">Exact Moment</span>
                        <span className="text-[11px] text-ink-muted">Alert at the exact scheduled follow-up minute</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindAtTime}
                      onChange={e => setRemindAtTime(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-lime"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <AlertTriangle size={13} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">Overdue Alert (Repeat)</span>
                        <span className="text-[11px] text-ink-muted">If follow-up wasn&apos;t completed, remind again</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindOverdue}
                      onChange={e => setRemindOverdue(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-lime"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Mail size={13} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block">Email Fallback Enabled</span>
                        <span className="text-[11px] text-ink-muted">Send email along with every push notification</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotificationsEnabled}
                      onChange={e => setEmailNotificationsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-lime"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE & DATABASE */}
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
