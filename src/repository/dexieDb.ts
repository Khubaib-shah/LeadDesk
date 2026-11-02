/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { Table } from 'dexie';
import { Lead, LeadTemplate, AppSettings, Interaction } from '../types';
import { LeadRepository } from './leadRepository';
import { generateSeedLeads } from '../data/seedLeads';
import { SEED_TEMPLATES } from '../data/seedTemplates';

class LeadDeskDatabase extends Dexie {
  leads!: Table<Lead, string>;
  templates!: Table<LeadTemplate, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('LeadDeskDB');
    this.version(1).stores({
      leads: 'id, fullName, whatsappNumber, source, purpose, stage, temperature, nextFollowUpAt, lastContactedAt, archived',
      templates: 'id, title, category, channel',
      settings: 'key',
    });
  }
}

export const db = new LeadDeskDatabase();

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Zubair',
  userSignature: 'Best regards,\nZubair — Software Engineer & Creator',
  defaultCountryCode: 'US',
  defaultCurrency: 'USD',
  defaultFollowUpTime: '10:00',
  cadenceDays: [2, 5, 10],
  goingColdDays: 7,
  theme: 'light',
  reducedMotion: false,
};

class DexieLeadRepository implements LeadRepository {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    try {
      const count = await db.leads.count();
      if (count === 0) {
        await this.seedInitialData(false);
      }
      this.initialized = true;
    } catch (err) {
      console.warn('IndexedDB initialization notice, using local persistence:', err);
    }
  }

  async getAllLeads(): Promise<Lead[]> {
    await this.ensureInitialized();
    try {
      const all = await db.leads.toArray();
      // Sort: not archived first, then next follow-up ascending
      return all.sort((a, b) => {
        if (a.archived !== b.archived) return a.archived ? 1 : -1;
        const timeA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity;
        const timeB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity;
        return timeA - timeB;
      });
    } catch {
      return generateSeedLeads();
    }
  }

  async getLeadById(id: string): Promise<Lead | null> {
    await this.ensureInitialized();
    try {
      const lead = await db.leads.get(id);
      return lead || null;
    } catch {
      return null;
    }
  }

  async createLead(data: Partial<Lead>): Promise<Lead> {
    await this.ensureInitialized();
    const id = data.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newLead: Lead = {
      id,
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
      firstContactAt: data.firstContactAt || nowIso,
      purpose: data.purpose || 'Software project',
      interestedIn: data.interestedIn,
      estimatedValue: data.estimatedValue,
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
      lastContactedAt: data.lastContactedAt || nowIso,
      followUpCount: data.followUpCount || 0,
      tags: data.tags || [],
      createdAt: nowIso,
      updatedAt: nowIso,
      archived: !!data.archived,
      avatarColor: data.avatarColor || '#C9C3F5',
    };

    await db.leads.put(newLead);
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    await this.ensureInitialized();
    const existing = await db.leads.get(id);
    if (!existing) {
      throw new Error(`Lead with id ${id} not found`);
    }

    const updated: Lead = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.leads.put(updated);
    return updated;
  }

  async deleteLead(id: string): Promise<void> {
    await this.ensureInitialized();
    await db.leads.delete(id);
  }

  async logInteraction(
    leadId: string,
    interactionData: Omit<Interaction, 'id'>,
    nextFollowUpAt?: string
  ): Promise<Lead> {
    await this.ensureInitialized();
    const lead = await db.leads.get(leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    const newInteraction: Interaction = {
      ...interactionData,
      id: `int-${Date.now()}`,
    };

    const nowIso = new Date().toISOString();
    const updates: Partial<Lead> = {
      interactions: [newInteraction, ...(lead.interactions || [])],
      lastContactedAt: nowIso,
      followUpCount: (lead.followUpCount || 0) + 1,
    };

    if (nextFollowUpAt !== undefined) {
      updates.nextFollowUpAt = nextFollowUpAt;
    }

    return this.updateLead(leadId, updates);
  }

  async clearAllLeads(): Promise<void> {
    await db.leads.clear();
  }

  async seedInitialData(force = false): Promise<void> {
    if (force) {
      await db.leads.clear();
      await db.templates.clear();
    }

    const leadCount = await db.leads.count();
    if (leadCount === 0 || force) {
      const seeds = generateSeedLeads();
      await db.leads.bulkPut(seeds);
    }

    const tplCount = await db.templates.count();
    if (tplCount === 0 || force) {
      await db.templates.bulkPut(SEED_TEMPLATES);
    }
  }

  async getAllTemplates(): Promise<LeadTemplate[]> {
    await this.ensureInitialized();
    const all = await db.templates.toArray();
    return all.length > 0 ? all : SEED_TEMPLATES;
  }

  async createTemplate(template: Omit<LeadTemplate, 'id'>): Promise<LeadTemplate> {
    await this.ensureInitialized();
    const newTpl: LeadTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
    };
    await db.templates.put(newTpl);
    return newTpl;
  }

  async updateTemplate(id: string, updates: Partial<LeadTemplate>): Promise<LeadTemplate> {
    await this.ensureInitialized();
    const existing = await db.templates.get(id);
    if (!existing) throw new Error('Template not found');
    const updated = { ...existing, ...updates };
    await db.templates.put(updated);
    return updated;
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const row = await db.settings.get('app_settings');
      if (row && row.value) {
        return { ...DEFAULT_SETTINGS, ...row.value };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...updates };
    await db.settings.put({ key: 'app_settings', value: merged });
    return merged;
  }
}

export const leadRepository: LeadRepository = new DexieLeadRepository();
