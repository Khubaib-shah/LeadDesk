import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePhoneInput, findDuplicatePhone, normalizePhoneForComparison } from './phone';

test('parsePhoneInput parses wa.me links with country code', () => {
  const res = parsePhoneInput('https://wa.me/14155552671');
  assert.equal(res.isValid, true);
  assert.equal(res.e164, '+14155552671');
});

test('parsePhoneInput extracts combined name and phone', () => {
  const res = parsePhoneInput('Zubair +1 415 555 2671');
  assert.equal(res.isValid, true);
  assert.equal(res.extractedName, 'Zubair');
  assert.equal(res.e164, '+14155552671');
});

test('findDuplicatePhone detects exact and suffix digit matches', () => {
  const leads = [
    { id: '1', whatsappNumber: '+14155552671', fullName: 'Alice' },
    { id: '2', whatsappNumber: '+919876543210', fullName: 'Bob' },
  ];

  const dup = findDuplicatePhone('415-555-2671', leads);
  assert.ok(dup);
  assert.equal(dup.id, '1');

  const dup2 = findDuplicatePhone('+919876543210', leads);
  assert.ok(dup2);
  assert.equal(dup2.fullName, 'Bob');

  const noDup = findDuplicatePhone('+447911123456', leads);
  assert.equal(noDup, null);
});
