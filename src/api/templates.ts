/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { LeadTemplate } from '../types';
import { localFallbackStore } from './localStore';

export async function fetchTemplates(): Promise<LeadTemplate[]> {
  try {
    return await apiRequest<LeadTemplate[]>('/api/templates');
  } catch (err) {
    console.warn('[Templates API] Backend 404, using local templates:', (err as Error).message);
    return localFallbackStore.getTemplates();
  }
}

export async function fetchTemplateById(id: string): Promise<LeadTemplate> {
  try {
    return await apiRequest<LeadTemplate>(`/api/templates/${encodeURIComponent(id)}`);
  } catch (err) {
    const local = localFallbackStore.getTemplates().find(t => t.id === id);
    if (local) return local;
    throw err;
  }
}

export async function createTemplate(data: Omit<LeadTemplate, 'id'>): Promise<LeadTemplate> {
  try {
    const created = await apiRequest<LeadTemplate>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localFallbackStore.createTemplate(created);
    return created;
  } catch (err) {
    return localFallbackStore.createTemplate(data);
  }
}

export async function updateTemplate(id: string, updates: Partial<LeadTemplate>): Promise<LeadTemplate> {
  try {
    const updated = await apiRequest<LeadTemplate>(`/api/templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    localFallbackStore.updateTemplate(id, updates);
    return updated;
  } catch (err) {
    return localFallbackStore.updateTemplate(id, updates);
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    await apiRequest(`/api/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {
    // ignore
  }
  localFallbackStore.deleteTemplate(id);
}
