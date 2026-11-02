/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format, isToday, isBefore, startOfDay, parseISO, differenceInDays } from 'date-fns';
import { Lead } from '../types';

export const PASTEL_COLORS = [
  '#C9C3F5', // lavender
  '#A9C8FA', // sky
  '#92E2B3', // mint
  '#F8CDB0', // peach
  '#F6E7A1', // butter
  '#F5B8C4', // rose
];

/**
 * Returns a deterministic pastel hex from a string seed.
 */
export function getAvatarColor(seed: string): string {
  if (!seed) return PASTEL_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}

/**
 * Generates clean 1-2 character initials for avatar.
 */
export function getInitials(fullName?: string, phone?: string): string {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (phone) {
    const digits = phone.replace(/[^\d]/g, '');
    return digits.slice(-2) || 'LD';
  }
  return 'LD';
}

/**
 * Returns formatted lead title: Name if available, or "Lead ···4567" from phone.
 */
export function getLeadDisplayName(lead: Pick<Lead, 'fullName' | 'whatsappNumber'>): string {
  if (lead.fullName && lead.fullName.trim()) {
    return lead.fullName.trim();
  }
  const digits = lead.whatsappNumber ? lead.whatsappNumber.replace(/[^\d]/g, '') : '';
  if (digits.length >= 4) {
    return `Lead ···${digits.slice(-4)}`;
  }
  return 'New Lead';
}

/**
 * Checks if follow-up date is strictly today.
 */
export function isFollowUpDueToday(dateIso?: string): boolean {
  if (!dateIso) return false;
  try {
    const date = typeof dateIso === 'string' ? parseISO(dateIso) : new Date(dateIso);
    return isToday(date);
  } catch {
    return false;
  }
}

/**
 * Checks if follow-up date is in the past (before today's start).
 */
export function isFollowUpOverdue(dateIso?: string): boolean {
  if (!dateIso) return false;
  try {
    const date = typeof dateIso === 'string' ? parseISO(dateIso) : new Date(dateIso);
    const todayStart = startOfDay(new Date());
    return isBefore(date, todayStart);
  } catch {
    return false;
  }
}

/**
 * Checks if a lead has not been contacted for >= threshold days (e.g. 7 days).
 */
export function isLeadGoingCold(lastContactIso?: string, thresholdDays = 7): boolean {
  if (!lastContactIso) return false;
  try {
    const lastDate = typeof lastContactIso === 'string' ? parseISO(lastContactIso) : new Date(lastContactIso);
    const diff = differenceInDays(new Date(), lastDate);
    return diff >= thresholdDays;
  } catch {
    return false;
  }
}

/**
 * Replaces {{first_name}}, {{purpose}}, {{my_name}}, {{topic}} in templates.
 */
export function fillTemplateVariables(
  templateBody: string,
  vars: {
    firstName?: string;
    purpose?: string;
    myName?: string;
    topic?: string;
  }
): string {
  let result = templateBody;
  const fName = vars.firstName || 'there';
  const purpose = vars.purpose || 'your request';
  const myName = vars.myName || 'Zubair';
  const topic = vars.topic || 'project discussion';

  result = result.replace(/{{\s*first_name\s*}}/gi, fName);
  result = result.replace(/{{\s*purpose\s*}}/gi, purpose);
  result = result.replace(/{{\s*my_name\s*}}/gi, myName);
  result = result.replace(/{{\s*topic\s*}}/gi, topic);

  return result;
}

/**
 * Generates direct wa.me link with encoded text.
 */
export function buildWhatsAppUrl(phoneNumber: string, prefilledText?: string): string {
  const digits = phoneNumber.replace(/[^\d]/g, '');
  const base = `https://wa.me/${digits}`;
  if (!prefilledText) return base;
  return `${base}?text=${encodeURIComponent(prefilledText)}`;
}

/**
 * Generates direct Gmail compose link with mailto fallback.
 */
export function buildGmailComposeUrl(email: string, subject = '', body = ''): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email,
    su: subject,
    body: body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Generates Google Calendar event creation URL.
 */
export function buildGoogleCalendarUrl(title: string, details: string, startIso?: string): string {
  let startTime = startIso ? new Date(startIso) : new Date(Date.now() + 86400000);
  if (isNaN(startTime.getTime())) {
    startTime = new Date(Date.now() + 86400000);
  }
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min default

  const formatCalTime = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dates = `${formatCalTime(startTime)}/${formatCalTime(endTime)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    dates: dates,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates downloadable .ics iCalendar file content.
 */
export function generateIcsContent(title: string, details: string, startIso?: string): string {
  const startTime = startIso ? new Date(startIso) : new Date(Date.now() + 86400000);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  const formatIcsTime = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LeadDesk//Follow-up Event//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `DTSTART:${formatIcsTime(startTime)}`,
    `DTEND:${formatIcsTime(endTime)}`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `UID:${Date.now()}@leaddesk.app`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Formats a date relative or short (e.g. "Today 2:00 PM", "Tomorrow 10:00 AM", "Oct 14").
 */
export function formatFollowUpDateDisplay(dateIso?: string): string {
  if (!dateIso) return 'Not scheduled';
  try {
    const d = parseISO(dateIso);
    if (isToday(d)) {
      return `Today · ${format(d, 'h:mm a')}`;
    }
    return format(d, 'MMM d · h:mm a');
  } catch {
    return 'Invalid date';
  }
}
