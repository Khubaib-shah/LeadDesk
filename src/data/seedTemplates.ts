/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeadTemplate } from '../types';

export const SEED_TEMPLATES: LeadTemplate[] = [
  {
    id: 'tpl-1',
    title: 'First Reply (Quick Welcome)',
    category: 'first_reply',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}! Thanks for reaching out about {{purpose}}. I’d love to learn more about what you have in mind. Could you share a quick overview of your goals and timeline? — {{my_name}}',
  },
  {
    id: 'tpl-2',
    title: 'Follow-up 1 (Value & Portfolio Check)',
    category: 'follow_up',
    channel: 'WhatsApp',
    body: 'Hey {{first_name}}, following up on our chat regarding {{purpose}}! Here are a couple similar projects I built recently that match your scope. Let me know if you’d like to jump on a quick 15-min sync this week.',
  },
  {
    id: 'tpl-3',
    title: 'Follow-up 2 (Mid-Week Check-in)',
    category: 'follow_up',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}, just checking in to see if you had a chance to review the details for {{topic}}. Happy to answer any questions or adjust the scope to fit your launch target.',
  },
  {
    id: 'tpl-4',
    title: 'Follow-up 3 (Scope & Availability)',
    category: 'follow_up',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}, I’m planning my project schedule for the upcoming weeks. If you still want to proceed with {{purpose}}, let me know by Friday so I can reserve your build slot!',
  },
  {
    id: 'tpl-5',
    title: 'Proposal Sent (Breakdown & Next Steps)',
    category: 'proposal',
    channel: 'Email',
    subject: 'Proposal & Scope Breakdown for {{purpose}} — {{my_name}}',
    body: 'Hi {{first_name}},\n\nI’ve put together the proposal and timeline for {{purpose}} based on our conversation about {{topic}}.\n\nPlease take a look when you have a moment. Looking forward to your thoughts!\n\nBest regards,\n{{my_name}}',
  },
  {
    id: 'tpl-6',
    title: 'Gentle Nudge (Going Cold)',
    category: 'nudge',
    channel: 'WhatsApp',
    body: 'Hey {{first_name}}, hope you’re having a great week! Did you still want to explore {{purpose}} or is it better to put this on pause for now? No worries either way!',
  },
  {
    id: 'tpl-7',
    title: 'Thank You & Onboarding',
    category: 'thank_you',
    channel: 'WhatsApp',
    body: 'Awesome working with you, {{first_name}}! Really excited to kick off {{purpose}}. I will prepare the kickoff checklist and shared workspace shortly.',
  },
  {
    id: 'tpl-8',
    title: 'Polite Close (Archive)',
    category: 'close',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}, I haven’t heard back so I’ll archive our thread on {{topic}} for now. Whenever you’re ready to pick this back up in the future, my door is always open. Wishing you the best!',
  },
];
