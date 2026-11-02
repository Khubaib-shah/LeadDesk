/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { LeadTemplate } from '../types';

export async function fetchTemplates(): Promise<LeadTemplate[]> {
  return apiRequest<LeadTemplate[]>('/api/templates');
}

export async function fetchTemplateById(id: string): Promise<LeadTemplate> {
  return apiRequest<LeadTemplate>(`/api/templates/${encodeURIComponent(id)}`);
}

export async function createTemplate(data: Omit<LeadTemplate, 'id'>): Promise<LeadTemplate> {
  return apiRequest<LeadTemplate>('/api/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTemplate(id: string, updates: Partial<LeadTemplate>): Promise<LeadTemplate> {
  return apiRequest<LeadTemplate>(`/api/templates/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiRequest(`/api/templates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
