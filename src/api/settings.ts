/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { AppSettings } from '../types';

export async function fetchSettings(): Promise<AppSettings> {
  return apiRequest<AppSettings>('/api/settings');
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  return apiRequest<AppSettings>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}
