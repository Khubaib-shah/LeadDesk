/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, AppSettings } from '../types';
import { savePushSubscriptionToFirestore, logNotificationToFirestore } from '../lib/firebase';
import { toast } from 'sonner';

export type ReminderStage = '2h_before' | '1h_before' | '10m_before' | 'at_time' | 'overdue';

// In-memory set of triggered reminders for the current active session
const sentMilestones = new Set<string>();

/**
 * Generate a clean, pleasant notification chime bell using Web Audio API
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (E5 ~ 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second harmonic chime tone (A5 ~ 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.9);
  } catch {
    // Non-blocking if audio context is restricted
  }
}

/**
 * Request browser push notification permission and register service worker
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    toast.error('This browser does not support desktop push notifications.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      let swRegistration: ServiceWorkerRegistration | null = null;
      if ('serviceWorker' in navigator) {
        try {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('[Notification Service] Service Worker registered:', swRegistration.scope);
        } catch (swErr) {
          console.warn('[Notification Service] Service Worker registration failed:', swErr);
        }
      }

      // Connect and save subscription to Firebase Firestore
      await savePushSubscriptionToFirestore({
        userAgent: navigator.userAgent,
        endpoint: swRegistration?.scope || 'browser_notification_api',
      });

      playNotificationChime();
      toast.success('Push notifications successfully enabled and connected to Firebase!');
    } else if (permission === 'denied') {
      toast.error('Push notification permission was blocked in your browser settings.');
    }

    return permission;
  } catch (err) {
    console.error('[Notification Service] Error requesting push permission:', err);
    return 'denied';
  }
}

/**
 * Display a native desktop or mobile push notification
 */
export async function triggerPushNotification(
  title: string,
  body: string,
  leadId?: string,
  stage?: ReminderStage
): Promise<void> {
  playNotificationChime();

  if (navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {}
  }

  // 1. Try Service Worker showNotification if active
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/logo.webp',
          badge: '/logo.webp',
          tag: `lead-${leadId || 'general'}-${stage || 'alert'}`,
          data: { leadId },
        });
        return;
      }
    } catch (err) {
      console.warn('[Notification Service] SW notification fallback to standard Notification API:', err);
    }
  }

  // 2. Standard Window Notification fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/logo.webp',
        badge: '/logo.webp',
        tag: `lead-${leadId || 'general'}-${stage || 'alert'}`,
      });
      n.onclick = () => {
        window.focus();
        if (leadId) {
          window.location.hash = `lead/${leadId}`;
        }
      };
    } catch (err) {
      console.warn('[Notification Service] Window notification fallback:', err);
    }
  }
}

/**
 * Evaluates active leads against multi-stage reminder rules (2h, 1h, 10m, At Time, Overdue)
 * and dispatches both Push Notifications and Fallback Email to userEmail from settings.
 */
