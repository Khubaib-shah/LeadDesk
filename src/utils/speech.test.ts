/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { isSpeechSynthesisSupported, isSpeechRecognitionSupported, speakText } from './speech';

test('isSpeechSynthesisSupported returns boolean', () => {
  const result = isSpeechSynthesisSupported();
  assert.strictEqual(typeof result, 'boolean');
});

test('isSpeechRecognitionSupported returns boolean', () => {
  const result = isSpeechRecognitionSupported();
  assert.strictEqual(typeof result, 'boolean');
});

test('speakText gracefully handles empty string or unsupported environment', () => {
  let ended = false;
  const controller = speakText('', {
    onEnd: () => {
      ended = true;
    },
  });
  assert.strictEqual(typeof controller.stop, 'function');
  controller.stop();
});
