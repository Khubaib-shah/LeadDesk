/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Single source of truth: re-exported from unified server/data/mockData.ts
import { MOCK_LEADS } from '../../server/data/mockData';
import { Lead } from '../types';

export function generateSeedLeads(): Lead[] {
  return JSON.parse(JSON.stringify(MOCK_LEADS));
}
