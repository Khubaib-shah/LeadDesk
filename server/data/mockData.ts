/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, LeadTemplate, AppSettings } from '../modules/leads/lead.types';

export const MOCK_SETTINGS: AppSettings = {
  userName: 'Creator',
  userRole: 'Software Engineer & Creator',
  userEmail: '',
  userPhone: '',
  userBio: 'Building and shipping projects.',
  userSignature: 'Best regards,\nCreator',
  instagramHandle: '',
  tiktokHandle: '',
  youtubeHandle: '',
  websiteUrl: '',
  defaultCountryCode: 'US',
  defaultCurrency: 'USD',
  defaultFollowUpTime: '10:00',
  cadenceDays: [2, 5, 10],
  goingColdDays: 7,
  theme: 'light',
  reducedMotion: false,
};

// All mock leads removed as requested by user. The database starts fresh and empty.
export const MOCK_LEADS: Lead[] = [];

// Default messaging templates for outreach & follow-ups
export const MOCK_TEMPLATES: LeadTemplate[] = [
  {
    id: 'tpl-1',
    title: 'First Reply (WhatsApp Warm)',
    category: 'first_reply',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}! Thanks for reaching out regarding {{purpose}}. I’d love to hear more about your goals and how we can work together. Are you free for a quick 10-minute chat this week?',
  },
  {
    id: 'tpl-2',
    title: '48-Hour Follow-up (Friendly Check-in)',
    category: 'follow_up',
    channel: 'WhatsApp',
    body: 'Hey {{first_name}}, just following up on our conversation about {{purpose}}. Let me know if you have any questions or if you would like me to prepare a quick outline for you!',
  },
  {
    id: 'tpl-3',
    title: '1-Week Nudge (Gentle Touchpoint)',
    category: 'nudge',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}, hope you’re having a great week! Wanted to check in regarding {{purpose}}. No rush at all—just let me know whenever you’re ready to take the next step.',
  },
  {
    id: 'tpl-4',
    title: 'Proposal Follow-up (Email)',
    category: 'proposal',
    channel: 'Email',
    subject: 'Proposal & Next Steps for {{purpose}}',
    body: 'Hi {{first_name}},\n\nI hope you had a chance to review the scope and proposal for {{purpose}}.\n\nHappy to hop on a quick call if you’d like to tweak any details or discuss timelines.\n\nBest regards,\n{{my_name}}',
  },
  {
    id: 'tpl-5',
    title: 'Thank You & Onboarding Kickoff',
    category: 'thank_you',
    channel: 'WhatsApp',
    body: 'Awesome to have you on board, {{first_name}}! Really excited to collaborate on {{purpose}}. I will send over our kickoff onboarding details shortly.',
  },
];
