/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, LeadTemplate, AppSettings, Interaction } from '../types';
import { MOCK_LEADS, MOCK_TEMPLATES, MOCK_SETTINGS } from '../../server/data/mockData';
import { isFollowUpDueToday, isFollowUpOverdue, isLeadGoingCold } from '../utils/leads';

const LEADS_STORAGE_KEY = 'leaddesk_leads_store';
const TEMPLATES_STORAGE_KEY = 'leaddesk_templates_store';
const SETTINGS_STORAGE_KEY = 'leaddesk_settings_store';

class LocalFallbackStore {
  private getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return JSON.parse(JSON.stringify(defaultValue));
      }
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }

  // --- LEADS ---
  getLeads(params?: Record<string, any>): Lead[] {
    let leads = this.getStorage<Lead[]>(LEADS_STORAGE_KEY, MOCK_LEADS);

    if (params) {
      const isArchived = params.archived === 'true' || params.archived === true;
      leads = leads.filter(l => Boolean(l.archived) === isArchived);

      if (params.railFilter && params.railFilter !== 'ALL') {
        const rf = String(params.railFilter).toUpperCase();
        leads = leads.filter(l => {
          if (rf === 'DUE_TODAY') return isFollowUpDueToday(l.nextFollowUpAt);
          if (rf === 'HOT') return l.temperature === 'Hot';
          if (rf === 'WHATSAPP') return l.source === 'WhatsApp';
          if (rf === 'INSTAGRAM') return l.source === 'Instagram';
          if (rf === 'TIKTOK') return l.source === 'TikTok';
          if (rf === 'WON') return l.stage === 'Won';
          return true;
        });
      }

      if (params.preset && params.preset !== 'all') {
        leads = leads.filter(l => {
          if (params.preset === 'due_today') return isFollowUpDueToday(l.nextFollowUpAt);
          if (params.preset === 'hot') return l.temperature === 'Hot';
          if (params.preset === 'whatsapp') return l.source === 'WhatsApp';
          if (params.preset === 'high_ticket') return (l.estimatedValue || 0) >= 3000;
          if (params.preset === 'going_cold') return isLeadGoingCold(l.lastContactedAt, 7);
          if (params.preset === 'won') return l.stage === 'Won';
          return true;
        });
      }

      if (params.source && params.source !== 'all') {
        leads = leads.filter(l => l.source === params.source);
      }
      if (params.stage && params.stage !== 'all') {
        leads = leads.filter(l => l.stage === params.stage);
      }
      if (params.temperature && params.temperature !== 'all') {
        leads = leads.filter(l => l.temperature === params.temperature);
      }

      if (params.search && typeof params.search === 'string' && params.search.trim() !== '') {
        const q = params.search.trim().toLowerCase();
        leads = leads.filter(l => {
          const matchesName = (l.fullName || '').toLowerCase().includes(q);
          const matchesPhone = (l.whatsappNumber || '').includes(q);
          const matchesCompany = (l.company || '').toLowerCase().includes(q);
          const matchesSummary = (l.summary || '').toLowerCase().includes(q);
          const matchesTags = (l.tags || []).some(t => t.toLowerCase().includes(q));
          return matchesName || matchesPhone || matchesCompany || matchesSummary || matchesTags;
        });
      }

      const sortField = params.sortField || 'nextFollowUp';
      const sortOrder = params.sortOrder || 'asc';
      const mult = sortOrder === 'desc' ? -1 : 1;

      leads.sort((a, b) => {
        if (sortField === 'value') return ((a.estimatedValue || 0) - (b.estimatedValue || 0)) * mult;
        if (sortField === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * mult;
        const timeA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity;
        const timeB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity;
        return (timeA - timeB) * mult;
      });
    }

    return leads;
  }

  getLeadById(id: string): Lead | null {
    const leads = this.getLeads();
    return leads.find(l => l.id === id) || null;
  }

  createLead(data: Partial<Lead>): Lead {
    const leads = this.getStorage<Lead[]>(LEADS_STORAGE_KEY, MOCK_LEADS);
    const now = new Date().toISOString();
    const newLead: Lead = {
      id: data.id || `lead-${Date.now()}`,
      fullName: data.fullName || '',
      whatsappNumber: data.whatsappNumber || '',
      altPhone: data.altPhone,
      email: data.email,
      instagramHandle: data.instagramHandle,
      tiktokHandle: data.tiktokHandle,
      company: data.company,
      city: data.city,
      country: data.country,
      source: data.source || 'WhatsApp',
      sourceDetail: data.sourceDetail,
      referredBy: data.referredBy,
      firstContactAt: data.firstContactAt || now,
      purpose: data.purpose || 'Software project',
      interestedIn: data.interestedIn,
      estimatedValue: data.estimatedValue || 0,
      currency: data.currency || 'USD',
      deadline: data.deadline,
      summary: data.summary || '',
      interactions: data.interactions || [],
      stage: data.stage || 'New',
      temperature: data.temperature || 'Warm',
      lostReason: data.lostReason,
      wonValue: data.wonValue,
      closedAt: data.closedAt,
      nextFollowUpAt: data.nextFollowUpAt,
      followUpChannel: data.followUpChannel || 'WhatsApp',
      followUpNote: data.followUpNote,
      reminder: data.reminder || 'at_time',
      lastContactedAt: data.lastContactedAt || now,
      followUpCount: data.followUpCount || 0,
      tags: data.tags || [],
      createdAt: data.createdAt || now,
      updatedAt: now,
      archived: data.archived || false,
      avatarColor: data.avatarColor || 'mint',
    };

    leads.unshift(newLead);
    this.setStorage(LEADS_STORAGE_KEY, leads);
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead {
    const leads = this.getStorage<Lead[]>(LEADS_STORAGE_KEY, MOCK_LEADS);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`Lead with ID ${id} not found.`);
    }
    const updated = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    leads[index] = updated;
    this.setStorage(LEADS_STORAGE_KEY, leads);
    return updated;
  }

  deleteLead(id: string): void {
    const leads = this.getStorage<Lead[]>(LEADS_STORAGE_KEY, MOCK_LEADS);
    const filtered = leads.filter(l => l.id !== id);
    this.setStorage(LEADS_STORAGE_KEY, filtered);
  }

  bulkDeleteLeads(ids: string[]): number {
    const leads = this.getStorage<Lead[]>(LEADS_STORAGE_KEY, MOCK_LEADS);
    const beforeCount = leads.length;
    const filtered = leads.filter(l => !ids.includes(l.id));
    this.setStorage(LEADS_STORAGE_KEY, filtered);
    return beforeCount - filtered.length;
  }

  logInteraction(leadId: string, interaction: Omit<Interaction, 'id'>, nextFollowUpAt?: string): Lead {
    const lead = this.getLeadById(leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found.`);

    const newInt: Interaction = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: interaction.type,
      text: interaction.text,
      timestamp: interaction.timestamp || new Date().toISOString(),
      channel: interaction.channel,
    };

    const updates: Partial<Lead> = {
      interactions: [...lead.interactions, newInt],
      lastContactedAt: newInt.timestamp,
      followUpCount: (lead.followUpCount || 0) + 1,
    };

    if (nextFollowUpAt !== undefined) {
      updates.nextFollowUpAt = nextFollowUpAt;
    }

    return this.updateLead(leadId, updates);
  }

  resetLeads(): Lead[] {
    this.setStorage(LEADS_STORAGE_KEY, MOCK_LEADS);
    return JSON.parse(JSON.stringify(MOCK_LEADS));
  }

  // --- TEMPLATES ---
  getTemplates(): LeadTemplate[] {
    return this.getStorage<LeadTemplate[]>(TEMPLATES_STORAGE_KEY, MOCK_TEMPLATES);
  }

  createTemplate(data: Omit<LeadTemplate, 'id'>): LeadTemplate {
    const templates = this.getTemplates();
    const newTpl: LeadTemplate = {
      id: `tpl-${Date.now()}`,
      ...data,
    };
    templates.push(newTpl);
    this.setStorage(TEMPLATES_STORAGE_KEY, templates);
    return newTpl;
  }

  updateTemplate(id: string, updates: Partial<LeadTemplate>): LeadTemplate {
    const templates = this.getTemplates();
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Template ${id} not found.`);
    templates[idx] = { ...templates[idx], ...updates };
    this.setStorage(TEMPLATES_STORAGE_KEY, templates);
    return templates[idx];
  }

  deleteTemplate(id: string): void {
    const templates = this.getTemplates();
    this.setStorage(TEMPLATES_STORAGE_KEY, templates.filter(t => t.id !== id));
  }

  // --- SETTINGS ---
  getSettings(): AppSettings {
    return this.getStorage<AppSettings>(SETTINGS_STORAGE_KEY, MOCK_SETTINGS);
  }

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.setStorage(SETTINGS_STORAGE_KEY, updated);
    return updated;
  }
}

export const localFallbackStore = new LocalFallbackStore();
