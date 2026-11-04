/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer, { type Transporter } from 'nodemailer';

export interface SendReminderEmailParams {
  toEmail: string;
  userName?: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadPurpose?: string;
  leadValue?: number;
  reminderStage: '2h_before' | '1h_before' | '10m_before' | 'at_time' | 'overdue';
  scheduledTime: string;
  summary?: string;
  appUrl?: string;
}

let cachedTransporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;

  // Check if custom SMTP is defined in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Create an automatic Ethereal test account for verified real email delivery & previewing
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Service] Initialized notification transporter (Test account: ${testAccount.user})`);
    return cachedTransporter;
  } catch (err) {
    console.warn('[Email Service] Failed to create test SMTP transporter, using json fallback:', err);
    // JSON transport fallback for environments without internet SMTP access
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return cachedTransporter;
  }
}

export async function sendFollowUpReminderEmail(params: SendReminderEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}> {
  try {
    const transporter = await getTransporter();

    const stageTitles: Record<string, string> = {
      '2h_before': '⏰ Follow-up in 2 Hours',
      '1h_before': '⏰ Follow-up in 1 Hour',
      '10m_before': '⚡ Urgent: Follow-up in 10 Minutes',
      'at_time': '🎯 Scheduled Follow-up Due Right Now',
      'overdue': '🚨 Overdue: Missed Follow-up Reminder',
    };

    const stageColors: Record<string, string> = {
      '2h_before': '#A9C8FA',
      '1h_before': '#C9C3F5',
      '10m_before': '#F5B544',
      'at_time': '#D4F56B',
      'overdue': '#E5484D',
    };

    const stageTitle = stageTitles[params.reminderStage] || 'Follow-up Reminder';
    const accentColor = stageColors[params.reminderStage] || '#D4F56B';
    const waUrl = `https://wa.me/${params.leadPhone.replace(/[^0-9]/g, '')}`;
    const cleanAppUrl = params.appUrl || 'https://ais-dev-oebeqy2d7novbqcuvqgepd-65285170260.asia-southeast1.run.app';
    const leadLink = `${cleanAppUrl}#lead/${params.leadId}`;

    const formattedTime = new Date(params.scheduledTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F4F4; margin: 0; padding: 24px; color: #14161A; }
    .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E3E6E8; padding: 32px; box-shadow: 0 4px 20px rgba(20,22,26,0.06); }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #F3F5F6; padding-bottom: 16px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; background-color: ${accentColor}; color: #14161A; text-transform: uppercase; letter-spacing: 0.05em; }
    .lead-box { background: #F3F5F6; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .lead-name { font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #14161A; }
    .lead-meta { font-size: 13px; color: #4A515B; margin: 4px 0; }
    .cta-button { display: inline-block; background-color: #D4F56B; color: #14161A; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 16px; text-align: center; }
    .wa-button { display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 12px; text-decoration: none; margin-left: 10px; }
    .footer { font-size: 11px; color: #636B76; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span style="font-weight: 900; font-size: 15px; letter-spacing: 0.05em;">LEADDESK CRM</span>
      <span class="badge">${stageTitle}</span>
    </div>

    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">Don't let this lead slip away!</h2>
    <p style="font-size: 14px; color: #4A515B; margin: 0 0 16px 0;">
      Hi ${params.userName || 'Creator'}, you have a scheduled follow-up due at <strong>${formattedTime}</strong>.
    </p>

    <div class="lead-box">
      <div class="lead-name">${params.leadName}</div>
      <div class="lead-meta">📱 <strong>WhatsApp:</strong> ${params.leadPhone}</div>
      <div class="lead-meta">🎯 <strong>Intent / Purpose:</strong> ${params.leadPurpose || 'Software inquiry'}</div>
      ${params.leadValue ? `<div class="lead-meta">💰 <strong>Estimated Value:</strong> $${params.leadValue.toLocaleString()}</div>` : ''}
      ${params.summary ? `<div class="lead-meta" style="margin-top: 10px; border-top: 1px dashed #D7DBDF; padding-top: 8px;">📝 <em>"${params.summary}"</em></div>` : ''}
    </div>

    <div style="margin-top: 20px;">
      <a href="${leadLink}" class="cta-button" target="_blank">Open in LeadDesk</a>
      ${params.leadPhone ? `<a href="${waUrl}" class="wa-button" target="_blank">Chat on WhatsApp</a>` : ''}
    </div>

    <div class="footer">
      This automated alert was sent from your LeadDesk Personal CRM settings to <strong>${params.toEmail}</strong>.<br/>
      You can manage your notification thresholds in Profile &gt; Settings.
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: `"LeadDesk CRM" <notifications@leaddesk.app>`,
      to: params.toEmail,
      subject: `${stageTitle}: ${params.leadName} (${formattedTime})`,
      html: htmlContent,
      text: `${stageTitle}\n\nHi ${params.userName || 'Creator'},\n\nYou have a scheduled follow-up with ${params.leadName} (${params.leadPhone}) at ${formattedTime}.\nPurpose: ${params.leadPurpose || 'Software inquiry'}\n\nOpen Lead: ${leadLink}\nWhatsApp: ${waUrl}`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] Sent follow-up email to ${params.toEmail}. Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Email Service] Ethereal email preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (err) {
    console.error('[Email Service] Failed to send reminder email:', err);
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}
