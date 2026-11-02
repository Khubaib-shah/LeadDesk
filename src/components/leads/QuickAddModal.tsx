/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, AlertCircle, Sparkles, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { Lead, LeadSource, LeadPurpose } from '../../types';
import { parsePhoneInput, findDuplicatePhone } from '../../utils/phone';
import { FaWhatsapp, FaInstagram, FaTiktok, FaYoutube, FaLinkedinIn } from 'react-icons/fa6';
import { toast } from 'sonner';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLeads: Lead[];
  onSaveLead: (leadData: Partial<Lead>, andAddAnother?: boolean) => Promise<Lead>;
  onOpenExistingLead: (lead: Lead) => void;
}

const SOURCES: Array<{ id: LeadSource; label: string; icon: React.ReactNode }> = [
  { id: 'WhatsApp', label: 'WhatsApp', icon: <FaWhatsapp size={14} className="text-[#25D366]" /> },
  { id: 'TikTok', label: 'TikTok', icon: <FaTiktok size={13} /> },
  { id: 'Instagram', label: 'Instagram', icon: <FaInstagram size={14} className="text-[#E1306C]" /> },
  { id: 'YouTube', label: 'YouTube', icon: <FaYoutube size={14} className="text-[#FF0000]" /> },
  { id: 'LinkedIn', label: 'LinkedIn', icon: <FaLinkedinIn size={13} className="text-[#0A66C2]" /> },
  { id: 'Referral', label: 'Referral', icon: <Sparkles size={13} className="text-[#F5B544]" /> },
];

const PURPOSES: LeadPurpose[] = [
  'Software project',
  'Consultation or mentoring',
  'Course or coaching',
  'Collaboration or sponsorship',
  'Job or hiring',
  'Question or support',
];

