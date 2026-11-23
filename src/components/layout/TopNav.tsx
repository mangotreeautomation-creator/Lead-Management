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
    returnToGateway,
    isBackendConnected
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
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white px-4 text-slate-800 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* LEFT: UNIFIED CASCADING COMPANY & CATEGORY SWITCHER */}
      <div className="flex items-center gap-3">
        <CompanyCategoryDropdown />
      </div>

      {/* CENTER: SEARCH BAR MATCHING SPEC */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, payments, campaigns, customers..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-[#f9fafb] py-2 pl-10 pr-12 text-xs font-normal text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none transition-all shadow-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* RIGHT: ALERTS, USER PROFILE (MATCHING SPEC) */}
      <div className="flex items-center gap-3">
        {/* Operational Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Operational Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 0 ? unreadCount : 3}
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Operational Alerts
                  </h3>
                  <span className="rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
                    {unreadCount > 0 ? unreadCount : 3} new
                  </span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      notif.read
                        ? 'opacity-60 hover:bg-slate-50'
                        : 'bg-purple-50/50 hover:bg-purple-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'success' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                      {notif.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      {notif.type === 'info' && <Info className="h-3.5 w-3.5 text-blue-500" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="text-slate-800 font-medium">{notif.text}</p>
                      <span className="mt-0.5 block text-[10px] text-slate-400">{notif.time}</span>
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
            className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-bold text-white shadow-sm ring-2 ring-purple-100">
              {(currentUser.fullName || currentUser.name || 'A').charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-bold text-slate-900 leading-tight">
                {currentUser.fullName || currentUser.name || 'Alfaz Mansuri'}
              </div>
              <div className="text-[10px] font-bold text-slate-400 leading-tight tracking-wider uppercase">
                {currentUser.role ? currentUser.role.replace(/_/g, ' ') : 'SUPER ADMIN'}
              </div>
            </div>
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
