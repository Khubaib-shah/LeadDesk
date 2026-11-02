/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface TodayFollowUpsCardProps {
  dueTodayCount: number;
  overdueCount: number;
  onStartFocusMode: () => void;
}

export const TodayFollowUpsCard: React.FC<TodayFollowUpsCardProps> = ({
  dueTodayCount,
  overdueCount,
  onStartFocusMode,
}) => {
  return (
    <div className="relative rounded-[20px] p-5 bg-[#17807D] text-white flex flex-col justify-between min-h-[148px] overflow-hidden shadow-xs">
      {/* Subtle corner line illustration */}
      <svg
        className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="40" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="28" strokeWidth="2" />
        <path d="M50 25 V50 L65 65" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
            <Clock size={16} strokeWidth={2.4} />
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight">Today’s Follow-ups</span>
        </div>
        {overdueCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#E5484D] text-white px-2 py-0.5 rounded-full">
            <AlertCircle size={10} />
            <span>{overdueCount} overdue</span>
          </span>
        )}
      </div>

      {/* Body: Count & status */}
      <div className="relative z-10 my-2 flex items-baseline gap-2">
        <span className="text-[32px] leading-tight font-extrabold text-white tabular-nums tracking-tight">
          {dueTodayCount}
        </span>
        <span className="text-xs text-white/80">
          {dueTodayCount === 1 ? 'task scheduled today' : 'tasks scheduled today'}
        </span>
      </div>

      {/* Action: Lime button */}
      <div className="relative z-10 pt-1">
        <motion.button
          type="button"
          onClick={onStartFocusMode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-8 px-3.5 rounded-[10px] bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span className="text-[#14161A]">Start follow-ups</span>
          <ArrowRight size={14} strokeWidth={2.5} className="text-[#14161A]" />
        </motion.button>
      </div>
    </div>
  );
};
