/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { SettingsRepository } from '../settings/settings.model';
import { sendFollowUpReminderEmail } from './email.service';

interface NotificationLogItem {
  id: string;
  leadId: string;
  leadName: string;
  reminderStage: string;
  channels: string[];
  recipientEmail?: string;
  status: 'sent' | 'failed';
  timestamp: string;
  previewUrl?: string | false;
}

const inMemoryLogs: NotificationLogItem[] = [];

// Track recently sent alerts to prevent duplicate emails within 2 hours for the same lead + stage
const recentAlertsCache = new Map<string, number>();

export const dispatchNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      leadId,
      leadName,
      leadPhone,
      leadPurpose,
      leadValue,
      reminderStage,
      scheduledTime,
      summary,
      force = false,
    } = req.body;

    if (!leadId || !reminderStage) {
      res.status(400).json({ success: false, message: 'leadId and reminderStage are required.' });
      return;
    }

    const dedupKey = `${leadId}_${reminderStage}`;
    const now = Date.now();
    const lastSent = recentAlertsCache.get(dedupKey);

    // Throttle duplicate emails for same lead & stage to once every 60 minutes unless force = true
    if (!force && lastSent && now - lastSent < 60 * 60 * 1000) {
      res.json({
        success: true,
        skipped: true,
        message: 'Notification already dispatched recently for this milestone.',
      });
      return;
    }

    const settings = await SettingsRepository.get();
    const toEmail = req.body.toEmail || settings.userEmail;

    let emailResult: { success: boolean; previewUrl?: string | false; error?: string; messageId?: string } = { success: false };

    // Send email fallback if userEmail is set in settings
    if (toEmail && toEmail.trim() !== '' && toEmail.includes('@')) {
      emailResult = await sendFollowUpReminderEmail({
        toEmail: toEmail.trim(),
        userName: settings.userName,
        leadId,
        leadName: leadName || 'Lead Contact',
        leadPhone: leadPhone || '',
        leadPurpose,
        leadValue,
        reminderStage,
        scheduledTime: scheduledTime || new Date().toISOString(),
        summary,
      });
    }

    recentAlertsCache.set(dedupKey, now);

    const logItem: NotificationLogItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      leadId,
      leadName: leadName || 'Lead',
      reminderStage,
      channels: toEmail ? ['push', 'email'] : ['push'],
      recipientEmail: toEmail,
      status: emailResult.success || !toEmail ? 'sent' : 'failed',
      timestamp: new Date().toISOString(),
      previewUrl: emailResult.previewUrl,
    };

    inMemoryLogs.unshift(logItem);
    if (inMemoryLogs.length > 50) inMemoryLogs.pop();

    res.json({
      success: true,
      data: {
        push: true,
        email: emailResult.success,
        recipientEmail: toEmail || null,
        previewUrl: emailResult.previewUrl || null,
        reminderStage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await SettingsRepository.get();
    const toEmail = req.body.toEmail || req.body.email || settings.userEmail;

    if (!toEmail || !toEmail.trim() || !toEmail.includes('@')) {
      res.status(400).json({
        success: false,
        message: 'No email address found. Please enter your email in Settings > Profile or in the notification test field.',
      });
      return;
    }

    const result = await sendFollowUpReminderEmail({
      toEmail: toEmail.trim(),
      userName: settings.userName || 'Creator',
      leadId: 'test-lead-001',
      leadName: 'Alex Rivera (Demo Client)',
      leadPhone: '+1 415 555 2671',
      leadPurpose: 'Software project ($5,000 MVP)',
      leadValue: 5000,
      reminderStage: '1h_before',
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      summary: 'Discussing Next.js SaaS migration and contract signing.',
    });

    if (result.success) {
      res.json({
        success: true,
        message: `Test email successfully sent to ${toEmail}!`,
        previewUrl: result.previewUrl || null,
        recipient: toEmail,
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Email sending failed: ${result.error}`,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getNotificationLogs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      count: inMemoryLogs.length,
      data: inMemoryLogs,
    });
  } catch (error) {
    next(error);
  }
};
