/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { Lead, ViewTab, RailFilter, AppSettings, InteractionType } from './types';
import * as leadsApi from './api/leads';
import * as settingsApi from './api/settings';
import { calculateDashboardMetrics } from './utils/analytics';
import { AppShell } from './components/shell/AppShell';
import { HomeView } from './components/home/HomeView';
import { LeadsView } from './components/leads/LeadsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { QuickAddModal } from './components/leads/QuickAddModal';
import { LeadDrawer } from './components/leads/LeadDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { TemplatesModal } from './components/templates/TemplatesModal';
import { HelpModal } from './components/help/HelpModal';
import { CommandPalette } from './components/command/CommandPalette';
import { FocusModeModal } from './components/followups/FocusModeModal';
import { isFollowUpDueToday, isFollowUpOverdue } from './utils/leads';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    userName: 'Zubair',
    userSignature: 'Best regards,\nZubair',
    defaultCountryCode: 'US',
    defaultCurrency: 'USD',
    defaultFollowUpTime: '10:00',
    cadenceDays: [2, 5, 10],
    goingColdDays: 7,
    theme: 'light',
    reducedMotion: false,
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('HOME');
  const [activeFilter, setActiveFilter] = useState<RailFilter>('ALL');

  // Modals / Drawers
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('leaddesk_theme') === 'dark' ||
      (!('leaddesk_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Apply theme to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('leaddesk_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('leaddesk_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Load leads and settings
  const refreshData = useCallback(async () => {
    try {
      const all = await leadsApi.fetchLeads();
      setLeads(all);
      const s = await settingsApi.fetchSettings();
      setSettings(s);
    } catch (err) {
      console.error('Failed to load leads from API:', err);
      toast.error(`API Error: ${(err as Error).message}`);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Hash route sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('leads')) setActiveTab('LEADS');
      else if (hash.includes('pipeline')) setActiveTab('PIPELINE');
      else if (hash.includes('follow-ups') || hash.includes('followups')) setActiveTab('FOLLOW-UPS');
      else if (hash.includes('analytics')) setActiveTab('ANALYTICS');
      else if (hash.includes('home') || hash === '' || hash === '#') setActiveTab('HOME');

      // Check lead ID in hash: #lead/lead-01
      const leadMatch = window.location.hash.match(/#lead\/([a-zA-Z0-9-_]+)/);
      if (leadMatch && leadMatch[1]) {
        const found = leads.find(l => l.id === leadMatch[1]);
        if (found) setSelectedLead(found);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [leads]);

  const handleTabChange = (tab: ViewTab) => {
    setActiveTab(tab);
    window.location.hash = tab.toLowerCase();
  };

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    window.location.hash = `lead/${lead.id}`;
  };

  const handleCloseLead = () => {
    setSelectedLead(null);
    window.location.hash = activeTab.toLowerCase();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    let gKeyTimeout: any = null;
    let gPressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
        setIsSettingsOpen(false);
        setIsTemplatesOpen(false);
        setIsHelpOpen(false);
        setIsCommandPaletteOpen(false);
        setIsFocusModeOpen(false);
        if (selectedLead) handleCloseLead();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      if (!isInput) {
        if (e.key === '/') {
          e.preventDefault();
          setIsCommandPaletteOpen(true);
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsQuickAddOpen(true);
          return;
        }
        if (e.key === '?') {
          e.preventDefault();
          setIsHelpOpen(true);
          return;
        }

        // Two-key chord G + L, P, F, A, H
        if (e.key.toLowerCase() === 'g') {
          gPressed = true;
          clearTimeout(gKeyTimeout);
          gKeyTimeout = setTimeout(() => {
            gPressed = false;
          }, 1000);
          return;
        }

        if (gPressed) {
          gPressed = false;
          clearTimeout(gKeyTimeout);
          const k = e.key.toLowerCase();
          if (k === 'l') handleTabChange('LEADS');
          else if (k === 'p') handleTabChange('PIPELINE');
          else if (k === 'f') handleTabChange('FOLLOW-UPS');
          else if (k === 'a') handleTabChange('ANALYTICS');
          else if (k === 'h') handleTabChange('HOME');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gKeyTimeout);
    };
  }, [selectedLead, activeTab]);

  // Lead CRUD handlers
  const handleSaveNewLead = async (leadData: Partial<Lead>, andAddAnother = false) => {
    const saved = await leadsApi.createLead(leadData);
    await refreshData();
    toast.success(`Lead ${saved.fullName || saved.whatsappNumber} created!`, {
      action: {
        label: 'Open',
        onClick: () => handleOpenLead(saved),
      },
    });
    return saved;
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    const updated = await leadsApi.updateLead(id, updates);
    await refreshData();
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(updated);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const previous = leads.find(l => l.id === id);
    await leadsApi.deleteLead(id);
    await refreshData();
    if (selectedLead && selectedLead.id === id) {
      handleCloseLead();
    }
    toast('Lead removed', {
      action: previous
        ? {
            label: 'Undo',
            onClick: async () => {
              await leadsApi.createLead(previous);
              await refreshData();
              toast.success('Lead restored');
            },
          }
        : undefined,
    });
  };

  const handleLogInteraction = async (
    leadId: string,
    interaction: { type: InteractionType; text: string; timestamp: string },
    nextDate?: string
  ) => {
    const updated = await leadsApi.logInteraction(leadId, interaction, nextDate);
    await refreshData();
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(updated);
    }
  };

  const handleClearDemoData = async () => {
    await leadsApi.resetLeadsToMock();
    await refreshData();
    toast.success('Reset leads to clean initial seed data.');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leads, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `leaddesk-backup-${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    toast.success('JSON backup downloaded');
  };

  // Metrics for Top Right Cluster
  const metrics = calculateDashboardMetrics(leads);
  const dueTodayLeads = leads.filter(
    l => !l.archived && (isFollowUpDueToday(l.nextFollowUpAt) || isFollowUpOverdue(l.nextFollowUpAt))
  );

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'bg-surface text-ink border border-border-subtle rounded-2xl shadow-xl text-xs font-semibold',
        }}
      />

      <AppShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        dueTodayCount={metrics.followUpsDueCount}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userName={settings.userName}
        userRole={settings.userRole}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onClearDemoData={handleClearDemoData}
      >
        {activeTab === 'HOME' && (
          <HomeView
            leads={leads}
            onNavigateTab={handleTabChange}
            onFilterChange={setActiveFilter}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenLead={handleOpenLead}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onStartFocusMode={() => setIsFocusModeOpen(true)}
            onDoneFollowUp={lead => {
              handleLogInteraction(
                lead.id,
                {
                  type: 'Note',
                  text: 'Completed scheduled follow-up.',
                  timestamp: new Date().toISOString(),
                },
                new Date(Date.now() + 5 * 86400000).toISOString()
              );
              toast.success('Follow-up marked Done!');
            }}
          />
        )}

        {activeTab === 'LEADS' && (
          <LeadsView
            leads={leads}
            railFilter={activeFilter}
            onClearRailFilter={() => setActiveFilter('ALL')}
            onFilterChange={setActiveFilter}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenLead={handleOpenLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        )}

        {activeTab === 'PIPELINE' && (
          <PipelineView
            leads={leads}
            onOpenLead={handleOpenLead}
            onUpdateStage={(id, stage) => handleUpdateLead(id, { stage })}
          />
        )}

        {activeTab === 'FOLLOW-UPS' && (
          <FollowUpsView
            leads={leads}
            onOpenLead={handleOpenLead}
            onUpdateLead={handleUpdateLead}
            onLogInteraction={handleLogInteraction}
            onStartFocusMode={() => setIsFocusModeOpen(true)}
          />
        )}

        {activeTab === 'ANALYTICS' && <AnalyticsView leads={leads} />}
      </AppShell>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        existingLeads={leads}
        onSaveLead={handleSaveNewLead}
        onOpenExistingLead={handleOpenLead}
      />

      {/* Lead Detail Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={handleCloseLead}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
        onLogInteraction={handleLogInteraction}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={async updates => {
          const s = await settingsApi.updateSettings(updates);
          setSettings(s);
        }}
        onClearDemoData={handleClearDemoData}
        onExportJson={handleExportJson}
        onToggleTheme={toggleTheme}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      {/* Help & Shortcuts Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        leads={leads}
        onOpenLead={handleOpenLead}
        onNavigateTab={handleTabChange}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Focus Mode Follow-up Queue */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        leads={dueTodayLeads}
        onMarkDone={async lead => {
          await handleLogInteraction(
            lead.id,
            {
              type: 'Note',
              text: 'Completed follow-up in Focus Mode.',
              timestamp: new Date().toISOString(),
            },
            new Date(Date.now() + 5 * 86400000).toISOString()
          );
        }}
        onSnooze={async (lead, days) => {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + days);
          nextDate.setHours(10, 0, 0, 0);
          await handleUpdateLead(lead.id, { nextFollowUpAt: nextDate.toISOString() });
        }}
      />
    </>
  );
}
