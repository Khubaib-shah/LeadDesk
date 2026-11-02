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
      className="fixed top-5 left-5 z-40 w-[52px] h-[52px] rounded-[18px] bg-surface border border-border-subtle/80 flex items-center justify-center shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)] cursor-pointer text-ink transition-colors"
    >
      {/* Custom LeadDesk Monogram: chat bubble with bold checkmark */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-ink"
      >
        <path
          d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 11.5L11.5 14L15.5 9.5"
          stroke="#D4F56B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:stroke-lime"
        />
      </svg>
    </motion.button>
  );
};
