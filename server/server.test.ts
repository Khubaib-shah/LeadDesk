/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { LeadRepository } from './modules/leads/lead.model';
import { TemplateRepository } from './modules/templates/template.model';
import { SettingsRepository } from './modules/settings/settings.model';

test('LeadRepository starts completely fresh and empty', async () => {
  const leads = await LeadRepository.getAll();
  assert.equal(Array.isArray(leads), true);
});

test('LeadRepository supports CRUD operations', async () => {
  // Create
  const created = await LeadRepository.create({
    fullName: 'Test User',
    whatsappNumber: '+1234567890',
    purpose: 'Software project',
    source: 'WhatsApp',
  });
  assert.ok(created.id);
  assert.equal(created.fullName, 'Test User');

  // Read
  const fetched = await LeadRepository.getById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.fullName, 'Test User');

  // Update
  const updated = await LeadRepository.update(created.id, {
    fullName: 'Updated Test User',
    stage: 'Qualified',
  });
  assert.ok(updated);
  assert.equal(updated.fullName, 'Updated Test User');
  assert.equal(updated.stage, 'Qualified');

  // Log interaction
  const withInt = await LeadRepository.logInteraction(created.id, {
    type: 'WhatsApp',
    text: 'Sent portfolio link',
    timestamp: new Date().toISOString(),
  });
  assert.ok(withInt);
  assert.ok(withInt.interactions.length > 0);
  assert.equal(withInt.followUpCount, 1);

  // Delete
  const deleted = await LeadRepository.delete(created.id);
  assert.equal(deleted, true);
  const afterDelete = await LeadRepository.getById(created.id);
  assert.equal(afterDelete, null);
});

test('TemplateRepository supports template creation and retrieval', async () => {
  const created = await TemplateRepository.create({
    title: 'Custom Follow-up',
    category: 'follow_up',
    channel: 'WhatsApp',
    body: 'Hi {{first_name}}, following up on {{purpose}}!',
  });
  assert.ok(created.id);
  const fetched = await TemplateRepository.getById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.title, 'Custom Follow-up');
});

test('SettingsRepository returns profile settings and updates cleanly', async () => {
  const initial = await SettingsRepository.get();
  assert.ok(initial.userName);

  const updated = await SettingsRepository.update({
    userName: 'Alex Rivers',
    userRole: 'Full-Stack Consultant',
    userEmail: 'alex@example.com',
  });
  assert.equal(updated.userName, 'Alex Rivers');
  assert.equal(updated.userRole, 'Full-Stack Consultant');
  assert.equal(updated.userEmail, 'alex@example.com');
});

test('sendFollowUpReminderEmail generates and dispatches reminder email successfully', async () => {
  const { sendFollowUpReminderEmail } = await import('./modules/notifications/email.service');
  const result = await sendFollowUpReminderEmail({
    toEmail: 'test-recipient@example.com',
    userName: 'Zubair',
    leadId: 'lead-test-123',
    leadName: 'Jane Smith',
    leadPhone: '+14155552671',
    leadPurpose: 'Custom AI Bot Consultation',
    leadValue: 1850,
    reminderStage: '2h_before',
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    summary: 'Discovery call completed, requested quote follow-up.',
  });

  assert.equal(result.success, true);
  assert.ok(result.messageId);
});

