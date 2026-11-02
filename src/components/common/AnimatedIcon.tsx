/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Users,
  Kanban,
  Clock,
  BarChart3,
  Plus,
  User,
  Sun,
  Moon,
  HelpCircle,
  Flame,
  Trophy,
  MessageCircle,
  Instagram,
  Check,
  Search,
  Bell,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Trash2,
  Share2,
  Mic,
  Copy,
  Zap,
} from 'lucide-react';
import { FaWhatsapp, FaTiktok, FaInstagram, FaYoutube, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';

export type IconSlot =
  | 'home'
  | 'leads'
  | 'pipeline'
  | 'followups'
  | 'analytics'
  | 'add'
  | 'user'
  | 'theme'
  | 'help'
  | 'due-today'
  | 'hot'
  | 'won'
  | 'whatsapp'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'x';

interface AnimatedIconProps {
  slot: IconSlot | string;
  size?: number;
  className?: string;
  isActive?: boolean;
  isDark?: boolean;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  slot,
  size = 20,
  className = '',
  isActive = false,
  isDark = false,
}) => {
  // Motion container for micro-bounce and subtle lift
  const renderIcon = () => {
    switch (slot) {
      case 'home':
        return <Home size={size} strokeWidth={2} />;
      case 'leads':
        return <Users size={size} strokeWidth={2} />;
      case 'pipeline':
        return <Kanban size={size} strokeWidth={2} />;
      case 'followups':
      case 'due-today':
        return <Clock size={size} strokeWidth={2} />;
      case 'analytics':
        return <BarChart3 size={size} strokeWidth={2} />;
      case 'add':
        return <Plus size={size} strokeWidth={2.5} />;
      case 'user':
        return <User size={size} strokeWidth={2} />;
      case 'theme':
        return isDark ? <Moon size={size} strokeWidth={2} /> : <Sun size={size} strokeWidth={2} />;
      case 'help':
        return <HelpCircle size={size} strokeWidth={2} />;
      case 'hot':
        return <Flame size={size} strokeWidth={2} />;
      case 'won':
        return <Trophy size={size} strokeWidth={2} />;
      case 'whatsapp':
        return <FaWhatsapp size={size} />;
      case 'instagram':
        return <FaInstagram size={size} />;
      case 'tiktok':
        return <FaTiktok size={size} />;
      case 'youtube':
        return <FaYoutube size={size} />;
      case 'linkedin':
        return <FaLinkedinIn size={size} />;
      case 'x':
        return <FaXTwitter size={size} />;
      case 'search':
        return <Search size={size} strokeWidth={2} />;
      case 'bell':
        return <Bell size={size} strokeWidth={2} />;
      case 'calendar':
        return <Calendar size={size} strokeWidth={2} />;
      case 'phone':
        return <Phone size={size} strokeWidth={2} />;
      case 'mail':
        return <Mail size={size} strokeWidth={2} />;
      default:
        return <Zap size={size} strokeWidth={2} />;
    }
  };

  return (
    <motion.span
      className={`inline-flex items-center justify-center select-none ${className}`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {renderIcon()}
    </motion.span>
  );
};
