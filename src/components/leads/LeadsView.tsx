/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  LayoutList,
  LayoutGrid,
  Check,
  ChevronDown,
  AlertCircle,
  MoreVertical,
  ArrowUpDown,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Snowflake,
  Trophy,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Lead, LeadSource, LeadStage, LeadTemperature, RailFilter } from '../../types';
import { Avatar } from '../common/Avatar';
import { StageBadge, SourceBadge, TemperatureBadge } from '../common/Badge';
import { CustomSelect } from '../common/Select';
import {
  getLeadDisplayName,
  formatFollowUpDateDisplay,
  isFollowUpOverdue,
  isFollowUpDueToday,
  isLeadGoingCold,
  buildWhatsAppUrl,
} from '../../utils/leads';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LeadsViewProps {
  leads: Lead[];
  railFilter: RailFilter;
  onClearRailFilter: () => void;
  onOpenQuickAdd: () => void;
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

type SavedPreset = 'all' | 'due_today' | 'hot' | 'whatsapp' | 'high_ticket' | 'going_cold' | 'won';

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  railFilter,
  onClearRailFilter,
  onOpenQuickAdd,
  onOpenLead,
  onUpdateLead,
  onDeleteLead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<SavedPreset>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortField, setSortField] = useState<'nextFollowUp' | 'createdAt' | 'value'>('nextFollowUp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Real-time counts for all preset filters
  const presetCounts = useMemo(() => {
    return {
      all: leads.filter(l => !l.archived).length,
      due_today: leads.filter(l => !l.archived && isFollowUpDueToday(l.nextFollowUpAt)).length,
      hot: leads.filter(l => !l.archived && l.temperature === 'Hot').length,
      whatsapp: leads.filter(l => !l.archived && l.source === 'WhatsApp').length,
      high_ticket: leads.filter(l => !l.archived && (l.estimatedValue || 0) >= 3000).length,
      going_cold: leads.filter(l => !l.archived && isLeadGoingCold(l.lastContactedAt, 7)).length,
      won: leads.filter(l => !l.archived && l.stage === 'Won').length,
    };
  }, [leads]);

  const presetFilters = useMemo(
    () => [
      { id: 'all' as SavedPreset, label: 'All Leads', icon: <LayoutList size={13} />, count: presetCounts.all },
      { id: 'due_today' as SavedPreset, label: 'Due Today', icon: <Clock size={13} className="text-amber-500" />, count: presetCounts.due_today },
      { id: 'hot' as SavedPreset, label: 'Hot', icon: <Flame size={13} className="text-orange-500" />, count: presetCounts.hot },
      { id: 'whatsapp' as SavedPreset, label: 'WhatsApp', icon: <FaWhatsapp size={13} className="text-[#25D366]" />, count: presetCounts.whatsapp },
      { id: 'high_ticket' as SavedPreset, label: 'High-Ticket ($3k+)', icon: <Sparkles size={13} className="text-sky-500" />, count: presetCounts.high_ticket },
      { id: 'going_cold' as SavedPreset, label: 'Going Cold', icon: <Snowflake size={13} className="text-cyan-500" />, count: presetCounts.going_cold },
      { id: 'won' as SavedPreset, label: 'Won Deals', icon: <Trophy size={13} className="text-emerald-500" />, count: presetCounts.won },
    ],
    [presetCounts]
  );

  // Apply Rail filter or saved preset
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (lead.archived) return false;

      // 1. Left Rail Global Filter check
      if (railFilter === 'DUE_TODAY' && !isFollowUpDueToday(lead.nextFollowUpAt)) return false;
      if (railFilter === 'HOT' && lead.temperature !== 'Hot') return false;
      if (railFilter === 'WHATSAPP' && lead.source !== 'WhatsApp') return false;
      if (railFilter === 'INSTAGRAM' && lead.source !== 'Instagram') return false;
      if (railFilter === 'TIKTOK' && lead.source !== 'TikTok') return false;
      if (railFilter === 'WON' && lead.stage !== 'Won') return false;

      // 2. Saved preset filter
      if (selectedPreset === 'due_today' && !isFollowUpDueToday(lead.nextFollowUpAt)) return false;
      if (selectedPreset === 'hot' && lead.temperature !== 'Hot') return false;
      if (selectedPreset === 'whatsapp' && lead.source !== 'WhatsApp') return false;
      if (selectedPreset === 'high_ticket' && (lead.estimatedValue || 0) < 3000) return false;
      if (selectedPreset === 'going_cold' && !isLeadGoingCold(lead.lastContactedAt, 7)) return false;
      if (selectedPreset === 'won' && lead.stage !== 'Won') return false;

      // 3. Dropdown filters
      if (selectedSource !== 'all' && lead.source !== selectedSource) return false;
      if (selectedStage !== 'all' && lead.stage !== selectedStage) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (lead.fullName || '').toLowerCase().includes(q);
        const matchesPhone = lead.whatsappNumber.includes(q);
        const matchesSummary = (lead.summary || '').toLowerCase().includes(q);
        const matchesCompany = (lead.company || '').toLowerCase().includes(q);
        const matchesTags = lead.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesPhone && !matchesSummary && !matchesCompany && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'value') {
        const valA = a.estimatedValue || 0;
        const valB = b.estimatedValue || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      // nextFollowUp
      const timeA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity;
      const timeB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [leads, railFilter, selectedPreset, selectedSource, selectedStage, searchQuery, sortField, sortOrder]);

  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedLeadIds.length) return;
    for (const id of selectedLeadIds) {
      await onDeleteLead(id);
    }
    toast.success(`Deleted ${selectedLeadIds.length} leads`);
    setSelectedLeadIds([]);
  };

  const handleExportCsv = () => {
    const listToExport = selectedLeadIds.length
      ? leads.filter(l => selectedLeadIds.includes(l.id))
      : filteredLeads;

    const headers = ['Full Name', 'WhatsApp', 'Email', 'Source', 'Purpose', 'Stage', 'Value', 'Next Follow-up'];
    const rows = listToExport.map(l => [
      `"${l.fullName || 'Lead'}"`,
      `"${l.whatsappNumber}"`,
      `"${l.email || ''}"`,
      `"${l.source}"`,
      `"${l.purpose}"`,
      `"${l.stage}"`,
      `"${l.estimatedValue || ''}"`,
      `"${l.nextFollowUpAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-ink tracking-[-0.02em]">
            Leads Directory
          </h1>
          <p className="text-[13px] text-ink-muted">
            {filteredLeads.length} leads matching criteria · {leads.length} total
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-3.5 rounded-xl bg-surface border border-border-subtle/80 hover:bg-surface-subtle text-ink font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="h-10 px-4 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={16} strokeWidth={2.8} className="text-[#14161A]" />
            <span className="text-[#14161A]">Add Lead (N)</span>
          </button>
        </div>
      </div>

      {/* Saved Preset Filters (Non-scrolling: Native dropdown on mobile, wrapped pills on tablet/desktop) */}
      <div className="w-full">
        {/* Mobile (< sm): Clean Compact Dropdown (No scrolling, no truncated pills) */}
        <div className="sm:hidden w-full">
          <CustomSelect
            value={selectedPreset}
            onChange={val => setSelectedPreset(val as SavedPreset)}
            className="w-full"
            options={presetFilters.map(p => ({
              value: p.id,
              label: `${p.label} (${p.count})`,
              icon: p.icon,
            }))}
          />
        </div>

        {/* Tablet & Desktop (>= sm): Clean Multi-Pill Wrap (Zero scrolling, zero scrollbars) */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 py-0.5">
          {presetFilters.map(preset => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ink text-white dark:bg-white dark:text-[#14161A] font-bold shadow-xs'
                    : 'bg-surface text-ink-secondary hover:text-ink hover:bg-surface-subtle border border-border-subtle/80'
                }`}
              >
                {preset.icon}
                <span>{preset.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white dark:bg-black/10 dark:text-[#14161A]'
                      : 'bg-surface-subtle text-ink-muted'
                  }`}
                >
                  {preset.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle/80 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            dir="auto"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, notes, tags..."
            className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>

        {/* Filter Dropdowns & View Toggles */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
          {/* Custom Source Dropdown */}
          <CustomSelect
            value={selectedSource}
            onChange={val => setSelectedSource(val)}
            className="w-36 shrink-0"
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'WhatsApp', label: 'WhatsApp', icon: <FaWhatsapp size={13} className="text-[#25D366]" /> },
              { value: 'TikTok', label: 'TikTok' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'YouTube', label: 'YouTube' },
              { value: 'LinkedIn', label: 'LinkedIn' },
            ]}
          />

          {/* Custom Stage Dropdown */}
          <CustomSelect
            value={selectedStage}
            onChange={val => setSelectedStage(val)}
            className="w-36 shrink-0"
            options={[
              { value: 'all', label: 'All Stages' },
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Proposal sent', label: 'Proposal sent' },
              { value: 'Negotiation', label: 'Negotiation' },
              { value: 'Won', label: 'Won' },
              { value: 'Lost', label: 'Lost' },
            ]}
          />

          {/* Sort field */}
          <button
            type="button"
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            title={`Sort order: ${sortOrder}`}
            className="h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink flex items-center gap-1.5 cursor-pointer hover:bg-surface transition-colors"
          >
            <ArrowUpDown size={14} />
            <span className="capitalize">{sortOrder}</span>
          </button>

          {/* Table / Cards Toggle */}
          <div className="flex items-center p-0.5 bg-surface-subtle rounded-xl border border-border-subtle">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
              title="Table View"
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3 bg-surface border border-border-strong rounded-xl flex items-center justify-between text-xs font-semibold text-ink shadow-sm">
          <span>{selectedLeadIds.length} leads selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-border-subtle cursor-pointer"
            >
              Export Selected
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-semantic-overdue/10 hover:bg-semantic-overdue/20 text-semantic-overdue cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="rounded-[20px] bg-surface border border-border-subtle/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-[12px] font-medium text-ink-muted bg-surface-subtle/40">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border-subtle cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 font-medium">Lead</th>
                  <th className="py-3 px-3 font-medium">WhatsApp</th>
                  <th className="py-3 px-3 font-medium">Source</th>
                  <th className="py-3 px-3 font-medium">Purpose</th>
                  <th className="py-3 px-3 font-medium">Stage</th>
                  <th className="py-3 px-3 font-medium">Temp</th>
                  <th className="py-3 px-3 font-medium">Next Follow-up</th>
                  <th className="py-3 px-3 font-medium text-right">Value</th>
                  <th className="py-3 px-4 font-medium text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-xs">
                {filteredLeads.map(lead => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const displayName = getLeadDisplayName(lead);
                  const isOverdue = isFollowUpOverdue(lead.nextFollowUpAt);
                  const waUrl = buildWhatsAppUrl(lead.whatsappNumber);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onOpenLead(lead)}
                      className={`h-[52px] hover:bg-[#F7F9F9] dark:hover:bg-surface-subtle transition-colors cursor-pointer ${
                        isSelected ? 'bg-active-chip/60' : ''
                      }`}
                    >
                      <td className="py-2 px-4" onClick={e => handleToggleSelect(lead.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-border-subtle cursor-pointer"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={lead.fullName}
                            phone={lead.whatsappNumber}
                            avatarColor={lead.avatarColor}
                            size={32}
                          />
                          <div className="overflow-hidden max-w-[140px]">
                            <span className="font-bold text-ink truncate block">{displayName}</span>
                            {lead.company && (
                              <span className="text-[10px] text-ink-muted truncate block">
                                {lead.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-2 px-3 font-mono text-[11px] text-ink-secondary">
                        {lead.whatsappNumber}
                      </td>

                      <td className="py-2 px-3">
                        <SourceBadge source={lead.source} />
                      </td>

                      <td className="py-2 px-3 text-ink-secondary max-w-[130px] truncate">
                        {lead.purpose}
                      </td>

                      <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                        <CustomSelect
                          size="sm"
                          value={lead.stage}
                          onChange={val => onUpdateLead(lead.id, { stage: val as LeadStage })}
                          className="w-32"
                          options={[
                            { value: 'New', label: 'New' },
                            { value: 'Contacted', label: 'Contacted' },
                            { value: 'Qualified', label: 'Qualified' },
                            { value: 'Proposal sent', label: 'Proposal sent' },
                            { value: 'Negotiation', label: 'Negotiation' },
                            { value: 'Won', label: 'Won' },
                            { value: 'Lost', label: 'Lost' },
                          ]}
                        />
                      </td>

                      <td className="py-2 px-3">
                        <TemperatureBadge temperature={lead.temperature} />
                      </td>

                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={
                            isOverdue
                              ? 'font-bold text-semantic-overdue-text flex items-center gap-1'
                              : 'text-ink-secondary'
                          }
                        >
                          {formatFollowUpDateDisplay(lead.nextFollowUpAt)}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right font-bold text-ink tabular-nums">
                        {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '—'}
                      </td>

                      <td className="py-2 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg hover:bg-border-subtle flex items-center justify-center text-ink-secondary hover:text-[#25D366] transition-colors"
                            title="Message on WhatsApp"
                          >
                            <FaWhatsapp size={15} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="py-16 text-center text-ink-muted flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-ink">No leads found</p>
              <p className="text-xs mt-1 max-w-sm text-ink-muted">
                {leads.length === 0
                  ? 'Your workspace is completely fresh. Click below or press "N" on your keyboard to add your first lead.'
                  : 'No leads match your current filter or search criteria.'}
              </p>
              {leads.length === 0 && (
                <button
                  type="button"
                  onClick={onOpenQuickAdd}
                  className="mt-4 h-9 px-4 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} strokeWidth={2.5} className="text-[#14161A]" />
                  <span className="text-[#14161A]">Add First Lead</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map(lead => {
            const displayName = getLeadDisplayName(lead);
            const waUrl = buildWhatsAppUrl(lead.whatsappNumber);
            return (
              <div
                key={lead.id}
                onClick={() => onOpenLead(lead)}
                className="p-5 rounded-[20px] bg-surface border border-border-subtle/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={lead.fullName}
                      phone={lead.whatsappNumber}
                      avatarColor={lead.avatarColor}
                      size={40}
                    />
                    <div>
                      <h3 className="font-bold text-ink text-sm">{displayName}</h3>
                      <p className="text-[11px] text-ink-muted font-mono">{lead.whatsappNumber}</p>
                    </div>
                  </div>
                  <SourceBadge source={lead.source} />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-ink-secondary">
                    <span>Purpose:</span>
                    <span className="font-semibold text-ink">{lead.purpose}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-secondary">
                    <span>Follow-up:</span>
                    <span className="font-semibold text-ink">
                      {formatFollowUpDateDisplay(lead.nextFollowUpAt)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between">
                  <StageBadge stage={lead.stage} />
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="h-8 px-3 rounded-lg bg-button-dark text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FaWhatsapp size={13} className="text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
