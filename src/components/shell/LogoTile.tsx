/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface LogoTileProps {
  onClick?: () => void;
}

export const LogoTile: React.FC<LogoTileProps> = ({ onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      aria-label="LeadDesk Home"
      className="fixed top-5 left-5 z-40 hidden xl:flex w-[52px] h-[52px] rounded-[18px] bg-surface border border-border-subtle/80 items-center justify-center shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)] cursor-pointer text-ink transition-colors"
    >
      {/* Official LeadDesk Monogram */}
      <img
        src="/logo.webp"
        alt="LeadDesk Logo"
        className="w-[30px] h-[30px] object-contain dark:invert select-none pointer-events-none transition-transform"
      />
    </motion.button>
  );
};
