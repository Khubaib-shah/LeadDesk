/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { Lead, Interaction } from '../types';

export interface LeadFilterParams {
  source?: string;
  stage?: string;
  temperature?: string;
  railFilter?: string;
  preset?: string;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  archived?: boolean;
}

export async function fetchLeads(params?: LeadFilterParams): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params) {
    if (params.source) query.set('source', params.source);
    if (params.stage) query.set('stage', params.stage);
    if (params.temperature) query.set('temperature', params.temperature);
    if (params.railFilter) query.set('railFilter', params.railFilter);
    if (params.preset) query.set('preset', params.preset);
    if (params.search) query.set('search', params.search);
    if (params.sortField) query.set('sortField', params.sortField);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.archived !== undefined) query.set('archived', String(params.archived));
  }

  const qs = query.toString();
  const endpoint = qs ? `/api/leads?${qs}` : '/api/leads';
  return apiRequest<Lead[]>(endpoint);
}

export async function fetchLeadById(id: string): Promise<Lead> {
  return apiRequest<Lead>(`/api/leads/${encodeURIComponent(id)}`);
}

export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  return apiRequest<Lead>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  return apiRequest<Lead>(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteLead(id: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteLeads(ids: string[]): Promise<{ count: number }> {
  return apiRequest<{ count: number }>('/api/leads/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function logInteraction(
  leadId: string,
  interaction: Omit<Interaction, 'id'>,
  nextFollowUpAt?: string
): Promise<Lead> {
  return apiRequest<Lead>(`/api/leads/${encodeURIComponent(leadId)}/interactions`, {
    method: 'POST',
    body: JSON.stringify({ interaction, nextFollowUpAt }),
  });
}

export async function resetLeadsToMock(): Promise<Lead[]> {
  return apiRequest<Lead[]>('/api/leads/reset', {
    method: 'POST',
  });
}
