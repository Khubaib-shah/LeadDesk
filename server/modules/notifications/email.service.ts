/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer, { type Transporter } from 'nodemailer';
import { SettingsRepository } from '../settings/settings.model';

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
  fromEmail?: string;
  fromName?: string;
}

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
  smtpConfig?: SmtpConfig;
}

/**
 * Build a Nodemailer Transporter using custom SMTP settings, environment vars, or Ethereal test fallback
 */
export async function createTransporter(customConfig?: SmtpConfig): Promise<{
  transporter: Transporter;
  fromAddress: string;
  isTestAccount: boolean;
}> {
  // 1. Resolve settings from parameter or database
  let config = customConfig;
  if (!config || !config.host || !config.user) {
    try {
      const dbSettings = await SettingsRepository.get();
      if (dbSettings.smtpHost && dbSettings.smtpUser) {
        config = {
          host: dbSettings.smtpHost,
          port: dbSettings.smtpPort || 587,
          user: dbSettings.smtpUser,
          pass: dbSettings.smtpPass || '',
          secure: dbSettings.smtpSecure || false,
          fromEmail: dbSettings.smtpFromEmail || dbSettings.smtpUser,
          fromName: dbSettings.smtpFromName || 'LeadDesk CRM',
        };
      }
    } catch {
      // ignore
    }
  }

  // 2. Custom SMTP from Settings
  if (config && config.host && config.user && config.pass) {
    const isPort465 = Number(config.port) === 465;
    const isSecure = config.secure !== undefined ? Boolean(config.secure) : isPort465;

    const transporter = nodemailer.createTransport({
      host: config.host.trim(),
      port: Number(config.port) || 587,
      secure: isSecure,
      auth: {
        user: config.user.trim(),
        pass: config.pass.trim(),
      },
    });

    const senderEmail = config.fromEmail?.trim() || config.user.trim();
    const senderName = config.fromName?.trim() || 'LeadDesk CRM';
    const fromAddress = `"${senderName}" <${senderEmail}>`;

    return { transporter, fromAddress, isTestAccount: false };
  }

  // 3. Fallback to Environment Variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isPort465 = process.env.SMTP_PORT === '465';
    const isSecure = process.env.SMTP_SECURE === 'true' || isPort465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
    });

    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromAddress = `"LeadDesk CRM" <${senderEmail}>`;
    return { transporter, fromAddress, isTestAccount: false };
  }

  // 4. Fallback to Ethereal Test Account (generates web-preview link)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return {
      transporter,
      fromAddress: `"LeadDesk CRM" <${testAccount.user}>`,
      isTestAccount: true,
    };
  } catch {
    // 5. Offline JSON transporter
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    return {
      transporter,
      fromAddress: `"LeadDesk CRM" <notifications@leaddesk.app>`,
      isTestAccount: true,
    };
  }
}

/**
 * Test SMTP connection and credentials
 */
export async function verifySmtpConnection(config: SmtpConfig): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { transporter } = await createTransporter(config);
    await transporter.verify();
    return {
      success: true,
      message: 'SMTP connection verified successfully! Server is ready to deliver emails.',
    };
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || 'Failed to connect to SMTP server. Please verify host, port, user and pass.',
    };
  }
}

/**
 * Dispatches a minimal, clean, professional follow-up reminder email
 */
