/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { AppSettings } from '../types';
import { localFallbackStore } from './localStore';

export async function fetchSettings(): Promise<AppSettings> {
  try {
    return await apiRequest<AppSettings>('/api/settings');
  } catch (err) {
    console.warn('[Settings API] Backend 404, using local settings:', (err as Error).message);
    return localFallbackStore.getSettings();
  }
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const res = await apiRequest<AppSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    localFallbackStore.updateSettings(res);
    return res;
  } catch (err) {
    console.warn('[Settings API] Backend 404 on update, saving to local settings:', (err as Error).message);
    return localFallbackStore.updateSettings(updates);
  }
}
