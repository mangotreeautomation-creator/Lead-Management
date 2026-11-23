'use client';

import React, { useState } from 'react';
import { useApp, NavigationModule } from '../../context/AppContext';
import { BusinessUnitCode, CompanyCode } from '../../data/types';
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  Globe,
  TrendingUp,
  CreditCard,
  PhoneCall,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  ClipboardList,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Compass,
  Video,
  Hand,
  Layers,
  Store,
  ChevronUp,
  Gem,
  ArrowLeft,
  AlertOctagon,
  Webhook,
  Zap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedCompany,
    selectedVertical,
    setSelectedVertical,
    selectedLens,
    returnToGateway,
    currentUser,
    dynamicFilter,
    updateFilterPreset,
    db
  } = useApp();

  const [isTracksDropdownOpen, setIsTracksDropdownOpen] = useState(false);

  // Total Leads & Calls in active company scope
  const scopedLeads = db.leads.filter(l => selectedCompany === 'ALL' || l.company === selectedCompany);
  const totalLeads = scopedLeads.length;
  const totalCalls = db.aiCalls.length;
  const failedCount = db.paymentAttempts.filter(p => p.status === 'FAILED').length;

  const handleNav = (mod: NavigationModule) => {
    setActiveModule(mod);
  };

  const handleCategoryNav = (cat: BusinessUnitCode) => {
    setSelectedVertical(cat);
    setActiveModule('overview');
  };

  const isCategoryActive = (cat: BusinessUnitCode) => {
    return selectedVertical === cat;
  };

  const isNavActive = (mod: NavigationModule) => activeModule === mod;

  // Company Brand Metadata
  const getCompanyMeta = () => {
    switch (selectedCompany) {
      case 'VASTU_SHIKHAR':
        return {
          title: 'Vastu Shikhar',
          subtitle: 'consultancy.vastushikhar.com',
          initials: 'VS',
          color: 'bg-amber-600'
        };
      case 'GLOBALINCH':
        return {
          title: 'GlobalInch',
          subtitle: 'mangotreetechnology.com',
          initials: 'GI',
          color: 'bg-emerald-600'
        };
      case 'MANGO_TREE':
        return {
          title: 'Mango Tree Tech',
          subtitle: 'astroshi.com',
          initials: 'MT',
          color: 'bg-blue-600'
        };
      default:
        return {
          title: 'Unified Master Hub',
          subtitle: 'All 3 Companies Combined',
          initials: 'ALL',
          color: 'bg-purple-600'
        };
    }
  };

  const companyMeta = getCompanyMeta();

  // Dynamic Categories based on selected company
  const getCategoriesForCompany = (): { id: BusinessUnitCode; label: string; icon: any; count: number }[] => {
    if (selectedCompany === 'VASTU_SHIKHAR') {
      return [
        { id: 'ALL', label: 'All 3 Combined', icon: Layers, count: db.leads.filter(l => l.company === 'VASTU_SHIKHAR').length },
        { id: 'ASTROLOGY', label: 'Astrology', icon: Sparkles, count: 520 },
        { id: 'VASTU', label: 'Vastu', icon: Compass, count: 520 },
        { id: 'CONSULTANCY', label: 'Consultancy', icon: Building2, count: 520 }
      ];
    }
    if (selectedCompany === 'GLOBALINCH') {
      return [
        { id: 'ALL', label: 'Combined Data', icon: Layers, count: db.leads.filter(l => l.company === 'GLOBALINCH').length },
        { id: 'VASTU_REPORT', label: 'Vastu Wheel Report', icon: Compass, count: 520 },
        { id: 'PALMISTRY', label: 'Palmistry (AI Telephony)', icon: Hand, count: 520 }
      ];
    }
    if (selectedCompany === 'MANGO_TREE') {
      return [
        { id: 'ALL', label: 'All MTT Data', icon: Layers, count: db.leads.filter(l => l.company === 'MANGO_TREE').length },
        { id: 'ASTROSHI', label: 'Astroshi Sacred Remedies', icon: Gem, count: 520 }
      ];
    }
    // 'ALL' Companies
    return [
      { id: 'ALL', label: 'All Categories (Master)', icon: Layers, count: db.leads.length },
      { id: 'ASTRO_WEBINAR', label: 'Astrology Webinar', icon: Sparkles, count: 520 },
      { id: 'VASTU_WEBINAR', label: 'Vastu Webinar', icon: Compass, count: 520 },
      { id: 'PALMISTRY', label: 'Palmistry', icon: Hand, count: 520 },
      { id: 'VASTU_REPORT', label: 'Vastu Wheel Report', icon: Compass, count: 520 },
      { id: 'ASTROSHI', label: 'Astroshi', icon: Gem, count: 520 },
      { id: 'CONSULTANCY', label: 'Consultancy', icon: Building2, count: 520 }
    ];
  };

  const categories = getCategoriesForCompany();

  return (
    <aside
      className={`relative flex flex-col border-r border-[#27272a] bg-[#0c0e14] text-[#a1a1aa] transition-all duration-200 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      } shrink-0 select-none z-30 font-sans`}
    >
      {/* Brand Header: LeadPulse Enterprise */}
      <div className="flex h-14 items-center justify-between border-b border-[#27272a] px-3.5">
        {!isSidebarCollapsed && (
          <div
            onClick={() => returnToGateway('COMPANY_SELECT')}
            className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-[#1a1d24] transition-colors"
            title="LeadPulse Enterprise"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 text-white font-extrabold text-xs shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">LeadPulse</span>
              <span className="text-xs font-medium text-slate-400">Enterprise</span>
              <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
            </div>
          </div>
        )}

        {isSidebarCollapsed && (
          <div
            onClick={() => returnToGateway('COMPANY_SELECT')}
            className={`mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 font-bold text-white text-xs`}
            title="LeadPulse Enterprise"
          >
            LP
          </div>
        )}

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="rounded p-1 text-slate-400 hover:bg-[#1a1d24] hover:text-white transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Switch Company / Category Quick Action */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => returnToGateway('COMPANY_SELECT')}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#161922] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-purple-500/50 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5 text-blue-400" />
              <span>Change Company / Hub</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">ESC</span>
          </button>
        </div>
      )}

      {/* Active Preset Indicator (When Failed Payments or others active) */}
      {!isSidebarCollapsed && dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE' && (
        <div className="mx-3 mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-rose-300">
              <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
              <span>Failed Queue</span>
            </span>
            <span className="rounded bg-rose-500/30 px-1 text-[10px] font-bold text-rose-200">
              {failedCount}
            </span>
          </div>
          <button
            onClick={() => updateFilterPreset('ALL')}
            className="mt-1 text-[10px] text-zinc-400 hover:text-white underline"
          >
            Reset to All Data
          </button>
        </div>
      )}

      {/* Scrollable Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* SECTION 1: CORE OPERATIONS */}
        <div className="space-y-0.5 text-xs">
          {/* 1. Overview */}
          <button
            onClick={() => handleNav('overview')}
            className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
              isNavActive('overview')
                ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                : 'text-slate-400 hover:bg-[#161920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Dynamic Analytics</span>}
            </div>
          </button>

          {/* 2. Lead Operations */}
          <button
            onClick={() => handleNav('leads')}
            className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
              isNavActive('leads')
                ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                : 'text-slate-400 hover:bg-[#161920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users2 className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Lead Management</span>}
            </div>
            {!isSidebarCollapsed && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                1,648
              </span>
            )}
          </button>

          {/* 3. Customer 360 CRM */}
          <button
            onClick={() => handleNav('customers')}
            className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
              isNavActive('customers')
                ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                : 'text-slate-400 hover:bg-[#161920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Customer 360 CRM</span>}
            </div>
          </button>

          {/* 4. Automation Hub (Executive Briefings & Triggers) */}
          <button
            onClick={() => handleNav('automation-hub')}
            className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium transition-colors ${
              isNavActive('automation-hub')
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:bg-[#161920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-amber-400" />
              {!isSidebarCollapsed && <span>Automation Hub</span>}
            </div>
            {!isSidebarCollapsed && (
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                ACTIVE
              </span>
            )}
          </button>
        </div>

        {/* SECTION 2: OPERATIONAL CATEGORIES FOR CURRENT COMPANY (COLLAPSIBLE ACCORDION DROPDOWN) */}
        {!isSidebarCollapsed && (
          <div className="rounded-xl border border-[#1e3a5f] bg-[#0c1829] overflow-hidden shadow-sm">
            {/* Accordion Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsTracksDropdownOpen(!isTracksDropdownOpen)}
              className="flex w-full items-center justify-between px-2.5 py-2 text-xs font-semibold text-[#38bdf8] hover:bg-[#10233d] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-3.5 w-3.5 text-[#38bdf8] shrink-0" />
                <span className="truncate text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
                  GLOBALINCH... VASTU...
                </span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ease-in-out text-[#38bdf8] ${
                  isTracksDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Collapsible Category Items with Smooth Accordion Slide Transition */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isTracksDropdownOpen
                  ? 'max-h-80 opacity-100 p-1.5 pt-0.5 space-y-0.5'
                  : 'max-h-0 opacity-0 p-0 pointer-events-none'
              }`}
            >
              {categories.map(cat => {
                const Icon = cat.icon;
                const active = isCategoryActive(cat.id);

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryNav(cat.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30 shadow-sm'
                        : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-blue-400' : 'text-zinc-500'}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: INTEGRATIONS & RECOVERY */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Integrations & Telephony
            </div>
          )}

          <div className="space-y-0.5 text-xs">
            {/* Landing Pages */}
            <button
              onClick={() => handleNav('landing-pages')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('landing-pages')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Landing Pages</span>}
              </div>
            </button>

            {/* Marketing */}
            <button
              onClick={() => handleNav('marketing')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('marketing')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Meta Video Ads</span>}
              </div>
            </button>

            {/* Razorpay Accounts */}
            <button
              onClick={() => handleNav('razorpay')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('razorpay')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Razorpay Gateway</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  LIVE
                </span>
              )}
            </button>

            {/* AI Voice Calls */}
            <button
              onClick={() => handleNav('ai-element')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('ai-element')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="h-4 w-4" />
                {!isSidebarCollapsed && <span>AI Voice (Pooja)</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                  1,062
                </span>
              )}
            </button>

            {/* WATI WhatsApp */}
            <button
              onClick={() => handleNav('wati')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('wati')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4" />
                {!isSidebarCollapsed && <span>WATI WhatsApp</span>}
              </div>
            </button>

            {/* Reports */}
            <button
              onClick={() => handleNav('reports')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('reports')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Reports Centre</span>}
              </div>
            </button>

            {/* Integration Health */}
            <button
              onClick={() => handleNav('integration-health')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('integration-health')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Integration Health</span>}
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 4: ANALYTICS & INSIGHTS (MATCHING SPEC) */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Analytics & Insights
            </div>
          )}

          <div className="space-y-0.5 text-xs">
            <button
              onClick={() => handleNav('overview')}
              className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-2 font-bold transition-all ${
                isNavActive('overview') || isNavActive('analytics')
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-900/40'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Analytics</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 px-2 py-0.5 text-[9px] font-extrabold tracking-wider">
                  NEW
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 5: ENTERPRISE ADMINISTRATION & SETTINGS */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              System & Governance
            </div>
          )}

          <div className="space-y-0.5 text-xs">
            {/* 1. Webhooks & Integrations Vault (Direct Shortcut) */}
            <button
              onClick={() => handleNav('settings')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('settings')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Webhook className="h-4 w-4 text-blue-400" />
                {!isSidebarCollapsed && <span>Webhooks & Integrations</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                  5 ACTIVE
                </span>
              )}
            </button>

            {/* 2. Team & User Access (RBAC) */}
            <button
              onClick={() => handleNav('users')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('users')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users2 className="h-4 w-4 text-purple-400" />
                {!isSidebarCollapsed && <span>Team & Access (RBAC)</span>}
              </div>
            </button>

            {/* 3. Audit Logs & Compliance */}
            <button
              onClick={() => handleNav('audit')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('audit')
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                {!isSidebarCollapsed && <span>Security & Audit Logs</span>}
              </div>
            </button>

            {/* 4. Enterprise Settings */}
            <button
              onClick={() => handleNav('settings')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isNavActive('settings')
                  ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-zinc-400 hover:bg-[#161920] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-zinc-400" />
                {!isSidebarCollapsed && <span>Platform Settings</span>}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer: User Profile */}
      <div className="border-t border-[#27272a] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              {(currentUser.fullName || currentUser.name || 'A').charAt(0)}
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {currentUser.fullName || currentUser.name || 'Alfaz Mansuri'}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">
                  SUPER_ADMIN
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