export async function sendFollowUpReminderEmail(params: SendReminderEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
  isTestAccount?: boolean;
}> {
  try {
    const { transporter, fromAddress, isTestAccount } = await createTransporter(params.smtpConfig);

    const stageBadgeLabels: Record<string, string> = {
      '2h_before': '2 Hours Left',
      '1h_before': '1 Hour Left',
      '10m_before': '10 Minutes Left',
      'at_time': 'Due Now',
      'overdue': 'Overdue',
    };

    const stageBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
      '2h_before': { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' },
      '1h_before': { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' },
      '10m_before': { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
      'at_time': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
      'overdue': { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' },
    };

    const badgeLabel = stageBadgeLabels[params.reminderStage] || 'Reminder';
    const badgeStyle = stageBadgeStyles[params.reminderStage] || { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0' };

    const waPhoneClean = params.leadPhone.replace(/[^0-9]/g, '');
    const waUrl = waPhoneClean ? `https://wa.me/${waPhoneClean}` : '';
    const cleanAppUrl = params.appUrl || 'https://ais-dev-oebeqy2d7novbqcuvqgepd-65285170260.asia-southeast1.run.app';
    const leadLink = `${cleanAppUrl}#lead/${params.leadId}`;

    const formattedTime = new Date(params.scheduledTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const subjectLine = `${badgeLabel}: Follow-up with ${params.leadName} (${formattedTime})`;

    // Minimal, ultra-clean, professional executive layout
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectLine}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04); overflow: hidden;">
          
          <!-- Top Brand Bar -->
          <tr>
            <td style="padding: 24px 28px 16px 28px; border-bottom: 1px solid #F1F5F9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.06em; color: #0F172A; text-transform: uppercase;">LeadDesk</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; background-color: ${badgeStyle.bg}; color: ${badgeStyle.text}; border: 1px solid ${badgeStyle.border}; border-radius: 6px;">
                      ${badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading Content -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <h1 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #0F172A; line-height: 1.35; letter-spacing: -0.01em;">
                Follow-up with ${params.leadName}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                Scheduled for <strong style="color: #0F172A;">${formattedTime}</strong>.
              </p>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; width: 35%;">
                    Contact
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 600; color: #0F172A;">
                    ${params.leadName}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B;">
                    Phone / WhatsApp
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #0F172A; font-family: monospace;">
                    ${params.leadPhone || '—'}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B;">
                    Objective
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #334155;">
                    ${params.leadPurpose || 'Follow-up consultation'}
                  </td>
                </tr>

                ${
                  params.leadValue
                    ? `<tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B;">
                    Estimated Value
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 600; color: #0F172A;">
                    $${params.leadValue.toLocaleString()}
                  </td>
                </tr>`
                    : ''
                }

                ${
                  params.summary
                    ? `<tr>
                  <td colspan="2" style="padding: 12px 16px; font-size: 12px; color: #475569; line-height: 1.5; font-style: italic;">
                    &ldquo;${params.summary}&rdquo;
                  </td>
                </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right: 10px;">
                    <a href="${leadLink}" target="_blank" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 12px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 6px; text-align: center;">
                      Open in CRM &rarr;
                    </a>
                  </td>
                  ${
                    waUrl
                      ? `<td>
                    <a href="${waUrl}" target="_blank" style="display: inline-block; background-color: #FFFFFF; color: #0F172A; border: 1px solid #CBD5E1; font-size: 12px; font-weight: 600; text-decoration: none; padding: 9px 16px; border-radius: 6px; text-align: center;">
                      Chat on WhatsApp
                    </a>
                  </td>`
                      : ''
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 28px 24px 28px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; font-size: 11px; color: #64748B; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">This reminder was sent to <strong>${params.toEmail}</strong> from your LeadDesk Personal CRM.</p>
              <p style="margin: 0;">Manage alert cadences or configure custom SMTP in <strong>Settings &gt; Push &amp; Email Alerts</strong>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const plainText = `${badgeLabel}: Follow-up with ${params.leadName}\n\nScheduled for ${formattedTime}\nPhone: ${params.leadPhone}\nObjective: ${params.leadPurpose || 'Follow-up'}\n${params.leadValue ? `Value: $${params.leadValue}\n` : ''}\nOpen in CRM: ${leadLink}\nWhatsApp: ${waUrl}`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: params.toEmail,
      subject: subjectLine,
      html: htmlContent,
      text: plainText,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] Delivered reminder email to ${params.toEmail}. Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Email Service] Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      isTestAccount,
    };
  } catch (err) {
    console.error('[Email Service] Failed to send reminder email:', err);
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}
