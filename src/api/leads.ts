/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './client';
import { Lead, Interaction } from '../types';
import { localFallbackStore } from './localStore';

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

  try {
    const leads = await apiRequest<Lead[]>(endpoint);
    return leads;
  } catch (err) {
    console.warn('[Leads API] Backend unavailable or 404, using resilient local storage:', (err as Error).message);
    return localFallbackStore.getLeads(params as any);
  }
}

export async function fetchLeadById(id: string): Promise<Lead> {
  try {
    return await apiRequest<Lead>(`/api/leads/${encodeURIComponent(id)}`);
  } catch (err) {
    console.warn(`[Leads API] Backend 404 for lead ${id}, using local fallback:`, (err as Error).message);
    const local = localFallbackStore.getLeadById(id);
    if (local) return local;
    throw err;
  }
}

export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  try {
    const created = await apiRequest<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
    // Sync to local cache
    localFallbackStore.createLead(created);
    return created;
  } catch (err) {
    console.warn('[Leads API] Backend 404 on create, saving to resilient local storage:', (err as Error).message);
    return localFallbackStore.createLead(leadData);
  }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  try {
    const updated = await apiRequest<Lead>(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    // Sync to local
    localFallbackStore.updateLead(id, updates);
    return updated;
  } catch (err) {
    console.warn(`[Leads API] Backend 404 on update ${id}, updating local storage:`, (err as Error).message);
    return localFallbackStore.updateLead(id, updates);
  }
}

export async function deleteLead(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await apiRequest<{ success: boolean; message: string }>(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    localFallbackStore.deleteLead(id);
    return { success: true, message: `Lead ${id} deleted` };
  } catch (err) {
    console.warn(`[Leads API] Backend 404 on delete ${id}, deleting from local storage:`, (err as Error).message);
    localFallbackStore.deleteLead(id);
    return { success: true, message: `Lead ${id} deleted from local storage` };
  }
}

export async function bulkDeleteLeads(ids: string[]): Promise<{ count: number }> {
  try {
    const res = await apiRequest<{ count: number }>('/api/leads/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    localFallbackStore.bulkDeleteLeads(ids);
    return res;
  } catch (err) {
    console.warn('[Leads API] Backend 404 on bulk-delete, deleting from local storage:', (err as Error).message);
    const count = localFallbackStore.bulkDeleteLeads(ids);
    return { count };
  }
}

export async function logInteraction(
  leadId: string,
  interaction: Omit<Interaction, 'id'>,
  nextFollowUpAt?: string
): Promise<Lead> {
  try {
    const res = await apiRequest<Lead>(`/api/leads/${encodeURIComponent(leadId)}/interactions`, {
      method: 'POST',
      body: JSON.stringify({ interaction, nextFollowUpAt }),
    });
    localFallbackStore.logInteraction(leadId, interaction, nextFollowUpAt);
    return res;
  } catch (err) {
    console.warn(`[Leads API] Backend 404 on logInteraction ${leadId}, logging to local storage:`, (err as Error).message);
    return localFallbackStore.logInteraction(leadId, interaction, nextFollowUpAt);
  }
}

export async function resetLeadsToMock(): Promise<Lead[]> {
  try {
    const res = await apiRequest<Lead[]>('/api/leads/reset', {
      method: 'POST',
    });
    localFallbackStore.resetLeads();
    return res;
  } catch (err) {
    console.warn('[Leads API] Backend 404 on reset, resetting local storage:', (err as Error).message);
    return localFallbackStore.resetLeads();
  }
}
