/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { LeadRepository } from './modules/leads/lead.model';
import { TemplateRepository } from './modules/templates/template.model';
import { SettingsRepository } from './modules/settings/settings.model';
import { MOCK_LEADS, MOCK_TEMPLATES } from './data/mockData';

test('LeadRepository loads unified mock leads initially', async () => {
  const leads = await LeadRepository.getAll();
  assert.ok(leads.length >= MOCK_LEADS.length);
  assert.equal(leads[0].id, 'lead-01');
  assert.equal(leads[0].whatsappNumber, '+919876543210');
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

test('TemplateRepository provides seeded templates and supports updates', async () => {
  const templates = await TemplateRepository.getAll();
  assert.ok(templates.length >= MOCK_TEMPLATES.length);

  const tpl1 = await TemplateRepository.getById('tpl-1');
  assert.ok(tpl1);
  assert.equal(tpl1.channel, 'WhatsApp');
});

test('SettingsRepository returns default settings and updates cleanly', async () => {
  const initial = await SettingsRepository.get();
  assert.equal(initial.userName, 'Zubair');

  const updated = await SettingsRepository.update({ userName: 'Zubair Baacha' });
  assert.equal(updated.userName, 'Zubair Baacha');

  // Restore
  await SettingsRepository.update({ userName: 'Zubair' });
});
