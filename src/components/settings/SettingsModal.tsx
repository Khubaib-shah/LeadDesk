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
  ArrowLeft,
  ChevronDown,
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
  onExportJson?: () => void;
  onToggleTheme?: () => void;
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

  // Profile
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
      'Test Reminder: Alex Rivera',
      'Follow-up scheduled right now for Software MVP ($5,000).',
      'test-lead',
      'at_time'
    );
    toast.success('Test push alert triggered with sound chime!');
  };

  const handleVerifySmtp = async () => {
    if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) {
      toast.error('Enter SMTP Host, Username/Email, and Password.');
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
          text: data.message || 'SMTP connected successfully!',
        });
        toast.success('SMTP server connection verified!');
      } else {
        setSmtpVerificationMsg({
          success: false,
          text: data.message || 'Failed to authenticate.',
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
      toast.error('Enter your email address in Profile first.');
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
        toast.error(`Email error: ${data.message}`);
      }
    } catch (err) {
      toast.error(`Delivery failed: ${(err as Error).message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      toast.success('Settings updated!');
      onClose();
    } catch (err) {
      toast.error(`Save failed: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = getInitials(userName || 'Creator');

  return (
    // On small screen (< md): full separate page view (fixed inset-0 bg-canvas).
    // On desktop (md:): floating centered modal dialog.
    <div className="fixed inset-0 z-50 md:z-60 bg-canvas md:bg-black/50 md:backdrop-blur-xs flex flex-col md:items-center md:justify-center md:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full min-h-screen md:min-h-0 md:max-w-2xl bg-surface text-ink md:rounded-3xl shadow-2xl md:border md:border-border-subtle flex flex-col md:max-h-[90vh] overflow-hidden"
      >
        {/* Mobile Header (Separate Page App-Bar with Back button) */}
        <div className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur-md px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-ink-secondary transition-colors cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <h1 className="text-sm font-bold text-ink tracking-tight">Settings</h1>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-full bg-lime text-[#14161A] text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin text-[#14161A]" /> : <Save size={13} className="text-[#14161A]" />}
            <span>Save</span>
          </button>
        </div>

        {/* Desktop Modal Header */}
        <div className="hidden md:flex p-5 sm:p-6 border-b border-border-subtle items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime/20 text-[#14161A] dark:text-lime flex items-center justify-center font-bold text-sm shadow-xs">
              {userInitials}
            </div>
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight">Settings</h2>
              <p className="text-xs text-ink-muted">Profile, CRM preferences & notifications</p>
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

        {/* Small Screen: Dropdown Section Select (Instead of Tabs) */}
        <div className="sm:hidden px-4 py-2.5 bg-surface border-b border-border-subtle">
          <div className="relative">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as SettingsTab)}
              aria-label="Settings Section"
              className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-bold text-ink appearance-none focus:outline-none focus:border-ink cursor-pointer"
            >
              <option value="profile">Profile & Brand</option>
              <option value="preferences">CRM Preferences</option>
              <option value="notifications">Alerts & Notifications</option>
              <option value="appearance">Theme & Data</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          </div>
        </div>

        {/* Desktop: Horizontal Pill Tabs */}
        <div className="hidden sm:flex items-center px-6 pt-3 border-b border-border-subtle/80 gap-2 bg-surface-subtle/30 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <User size={14} />
            <span>Profile & Brand</span>
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
            <Sliders size={14} />
            <span>CRM Preferences</span>
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
            <Bell size={14} />
            <span>Alerts & Notifications</span>
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
            <Palette size={14} />
            <span>Theme & Data</span>
          </button>
        </div>

        {/* Form Body with Reduced, Minimal Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: PROFILE & BRAND */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    placeholder="e.g. Software Consultant"
                    className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Notification Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="e.g. you@example.com"
                    className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={e => setUserPhone(e.target.value)}
                    placeholder="e.g. +14155552671"
                    className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Short Bio</label>
                <input
                  type="text"
                  value={userBio}
                  onChange={e => setUserBio(e.target.value)}
                  placeholder="One-line summary of services"
                  className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-ink">Message Signature</label>
                  <span className="text-[10px] text-ink-muted">Used in {"{{my_name}}"} tag</span>
                </div>
                <textarea
                  rows={2}
                  value={userSignature}
                  onChange={e => setUserSignature(e.target.value)}
                  placeholder="Best regards,&#10;Alex Rivers"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink focus:outline-none focus:border-ink/40"
                />
              </div>

              {/* Social Channels */}
              <div className="pt-2 border-t border-border-subtle">
                <p className="text-xs font-semibold text-ink-muted mb-2.5">Content Channels (Lead Attribution)</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">@</span>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={e => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                      placeholder="Instagram"
                      className="w-full h-8 pl-6 pr-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-ink"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">@</span>
                    <input
                      type="text"
                      value={tiktokHandle}
                      onChange={e => setTiktokHandle(e.target.value.replace(/^@/, ''))}
                      placeholder="TikTok"
                      className="w-full h-8 pl-6 pr-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-ink"
                    />
                  </div>

                  <input
                    type="text"
                    value={youtubeHandle}
                    onChange={e => setYoutubeHandle(e.target.value)}
                    placeholder="YouTube channel"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />

                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="Website URL"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRM PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Default Country Code</label>
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Currency</label>
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Default Follow-up Hour</label>
                  <input
                    type="time"
                    value={defaultFollowUpTime}
                    onChange={e => setDefaultFollowUpTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Going Cold (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={goingColdDays}
                    onChange={e => setGoingColdDays(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Reschedule Preset Days</label>
                <input
                  type="text"
                  value={cadenceStr}
                  onChange={e => setCadenceStr(e.target.value)}
                  placeholder="2, 5, 10"
                  className="w-full h-9 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                />
                <p className="text-[10px] text-ink-muted mt-1">Comma-separated days on quick bar (+2d, +5d, +10d)</p>
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS & NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Push Alerts Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-lime-deep shrink-0" />
                    <span className="text-xs font-bold text-ink">Browser Push Alerts</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pushPermissionStatus === 'granted'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  }`}>
                    {pushPermissionStatus === 'granted' ? 'Enabled' : 'Needs Permission'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {pushPermissionStatus !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestPush}
                      className="h-8 px-3 rounded-lg bg-lime text-[#14161A] font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Bell size={13} />
                      <span>Enable Push</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendTestPush}
                      className="h-8 px-3 rounded-lg bg-surface border border-border-subtle text-xs font-semibold text-ink flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Test Push Alert</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Email Alerts Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-sky-500 shrink-0" />
                    <span className="text-xs font-bold text-ink">Fallback Email</span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted truncate max-w-[160px] sm:max-w-none">
                    {userEmail || 'No email set'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSendingTestEmail || !userEmail}
                    onClick={handleSendTestEmail}
                    className="h-8 px-3 rounded-lg bg-surface border border-border-subtle text-xs font-semibold text-ink flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingTestEmail ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
                  </button>

                  {lastEmailPreviewUrl && (
                    <a
                      href={lastEmailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold underline"
                    >
                      View Preview ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Dynamic SMTP Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Server size={15} className="text-violet-500 shrink-0" />
                    <span className="text-xs font-bold text-ink">Custom SMTP Server (Optional)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={e => setSmtpHost(e.target.value)}
                    placeholder="Host (e.g. smtp.gmail.com)"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface border border-border-subtle text-xs text-ink font-mono"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={e => setSmtpPort(e.target.value)}
                      placeholder="Port (587)"
                      className="w-20 h-8 px-2.5 rounded-lg bg-surface border border-border-subtle text-xs text-ink font-mono"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smtpSecure}
                        onChange={e => setSmtpSecure(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-lime"
                      />
                      <span>SSL (465)</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={smtpUser}
                    onChange={e => setSmtpUser(e.target.value)}
                    placeholder="SMTP Username / Email"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface border border-border-subtle text-xs text-ink font-mono"
                  />

                  <div className="relative">
                    <input
                      type={showSmtpPass ? 'text' : 'password'}
                      value={smtpPass}
                      onChange={e => setSmtpPass(e.target.value)}
                      placeholder="SMTP Password / App Pass"
                      className="w-full h-8 pl-2.5 pr-8 rounded-lg bg-surface border border-border-subtle text-xs text-ink font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(p => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      {showSmtpPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-ink-muted">
                  Gmail: host <code className="font-mono text-ink">smtp.gmail.com:587</code> with Google App Password.
                </p>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    disabled={isVerifyingSmtp || !smtpHost || !smtpUser}
                    onClick={handleVerifySmtp}
                    className="h-7 px-2.5 rounded-lg bg-surface border border-border-subtle text-xs font-semibold text-ink flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingSmtp ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                    <span>Test SMTP</span>
                  </button>

                  {smtpVerificationMsg && (
                    <span className={`text-xs font-semibold flex items-center gap-1 ${
                      smtpVerificationMsg.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {smtpVerificationMsg.success ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      <span>{smtpVerificationMsg.text}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Schedule Checklist */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
                <p className="text-xs font-bold text-ink mb-1.5">Reminder Schedule</p>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle transition-colors">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-indigo-500 shrink-0" />
                      <span className="text-xs font-semibold text-ink">2 Hours Before</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind2HoursBefore}
                      onChange={e => setRemind2HoursBefore(e.target.checked)}
                      className="w-4 h-4 rounded accent-lime cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle transition-colors">
                    <div className="flex items-center gap-2">
                      <Timer size={14} className="text-violet-500 shrink-0" />
                      <span className="text-xs font-semibold text-ink">1 Hour Before</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind1HourBefore}
                      onChange={e => setRemind1HourBefore(e.target.checked)}
                      className="w-4 h-4 rounded accent-lime cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle transition-colors">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-semibold text-ink">10 Minutes Before</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind10MinBefore}
                      onChange={e => setRemind10MinBefore(e.target.checked)}
                      className="w-4 h-4 rounded accent-lime cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle transition-colors">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-ink">At Exact Time</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindAtTime}
                      onChange={e => setRemindAtTime(e.target.checked)}
                      className="w-4 h-4 rounded accent-lime cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle transition-colors">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      <span className="text-xs font-semibold text-ink">Overdue Reminder</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindOverdue}
                      onChange={e => setRemindOverdue(e.target.checked)}
                      className="w-4 h-4 rounded accent-lime cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-subtle cursor-pointer hover:bg-surface-subtle transition-colors">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-sky-500 shrink-0" />
                      <span className="text-xs font-semibold text-ink">Email Delivery</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotificationsEnabled}
                      onChange={e => setEmailNotificationsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded accent-lime cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THEME & DATA */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">Color Theme</p>
                  <p className="text-[10px] text-ink-muted">Light or dark interface</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="h-8 px-3 rounded-lg bg-surface border border-border-subtle text-xs font-bold text-ink cursor-pointer"
                >
                  {settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">Reduced Motion</p>
                  <p className="text-[10px] text-ink-muted">Disable spring animations</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={e => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 rounded accent-lime cursor-pointer"
                />
              </div>

              {/* Data Actions */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2.5">
                <p className="text-xs font-bold text-ink">Data Management</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onExportJson}
                    className="flex-1 h-8 px-3 rounded-lg bg-surface border border-border-subtle text-xs font-semibold text-ink flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all leads to start completely fresh? This cannot be undone.')) {
                        onClearDemoData();
                        onClose();
                      }
                    }}
                    className="h-8 px-3 rounded-lg bg-semantic-overdue/10 text-semantic-overdue text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Wipe Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl text-xs font-semibold text-ink hover:bg-surface-subtle cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 h-9 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save size={13} className="text-[#14161A]" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
