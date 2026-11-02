/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  caption: string;
  delta?: number;
  deltaPrefix?: string;
  icon: React.ReactNode;
  bgHex: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  caption,
  delta,
  deltaPrefix = '+',
  icon,
  bgHex,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      style={{ backgroundColor: bgHex }}
      className={`rounded-[20px] p-5 flex flex-col justify-between min-h-[148px] select-none text-[#14161A] shadow-[0_1px_2px_rgba(20,22,26,0.02)] transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      {/* Top row: 28px icon chip (white at 60%) and 13px semibold label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center text-[#14161A] shadow-xs">
            {icon}
          </div>
          <span className="text-[13px] font-semibold text-[#14161A] tracking-tight">{title}</span>
        </div>

        {delta !== undefined && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14161A]/80 bg-white/50 px-2 py-0.5 rounded-full">
            {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>
              {delta >= 0 ? deltaPrefix : ''}
              {delta}%
            </span>
          </span>
        )}
      </div>

      {/* Value centered at 28px bold */}
      <div className="my-auto text-center py-1">
        <span className="text-[28px] leading-[32px] font-bold text-[#14161A] tabular-nums tracking-tight">
          {value}
        </span>
      </div>

      {/* Caption centered, 11px, 70% opacity */}
      <div className="text-center">
        <p className="text-[11px] text-[#14161A]/70 font-medium">{caption}</p>
      </div>
    </motion.div>
  );
};
