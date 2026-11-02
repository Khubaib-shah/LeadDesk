import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fillTemplateVariables,
  getLeadDisplayName,
  getInitials,
  buildWhatsAppUrl,
  isFollowUpDueToday,
  isFollowUpOverdue,
} from './leads';

test('fillTemplateVariables replaces variables with correct fallback', () => {
  const template = 'Hi {{first_name}}, following up on {{purpose}} for {{topic}}! Best, {{my_name}}';
  const filled = fillTemplateVariables(template, {
    firstName: 'Alex',
    purpose: 'Software project',
    myName: 'Zubair',
    topic: 'MVP architecture',
  });
  assert.equal(filled, 'Hi Alex, following up on Software project for MVP architecture! Best, Zubair');
});

test('getLeadDisplayName formats names and falls back to phone digits', () => {
  assert.equal(getLeadDisplayName({ fullName: 'Sarah Connor', whatsappNumber: '+14155551234' }), 'Sarah Connor');
  assert.equal(getLeadDisplayName({ fullName: '', whatsappNumber: '+14155554567' }), 'Lead ···4567');
  assert.equal(getLeadDisplayName({ fullName: '   ', whatsappNumber: '+919876543210' }), 'Lead ···3210');
});

test('getInitials extracts two characters correctly', () => {
  assert.equal(getInitials('John Doe'), 'JD');
  assert.equal(getInitials('Elon'), 'EL');
  assert.equal(getInitials('', '+14155551234'), '34');
});

test('buildWhatsAppUrl constructs valid wa.me link with encoded text', () => {
  const url = buildWhatsAppUrl('+1 415 555-2671', 'Hello World!');
  assert.equal(url, 'https://wa.me/14155552671?text=Hello%20World!');
});

test('isFollowUpDueToday returns true for current date', () => {
  const nowIso = new Date().toISOString();
  assert.equal(isFollowUpDueToday(nowIso), true);
  assert.equal(isFollowUpDueToday('2020-01-01T10:00:00Z'), false);
});

test('isFollowUpOverdue returns true for past dates', () => {
  assert.equal(isFollowUpOverdue('2020-01-01T10:00:00Z'), true);
  const future = new Date(Date.now() + 86400000 * 5).toISOString();
  assert.equal(isFollowUpOverdue(future), false);
});
