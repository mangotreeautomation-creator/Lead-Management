'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DemoRole } from '../../data/types';
import { CompanyCategoryDropdown } from './CompanyCategoryDropdown';
import { EnterpriseDateRangePicker } from '../ui/EnterpriseDateRangePicker';
import { ThemeFontStudio } from './ThemeFontStudio';
import {
  Search,
  Sun,
  Moon,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  ChevronDown,
  X,
  ArrowLeft,
  User,
  Shield,
  Layers
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    theme,
    toggleTheme,
    globalSearch,
    setGlobalSearch,
    currentUser,
    switchDemoRole,
    notifications,
    markNotificationAsRead,
    resetDemoData,
    returnToGateway
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const demoRoles: DemoRole[] = [
    'SUPER_ADMIN',
    'EXECUTIVE_LEADERSHIP',
    'PERFORMANCE_MARKETER',
    'SALES_CALLING_TEAM',
    'CUSTOMER_SUPPORT',
    'FINANCE_RECONCILIATION'
  ];

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-[#27272a] bg-[#0c0e14] px-4 text-zinc-200 sm:px-6">
      {/* LEFT: UNIFIED CASCADING COMPANY & CATEGORY SWITCHER (Zero clutter, full flyout power) */}
      <div className="flex items-center gap-3">
        <CompanyCategoryDropdown />
      </div>

      {/* CENTER: CLEAN, SLEEK SEARCH BAR (Razorpay/Linear Style) */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search leads, phone, creative, order..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-1.5 pl-8 pr-12 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:bg-zinc-900 focus:outline-none transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* RIGHT: DATE RANGE PICKER (DUAL MONTH), THEME, ALERTS, USER PROFILE */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Enterprise Date Range Popover (Dual Month Calendar + Presets) */}
        <EnterpriseDateRangePicker />

        {/* 10 Production Themes & 10 Typography Fonts Switchers */}
        <ThemeFontStudio />

        {/* Operational Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Operational Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-[#11131a] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Operational Alerts
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 max-h-72 divide-y divide-zinc-800/80 overflow-y-auto">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      notif.read
                        ? 'opacity-60 hover:bg-zinc-800/40'
                        : 'bg-blue-500/10 hover:bg-blue-500/20'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'success' && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                      {notif.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                      {notif.type === 'info' && <Info className="h-3.5 w-3.5 text-blue-400" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="text-zinc-200">{notif.text}</p>
                      <span className="mt-0.5 block text-[10px] text-zinc-500">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Role Switcher with Clean Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
              {(currentUser.fullName || currentUser.name || 'A').charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-white leading-tight">
                {currentUser.fullName || currentUser.name || 'Alfaz Mansuri'}
              </div>
              <div className="text-[10px] text-zinc-400 leading-tight">
                {currentUser.role.replace(/_/g, ' ')}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-zinc-800 bg-[#11131a] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Switch Role Profile
              </div>
              <div className="mt-1 space-y-0.5">
                {demoRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      switchDemoRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-left transition-colors ${
                      currentUser.role === role
                        ? 'bg-blue-600/20 font-bold text-blue-400 border border-blue-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{role.replace(/_/g, ' ')}</span>
                    {currentUser.role === role && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>

              {/* Utility Section inside Dropdown: Reset Demo Data */}
              <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
                <button
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    resetDemoData();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                  <span>Reset Demo Environment</span>
                </button>

                <button
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    returnToGateway('LOGIN');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Lock & Exit Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