export async function checkAndDispatchLeadReminders(
  leads: Lead[],
  settings: AppSettings,
  onOpenLead?: (lead: Lead) => void
): Promise<void> {
  const activeLeads = leads.filter(
    l => !l.archived && l.stage !== 'Won' && l.stage !== 'Lost' && l.nextFollowUpAt
  );

  const now = Date.now();

  for (const lead of activeLeads) {
    if (!lead.nextFollowUpAt) continue;
    const scheduledMs = new Date(lead.nextFollowUpAt).getTime();
    if (isNaN(scheduledMs)) continue;

    const diffMin = (scheduledMs - now) / (60 * 1000);
    const leadName = lead.fullName || lead.whatsappNumber || 'Lead Contact';

    let stageToTrigger: ReminderStage | null = null;
    let title = '';
    let body = '';

    // 1. 2 Hours Left Window (between 105 and 130 minutes before)
    if (diffMin > 105 && diffMin <= 130 && settings.remind2HoursBefore !== false) {
      stageToTrigger = '2h_before';
      title = `⏰ Follow-up in 2 Hours: ${leadName}`;
      body = `Scheduled for ${new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${lead.purpose || 'Software inquiry'}).`;
    }
    // 2. 1 Hour Left Window (between 45 and 70 minutes before)
    else if (diffMin > 45 && diffMin <= 70 && settings.remind1HourBefore !== false) {
      stageToTrigger = '1h_before';
      title = `⏰ 1 Hour Reminder: ${leadName}`;
      body = `Prepare your talking points. Scheduled at ${new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    }
    // 3. 10 Minutes Left Window (between 4 and 15 minutes before)
    else if (diffMin > 4 && diffMin <= 15 && settings.remind10MinBefore !== false) {
      stageToTrigger = '10m_before';
      title = `⚡ 10 Minutes Left: ${leadName}`;
      body = `Follow-up starting very soon! Click to open details and start WhatsApp chat.`;
    }
    // 4. Exact Moment Window (within ±4 minutes)
    else if (diffMin >= -4 && diffMin <= 4 && settings.remindAtTime !== false) {
      stageToTrigger = 'at_time';
      title = `🎯 Follow-up Due Right Now: ${leadName}`;
      body = `It is time to reach out to ${leadName} via ${lead.followUpChannel || 'WhatsApp'}.`;
    }
    // 5. Overdue Window (5 minutes to 24 hours overdue if not completed)
    else if (diffMin < -5 && diffMin >= -1440 && settings.remindOverdue !== false) {
      stageToTrigger = 'overdue';
      const hoursOverdue = Math.abs(Math.round(diffMin / 60));
      title = `🚨 Overdue Reminder: ${leadName}`;
      body = `Follow-up was scheduled for ${new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${hoursOverdue > 0 ? `${hoursOverdue}h overdue` : 'missed'}). Don't let this deal cool down!`;
    }

    if (!stageToTrigger) continue;

    // Milestone deduplication key
    const milestoneKey = `${lead.id}_${stageToTrigger}_${lead.nextFollowUpAt.split('T')[0]}_${Math.floor(scheduledMs / (1000 * 60 * 15))}`;
    const storageKey = `leaddesk_milestone_${milestoneKey}`;

    if (sentMilestones.has(milestoneKey) || localStorage.getItem(storageKey)) {
      continue;
    }

    // Mark as sent immediately to prevent concurrent triggers
    sentMilestones.add(milestoneKey);
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {}

    // 1. Dispatch Push Notification
    if (settings.pushNotificationsEnabled !== false) {
      triggerPushNotification(title, body, lead.id, stageToTrigger);
    }

    // 2. In-App Interactive Toast with Action
    toast(title, {
      description: body,
      duration: 8000,
      action: {
        label: 'Open Lead',
        onClick: () => {
          if (onOpenLead) onOpenLead(lead);
          window.location.hash = `lead/${lead.id}`;
        },
      },
    });

    // 3. Dispatch Backend Fallback Email & Firestore Sync
    try {
      const response = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          leadName,
          leadPhone: lead.whatsappNumber,
          leadPurpose: lead.purpose,
          leadValue: lead.estimatedValue,
          reminderStage: stageToTrigger,
          scheduledTime: lead.nextFollowUpAt,
          summary: lead.summary || lead.followUpNote,
          toEmail: settings.userEmail,
        }),
      });

      const resData = await response.json();
      if (resData.data?.email && resData.data?.recipientEmail) {
        console.log(`[Notification Service] Fallback email sent to ${resData.data.recipientEmail}`);
      }

      // Log to Firebase Cloud Firestore
      await logNotificationToFirestore({
        leadId: lead.id,
        leadName,
        title,
        body,
        reminderStage: stageToTrigger,
        channel: settings.userEmail ? 'both' : 'push',
        emailRecipient: settings.userEmail,
        status: 'sent',
      });
    } catch (apiErr) {
      console.warn('[Notification Service] Background notification dispatch error:', apiErr);
    }
  }
}
