/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, MessageSquare, Mail, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { LeadTemplate } from '../../types';
import { SEED_TEMPLATES } from '../../data/seedTemplates';
import { fetchTemplates } from '../../api/templates';
import { fillTemplateVariables } from '../../utils/leads';
import { toast } from 'sonner';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<LeadTemplate[]>(SEED_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<LeadTemplate>(SEED_TEMPLATES[0]);
  const [previewName, setPreviewName] = useState('Alex');
  const [previewPurpose, setPreviewPurpose] = useState('Software project');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetchTemplates()
        .then(data => {
          if (data && data.length > 0) {
            setTemplates(data);
            setSelectedTemplate(data[0]);
          }
        })
        .catch(err => console.error('Failed to load templates:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const previewBody = fillTemplateVariables(selectedTemplate.body, {
    firstName: previewName,
    purpose: previewPurpose,
    myName: 'Zubair',
    topic: 'MVP launch timeline',
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Template copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-surface text-ink rounded-3xl shadow-2xl border border-border-subtle flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight">Message Templates</h2>
            <p className="text-xs text-ink-muted">High-converting WhatsApp & Email follow-up presets</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Split: Left List, Right Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
          {/* Templates List */}
          <div className="md:col-span-5 p-4 space-y-2 overflow-y-auto max-h-[500px]">
            {templates.map(tpl => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-active-chip border-border-strong shadow-xs'
                      : 'bg-surface hover:bg-surface-subtle border-border-subtle/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-ink">{tpl.title}</span>
                    {tpl.channel === 'WhatsApp' ? (
                      <FaWhatsapp size={14} className="text-[#25D366]" />
                    ) : (
                      <Mail size={13} className="text-ink-secondary" />
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                    {tpl.body}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Live Preview & Variables Sandbox */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Live Preview ({selectedTemplate.channel})
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle text-ink-secondary">
                  Category: {selectedTemplate.category}
                </span>
              </div>

              {/* Sample test inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-ink-muted block mb-1">Sample First Name</label>
                  <input
                    type="text"
                    value={previewName}
                    onChange={e => setPreviewName(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-muted block mb-1">Sample Purpose</label>
                  <input
                    type="text"
                    value={previewPurpose}
                    onChange={e => setPreviewPurpose(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-ink"
                  />
                </div>
              </div>

              {selectedTemplate.subject && (
                <div className="p-2.5 rounded-xl bg-surface-subtle text-xs">
                  <span className="text-ink-muted font-semibold block">Subject:</span>
                  <span className="text-ink font-bold">
                    {fillTemplateVariables(selectedTemplate.subject, {
                      firstName: previewName,
                      purpose: previewPurpose,
                      myName: 'Zubair',
                    })}
                  </span>
                </div>
              )}

              {/* Rendered Preview Box */}
              <div className="p-4 rounded-2xl bg-[#F7F9F9] dark:bg-canvas border border-border-subtle text-xs leading-relaxed text-ink space-y-2">
                <p className="whitespace-pre-wrap">{previewBody}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopy(previewBody, selectedTemplate.id)}
                className="h-10 px-4 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                {copiedId === selectedTemplate.id ? <Check size={15} className="text-[#14161A]" /> : <Copy size={15} className="text-[#14161A]" />}
                <span className="text-[#14161A]">{copiedId === selectedTemplate.id ? 'Copied!' : 'Copy Formatted Text'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
