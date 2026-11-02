/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, HelpCircle } from 'lucide-react';

interface BottomLeftButtonsProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHelp: () => void;
}

export const BottomLeftButtons: React.FC<BottomLeftButtonsProps> = ({
  isDark,
  onToggleTheme,
  onOpenHelp,
}) => {
  return (
    <div className="fixed bottom-5 left-5 z-40 hidden xl:flex flex-col gap-3">
      {/* Theme Toggle Button (52x52, radius 20) */}
      <motion.button
        type="button"
        onClick={onToggleTheme}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title="Toggle Theme"
        className="w-[52px] h-[52px] rounded-[20px] bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)] cursor-pointer hover:border-ink/20 transition-colors"
      >
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 45, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={20} strokeWidth={2} /> : <Sun size={20} strokeWidth={2} />}
        </motion.div>
      </motion.button>

      {/* Help Button (52x52, radius 20) */}
      <motion.button
        type="button"
        onClick={onOpenHelp}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        aria-label="Open shortcuts and help dialog"
        title="Help & Shortcuts (?)"
        className="w-[52px] h-[52px] rounded-[20px] bg-surface border border-border-subtle/80 flex items-center justify-center text-ink shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)] cursor-pointer hover:border-ink/20 transition-colors"
      >
        <HelpCircle size={20} strokeWidth={2} />
      </motion.button>
    </div>
  );
};
