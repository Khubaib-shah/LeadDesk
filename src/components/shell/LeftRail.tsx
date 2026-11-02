/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { RailFilter } from '../../types';
import { Users, Clock, Flame, Trophy } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa6';

interface LeftRailProps {
  activeFilter: RailFilter;
  onFilterChange: (filter: RailFilter) => void;
}

interface RailItem {
  id: RailFilter;
  label: string;
  icon: React.ReactNode;
}

const RAIL_ITEMS: RailItem[] = [
  { id: 'ALL', label: 'All Leads', icon: <Users size={18} strokeWidth={2} /> },
  { id: 'DUE_TODAY', label: 'Due Today', icon: <Clock size={18} strokeWidth={2} /> },
  { id: 'HOT', label: 'Hot Leads', icon: <Flame size={18} strokeWidth={2.2} /> },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: <FaWhatsapp size={18} /> },
  { id: 'INSTAGRAM', label: 'Instagram', icon: <FaInstagram size={18} /> },
  { id: 'TIKTOK', label: 'TikTok', icon: <FaTiktok size={16} /> },
  { id: 'WON', label: 'Won Deals', icon: <Trophy size={18} strokeWidth={2} /> },
];

export const LeftRail: React.FC<LeftRailProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <aside
      aria-label="Quick Filter Rail"
      className="fixed top-28 left-5 z-40 hidden xl:flex flex-col items-center w-[52px] p-1.5 gap-1 bg-surface border border-border-subtle/80 rounded-[20px] shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)]"
    >
      {RAIL_ITEMS.map(item => {
        const isActive = activeFilter === item.id;
        return (
          <div key={item.id} className="relative group">
            <motion.button
              type="button"
              onClick={() => onFilterChange(isActive && item.id !== 'ALL' ? 'ALL' : item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              aria-label={item.label}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center cursor-pointer transition-colors outline-none focus:outline-none ${
                isActive
                  ? 'bg-lime text-[#14161A] font-bold shadow-xs'
                  : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle'
              }`}
            >
              {item.icon}
            </motion.button>

            {/* Accessible tooltip */}
            <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-button-dark text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
              {item.label}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-button-dark" />
            </div>
          </div>
        );
      })}
    </aside>
  );
};
