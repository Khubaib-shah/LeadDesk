/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LeadSource =
  | 'WhatsApp'
  | 'TikTok'
  | 'Instagram'
  | 'YouTube'
  | 'LinkedIn'
  | 'X'
  | 'Facebook'
  | 'Email'
  | 'Referral'
  | 'Website'
  | 'Other';

export type LeadPurpose =
  | 'Software project'
  | 'Consultation or mentoring'
  | 'Course or coaching'
  | 'Collaboration or sponsorship'
  | 'Job or hiring'
  | 'Question or support'
  | 'Other';

export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold';

export type FollowUpChannel = 'WhatsApp' | 'Email' | 'Call' | 'DM';

export type InteractionType = 'WhatsApp' | 'Email' | 'Call' | 'Meeting' | 'Note';

export interface Interaction {
  id: string;
  type: InteractionType;
  text: string;
  timestamp: string;
  channel?: string;
}

export interface Lead {
  id: string;
  fullName: string;
  whatsappNumber: string; // E.164 formatted (+1234567890)
  altPhone?: string;
  email?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  company?: string;
  city?: string;
  country?: string;

  // Origin
  source: LeadSource;
  sourceDetail?: string; // Video title, reel URL, post topic
  referredBy?: string;
  firstContactAt: string; // ISO string

  // Intent
  purpose: LeadPurpose;
  interestedIn?: string;
  estimatedValue?: number;
  currency: string;
  deadline?: string;

  // Conversation
  summary: string;
  interactions: Interaction[];

  // Pipeline
  stage: LeadStage;
  temperature: LeadTemperature;
  lostReason?: string;
  wonValue?: number;
  closedAt?: string;

  // Follow-up
  nextFollowUpAt?: string; // ISO string
  followUpChannel: FollowUpChannel;
  followUpNote?: string;
  reminder?: 'at_time' | '1h_before' | '1d_before';
  lastContactedAt: string; // ISO string
  followUpCount: number;

  // Meta
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  avatarColor: string;
}

export interface LeadTemplate {
  id: string;
  title: string;
  category: 'first_reply' | 'follow_up' | 'proposal' | 'nudge' | 'thank_you' | 'close';
  channel: 'WhatsApp' | 'Email';
  subject?: string;
  body: string;
}

export interface AppSettings {
  userName: string;
  userRole?: string;
  userEmail?: string;
  userPhone?: string;
  userBio?: string;
  userSignature: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  youtubeHandle?: string;
  websiteUrl?: string;
  defaultCountryCode: string;
  defaultCurrency: string;
  defaultFollowUpTime: string;
  cadenceDays: number[];
  goingColdDays: number;
  theme: 'light' | 'dark';
  reducedMotion?: boolean;

  // Push & Email Notification Settings
  pushNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  remind2HoursBefore?: boolean;
  remind1HourBefore?: boolean;
  remind10MinBefore?: boolean;
  remindAtTime?: boolean;
  remindOverdue?: boolean;
}

export interface LeadFilterQuery {
  search?: string;
  source?: string;
  stage?: string;
  temperature?: string;
  railFilter?: string;
  preset?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
