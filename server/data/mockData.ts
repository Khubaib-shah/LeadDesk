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

// Templates list starts empty for custom creation.
export const MOCK_TEMPLATES: LeadTemplate[] = [];
