/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LeadTemplate {
  id: string;
  title: string;
  category: 'first_reply' | 'follow_up' | 'proposal' | 'nudge' | 'thank_you' | 'close';
  channel: 'WhatsApp' | 'Email';
  subject?: string;
  body: string;
}