const COUNTRY_DIAL_CODES = [
  { code: 'US', dial: '+1', name: 'US / Canada' },
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'PK', dial: '+92', name: 'Pakistan' },
  { code: 'AE', dial: '+971', name: 'UAE' },
  { code: 'GB', dial: '+44', name: 'UK' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
  { code: 'SG', dial: '+65', name: 'Singapore' },
  { code: 'DE', dial: '+49', name: 'Germany' },
  { code: 'FR', dial: '+33', name: 'France' },
  { code: 'AU', dial: '+61', name: 'Australia' },
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  existingLeads,
  onSaveLead,
  onOpenExistingLead,
}) => {
  const [phoneRaw, setPhoneRaw] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    () => localStorage.getItem('leaddesk_last_country') || 'US'
  );
  const [fullName, setFullName] = useState('');
  const [source, setSource] = useState<LeadSource>(
    () => (localStorage.getItem('leaddesk_last_source') as LeadSource) || 'WhatsApp'
  );
  const [sourceDetail, setSourceDetail] = useState('');
  const [purpose, setPurpose] = useState<LeadPurpose>(
    () => (localStorage.getItem('leaddesk_last_purpose') as LeadPurpose) || 'Software project'
  );
  const [followUpPreset, setFollowUpPreset] = useState<'tomorrow' | '3days' | 'nextweek' | 'custom'>('tomorrow');
  const [customFollowUpDate, setCustomFollowUpDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dictationLang, setDictationLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [showFullForm, setShowFullForm] = useState(false);

  // Additional full form fields
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [tags, setTags] = useState('');

  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => phoneInputRef.current?.focus(), 80);
    } else {
      setShowFullForm(false);
    }
  }, [isOpen]);

  // Parse phone live
  const parsedPhone = parsePhoneInput(
    phoneRaw.startsWith('+') ? phoneRaw : `${COUNTRY_DIAL_CODES.find(c => c.code === selectedCountry)?.dial || '+1'}${phoneRaw}`,
    selectedCountry as any
  );

  // Auto-fill extracted name from pasted text like "Zubair +1 415 555 2671"
  useEffect(() => {
    if (parsedPhone.extractedName && !fullName) {
      setFullName(parsedPhone.extractedName);
    }
  }, [parsedPhone.extractedName, fullName]);

  // Duplicate check
  const duplicateMatch = parsedPhone.isValid
    ? findDuplicatePhone(parsedPhone.e164, existingLeads)
    : null;

  const calculateFollowUpIso = () => {
    const now = new Date();
    let target = new Date(now);
    if (followUpPreset === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (followUpPreset === '3days') {
      target.setDate(now.getDate() + 3);
    } else if (followUpPreset === 'nextweek') {
      target.setDate(now.getDate() + 7);
    } else if (followUpPreset === 'custom' && customFollowUpDate) {
      return new Date(customFollowUpDate).toISOString();
    }
    target.setHours(10, 0, 0, 0); // default 10:00 AM
    return target.toISOString();
  };

  const handleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice dictation is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = dictationLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNoteText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSubmit = async (andAddAnother = false) => {
    if (!parsedPhone.isValid && !email) {
      toast.error('Please enter a valid phone number or email.');
      phoneInputRef.current?.focus();
      return;
    }

    // Remember smart defaults
    localStorage.setItem('leaddesk_last_country', selectedCountry);
    localStorage.setItem('leaddesk_last_source', source);
    localStorage.setItem('leaddesk_last_purpose', purpose);

    const followUpIso = calculateFollowUpIso();

    const leadData: Partial<Lead> = {
      fullName: fullName.trim(),
      whatsappNumber: parsedPhone.e164 || phoneRaw.trim(),
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      source,
      sourceDetail: sourceDetail.trim() || undefined,
      purpose,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      currency: 'USD',
      summary: noteText.trim(),
      nextFollowUpAt: followUpIso,
      followUpChannel: source === 'Email' ? 'Email' : 'WhatsApp',
      followUpNote: noteText.trim() ? `Note: ${noteText.trim()}` : undefined,
      stage: 'New',
      temperature: 'Warm',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      const saved = await onSaveLead(leadData, andAddAnother);
      if (andAddAnother) {
        setPhoneRaw('');
        setFullName('');
        setNoteText('');
        setEstimatedValue('');
        phoneInputRef.current?.focus();
      } else {
        onClose();
      }
    } catch (err) {
      toast.error('Could not save lead');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Right Sheet (desktop) / Bottom Sheet (mobile) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-surface text-ink shadow-2xl flex flex-col border-l border-border-subtle"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <div>
                <h2 className="text-lg font-bold text-ink tracking-tight">Quick Add Lead</h2>
                <p className="text-xs text-ink-muted">Capture in under 10 seconds</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink-secondary hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmit(false);
              }}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Duplicate Warning Banner if phone exists */}
              {duplicateMatch && (
                <div className="p-3 rounded-xl bg-[#F5B544]/15 border border-[#F5B544]/30 flex items-start gap-3 text-xs">
                  <AlertCircle size={16} className="text-[#F5B544] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-ink">Possible duplicate detected</p>
                    <p className="text-ink-secondary">
                      Matches existing lead <strong className="text-ink">{duplicateMatch.fullName || duplicateMatch.whatsappNumber}</strong>.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenExistingLead(duplicateMatch as Lead);
                        }}
                        className="px-2.5 py-1 rounded-md bg-surface text-xs font-semibold border border-border-subtle hover:bg-surface-subtle cursor-pointer"
                      >
                        Open Lead
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. WhatsApp Number with Country Picker & Paste Handler */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  WhatsApp Number <span className="text-semantic-overdue">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {/* Country ISO code and Dial Code Selector */}
                  <select
                    value={selectedCountry}
                    onChange={e => setSelectedCountry(e.target.value)}
                    className="h-11 px-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink"
                  >
                    {COUNTRY_DIAL_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.dial})
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      value={phoneRaw}
                      onChange={e => setPhoneRaw(e.target.value)}
                      placeholder="e.g. 415 555 2671 or paste wa.me"
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-base sm:text-sm text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink"
                    />
                  </div>
                </div>

                {parsedPhone.isValid && (
                  <p className="text-[11px] text-[#1F7A55] font-semibold mt-1">
                    Formatted: {parsedPhone.formatted}
                  </p>
                )}
              </div>

              {/* 2. Full Name (optional) */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Full Name <span className="text-ink-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Marcus Vance or Leave empty"
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-base sm:text-sm text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* 3. Source Chips */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Lead Origin / Source
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SOURCES.map(s => {
                    const isSelected = source === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSource(s.id)}
                        className={`h-9 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-lime text-ink border-lime shadow-xs font-bold'
                            : 'bg-surface-subtle text-ink-secondary border-border-subtle/80 hover:bg-surface hover:text-ink'
                        }`}
                      >
                        {s.icon}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content attribution or specific detail */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Video, Reel or Post title <span className="text-ink-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={sourceDetail}
                  onChange={e => setSourceDetail(e.target.value)}
                  placeholder="e.g. Reel: 'How I charge $5k for MVP'"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* 4. Purpose Chips */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  What are they looking for? (Purpose)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PURPOSES.map(p => {
                    const isSelected = purpose === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPurpose(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pastel-sky text-ink border-pastel-sky font-bold'
                            : 'bg-surface-subtle text-ink-secondary border-border-subtle/80 hover:bg-surface hover:text-ink'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Follow-up Cadence Presets */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Follow-up Schedule
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: '3days', label: 'In 3 Days' },
                    { id: 'nextweek', label: 'Next Week' },
                    { id: 'custom', label: 'Pick Date' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFollowUpPreset(item.id as any)}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        followUpPreset === item.id
                          ? 'bg-active-chip text-ink border-border-strong font-bold'
                          : 'bg-surface-subtle text-ink-secondary border-border-subtle/80 hover:bg-surface hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {followUpPreset === 'custom' && (
                  <input
                    type="datetime-local"
                    value={customFollowUpDate}
                    onChange={e => setCustomFollowUpDate(e.target.value)}
                    className="mt-2 w-full h-10 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                )}
              </div>

              {/* 6. What did they say? (Note + Voice Dictation) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-ink">What did they say? (Notes)</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDictationLang(dictationLang === 'en-US' ? 'hi-IN' : 'en-US')}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-border-subtle"
                    >
                      {dictationLang === 'en-US' ? 'EN' : 'HI'}
                    </button>
                    <button
                      type="button"
                      onClick={handleVoiceDictation}
                      title="Voice dictation (speech-to-text)"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        isRecording ? 'bg-semantic-overdue text-white animate-pulse' : 'bg-surface-subtle hover:bg-border-subtle text-ink-secondary'
                      }`}
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  dir="auto"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Paste brief conversation note, requirements, or voice record..."
                  className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-base sm:text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {/* Accordion Toggle for More Details */}
              <div className="pt-2 border-t border-border-subtle/60">
                <button
                  type="button"
                  onClick={() => setShowFullForm(!showFullForm)}
                  className="text-xs font-bold text-ink hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showFullForm ? 'Hide extra details' : '+ Add more details (email, budget, tags)'}</span>
                </button>

                {showFullForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="client@company.com"
                        className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Company / Role</label>
                        <input
                          type="text"
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder="e.g. Founder"
                          className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Estimated Value ($)</label>
                        <input
                          type="number"
                          value={estimatedValue}
                          onChange={e => setEstimatedValue(e.target.value)}
                          placeholder="5000"
                          className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="MVP, High-Ticket, Next.js"
                        className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-ink"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </form>

            {/* Footer Actions: Lime Save lead, Save & add another */}
            <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="h-10 px-3 rounded-xl border border-border-subtle hover:bg-surface-subtle text-xs font-semibold text-ink-secondary hover:text-ink cursor-pointer transition-colors"
              >
                Save & Add Another
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="flex-1 h-10 px-4 rounded-xl bg-lime hover:bg-lime-hover text-ink font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Save Lead</span>
                <span className="text-[10px] text-ink/70 font-normal hidden sm:inline">(Enter)</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
