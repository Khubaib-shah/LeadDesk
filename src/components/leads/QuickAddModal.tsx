/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, AlertCircle, Sparkles, ChevronDown, Check, ArrowRight, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Lead, LeadSource, LeadPurpose } from '../../types';
import { parsePhoneInput, findDuplicatePhone } from '../../utils/phone';
import { useTextToSpeech, useVoiceRecognition } from '../../utils/speech';
import { CustomSelect } from '../common/Select';
import { DateTimePicker } from '../common/DateTimePicker';
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
  const [dictationLang, setDictationLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [showFullForm, setShowFullForm] = useState(false);
  const { isSpeaking, speak, stop } = useTextToSpeech();

  const {
    isListening,
    interimTranscript,
    toggleListening,
    stopListening,
    isSupported: isVoiceSupported,
  } = useVoiceRecognition({
    lang: dictationLang,
    onResult: (text, isInterim) => {
      if (!isInterim && text.trim()) {
        setNoteText(prev => (prev ? `${prev.trim()} ${text.trim()}` : text.trim()));
      }
    },
    onError: (msg) => {
      toast.error(msg);
    },
  });

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
      stopListening();
    }
  }, [isOpen, stopListening]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (andAddAnother = false) => {
    if (isSubmitting) return;

    if (!parsedPhone.isValid && !email) {
      toast.error('Please enter a valid phone number or email address.');
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
      setIsSubmitting(true);
      await onSaveLead(leadData, andAddAnother);
      if (andAddAnother) {
        setPhoneRaw('');
        setFullName('');
        setNoteText('');
        setEstimatedValue('');
        phoneInputRef.current?.focus();
      } else {
        onClose();
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Unable to connect to database. Please check your network and try again.';
      toast.error(`Could not save lead: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
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
                  {/* Custom Country ISO and Dial Code Selector */}
                  <CustomSelect
                    value={selectedCountry}
                    onChange={val => setSelectedCountry(val)}
                    className="w-32 shrink-0"
                    options={COUNTRY_DIAL_CODES.map(c => ({
                      value: c.code,
                      label: `${c.code} (${c.dial})`,
                    }))}
                  />

                  <div className="relative flex-1">
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      value={phoneRaw}
                      onChange={e => setPhoneRaw(e.target.value)}
                      placeholder="e.g. 415 555 2671 or paste wa.me"
                      className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-base sm:text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
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
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-base sm:text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
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
                            ? 'bg-lime text-[#14161A] border-lime shadow-xs font-bold'
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
                  <div className="mt-2">
                    <DateTimePicker
                      value={customFollowUpDate}
                      onChange={val => setCustomFollowUpDate(val)}
                      placeholder="Select custom date & time"
                    />
                  </div>
                )}
              </div>

              {/* 6. What did they say? (Notes + Voice Dictation + Text-to-Speech) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-ink">What did they say? (Notes)</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDictationLang(dictationLang === 'en-US' ? 'hi-IN' : 'en-US')}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-border-subtle"
                    >
                      {dictationLang === 'en-US' ? 'EN' : 'HI'}
                    </button>

                    {/* Text-to-Speech (Read Aloud) Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          stop();
                        } else {
                          if (!noteText.trim()) {
                            toast.info('Enter some note text to read aloud');
                            return;
                          }
                          speak(noteText, dictationLang);
                        }
                      }}
                      title={isSpeaking ? 'Stop text-to-speech' : 'Read notes aloud (Text-to-Speech)'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        isSpeaking ? 'bg-lime text-[#14161A]' : 'bg-surface-subtle hover:bg-border-subtle text-ink-secondary'
                      }`}
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    {/* Speech-to-Text (Voice Dictation) Button */}
                    <button
                      type="button"
                      onClick={() => toggleListening({ lang: dictationLang })}
                      title={isListening ? 'Stop voice typing (Listening)' : 'Start voice typing (speech-to-text)'}
                      className={`h-7 px-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold ${
                        isListening
                          ? 'bg-semantic-overdue text-white animate-pulse shadow-xs'
                          : 'bg-surface-subtle hover:bg-border-subtle text-ink-secondary hover:text-ink'
                      }`}
                    >
                      <Mic size={14} className={isListening ? 'animate-bounce' : ''} />
                      <span className="text-[11px]">{isListening ? 'Listening...' : 'Voice'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  dir="auto"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Paste brief conversation note, requirements, or voice record..."
                  className="w-full p-3 rounded-xl bg-surface-subtle border border-border-subtle text-base sm:text-xs text-ink placeholder:text-ink-disabled focus:outline-none focus:border-border-strong transition-colors"
                />

                {/* Live Dictation Status & Interim Preview */}
                {isListening && (
                  <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-subtle border border-semantic-overdue/40 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2 h-2 rounded-full bg-semantic-overdue animate-ping flex-shrink-0" />
                      <span className="text-[11px] text-ink-muted flex-shrink-0">
                        Listening ({dictationLang === 'en-US' ? 'EN' : 'HI'}):
                      </span>
                      <span className="font-medium text-ink italic truncate">
                        {interimTranscript || 'Listening for your voice...'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => stopListening()}
                      className="text-[11px] font-bold text-semantic-overdue hover:underline cursor-pointer ml-2 flex-shrink-0"
                    >
                      Done
                    </button>
                  </div>
                )}
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

            {/* Footer Actions: Lime Save lead, Save & add another with loading state */}
            <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
                className="h-10 px-3.5 rounded-xl border border-border-subtle hover:bg-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-ink-secondary hover:text-ink cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isSubmitting && <Loader2 size={13} className="animate-spin text-ink-secondary" />}
                <span>Save & Add Another</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="flex-1 h-10 px-4 rounded-xl bg-lime hover:bg-lime-hover disabled:opacity-60 disabled:cursor-not-allowed text-[#14161A] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-[#14161A]" />
                    <span className="text-[#14161A]">Saving Lead...</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#14161A]">Save Lead</span>
                    <span className="text-[10px] text-[#14161A]/70 font-normal hidden sm:inline">(Enter)</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
