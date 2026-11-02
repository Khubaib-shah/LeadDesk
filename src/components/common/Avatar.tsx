/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getAvatarColor, getInitials } from '../../utils/leads';

interface AvatarProps {
  name?: string;
  phone?: string;
  size?: number; // default 36
  className?: string;
  avatarColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  phone = '',
  size = 36,
  className = '',
  avatarColor,
}) => {
  const bgColor = avatarColor || getAvatarColor(name || phone || 'Lead');
  const initials = getInitials(name, phone);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      className={`rounded-full flex items-center justify-center font-bold text-ink shadow-xs select-none ${className}`}
      aria-hidden="true"
    >
      <span
        style={{ fontSize: `${Math.round(size * 0.38)}px`, letterSpacing: '-0.02em' }}
        className="text-[#14161A] font-semibold tracking-tight"
      >
        {initials}
      </span>
    </div>
  );
};
