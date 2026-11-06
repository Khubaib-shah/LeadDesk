/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  FileText,
  Mic,
  Sparkles,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from 'react-icons/fa6';
import { Lead, LeadSource, LeadPurpose, LeadStage, LeadTemperature, FollowUpChannel } from '../../types';
import { CustomSelect } from '../common/Select';
import { DateTimePicker } from '../common/DateTimePicker';
import { useVoiceRecognition } from '../../utils/speech';
import { toast } from 'sonner';

interface EditLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSave: (leadId: string, updates: Partial<Lead>) => Promise<void>;
}

const STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal sent',
  'Negotiation',
  'Won',
  'Lost',
];

const TEMPERATURES: LeadTemperature[] = ['Hot', 'Warm', 'Cold'];

const PURPOSES: LeadPurpose[] = [
  'Software project',
  'Consultation or mentoring',
  'Course or coaching',
  'Collaboration or sponsorship',
  'Job or hiring',
  'Question or support',
  'Other',
];

const SOURCES: LeadSource[] = [
  'WhatsApp',
  'TikTok',
  'Instagram',
  'YouTube',
  'LinkedIn',
  'X',
  'Facebook',
  'Email',
  'Referral',
  'Website',
  'Other',
];

const CHANNELS: FollowUpChannel[] = ['WhatsApp', 'Email', 'Call', 'DM'];

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [source, setSource] = useState<LeadSource>('WhatsApp');
  const [sourceDetail, setSourceDetail] = useState('');
  const [stage, setStage] = useState<LeadStage>('New');
  const [temperature, setTemperature] = useState<LeadTemperature>('Warm');
  const [purpose, setPurpose] = useState<LeadPurpose>('Software project');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [nextFollowUpAt, setNextFollowUpAt] = useState('');
  const [followUpChannel, setFollowUpChannel] = useState<FollowUpChannel>('WhatsApp');
  const [summary, setSummary] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state when lead changes
  useEffect(() => {
    if (lead) {
      setFullName(lead.fullName || '');
      setWhatsappNumber(lead.whatsappNumber || '');
      setAltPhone(lead.altPhone || '');
      setEmail(lead.email || '');
      setCompany(lead.company || '');
      setCity(lead.city || '');
      setCountry(lead.country || '');
      setSource(lead.source || 'WhatsApp');
      setSourceDetail(lead.sourceDetail || '');
      setStage(lead.stage || 'New');
      setTemperature(lead.temperature || 'Warm');
      setPurpose(lead.purpose || 'Software project');
      setEstimatedValue(lead.estimatedValue ? String(lead.estimatedValue) : '');
      setNextFollowUpAt(lead.nextFollowUpAt || '');
      setFollowUpChannel(lead.followUpChannel || 'WhatsApp');
      setSummary(lead.summary || '');
      setTagsInput(lead.tags && Array.isArray(lead.tags) ? lead.tags.join(', ') : '');
    }
  }, [lead, isOpen]);

  const {
    isListening,
    toggleListening,
    stopListening,
  } = useVoiceRecognition({
    onResult: (text, isInterim) => {
      if (!isInterim && text.trim()) {
        setSummary(prev => (prev ? `${prev.trim()} ${text.trim()}` : text.trim()));
      }
    },
    onError: msg => toast.error(msg),
  });

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim() && !whatsappNumber.trim()) {
      toast.error('Please enter at least a name or phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const updates: Partial<Lead> = {
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        altPhone: altPhone.trim() || undefined,
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        source,
        sourceDetail: sourceDetail.trim() || undefined,
        stage,
        temperature,
        purpose,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
        nextFollowUpAt: nextFollowUpAt || undefined,
        followUpChannel,
        summary: summary.trim(),
        tags: parsedTags,
        updatedAt: new Date().toISOString(),
      };

      await onSave(lead.id, updates);
      toast.success('Lead details updated successfully!');
      stopListening();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-2xl text-ink my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime/20 text-[#14161A] dark:text-lime flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Edit Lead Details</h2>
              <p className="text-xs text-ink-muted">Update contact info, deal scope, and follow-up timeline</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink-secondary hover:text-ink cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Contact Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <User size={13} />
              <span>Contact Info</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">WhatsApp Number (E.164)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink font-mono placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                  />
                  <FaWhatsapp size={14} className="absolute left-3 top-3 text-[#25D366]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-ink-muted" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Alt Phone / Office</label>
                <div className="relative">
                  <input
                    type="text"
                    value={altPhone}
                    onChange={e => setAltPhone(e.target.value)}
                    placeholder="+1 555 987 6543"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink font-mono placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                  />
                  <Phone size={14} className="absolute left-3 top-3 text-ink-muted" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Company & Location */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Building size={13} />
              <span>Company & Location</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Studio"
                  className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="United States"
                  className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pipeline & Deal Scope */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Pipeline & Deal Scope</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Stage</label>
                <CustomSelect
                  value={stage}
                  onChange={val => setStage(val as LeadStage)}
                  options={STAGES.map(s => ({ value: s, label: s }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Temperature</label>
                <CustomSelect
                  value={temperature}
                  onChange={val => setTemperature(val as LeadTemperature)}
                  options={TEMPERATURES.map(t => ({ value: t, label: t }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Estimated Deal ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={e => setEstimatedValue(e.target.value)}
                    placeholder="5000"
                    className="w-full h-10 pl-8 pr-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-bold text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                  />
                  <DollarSign size={14} className="absolute left-2.5 top-3 text-ink-muted" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Purpose / Scope</label>
                <CustomSelect
                  value={purpose}
                  onChange={val => setPurpose(val as LeadPurpose)}
                  options={PURPOSES.map(p => ({ value: p, label: p }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Source Platform</label>
                <CustomSelect
                  value={source}
                  onChange={val => setSource(val as LeadSource)}
                  options={SOURCES.map(s => ({ value: s, label: s }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Content Attribution / Campaign</label>
              <input
                type="text"
                value={sourceDetail}
                onChange={e => setSourceDetail(e.target.value)}
                placeholder="e.g. YouTube Video: Next.js Architecture or TikTok #3"
                className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>
          </div>

          {/* Section 4: Follow-up Scheduling */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Follow-up & Channel</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Next Follow-up Date & Time</label>
                <DateTimePicker
                  value={nextFollowUpAt}
                  onChange={val => setNextFollowUpAt(val)}
                  placeholder="Set follow-up date..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Follow-up Channel</label>
                <CustomSelect
                  value={followUpChannel}
                  onChange={val => setFollowUpChannel(val as FollowUpChannel)}
                  options={CHANNELS.map(c => ({ value: c, label: c }))}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Discussion Notes & Tags */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <FileText size={13} />
                <span>Discussion Notes & Summary</span>
              </h3>
              <button
                type="button"
                onClick={() => toggleListening()}
                className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-semantic-overdue text-white animate-pulse'
                    : 'bg-surface-subtle hover:bg-border-subtle text-ink-secondary hover:text-ink'
                }`}
              >
                <Mic size={13} className={isListening ? 'animate-bounce' : ''} />
                <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Key notes from conversation, client requirements, budget discussions..."
              className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors leading-relaxed"
            />

            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
                <Tag size={12} className="text-ink-muted" />
                <span>Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="saas, urgent, enterprise, q2-budget"
                className="w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-subtle/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="px-4 h-10 rounded-xl text-xs font-semibold text-ink hover:bg-surface-subtle cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 h-10 rounded-xl bg-lime hover:bg-lime-hover disabled:opacity-50 text-[#14161A] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Save size={14} className="text-[#14161A]" />
            <span className="text-[#14161A]">{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
