'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  TrendingUp,
  Download,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  MoreHorizontal,
  Info,
  Sparkles,
  MousePointer
} from 'lucide-react';

interface FunnelStage {
  id: string;
  label: string;
  count: number;
  displayCount: string;
  heightPercent: number;
  conversion: string;
  dropOff: string;
}

export const OverviewDashboard: React.FC = () => {
  const {
    db,
    selectedCompany,
    setSelectedCompany,
    selectedVertical,
    setSelectedVertical
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'leads' | 'meta' | 'customers' | 'attribution'>('overview');
  const [selectedStageId, setSelectedStageId] = useState<string>('successful');
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  const currentActiveStageId = hoveredStageId || selectedStageId;

  // Filter scoped data from database for dynamic responsiveness
  const scopedPayments = useMemo(() => {
    return db.paymentAttempts.filter(p => {
      if (selectedCompany !== 'ALL' && (p as any).company && (p as any).company !== selectedCompany) return false;
      return true;
    });
  }, [db.paymentAttempts, selectedCompany]);

  const scopedCustomers = useMemo(() => {
    return db.customers.filter(c => {
      if (selectedCompany !== 'ALL' && (c as any).company && (c as any).company !== selectedCompany) return false;
      return true;
    });
  }, [db.customers, selectedCompany]);

  // Funnel stages with exact values matching reference specification
  const funnelStages: FunnelStage[] = [
    {
      id: 'initiated',
      label: 'Initiated Payments',
      count: 65200,
      displayCount: '65.2k',
      heightPercent: 88,
      conversion: '100%',
      dropOff: '0%'
    },
    {
      id: 'authorized',
      label: 'Authorized Payments',
      count: 54800,
      displayCount: '54.8k',
      heightPercent: 76,
      conversion: '84%',
      dropOff: '-16%'
    },
    {
      id: 'successful',
      label: 'Successful Payments',
      count: 48600,
      displayCount: '48.6k',
      heightPercent: 65,
      conversion: '89%',
      dropOff: '-11%'
    },
    {
      id: 'payouts',
      label: 'Payouts to Merchants',
      count: 38300,
      displayCount: '38.3k',
      heightPercent: 52,
      conversion: '79%',
      dropOff: '-21%'
    },
    {
      id: 'completed',
      label: 'Completed Transactions',
      count: 32900,
      displayCount: '32.9k',
      heightPercent: 44,
      conversion: '86%',
      dropOff: '-14%'
    }
  ];

  const activeStage = funnelStages.find(s => s.id === currentActiveStageId) || funnelStages[2];

  // Company and category display labels
  const companyLabel = useMemo(() => {
    if (selectedCompany === 'GLOBALINCH') return 'GlobalInch';
    if (selectedCompany === 'VASTU_SHIKHAR') return 'Vastu Shikhar';
    if (selectedCompany === 'MANGO_TREE') return 'Mango Tree Tech';
    return 'GlobalInch';
  }, [selectedCompany]);

  const categoryLabel = useMemo(() => {
    if (selectedVertical === 'VASTU_REPORT') return 'Vastu Report';
    if (selectedVertical === 'PALMISTRY') return 'Palmistry';
    if (selectedVertical === 'ASTROLOGY' || selectedVertical === 'ASTRO_WEBINAR') return 'Astrology';
    if (selectedVertical === 'ASTROSHI') return 'Astroshi';
    if (selectedVertical === 'CONSULTANCY') return 'Consultancy';
    return 'Vastu Report';
  }, [selectedVertical]);

  return (
    <div className="bg-[#f7f8fd] px-4 py-3 sm:px-6 lg:px-7 space-y-3.5 text-slate-800 antialiased font-sans select-none">
      {/* 1. TOP TITLE BAR & TAB NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Title Squircle & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white shadow-md shadow-purple-500/20 shrink-0">
            <TrendingUp className="h-5 w-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-normal mt-1">
              Real-time business, revenue, lead and campaign performance
            </p>
          </div>
        </div>

        {/* 6 Pill Tabs + Export Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-full bg-transparent p-0.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === 'overview'
                ? 'bg-[#6d28d9] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'revenue'
                  ? 'bg-[#6d28d9] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-[#6d28d9] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'meta'
                  ? 'bg-[#6d28d9] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Meta Ads
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'customers'
                  ? 'bg-[#6d28d9] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('attribution')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'attribution'
                  ? 'bg-[#6d28d9] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attribution
            </button>
          </div>

          {/* Export Dropdown Button */}
          <button className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. OMNIBAR FILTER BAR */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex-wrap xl:flex-nowrap">
        {/* Date Range Picker Trigger */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:border-slate-300 transition-colors cursor-pointer">
          <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>Oct 01, 2026 – Nov 20, 2026</span>
          <span className="text-slate-400 font-normal">(Last 51 Days)</span>
          <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
        </div>

        {/* 6 Stacked Dropdown Filters */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap xl:flex-nowrap">
          {/* Operating Company */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Operating Company
            </span>
            <button
              onClick={() => setSelectedCompany(selectedCompany === 'GLOBALINCH' ? 'ALL' : 'GLOBALINCH')}
              className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors"
            >
              <span>{companyLabel}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Operational Category */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Operational Category
            </span>
            <button
              onClick={() => setSelectedVertical(selectedVertical === 'VASTU_REPORT' ? 'ALL' : 'VASTU_REPORT')}
              className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors"
            >
              <span>{categoryLabel}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Landing Page */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Landing Page
            </span>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors">
              <span>All Pages</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Campaign */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Campaign
            </span>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors">
              <span>All Campaigns</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Ad Creative */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ad Creative
            </span>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors">
              <span>All Creatives</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Payment Status */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Payment Status
            </span>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors">
              <span>All Status</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Filter Toggle Icon */}
        <button
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all"
          title="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* 3. ROW 1: PAYMENTS PERFORMANCE (LEFT ~65%) & GROSS VOLUME (RIGHT ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: PAYMENTS PERFORMANCE 3D STEPPED CONTINUOUS FUNNEL CARD */}
        <div className="lg:col-span-8 rounded-[24px] bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Payments Performance
              </h2>
              <div
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Conversion funnel from initiated payment to completion"
              >
                <Info className="h-2.5 w-2.5" />
              </div>
            </div>
            <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Stage Metric Headers Directly Above the Stepped Funnel */}
          <div className="grid grid-cols-5 gap-0 text-left mb-3 pl-8">
            {funnelStages.map(stage => {
              const isSelected = stage.id === currentActiveStageId;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  onMouseEnter={() => setHoveredStageId(stage.id)}
                  onMouseLeave={() => setHoveredStageId(null)}
                  className="cursor-pointer transition-transform hover:scale-[1.01] pr-2"
                >
                  <p className={`text-[11px] truncate transition-colors ${
                    isSelected ? 'font-semibold text-purple-600' : 'font-medium text-slate-400'
                  }`}>
                    {stage.label}
                  </p>
                  <p className={`text-base sm:text-lg tracking-tight mt-0.5 transition-colors ${isSelected ? 'font-extrabold text-purple-600' : 'font-bold text-slate-900'
                    }`}>
                    {stage.displayCount}
                  </p>
                  {/* Small stage indicator line */}
                  <div className={`mt-1 h-0.5 rounded-full transition-all ${
                    stage.id === 'initiated' || stage.id === 'authorized' || stage.id === 'successful'
                      ? 'bg-purple-600 w-7'
                      : stage.id === 'completed'
                      ? 'bg-blue-500 w-7'
                      : 'w-0'
                  }`} />
                </div>
              );
            })}
          </div>

          {/* CONTINUOUS STEPPED 3D FUNNEL CHART (ZERO GAP BETWEEN BARS, REAL PODIUM STAIRCASE) */}
          <div className="relative h-48 sm:h-52 w-full flex items-end justify-between px-1 pt-6 pb-1">
            {/* Y-Axis Grid Lines & Labels */}
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] font-mono text-slate-300 pointer-events-none select-none pl-1 pb-1">
              <span>70k</span>
              <span>60k</span>
              <span>50k</span>
              <span>40k</span>
              <span>30k</span>
            </div>

            {/* Subtle horizontal dashed lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-8 pr-1 py-1">
              <div className="border-b border-slate-100/70 w-full" />
              <div className="border-b border-slate-100/70 w-full" />
              <div className="border-b border-slate-100/70 w-full" />
              <div className="border-b border-slate-100/70 w-full" />
              <div className="border-b border-slate-200 w-full" />
            </div>

            {/* Continuous Stepped Staircase Podium (Zero Gap Between Steps) */}
            <div className="relative z-10 w-full h-full flex items-end pl-8">
              {funnelStages.map((stage, idx) => {
                const isSelected = stage.id === currentActiveStageId;

                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    onMouseEnter={() => setHoveredStageId(stage.id)}
                    onMouseLeave={() => setHoveredStageId(null)}
                    style={{ height: `${stage.heightPercent}%`, width: '20%' }}
                    className={`relative cursor-pointer transition-all duration-300 flex flex-col justify-start ${
                      isSelected
                        ? 'z-20 shadow-[0_0_35px_rgba(124,58,237,0.45)] ring-1 ring-purple-300/80 -translate-y-0.5'
                        : 'z-10 opacity-95 hover:opacity-100'
                    }`}
                  >
                    {/* Bar Background Gradient */}
                    <div
                      className={`absolute inset-0 rounded-t-lg transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#5b21b6]'
                          : idx === 0
                          ? 'bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e40af]'
                          : idx === 1
                          ? 'bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]'
                          : idx === 3
                          ? 'bg-gradient-to-b from-[#3b82f6] via-[#60a5fa] to-[#2563eb]'
                          : 'bg-gradient-to-b from-[#60a5fa] via-[#93c5fd] to-[#3b82f6]'
                      }`}
                    />

                    {/* 45-degree Diagonal White Stripe Texture Overlay */}
                    <div
                      className="absolute inset-0 rounded-t-lg pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 6px,
                          rgba(255, 255, 255, 0.22) 6px,
                          rgba(255, 255, 255, 0.22) 12px
                        )`
                      }}
                    />

                    {/* 3D Top Bevel Highlight for Step Shelf */}
                    <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-lg bg-white/40 shadow-xs" />

                    {/* Step Divider Line */}
                    <div className="absolute right-0 inset-y-0 w-[1px] bg-white/20 pointer-events-none" />

                    {/* Floating Tooltip and Pointer on Selected/Active Stage */}
                    {isSelected && (
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap">
                        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-[0_6px_20px_-2px_rgba(0,0,0,0.18)] border border-slate-100">
                          <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                          <span>{stage.displayCount} transactions</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-600">Conversion: <strong className="text-slate-900">{stage.conversion}</strong></span>
                          <span className="text-slate-300">|</span>
                          <span className="text-rose-600">Drop-off: {stage.dropOff}</span>
                        </div>

                        {/* Subtle Mouse Pointer on Top of Active Bar */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-900 drop-shadow">
                          <MousePointer className="h-4 w-4 fill-slate-900 text-white transform -rotate-12" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Glowing Floor Reflection Effect */}
            <div className="absolute bottom-0 inset-x-8 h-3 bg-gradient-to-t from-purple-500/15 to-transparent blur-xs pointer-events-none" />
          </div>

          {/* AI Prompt Box at the bottom of the Payments Performance card */}
          <div className="mt-3 rounded-2xl bg-[#fafaff] border border-purple-100/70 p-2.5 shadow-xs">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                <Sparkles className="h-3 w-3 text-purple-600" />
                What would you like to explore next?
              </span>
              <button className="text-slate-400 hover:text-slate-600">
                <ChevronDown className="h-3 w-3 rotate-180" />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200/80 px-3 py-1.5 text-xs text-slate-700 shadow-inner">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>I want to know what caused the drop-off from authorized to</span>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
                  [ {activeStage.label.toLowerCase()} ]
                </span>
                <span className="h-3.5 w-0.5 bg-purple-600 animate-pulse ml-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: GROSS VOLUME CARD */}
        <div className="lg:col-span-4 rounded-[24px] bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Gross Volume
              </h2>
              <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Large KPI with Green Growth Badge */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                ₹9,70,909
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-200/60 shadow-xs">
                ↑ +11.6%
              </span>
            </div>

            {/* 3 Striped Progress Bars */}
            <div className="mt-6 space-y-4">
              {/* 1. Online Payments */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Online Payments</span>
                  <span className="font-bold text-slate-900">₹6,52,500</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] relative overflow-hidden"
                    style={{ width: '70%' }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(255, 255, 255, 0.28) 4px,
                          rgba(255, 255, 255, 0.28) 8px
                        )`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Subscriptions */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Subscriptions</span>
                  <span className="font-bold text-slate-900">₹2,18,409</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8] relative overflow-hidden"
                    style={{ width: '28%' }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(255, 255, 255, 0.28) 4px,
                          rgba(255, 255, 255, 0.28) 8px
                        )`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. In-Store Sales */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">In-Store Sales</span>
                  <span className="font-bold text-slate-900">₹0</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#c026d3] to-[#e879f9] relative overflow-hidden"
                    style={{ width: '16%' }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(255, 255, 255, 0.28) 4px,
                          rgba(255, 255, 255, 0.28) 8px
                        )`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: FOUR EQUAL CARDS (RETENTION, TRANSACTIONS, CUSTOMERS, INSIGHTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: RETENTION (PINK STEPPED AREA CHART) */}
        <div className="rounded-[24px] bg-white p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Retention</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Stepped Pink Line & Area Graphic */}
          <div className="relative h-24 w-full pt-2">
            {/* Peak 42% Floating Tooltip */}
            <div className="absolute top-0 left-[44%] -translate-x-1/2 flex flex-col items-center z-10">
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-900 shadow-sm border border-slate-100">
                42%
              </span>
              <div className="h-5 w-0 border-l border-dashed border-rose-400" />
            </div>

            <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Stepped Area Fill */}
              <path
                d="M 10 75 L 30 75 L 30 65 L 50 65 L 50 48 L 80 48 L 80 38 L 110 38 L 110 42 L 140 42 L 140 60 L 170 60 L 170 55 L 200 55 L 200 70 L 230 70 L 230 95 L 10 95 Z"
                fill="url(#roseGradient)"
              />

              {/* Stepped Outline */}
              <path
                d="M 10 75 L 30 75 L 30 65 L 50 65 L 50 48 L 80 48 L 80 38 L 110 38 L 110 42 L 140 42 L 140 60 L 170 60 L 170 55 L 200 55 L 200 70 L 230 70"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Month Ticks */}
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 px-1 pt-1 border-t border-slate-100">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        {/* CARD 2: TRANSACTIONS (GREEN DOT-MATRIX EQUALIZER) */}
        <div className="rounded-[24px] bg-white p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Transactions</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              106k
            </span>
          </div>

          {/* Green Equalizer Dot Columns */}
          <div>
            <div className="flex items-center justify-center mb-1">
              <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-full">
                Peak: Wed
              </span>
            </div>

            <div className="flex items-end justify-between px-2 h-12">
              {[
                { day: 'M', dots: 3 },
                { day: 'T', dots: 4 },
                { day: 'W', dots: 7 }, // Peak
                { day: 'T', dots: 5 },
                { day: 'F', dots: 4 },
                { day: 'S', dots: 2 },
                { day: 'S', dots: 1 }
              ].map((col, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  {Array.from({ length: 7 }).map((_, dIdx) => {
                    const isLit = dIdx >= 7 - col.dots;
                    return (
                      <div
                        key={dIdx}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${isLit
                          ? col.dots === 7
                            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                            : 'bg-emerald-400'
                          : 'bg-slate-100'
                          }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Subtext: vs last period */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">vs last period</span>
            <span className="text-xs font-extrabold text-slate-900">+34,002</span>
          </div>
        </div>

        {/* CARD 3: CUSTOMERS (BLUE DOT-MATRIX EQUALIZER) */}
        <div className="rounded-[24px] bg-white p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Customers</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              1,284
            </span>
          </div>

          {/* Blue Equalizer Dot Columns */}
          <div>
            <div className="flex items-center justify-center mb-1">
              <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-full">
                Highest: Thu
              </span>
            </div>

            <div className="flex items-end justify-between px-2 h-12">
              {[
                { day: 'M', dots: 2 },
                { day: 'T', dots: 3 },
                { day: 'W', dots: 5 },
                { day: 'T', dots: 7 }, // Highest
                { day: 'F', dots: 6 },
                { day: 'S', dots: 3 },
                { day: 'S', dots: 1 }
              ].map((col, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  {Array.from({ length: 7 }).map((_, dIdx) => {
                    const isLit = dIdx >= 7 - col.dots;
                    return (
                      <div
                        key={dIdx}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${isLit
                          ? col.dots === 7
                            ? 'bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.7)]'
                            : 'bg-blue-400'
                          : 'bg-slate-100'
                          }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Subtext: vs last period */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">vs last period</span>
            <span className="text-xs font-extrabold text-slate-900">+320</span>
          </div>
        </div>

        {/* CARD 4: INSIGHTS (VIBRANT PURPLE-TO-PINK GRADIENT WITH 3D GLASS CHEVRONS) */}
        <div className="rounded-[24px] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] p-4 sm:p-5 text-white shadow-[0_8px_30px_-6px_rgba(139,92,246,0.35)] relative overflow-hidden flex flex-col justify-between">
          {/* Layered 3D Glowing Glass Chevrons in Background */}
          <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none opacity-45">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <path
                d="M 10 10 L 60 60 L 10 110 L 30 110 L 80 60 L 30 10 Z"
                fill="rgba(255, 255, 255, 0.28)"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.5"
              />
              <path
                d="M 35 10 L 85 60 L 35 110 L 55 110 L 105 60 L 55 10 Z"
                fill="rgba(255, 255, 255, 0.20)"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Top Pill Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-white border border-white/25 shadow-xs">
              <Sparkles className="h-3 w-3" />
              <span>Insights</span>
            </div>
          </div>

          {/* Main Stat & Growth */}
          <div className="relative z-10 mt-3 mb-1">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xs">
              72.0%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white/95 mt-0.5">
              Payment success rate
            </div>
            <div className="text-[11px] font-medium text-white/80 mt-0.5">
              ↑ +4.8% compared to last period
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
