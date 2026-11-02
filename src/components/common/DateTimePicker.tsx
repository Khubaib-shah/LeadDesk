/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addDays,
  setHours,
  setMinutes,
} from 'date-fns';

interface DateTimePickerProps {
  value?: string; // ISO string
  onChange: (isoString: string) => void;
  className?: string;
  placeholder?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Pick date & time',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : addDays(new Date(), 1);
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // Time state
  const rawHours = selectedDate.getHours();
  const [hour12, setHour12] = useState(rawHours % 12 === 0 ? 12 : rawHours % 12);
  const [minute, setMinute] = useState(selectedDate.getMinutes() >= 30 ? 30 : 0);
  const [period, setPeriod] = useState<'AM' | 'PM'>(rawHours >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setSelectedDate(d);
      setCurrentMonth(d);
      const h = d.getHours();
      setHour12(h % 12 === 0 ? 12 : h % 12);
      setMinute(d.getMinutes());
      setPeriod(h >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = monthStart.getDay(); // 0 for Sunday

  const applyDateTime = (newDate: Date, h12: number, min: number, ampm: 'AM' | 'PM') => {
    let hour24 = h12 % 12;
    if (ampm === 'PM') hour24 += 12;
    const finalDate = setMinutes(setHours(newDate, hour24), min);
    setSelectedDate(finalDate);
    onChange(finalDate.toISOString());
  };

  const handleSelectDay = (day: Date) => {
    applyDateTime(day, hour12, minute, period);
  };

  const handleApplyPreset = (daysOffset: number) => {
    const target = addDays(new Date(), daysOffset);
    applyDateTime(target, 10, 0, 'AM');
    setHour12(10);
    setMinute(0);
    setPeriod('AM');
    setIsOpen(false);
  };

  const formattedDisplay = value
    ? format(new Date(value), 'EEE, MMM d · h:mm a')
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3.5 rounded-xl bg-surface-subtle hover:bg-surface border border-border-subtle text-ink font-semibold text-xs flex items-center justify-between transition-all cursor-pointer select-none shadow-xs"
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon size={15} className="text-ink-secondary shrink-0" />
          <span className="truncate">{formattedDisplay}</span>
        </div>
        <span className="text-[10px] text-ink-muted uppercase font-bold">Edit</span>
      </button>

      {/* Popover Custom Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute left-0 mt-2 z-50 w-[310px] p-4 bg-surface border border-border-subtle rounded-2xl shadow-2xl text-xs text-ink"
          >
            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1 mb-3 pb-3 border-b border-border-subtle overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleApplyPreset(1)}
                className="px-2 py-1 rounded-lg bg-surface-subtle hover:bg-active-chip text-[11px] font-semibold text-ink cursor-pointer shrink-0"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(3)}
                className="px-2 py-1 rounded-lg bg-surface-subtle hover:bg-active-chip text-[11px] font-semibold text-ink cursor-pointer shrink-0"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7)}
                className="px-2 py-1 rounded-lg bg-surface-subtle hover:bg-active-chip text-[11px] font-semibold text-ink cursor-pointer shrink-0"
              >
                +1 Week
              </button>
            </div>

            {/* Calendar Month Navigation Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-bold text-sm text-ink">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-7 h-7 rounded-lg hover:bg-surface-subtle flex items-center justify-center cursor-pointer text-ink-secondary hover:text-ink"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-7 h-7 rounded-lg hover:bg-surface-subtle flex items-center justify-center cursor-pointer text-ink-secondary hover:text-ink"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day of Week Labels */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-ink-muted mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: startDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="w-8 h-8" />
              ))}

              {daysInMonth.map(day => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentToday = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs transition-colors cursor-pointer relative ${
                      isSelected
                        ? 'bg-lime text-[#14161A] font-bold shadow-xs'
                        : isCurrentToday
                        ? 'bg-surface-subtle font-bold text-ink'
                        : 'hover:bg-surface-subtle text-ink'
                    }`}
                  >
                    <span>{format(day, 'd')}</span>
                    {isCurrentToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-lime" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time Selector Bar */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Clock size={13} className="text-ink-secondary" />
                <span className="font-semibold text-ink-muted text-[11px]">Time:</span>
              </div>

              <div className="flex items-center gap-1 font-bold">
                {/* Hour */}
                <select
                  value={hour12}
                  onChange={e => {
                    const h = parseInt(e.target.value);
                    setHour12(h);
                    applyDateTime(selectedDate, h, minute, period);
                  }}
                  className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border-subtle text-xs text-ink cursor-pointer focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                    <option key={h} value={h}>
                      {h < 10 ? `0${h}` : h}
                    </option>
                  ))}
                </select>

                <span>:</span>

                {/* Minute */}
                <select
                  value={minute}
                  onChange={e => {
                    const m = parseInt(e.target.value);
                    setMinute(m);
                    applyDateTime(selectedDate, hour12, m, period);
                  }}
                  className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border-subtle text-xs text-ink cursor-pointer focus:outline-none"
                >
                  {[0, 15, 30, 45].map(m => (
                    <option key={m} value={m}>
                      {m < 10 ? `0${m}` : m}
                    </option>
                  ))}
                </select>

                {/* AM/PM */}
                <button
                  type="button"
                  onClick={() => {
                    const nextPeriod = period === 'AM' ? 'PM' : 'AM';
                    setPeriod(nextPeriod);
                    applyDateTime(selectedDate, hour12, minute, nextPeriod);
                  }}
                  className="ml-1 px-2 py-0.5 rounded bg-active-chip text-ink text-xs font-bold cursor-pointer"
                >
                  {period}
                </button>
              </div>
            </div>

            {/* Done CTA */}
            <div className="mt-3 pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full h-8 rounded-xl bg-lime hover:bg-lime-hover text-[#14161A] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Check size={14} strokeWidth={2.8} />
                <span>Confirm Date & Time</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
