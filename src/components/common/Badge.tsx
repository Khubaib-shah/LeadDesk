/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LeadSource, LeadStage, LeadTemperature } from '../../types';
import { FaWhatsapp, FaTiktok, FaInstagram, FaYoutube, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Mail, Globe, Flame, ShieldAlert, Sparkles, Check, X } from 'lucide-react';

interface StageBadgeProps {
  stage: LeadStage;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const StageBadge: React.FC<StageBadgeProps> = ({
  stage,
  className = '',
  onClick,
  clickable = false,
}) => {
  // Stage chips use pastels (New sky, Contacted lavender, Qualified butter, Proposal sent peach, Negotiation rose, Won mint, Lost gray)
  const getStyle = () => {
    switch (stage) {
      case 'New':
        return 'bg-[#A9C8FA] text-[#14161A]';
      case 'Contacted':
        return 'bg-[#C9C3F5] text-[#14161A]';
      case 'Qualified':
        return 'bg-[#F6E7A1] text-[#14161A]';
      case 'Proposal sent':
        return 'bg-[#F8CDB0] text-[#14161A]';
      case 'Negotiation':
        return 'bg-[#F5B8C4] text-[#14161A]';
      case 'Won':
        return 'bg-[#92E2B3] text-[#14161A] font-semibold';
      case 'Lost':
        return 'bg-[#D7DBDF] dark:bg-[#373E47] text-[#4A515B] dark:text-[#A3AAB3]';
      default:
        return 'bg-surface-subtle text-ink';
    }
  };

  const Component = clickable ? 'button' : 'span';

  return (
    <Component
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-transform ${
        clickable ? 'hover:scale-105 cursor-pointer active:scale-95' : ''
      } ${getStyle()} ${className}`}
    >
      {stage === 'Won' && <Check size={11} strokeWidth={3} />}
      {stage === 'Lost' && <X size={11} strokeWidth={2.5} />}
      <span>{stage}</span>
    </Component>
  );
};

interface SourceBadgeProps {
  source: LeadSource;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className = '' }) => {
  // Source chips: WhatsApp mint, Instagram rose, TikTok ink with white icon, YouTube peach, LinkedIn sky, others gray
  const getStyleAndIcon = () => {
    switch (source) {
      case 'WhatsApp':
        return {
          bg: 'bg-[#92E2B3]/70 text-[#14161A]',
          icon: <FaWhatsapp size={12} className="text-[#1F7A55]" />,
        };
      case 'Instagram':
        return {
          bg: 'bg-[#F5B8C4]/70 text-[#14161A]',
          icon: <FaInstagram size={12} className="text-[#C2363B]" />,
        };
      case 'TikTok':
        return {
          bg: 'bg-[#14161A] text-white dark:bg-white dark:text-[#14161A]',
          icon: <FaTiktok size={11} />,
        };
      case 'YouTube':
        return {
          bg: 'bg-[#F8CDB0] text-[#14161A]',
          icon: <FaYoutube size={12} className="text-[#E5484D]" />,
        };
      case 'LinkedIn':
        return {
          bg: 'bg-[#A9C8FA] text-[#14161A]',
          icon: <FaLinkedinIn size={11} className="text-[#14161A]" />,
        };
      case 'X':
        return {
          bg: 'bg-surface-subtle text-ink border border-border-subtle',
          icon: <FaXTwitter size={11} />,
        };
      case 'Email':
        return {
          bg: 'bg-surface-subtle text-ink border border-border-subtle',
          icon: <Mail size={12} className="text-ink-secondary" />,
        };
      default:
        return {
          bg: 'bg-[#EDEEEF] dark:bg-[#272C33] text-ink-secondary',
          icon: <Globe size={11} />,
        };
    }
  };

  const { bg, icon } = getStyleAndIcon();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0 ${bg} ${className}`}
    >
      {icon}
      <span>{source}</span>
    </span>
  );
};

interface TemperatureBadgeProps {
  temperature: LeadTemperature;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const TemperatureBadge: React.FC<TemperatureBadgeProps> = ({
  temperature,
  className = '',
  onClick,
  clickable = false,
}) => {
  const getStyle = () => {
    switch (temperature) {
      case 'Hot':
        return 'text-[#FF7A59] bg-[#FF7A59]/15';
      case 'Warm':
        return 'text-[#F5B544] bg-[#F5B544]/15';
      case 'Cold':
        return 'text-[#7BB2F9] bg-[#7BB2F9]/15';
    }
  };

  const Component = clickable ? 'button' : 'span';

  return (
    <Component
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 ${
        clickable ? 'cursor-pointer hover:opacity-80' : ''
      } ${getStyle()} ${className}`}
    >
      <Flame size={12} strokeWidth={2.5} />
      <span>{temperature}</span>
    </Component>
  );
};
