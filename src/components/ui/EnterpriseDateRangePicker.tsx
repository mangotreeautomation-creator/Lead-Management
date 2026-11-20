'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DateRangeOption, CustomDateRange } from '../../data/types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  RotateCcw
} from 'lucide-react';

interface EnterpriseDateRangePickerProps {
  className?: string;
  align?: 'left' | 'right';
  compact?: boolean;
}

export const EnterpriseDateRangePicker: React.FC<EnterpriseDateRangePickerProps> = ({
  className = '',
  align = 'right',
  compact = false
}) => {
  const { dateRange, setDateRange, customDateRange, setCustomDateRange } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reference year & month (Default Nov 2026 & Dec 2026 as per platform context)
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(10); // 10 = November (0-indexed)

  // Selection states
  const initialStart = useMemo(() => {
    if (customDateRange?.startDate) return new Date(customDateRange.startDate);
    return new Date(2026, 10, 1);
  }, [customDateRange]);

  const initialEnd = useMemo(() => {
    if (customDateRange?.endDate) return new Date(customDateRange.endDate);
    return new Date(2026, 10, 3);
  }, [customDateRange]);

  const [selectedStart, setSelectedStart] = useState<Date | null>(initialStart);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(initialEnd);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<DateRangeOption>(dateRange);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sync active preset when dateRange changes externally
  useEffect(() => {
    setActivePreset(dateRange);
  }, [dateRange]);

  // Preset definitions exactly matching Image 4 & enterprise SaaS needs
  const presets: { id: DateRangeOption; label: string; getRange: () => { start: Date; end: Date } }[] = [
    {
      id: 'TODAY',
      label: 'Today',
      getRange: () => ({ start: new Date(2026, 10, 3), end: new Date(2026, 10, 3) })
    },
    {
      id: 'YESTERDAY',
      label: 'Yesterday',
      getRange: () => ({ start: new Date(2026, 10, 2), end: new Date(2026, 10, 2) })
    },
    {
      id: 'LAST_7_DAYS',
      label: 'Last 7 Days',
      getRange: () => ({ start: new Date(2026, 9, 27), end: new Date(2026, 10, 3) })
    },
    {
      id: 'LAST_30_DAYS',
      label: 'Last 30 Days',
      getRange: () => ({ start: new Date(2026, 9, 4), end: new Date(2026, 10, 3) })
    },
    {
      id: 'LAST_90_DAYS',
      label: 'Last 90 Days',
      getRange: () => ({ start: new Date(2026, 7, 5), end: new Date(2026, 10, 3) })
    },
    {
      id: 'THIS_MONTH',
      label: 'This Month (Nov 2026)',
      getRange: () => ({ start: new Date(2026, 10, 1), end: new Date(2026, 10, 30) })
    },
    {
      id: 'LAST_MONTH',
      label: 'Last Month (Oct 2026)',
      getRange: () => ({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) })
    },
    {
      id: 'YEAR_TO_DATE',
      label: 'Jan 2026 - till date',
      getRange: () => ({ start: new Date(2026, 0, 1), end: new Date(2026, 10, 3) })
    },
    {
      id: 'FINANCIAL_YEAR',
      label: 'This financial year (FY26)',
      getRange: () => ({ start: new Date(2026, 3, 1), end: new Date(2027, 2, 31) })
    },
    {
      id: 'ALL_TIME',
      label: 'All Time',
      getRange: () => ({ start: new Date(2025, 0, 1), end: new Date(2026, 10, 3) })
    }
  ];

  // Helper formatters
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplay = (d: Date) => {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Month 2 is viewMonth + 1
  const secondMonth = (viewMonth + 1) % 12;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  // Calendar Day Generator
  const generateMonthDays = (year: number, month: number) => {
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ day: number | null; date: Date | null }> = [];

    // Leading empty slots
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }

    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      days.push({ day: d, date: new Date(year, month, d) });
    }

    return days;
  };

  const month1Days = useMemo(() => generateMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const month2Days = useMemo(() => generateMonthDays(secondYear, secondMonth), [secondYear, secondMonth]);

  // Date comparison helpers
  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBetween = (d: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const t = d.getTime();
    const s = Math.min(start.getTime(), end.getTime());
    const e = Math.max(start.getTime(), end.getTime());
    return t > s && t < e;
  };

  const isToday = (d: Date | null) => {
    if (!d) return false;
    return d.getFullYear() === 2026 && d.getMonth() === 10 && d.getDate() === 3;
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
      setActivePreset('CUSTOM');
    } else {
      if (date.getTime() < selectedStart.getTime()) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
      setActivePreset('CUSTOM');
    }
  };

  // Handle preset click
  const handlePresetSelect = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    const range = preset.getRange();
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
    setViewYear(range.start.getFullYear());
    setViewMonth(range.start.getMonth());
  };

  // Apply Range
  const handleApply = () => {
    setDateRange(activePreset);
    if (selectedStart && selectedEnd) {
      setCustomDateRange({
        startDate: formatDateStr(selectedStart),
        endDate: formatDateStr(selectedEnd),
        label: `${formatDisplay(selectedStart)} — ${formatDisplay(selectedEnd)}`
      });
    } else if (selectedStart) {
      setCustomDateRange({
        startDate: formatDateStr(selectedStart),
        endDate: formatDateStr(selectedStart),
        label: formatDisplay(selectedStart)
      });
    }
    setIsOpen(false);
  };

  // Get active trigger button label
  const getTriggerLabel = () => {
    if (customDateRange?.label && dateRange === 'CUSTOM') {
      return customDateRange.label;
    }
    const found = presets.find(p => p.id === dateRange);
    if (found) {
      if (dateRange === 'TODAY') return 'Today (3 Nov)';
      if (dateRange === 'ALL_TIME') return 'All Time';
      return found.label;
    }
    return 'Select Date Range';
  };

  // Render a single calendar month grid (Compact 230px width for zero overflow)
  const renderCalendarMonth = (
    title: string,
    days: Array<{ day: number | null; date: Date | null }>,
    showPrevArrow: boolean,
    showNextArrow: boolean
  ) => {
    return (
      <div className="w-[230px] p-1.5 shrink-0">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          {showPrevArrow ? (
            <button
              onClick={handlePrevMonth}
              className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <span className="text-[11px] font-bold text-white tracking-wide">
            {title}
          </span>

          {showNextArrow ? (
            <button
              onClick={handleNextMonth}
              className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-zinc-500 mb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center text-xs">
          {days.map((item, idx) => {
            if (!item.date || item.day === null) {
              return <div key={`empty-${idx}`} className="h-7 w-7" />;
            }

            const isStart = isSameDay(item.date, selectedStart);
            const isEnd = isSameDay(item.date, selectedEnd);
            const inRange = isBetween(item.date, selectedStart, selectedEnd || hoverDate);
            const today = isToday(item.date);

            return (
              <div
                key={item.date.toISOString()}
                className={`relative flex h-7 w-7 items-center justify-center ${
                  inRange ? 'bg-blue-600/20' : ''
                } ${isStart && selectedEnd ? 'rounded-l-full' : ''} ${
                  isEnd ? 'rounded-r-full' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(item.date!)}
                  onMouseEnter={() => selectedStart && !selectedEnd && setHoverDate(item.date)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium transition-all ${
                    isStart || isEnd
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/50 scale-105'
                      : inRange
                      ? 'text-blue-200 hover:bg-blue-500/30'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {item.day}
                </button>

                {/* Blue dot indicator for Today */}
                {today && (
                  <span
                    className={`absolute bottom-0 h-1 w-1 rounded-full ${
                      isStart || isEnd ? 'bg-white' : 'bg-blue-500'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* TRIGGER BUTTON (Razorpay / Linear Style) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#0c0e14] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-all shadow-sm ${
          isOpen ? 'ring-1 ring-blue-500 border-blue-500/50 bg-zinc-900' : ''
        }`}
      >
        <CalendarIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span className="truncate">{getTriggerLabel()}</span>
        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* LUXURY DUAL-MONTH POPOVER MODAL (Fixed width 670px, zero clipping, fully visible Apply button) */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-2 z-50 w-[670px] max-w-[calc(100vw-24px)] rounded-2xl border border-zinc-800 bg-[#10121a] shadow-2xl shadow-black/90 backdrop-blur-xl animate-popover text-zinc-200 overflow-hidden`}
        >
          {/* Main Layout: Left Presets Rail + Right Dual-Month Calendar */}
          <div className="flex divide-x divide-zinc-800/80">
            {/* LEFT RAIL: QUICK PRESETS LIST */}
            <div className="w-[185px] shrink-0 p-2.5 bg-[#0d0f17] flex flex-col justify-between">
              <div>
                <span className="block px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Quick Date Filters
                </span>
                <div className="space-y-0.5 max-h-[290px] overflow-y-auto">
                  {presets.map(p => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                            : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                        {isSelected && <Check className="h-3 w-3 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset to All */}
              <div className="pt-2 border-t border-zinc-800/80 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('ALL_TIME');
                    setSelectedStart(new Date(2025, 0, 1));
                    setSelectedEnd(new Date(2026, 10, 3));
                    setDateRange('ALL_TIME');
                    setCustomDateRange(null);
                  }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset to All Time</span>
                </button>
              </div>
            </div>

            {/* RIGHT AREA: DUAL MONTH CALENDARS */}
            <div className="flex-1 p-2.5">
              <div className="flex divide-x divide-zinc-800/60 justify-center">
                {/* Month 1: viewMonth */}
                {renderCalendarMonth(
                  `${monthNames[viewMonth]} ${viewYear}`,
                  month1Days,
                  true,
                  false
                )}

                {/* Month 2: secondMonth */}
                {renderCalendarMonth(
                  `${monthNames[secondMonth]} ${secondYear}`,
                  month2Days,
                  false,
                  true
                )}
              </div>

              {/* Range Feedback Bar & Action Buttons (100% visible, no cut-off) */}
              <div className="mt-2.5 pt-2.5 border-t border-zinc-800 flex items-center justify-between px-2 bg-[#0d0f17] rounded-xl p-2">
                <div className="text-xs truncate max-w-[240px]">
                  <span className="text-zinc-500">Range: </span>
                  <span className="font-semibold text-white font-mono text-[11px]">
                    {selectedStart ? formatDisplay(selectedStart) : 'None'}
                    {selectedEnd && ` — ${formatDisplay(selectedEnd)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-900/40 transition-all shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Apply Range</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
