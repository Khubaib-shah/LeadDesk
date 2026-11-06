/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import './SwipeRow.css';

export interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  dismiss?: boolean;
  color?: string;
  onSelect?: () => void;
}

export interface SwipeRowProps {
  children: React.ReactNode;
  actions?: SwipeAction[];
  actionColor?: string;
  drawerColor?: string;
  rowColor?: string;
  textColor?: string;
  height?: number;
  radius?: number;
  actionWidth?: number;
  direction?: 'left' | 'right';
  snapBounce?: number;
  resistance?: number;
  collapseMs?: number;
  commitAt?: number;
  fullSwipe?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction?: (action: SwipeAction) => void;
  onCommit?: (action: SwipeAction) => void;
  closeOnAction?: boolean;
  haptic?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const HYST = 8;
const FLICK = 120;
const DECEL = 0.998;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const DEFAULT_ACTIONS: SwipeAction[] = [
  { id: 'delete', label: 'Delete', icon: <HugeiconsIcon icon={Delete02Icon} size={20} /> },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const SwipeRow: React.FC<SwipeRowProps> = ({
  children,
  actions = DEFAULT_ACTIONS,
  actionColor = '#e5484d',
  drawerColor = '#3f3f46',
  rowColor = '#27272a',
  textColor = '#f5f5f5',
  height = 64,
  radius = 16,
  actionWidth = 80,
  direction = 'left',
  snapBounce = 0.2,
  resistance = 0.55,
  collapseMs = 200,
  commitAt = 0.6,
  fullSwipe = true,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  onAction,
  onCommit,
  closeOnAction = true,
  haptic = true,
  label = 'List item',
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentHeight, setCurrentHeight] = useState<number | undefined>(height);
  const [isCommitted, setIsCommitted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const drawerWidth = actions.length * actionWidth;
  const isLeft = direction === 'left';
  const sign = isLeft ? -1 : 1;

  // Pointer gesture tracking
  const stateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    startVal: 0,
    hasCaptured: false,
    history: [] as [number, number][],
    committed: false,
  });

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setRowWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle controlled open prop
  useEffect(() => {
    if (controlledOpen === undefined) return;
    const targetX = controlledOpen ? sign * drawerWidth : 0;
    animate(x, targetX, {
      type: 'spring',
      damping: 24,
      stiffness: 280,
    });
  }, [controlledOpen, drawerWidth, sign, x]);

  const snapTo = (targetX: number, onComplete?: () => void) => {
    animate(x, targetX, {
      type: 'spring',
      damping: snapBounce > 0 ? 20 : 28,
      stiffness: 260,
      onComplete,
    });
    if (onOpenChange) {
      onOpenChange(Math.abs(targetX) > 0);
    }
  };

  const handleCommit = (action: SwipeAction) => {
    if (onCommit) {
      onCommit(action);
    }
    // Animate collapse
    setTimeout(() => {
      setCurrentHeight(0);
      setTimeout(() => {
        setIsCollapsed(true);
      }, collapseMs);
    }, 100);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isCollapsed) return;
    stateRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      startVal: x.get(),
      hasCaptured: false,
      history: [[Date.now(), e.clientX]],
      committed: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = stateRef.current;
    if (!state.isDown) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    // Initial threshold check
    if (!state.hasCaptured) {
      if (Math.abs(dx) > HYST && Math.abs(dx) > Math.abs(dy)) {
        state.hasCaptured = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } else {
        return;
      }
    }

    state.history.push([Date.now(), e.clientX]);
    if (state.history.length > 5) state.history.shift();

    let rawTarget = state.startVal + dx;

    // Constrain motion based on swipe direction
    if (isLeft) {
      // Swiping left means negative x
      if (rawTarget > 0) {
        rawTarget = rawTarget * 0.2; // Rubberband to the right
      } else if (Math.abs(rawTarget) > drawerWidth) {
        const extra = Math.abs(rawTarget) - drawerWidth;
        rawTarget = -(drawerWidth + extra * resistance);
      }
    } else {
      // Swiping right means positive x
      if (rawTarget < 0) {
        rawTarget = rawTarget * 0.2;
      } else if (rawTarget > drawerWidth) {
        const extra = rawTarget - drawerWidth;
        rawTarget = drawerWidth + extra * resistance;
      }
    }

    x.set(rawTarget);

    // Check full swipe commit
    const currentUncovered = Math.abs(rawTarget);
    const commitThreshold = (rowWidth || 320) * commitAt;

    if (fullSwipe && currentUncovered >= commitThreshold) {
      if (!state.committed) {
        state.committed = true;
        setIsCommitted(true);
        if (haptic && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
        }
      }
    } else {
      if (state.committed) {
        state.committed = false;
        setIsCommitted(false);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = stateRef.current;
    if (!state.isDown) return;
    state.isDown = false;

    if (state.hasCaptured) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }

    const currentX = x.get();
    const currentDist = Math.abs(currentX);
    const commitThreshold = (rowWidth || 320) * commitAt;

    // 1. Full swipe commit triggered
    if (fullSwipe && (state.committed || currentDist >= commitThreshold)) {
      const commitX = sign * (rowWidth || 400);
      animate(x, commitX, {
        duration: 0.18,
        ease: EASE_OUT,
        onComplete: () => {
          handleCommit(actions[0]);
        },
      });
      return;
    }

    // 2. Velocity check or distance threshold to snap open/close
    let velocity = 0;
    if (state.history.length >= 2) {
      const [t0, x0] = state.history[0];
      const [t1, x1] = state.history[state.history.length - 1];
      const dt = Math.max(1, t1 - t0);
      velocity = ((x1 - x0) / dt) * 1000;
    }

    const flickingOpen = isLeft ? velocity < -FLICK : velocity > FLICK;
    const flickingClosed = isLeft ? velocity > FLICK : velocity < -FLICK;

    if (flickingOpen) {
      snapTo(sign * drawerWidth);
    } else if (flickingClosed) {
      snapTo(0);
    } else if (currentDist >= drawerWidth * 0.45) {
      snapTo(sign * drawerWidth);
    } else {
      snapTo(0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    if (onAction) onAction(action);
    if (action.onSelect) action.onSelect();

    if (action.dismiss) {
      handleCommit(action);
    } else if (closeOnAction) {
      snapTo(0);
    }
  };

  if (isCollapsed) return null;

  return (
    <div
      ref={containerRef}
      className={`swipe-row-root ${className}`}
      style={{
        height: currentHeight !== undefined ? `${currentHeight}px` : undefined,
        borderRadius: `${radius}px`,
        transition: currentHeight === 0 ? `height ${collapseMs}ms cubic-bezier(0.4, 0, 0.2, 1), margin ${collapseMs}ms ease` : undefined,
        overflow: 'hidden',
        ...style,
      }}
      role="region"
      aria-label={label}
    >
      {/* Background Drawer */}
      <div
        className="swipe-row-drawer"
        style={{
          [isLeft ? 'right' : 'left']: 0,
          width: `${drawerWidth}px`,
          backgroundColor: drawerColor,
        }}
      >
        {actions.map((act, idx) => {
          const isPrimary = idx === 0;
          const bg = act.color || (isPrimary ? actionColor : drawerColor);
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => handleActionClick(act)}
              className="swipe-row-action"
              style={{
                width: `${actionWidth}px`,
                backgroundColor: bg,
                color: textColor,
              }}
              title={act.label}
              aria-label={act.label}
            >
              {act.icon}
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Leap Full Swipe Block */}
      {isCommitted && fullSwipe && (
        <div
          className="swipe-row-commit-fill"
          style={{
            left: 0,
            right: 0,
            backgroundColor: actionColor,
            color: textColor,
          }}
        >
          <div className="flex items-center gap-2 font-bold text-xs">
            {actions[0]?.icon}
            <span>Release to {actions[0]?.label}</span>
          </div>
        </div>
      )}

      {/* Front Surface (Row Content) */}
      <motion.div
        className="swipe-row-surface"
        style={{
          x,
          backgroundColor: rowColor,
          borderRadius: `${radius}px`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeRow;
