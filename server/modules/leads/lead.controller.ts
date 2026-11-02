/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { LeadRepository } from './lead.model';
import { Lead } from './lead.types';

// Helper to determine overdue and due today
const isDueToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const isOverdue = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
};

const isGoingCold = (lastContactedAt?: string, days = 7): boolean => {
  if (!lastContactedAt) return false;
  const lastTime = new Date(lastContactedAt).getTime();
  const diffDays = (Date.now() - lastTime) / (1000 * 60 * 60 * 24);
  return diffDays >= days;
};

export const getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      source,
      stage,
      temperature,
      railFilter,
      preset,
      search,
      sortField = 'nextFollowUp',
      sortOrder = 'asc',
      archived = 'false',
    } = req.query;

    let leads = await LeadRepository.getAll();

    // Filter archived
    const isArchivedFilter = archived === 'true';
    leads = leads.filter(l => Boolean(l.archived) === isArchivedFilter);

    // Rail filter
    if (railFilter && railFilter !== 'ALL') {
      const rf = String(railFilter).toUpperCase();
      leads = leads.filter(l => {
        if (rf === 'DUE_TODAY') return isDueToday(l.nextFollowUpAt);
        if (rf === 'HOT') return l.temperature === 'Hot';
        if (rf === 'WHATSAPP') return l.source === 'WhatsApp';
        if (rf === 'INSTAGRAM') return l.source === 'Instagram';
        if (rf === 'TIKTOK') return l.source === 'TikTok';
        if (rf === 'WON') return l.stage === 'Won';
        return true;
      });
    }

    // Preset filter
    if (preset && preset !== 'all') {
      leads = leads.filter(l => {
        if (preset === 'due_today') return isDueToday(l.nextFollowUpAt);
        if (preset === 'hot') return l.temperature === 'Hot';
        if (preset === 'whatsapp') return l.source === 'WhatsApp';
        if (preset === 'high_ticket') return (l.estimatedValue || 0) >= 3000;
        if (preset === 'going_cold') return isGoingCold(l.lastContactedAt, 7);
        if (preset === 'won') return l.stage === 'Won';
        return true;
      });
    }

    // Direct filters
    if (source && source !== 'all') {
      leads = leads.filter(l => l.source === source);
    }
    if (stage && stage !== 'all') {
      leads = leads.filter(l => l.stage === stage);
    }
    if (temperature && temperature !== 'all') {
      leads = leads.filter(l => l.temperature === temperature);
    }

    // Search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      leads = leads.filter(l => {
        const matchesName = (l.fullName || '').toLowerCase().includes(q);
        const matchesPhone = (l.whatsappNumber || '').includes(q);
        const matchesCompany = (l.company || '').toLowerCase().includes(q);
        const matchesSummary = (l.summary || '').toLowerCase().includes(q);
        const matchesTags = (l.tags || []).some(t => t.toLowerCase().includes(q));
        return matchesName || matchesPhone || matchesCompany || matchesSummary || matchesTags;
      });
    }

    // Sorting
    leads.sort((a, b) => {
      const orderMultiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortField === 'value') {
        return ((a.estimatedValue || 0) - (b.estimatedValue || 0)) * orderMultiplier;
      }
      if (sortField === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderMultiplier;
      }
      // default nextFollowUp
      const timeA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity;
      const timeB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity;
      return (timeA - timeB) * orderMultiplier;
    });

    res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await LeadRepository.getById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leadData = req.body as Partial<Lead>;

    if (!leadData.whatsappNumber || leadData.whatsappNumber.trim() === '') {
      res.status(400).json({ success: false, message: 'WhatsApp number is required.' });
      return;
    }

    const created = await LeadRepository.create(leadData);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<Lead>;

    const updated = await LeadRepository.update(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await LeadRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, message: `Lead ${id} successfully deleted.` });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'Array of lead IDs is required.' });
      return;
    }

    const count = await LeadRepository.bulkDelete(ids);
    res.json({ success: true, count, message: `Deleted ${count} leads.` });
  } catch (error) {
    next(error);
  }
};

export const logInteraction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { interaction, nextFollowUpAt } = req.body;

    if (!interaction || !interaction.text) {
      res.status(400).json({ success: false, message: 'Interaction text and details are required.' });
      return;
    }

    const updatedLead = await LeadRepository.logInteraction(id, interaction, nextFollowUpAt);
    if (!updatedLead) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    next(error);
  }
};

export const resetToMock = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await LeadRepository.resetToMock();
    const leads = await LeadRepository.getAll();
    res.json({ success: true, count: leads.length, message: 'Reset to unified mockData successfully.', data: leads });
  } catch (error) {
    next(error);
  }
};
