'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DynamicTelemetryPreset,
  CompanyCode,
  BusinessUnitCode,
  LeadStatus
} from '../../data/types';
import { EnterpriseDateRangePicker } from './EnterpriseDateRangePicker';
import { exportToXLSX } from '../../utils/exportUtils';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Download,
  PhoneCall,
  RotateCcw,
  AlertOctagon,
  TrendingUp,
  CheckCircle2,
  Bot,
  Layers,
  Columns,
  Eye,
  EyeOff,
  ArrowUpDown,
  Building2,
  Globe,
  Film,
  MessageSquare,
  CreditCard,
  MapPin,
  DollarSign
} from 'lucide-react';

interface ShopifyDynamicFilterEngineProps {
  isAttachedToTable?: boolean;
}

export const ShopifyDynamicFilterEngine: React.FC<ShopifyDynamicFilterEngineProps> = ({ isAttachedToTable = false }) => {
  const {
    dynamicFilter,
    setDynamicFilter,
    updateFilterPreset,
    selectedCompany,
    setSelectedCompany,
    selectedVertical,
    setSelectedVertical,
    dateRange,
    customDateRange,
    db
  } = useApp();

  // Omnibar state
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [hoveredParameterKey, setHoveredParameterKey] = useState<string>('paymentStatus');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'amount' | 'name'>('date');

  const filterContainerRef = useRef<HTMLDivElement>(null);
  const columnsContainerRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (columnsContainerRef.current && !columnsContainerRef.current.contains(e.target as Node)) {
        setIsColumnsOpen(false);
      }
      if (exportContainerRef.current && !exportContainerRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Preset Tabs (Shopify Style Tabs in Image 2)
  const quickTabs: Array<{ id: DynamicTelemetryPreset; label: string; count?: number; alert?: boolean }> = [
    { id: 'ALL', label: 'All Leads', count: db.leads.length },
    {
      id: 'FAILED_PAYMENTS_QUEUE',
      label: 'Failed Payments Recovery',
      alert: true,
      count: db.paymentAttempts.filter(p => p.status === 'FAILED').length
    },
    {
      id: 'CONVERTED_CUSTOMERS',
      label: 'Captured Orders',
      count: db.paymentAttempts.filter(p => p.status === 'CAPTURED').length
    },
    {
      id: 'AI_VOICE_RECOVERY',
      label: 'AI Pooja Telephony',
      count: db.aiCalls.filter(c => c.status === 'CONNECTED').length
    },
    {
      id: 'ADS_VS_RAZORPAY_ROAS',
      label: 'Meta Ads ROAS View'
    }
  ];

  // Load saved visibleColumns from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadpulse_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDynamicFilter(prev => ({ ...prev, visibleColumns: { ...prev.visibleColumns, ...parsed } }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Dynamic Creative Options from real database records
  const dynamicCreativeOptions = React.useMemo(() => {
    if (db.videoCreatives && db.videoCreatives.length > 0) {
      return db.videoCreatives.map(c => ({
        value: c.creativeName || (c as any).title || c.id,
        label: c.creativeName || (c as any).title || c.id,
      }));
    }
    const distinctLeadCreatives = Array.from(new Set(db.leads.map(l => l.adCreativeName).filter(Boolean)));
    if (distinctLeadCreatives.length > 0) {
      return distinctLeadCreatives.map(name => ({ value: name as string, label: name as string }));
    }
    return [
      { value: 'VW_46 Dekhiye ab vastu', label: 'VW_46 Dekhiye ab vastu - 29-Oct-2026' },
      { value: 'VW_28 Ny_Ghar_khari', label: 'VW_28 Ny_Ghar_khari_21-Oct-2026' },
      { value: 'VW_47 16 Sal ke Vastu mein', label: 'VW_47 16 Sal ke Vastu mein_31-Oct-2026' }
    ];
  }, [db.videoCreatives, db.leads]);

  // Dynamic Category Options cascading based on active company
  const dynamicCategoryOptions = React.useMemo(() => {
    const activeComp = dynamicFilter.company !== 'ALL' ? dynamicFilter.company : selectedCompany;
    if (activeComp === 'GLOBALINCH') {
      return [
        { value: 'VASTU_REPORT', label: 'Vastu Wheel Automated Report' },
        { value: 'PALMISTRY', label: 'Palmistry & Astrological Analysis' }
      ];
    }
    if (activeComp === 'MANGO_TREE') {
      return [
        { value: 'WEBINAR', label: 'Vastu Mastery Live Webinar' }
      ];
    }
    if (activeComp === 'VASTU_SHIKHAR') {
      return [
        { value: 'CONSULTANCY', label: 'Vastu Professional Consultancy' }
      ];
    }
    return [
      { value: 'VASTU_REPORT', label: 'Vastu Wheel Automated Report' },
      { value: 'PALMISTRY', label: 'Palmistry & Astrological Analysis' },
      { value: 'WEBINAR', label: 'Vastu Mastery Live Webinar' },
      { value: 'CONSULTANCY', label: 'Vastu Professional Consultancy' }
    ];
  }, [dynamicFilter.company, selectedCompany]);

  // Available Filter Parameters definition (Matching Image 3 & 4)
  const filterParameters = [
    {
      key: 'paymentStatus',
      label: 'Payment status',
      icon: CreditCard,
      options: [
        { value: 'CAPTURED', label: 'Captured (Paid successfully)' },
        { value: 'FAILED', label: 'Failed (Bank decline / Timeout)' },
        { value: 'PENDING', label: 'Pending Checkout' },
        { value: 'REFUNDED', label: 'Refunded' }
      ]
    },
    {
      key: 'failureReason',
      label: 'Bank failure reason',
      icon: AlertOctagon,
      options: [
        { value: 'INSUFFICIENT_FUNDS', label: 'Insufficient funds (Declined by bank)' },
        { value: 'UPI_BANK_TIMEOUT', label: 'UPI gateway server timeout' },
        { value: 'CARD_EXPIRED', label: 'Card expired / 3DS aborted' },
        { value: 'USER_DROPOUT', label: 'User abandoned payment pin screen' }
      ]
    },
    {
      key: 'landingPageSlug',
      label: 'Landing page funnel',
      icon: Globe,
      options: [
        { value: 'vastuwheel-report', label: 'vastuwheel-report (Live)' },
        { value: 'astro-kundali-horoscope', label: 'astro-kundali-horoscope' },
        { value: 'vastu-audit-floorplan', label: 'vastu-audit-floorplan' },
        { value: 'palmistry-ai-scan', label: 'palmistry-ai-scan' },
        { value: 'consultancy-vip', label: 'consultancy-vip' }
      ]
    },
    {
      key: 'videoCreativeId',
      label: 'Meta video ad creative',
      icon: Film,
      options: dynamicCreativeOptions
    },
    {
      key: 'company',
      label: 'Operating company',
      icon: Building2,
      options: [
        { value: 'GLOBALINCH', label: 'GlobalInch (Connected)' },
        { value: 'MANGO_TREE', label: 'Mango Tree Technology' },
        { value: 'VASTU_SHIKHAR', label: 'Vastu Shikhar' }
      ]
    },
    {
      key: 'category',
      label: 'Operational category',
      icon: Layers,
      options: dynamicCategoryOptions
    },
    {
      key: 'telephonyStatus',
      label: 'AI voice call (Pooja)',
      icon: Bot,
      options: [
        { value: 'CONNECTED', label: 'Connected (Pooja 135s avg)' },
        { value: 'NO_ANSWER', label: 'No Answer' },
        { value: 'BUSY', label: 'Busy' },
        { value: 'FAILED', label: 'Call Failed' }
      ]
    }
  ];

  // Applied Active Filters count and chips (Multi-select supported)
  const activeFilterChips: Array<{ key: string; label: string; valueLabel: string; onRemove: () => void }> = [];

  // 1. Payment status chips
  const activePaymentStatuses = dynamicFilter.paymentStatuses && dynamicFilter.paymentStatuses.length > 0
    ? dynamicFilter.paymentStatuses
    : dynamicFilter.paymentStatus !== 'ALL'
    ? [dynamicFilter.paymentStatus]
    : [];

  if (activePaymentStatuses.length > 0) {
    const labelsMap: Record<string, string> = {
      CAPTURED: 'Captured',
      FAILED: 'Failed',
      PENDING: 'Pending',
      REFUNDED: 'Refunded'
    };
    activeFilterChips.push({
      key: 'paymentStatus',
      label: 'Payment',
      valueLabel: activePaymentStatuses.map(s => labelsMap[s] || s).join(', '),
      onRemove: () => setDynamicFilter(prev => ({ ...prev, paymentStatus: 'ALL', paymentStatuses: [] }))
    });
  }

  // 2. Failure reasons chips
  if (dynamicFilter.failureReasons && dynamicFilter.failureReasons.length > 0) {
    activeFilterChips.push({
      key: 'failureReason',
      label: 'Decline reason',
      valueLabel: dynamicFilter.failureReasons.map(r => r.replace(/_/g, ' ')).join(', '),
      onRemove: () => setDynamicFilter(prev => ({ ...prev, failureReasons: [] }))
    });
  }

  // 3. Landing page slugs chips
  const activeFunnels = dynamicFilter.landingPageSlugs && dynamicFilter.landingPageSlugs.length > 0
    ? dynamicFilter.landingPageSlugs
    : dynamicFilter.landingPageSlug !== 'ALL'
    ? [dynamicFilter.landingPageSlug]
    : [];

  if (activeFunnels.length > 0) {
    activeFilterChips.push({
      key: 'landingPageSlug',
      label: 'Landing page',
      valueLabel: activeFunnels.join(', '),
      onRemove: () => setDynamicFilter(prev => ({ ...prev, landingPageSlug: 'ALL', landingPageSlugs: [] }))
    });
  }

  // 4. Video creatives chips
  const activeCreatives = dynamicFilter.videoCreativeIds && dynamicFilter.videoCreativeIds.length > 0
    ? dynamicFilter.videoCreativeIds
    : dynamicFilter.videoCreativeId !== 'ALL'
    ? [dynamicFilter.videoCreativeId]
    : [];

  if (activeCreatives.length > 0) {
    activeFilterChips.push({
      key: 'videoCreativeId',
      label: 'Ad creative',
      valueLabel: activeCreatives.map(c => c.split('-')[0].trim()).join(', '),
      onRemove: () => setDynamicFilter(prev => ({ ...prev, videoCreativeId: 'ALL', videoCreativeIds: [] }))
    });
  }

  // 5. Telephony chips
  const activeTelephony = dynamicFilter.telephonyStatuses && dynamicFilter.telephonyStatuses.length > 0
    ? dynamicFilter.telephonyStatuses
    : dynamicFilter.telephonyStatus !== 'ALL'
    ? [dynamicFilter.telephonyStatus]
    : [];

  if (activeTelephony.length > 0) {
    activeFilterChips.push({
      key: 'telephonyStatus',
      label: 'AI call',
      valueLabel: activeTelephony.join(', '),
      onRemove: () => setDynamicFilter(prev => ({ ...prev, telephonyStatus: 'ALL', telephonyStatuses: [] }))
    });
  }

  if (dynamicFilter.company !== 'ALL') {
    activeFilterChips.push({
      key: 'company',
      label: 'Company',
      valueLabel: dynamicFilter.company.replace(/_/g, ' '),
      onRemove: () => {
        setSelectedCompany('ALL');
        setDynamicFilter(prev => ({ ...prev, company: 'ALL' }));
      }
    });
  }

  if (dynamicFilter.category !== 'ALL') {
    activeFilterChips.push({
      key: 'category',
      label: 'Category',
      valueLabel: dynamicFilter.category,
      onRemove: () => {
        setSelectedVertical('ALL');
        setDynamicFilter(prev => ({ ...prev, category: 'ALL' }));
      }
    });
  }

  // Clear all filters
  const handleClearAllFilters = () => {
    updateFilterPreset('ALL');
    setDynamicFilter(prev => ({
      ...prev,
      preset: 'ALL',
      paymentStatus: 'ALL',
      paymentStatuses: [],
      failureReasons: [],
      landingPageSlug: 'ALL',
      landingPageSlugs: [],
      videoCreativeId: 'ALL',
      videoCreativeIds: [],
      telephonyStatus: 'ALL',
      telephonyStatuses: []
    }));
  };

  // Toggle Column Visibility
  const handleToggleColumn = (col: keyof typeof dynamicFilter.visibleColumns) => {
    setDynamicFilter(prev => {
      const updated = {
        ...prev.visibleColumns,
        [col]: !prev.visibleColumns[col]
      };
      try {
        localStorage.setItem('leadpulse_visible_columns', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return {
        ...prev,
        visibleColumns: updated
      };
    });
  };

  // Filter matched leads for export calculation
  const getFilteredExportLeads = () => {
    return db.leads.filter(lead => {
      if (dynamicFilter.company !== 'ALL' && lead.company && lead.company !== dynamicFilter.company) return false;
      if (dynamicFilter.category !== 'ALL' && lead.businessUnit !== dynamicFilter.category) return false;

      // Landing page filter
      if (activeFunnels.length > 0 && lead.landingPageSlug && !activeFunnels.includes(lead.landingPageSlug)) return false;

      // Video creative filter
      if (activeCreatives.length > 0 && lead.adCreativeName && !activeCreatives.includes(lead.adCreativeName)) return false;

      // Telephony filter
      if (activeTelephony.length > 0 && (!lead.aiCallStatus || !activeTelephony.includes(lead.aiCallStatus))) return false;

      // Payment Status filter (Multi-select)
      if (activePaymentStatuses.length > 0) {
        const order = db.orders.find(o => o.leadId === lead.id);
        const attempt = db.paymentAttempts.find(p => p.orderId === order?.id);
        const leadStatus = attempt?.status || (lead.status === 'PAYMENT_COMPLETED' ? 'CAPTURED' : lead.status === 'FAILED_PAYMENT' ? 'FAILED' : 'PENDING');
        if (!activePaymentStatuses.includes(leadStatus)) return false;
      }

      // Date Range Filter
      if (dateRange === 'TODAY' && lead.createdAt && !lead.createdAt.startsWith('2026-11-20')) return false;
      if (dateRange === 'YESTERDAY' && lead.createdAt && !lead.createdAt.startsWith('2026-11-19')) return false;
      if (dateRange === 'LAST_7_DAYS' && lead.createdAt && lead.createdAt < '2026-11-14') return false;
      if (dateRange === 'LAST_30_DAYS' && lead.createdAt && lead.createdAt < '2026-10-22') return false;
      if (dateRange === 'THIS_MONTH' && lead.createdAt && lead.createdAt < '2026-11-01') return false;
      if (dateRange === 'LAST_MONTH' && lead.createdAt && (lead.createdAt < '2026-10-01' || lead.createdAt > '2026-10-31')) return false;
      if (dateRange === 'ALL_TIME' && lead.createdAt && (lead.createdAt < '2026-10-01' || lead.createdAt > '2026-11-20T23:59:59')) return false;
      if (dateRange === 'CUSTOM' && customDateRange && lead.createdAt) {
        const leadDate = lead.createdAt.slice(0, 10);
        if (leadDate < customDateRange.startDate || leadDate > customDateRange.endDate) return false;
      }
      return true;
    });
  };

  const handleExportFilteredLeads = () => {
    const leads = getFilteredExportLeads();
    const rows = leads.map(lead => {
      const customer = db.customers.find(c => c.id === lead.customerId);
      const order = db.orders.find(o => o.leadId === lead.id);
      const attempt = db.paymentAttempts.find(p => p.orderId === order?.id);
      return {
        'Customer Name': customer?.fullName || 'Prospect Visitor',
        'Phone Number': customer?.phone || customer?.primaryPhone || 'N/A',
        'City': customer?.city || 'N/A',
        'Company': lead.company || 'Mango Tree Tech',
        'Category': lead.businessUnit,
        'Order Amount (INR)': order?.amount || 0,
        'Payment Status': attempt?.status || (lead.status === 'PAYMENT_COMPLETED' ? 'CAPTURED' : 'PENDING'),
        'Decline Reason': attempt?.errorMessage || (attempt?.status === 'FAILED' ? 'Bank Gateway Timeout' : 'None'),
        'Landing Page': lead.landingPageSlug || '',
        'Ad Creative': lead.adCreativeName || 'Default Creative',
        'AI Call': lead.aiCallStatus || 'Unscheduled',
        'Date': lead.createdAt || ''
      };
    });
    exportToXLSX(rows, `Telemetry_Export_${new Date().toISOString().slice(0, 10)}`);
    setIsExportDropdownOpen(false);
  };

  const handleExportFailedQueue = () => {
    const leads = getFilteredExportLeads().filter(l => {
      const order = db.orders.find(o => o.leadId === l.id);
      const attempt = db.paymentAttempts.find(p => p.orderId === order?.id);
      return attempt?.status === 'FAILED' || l.status === 'FAILED_PAYMENT';
    });
    const rows = leads.map(lead => {
      const customer = db.customers.find(c => c.id === lead.customerId);
      const order = db.orders.find(o => o.leadId === lead.id);
      const attempt = db.paymentAttempts.find(p => p.orderId === order?.id);
      return {
        'Customer Full Name': customer?.fullName || 'Prospect Visitor',
        'Mobile Phone Number': customer?.phone || customer?.primaryPhone || 'N/A',
        'City': customer?.city || 'N/A',
        'Company': lead.company || 'Mango Tree Tech',
        'Category': lead.businessUnit,
        'At-Risk Amount (INR)': order?.amount || 999,
        'Decline Reason': attempt?.errorMessage || 'Bank UPI Timeout',
        'Landing Page': lead.landingPageSlug || '',
        'Recovery Priority': 'HIGH - IMMEDIATE CALL'
      };
    });
    exportToXLSX(rows, `Failed_Payments_Recovery_Calling_Sheet_${new Date().toISOString().slice(0, 10)}`);
    setIsExportDropdownOpen(false);
  };

  // Active parameter object for the hover flyout
  const activeParamObj = filterParameters.find(p => p.key === hoveredParameterKey) || filterParameters[0];

  return (
    <div
      className={
        isAttachedToTable
          ? 'relative bg-[#0d0f17] p-4 text-zinc-200 space-y-3 font-sans border-b border-zinc-800'
          : 'relative rounded-2xl border border-zinc-800 bg-[#0d0f17] p-3.5 shadow-xl text-zinc-200 space-y-3 font-sans'
      }
    >
      {/* 1. TOP BAR: SEPARATE TABS SCROLLER ON LEFT + UNCLIPPED ACTIONS ON RIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        {/* Left: Scrollable Preset Tabs (Isolated overflow, does NOT clip right side) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {quickTabs.map(tab => {
            const isActive = dynamicFilter.preset === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateFilterPreset(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? tab.alert
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950'
                      : 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                      isActive
                        ? tab.alert
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'bg-zinc-800/80 text-zinc-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Actions Container (NO overflow-hidden on this! Fully visible popovers) */}
        <div className="flex items-center gap-2 shrink-0 relative z-30">
          {/* Export Dropdown */}
          <div className="relative" ref={exportContainerRef}>
            <button
              onClick={() => {
                setIsExportDropdownOpen(!isExportDropdownOpen);
                setIsColumnsOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-750 transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export Sheet</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {/* High-Z-Index Unclipped Export Popover */}
            {isExportDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-zinc-800 bg-[#12141e] p-2 shadow-2xl z-50 animate-popover text-zinc-200 divide-y divide-zinc-800/80">
                <div className="p-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Export Options:
                  </span>
                  <button
                    onClick={handleExportFilteredLeads}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs text-left hover:bg-zinc-800 transition-colors text-zinc-200"
                  >
                    <div>
                      <span className="font-semibold block text-white">Current Filtered Leads</span>
                      <span className="text-[10px] text-zinc-400">Matches all active parameters</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                      .xlsx
                    </span>
                  </button>
                </div>

                <div className="p-1.5 pt-2">
                  <button
                    onClick={handleExportFailedQueue}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs text-left hover:bg-rose-500/15 text-rose-300 transition-colors"
                  >
                    <div>
                      <span className="font-semibold block flex items-center gap-1.5 text-rose-300">
                        <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                        <span>Failed Calling Sheet</span>
                      </span>
                      <span className="text-[10px] text-rose-400/80">Customer names & decline codes</span>
                    </div>
                    <span className="text-[10px] font-mono bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-300 font-bold">
                      .xlsx
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column Customizer Button */}
          <div className="relative" ref={columnsContainerRef}>
            <button
              onClick={() => {
                setIsColumnsOpen(!isColumnsOpen);
                setIsExportDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all shadow-sm"
              title="Customize visible columns & sort"
            >
              <Columns className="h-3.5 w-3.5 text-purple-400" />
              <span>Columns</span>
            </button>

            {/* High-Z-Index Unclipped Columns Popover */}
            {isColumnsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-zinc-800 bg-[#12141e] p-3 shadow-2xl z-50 animate-popover text-zinc-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5 text-blue-400" />
                    <span>Columns & Sorting</span>
                  </span>
                  <button onClick={() => setIsColumnsOpen(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Sort By Section */}
                <div className="mb-3 px-1">
                  <label className="text-[10px] font-semibold uppercase text-zinc-500 block mb-1">
                    Sort table order:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSortField('date')}
                      className={`flex-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                        sortField === 'date'
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Date
                    </button>
                    <button
                      onClick={() => setSortField('amount')}
                      className={`flex-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                        sortField === 'amount'
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Amount
                    </button>
                    <button
                      onClick={() => setSortField('name')}
                      className={`flex-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                        sortField === 'name'
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Name
                    </button>
                  </div>
                </div>

                {/* Columns List with Eye Toggle */}
                <div className="border-t border-zinc-800 pt-2 space-y-1 max-h-60 overflow-y-auto">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500 px-1 block mb-1">
                    Visible Columns (Click to Toggle):
                  </span>
                  {Object.entries(dynamicFilter.visibleColumns).map(([colKey, isVisible]) => (
                    <div
                      key={colKey}
                      onClick={() => handleToggleColumn(colKey as any)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 cursor-pointer text-xs transition-colors"
                    >
                      <span className="text-zinc-300 capitalize">
                        {colKey.replace(/([A-Z])/g, ' $1')}
                      </span>
                      {isVisible ? (
                        <span className="flex items-center gap-1 text-blue-400 font-semibold text-[11px]">
                          <span>Shown</span>
                          <Eye className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-600 text-[11px]">
                          <span>Hidden</span>
                          <EyeOff className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SHOPIFY-STYLE UNIFIED SEARCH & CASCADING HOVER FILTER OMNIBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 relative z-20">
        {/* Dynamic Filter Search Box */}
        <div className="relative flex-1" ref={filterContainerRef}>
          <div
            className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-200 transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
          >
            <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />

            {/* Left-side Add Filter Button (Smoothly slides in like water when clicked open) */}
            {isFilterMenuOpen && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsFilterMenuOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400 transition-all duration-300 animate-slide-in-left shrink-0"
              >
                <Filter className="h-3 w-3" />
                <span>+ Add Filter</span>
                <ChevronDown className="h-3 w-3 rotate-180 transition-transform duration-200" />
              </button>
            )}

            {/* Input Field */}
            <input
              type="text"
              placeholder="Search leads, phone, or hover parameters to query..."
              value={filterSearchQuery}
              onChange={e => {
                setFilterSearchQuery(e.target.value);
                setDynamicFilter(prev => ({ ...prev, searchQuery: e.target.value }));
              }}
              className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none py-1 transition-all duration-300"
            />

            {filterSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setFilterSearchQuery('');
                  setDynamicFilter(prev => ({ ...prev, searchQuery: '' }));
                }}
                className="text-zinc-500 hover:text-zinc-300 shrink-0 mr-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Right-side Add Filter Button (Default resting position when closed) */}
            {!isFilterMenuOpen && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsFilterMenuOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all duration-300 shrink-0 hover:scale-[1.02]"
              >
                <Filter className="h-3 w-3" />
                <span>+ Add Filter</span>
                <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              </button>
            )}
          </div>

          {/* CASCADING 2-COLUMN HOVER FILTER POPOVER (Positioned further down so active chips & table remain visible) */}
          {isFilterMenuOpen && (
            <div
              className={`absolute right-0 top-full ${
                activeFilterChips.length > 0 ? 'mt-11' : 'mt-4'
              } w-[520px] max-w-[calc(100vw-24px)] rounded-2xl border border-zinc-800 bg-[#11131a] shadow-2xl z-50 animate-popover overflow-hidden text-zinc-200`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0d0f17] border-b border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Filter className="h-3 w-3 text-blue-400" />
                  <span>Choose Filter Parameters (Hover to reveal values)</span>
                </span>
                <button
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 2-Column Cascading Body */}
              <div className="flex divide-x divide-zinc-800/80 min-h-[290px]">
                {/* Column 1: Parameters List (Level 1) */}
                <div className="w-[200px] shrink-0 p-2 bg-[#0d0f17] space-y-0.5">
                  <span className="block px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Categories:
                  </span>
                  {filterParameters.map(param => {
                    const isHovered = hoveredParameterKey === param.key;
                    const ParamIcon = param.icon;

                    return (
                      <div
                        key={param.key}
                        onMouseEnter={() => setHoveredParameterKey(param.key)}
                        onClick={() => setHoveredParameterKey(param.key)}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer transition-all ${
                          isHovered
                            ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <ParamIcon className={`h-3.5 w-3.5 shrink-0 ${isHovered ? 'text-blue-400' : 'text-zinc-500'}`} />
                          <span className="truncate">{param.label}</span>
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${isHovered ? 'text-blue-400 translate-x-0.5' : 'text-zinc-600'}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Column 2: Options with Multi-Select Checkboxes (Level 2) */}
                <div className="flex-1 p-2.5 bg-[#11131a] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-800/80">
                      <span className="text-xs font-bold text-white">
                        {activeParamObj.label} Values
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Select multiple options
                      </span>
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {activeParamObj.options.map(opt => {
                        const isChecked = (() => {
                          if (activeParamObj.key === 'paymentStatus') {
                            const list = dynamicFilter.paymentStatuses && dynamicFilter.paymentStatuses.length > 0
                              ? dynamicFilter.paymentStatuses
                              : dynamicFilter.paymentStatus !== 'ALL'
                              ? [dynamicFilter.paymentStatus]
                              : [];
                            return list.includes(opt.value);
                          }
                          if (activeParamObj.key === 'failureReason') {
                            return (dynamicFilter.failureReasons || []).includes(opt.value);
                          }
                          if (activeParamObj.key === 'landingPageSlug') {
                            const list = dynamicFilter.landingPageSlugs && dynamicFilter.landingPageSlugs.length > 0
                              ? dynamicFilter.landingPageSlugs
                              : dynamicFilter.landingPageSlug !== 'ALL'
                              ? [dynamicFilter.landingPageSlug]
                              : [];
                            return list.includes(opt.value);
                          }
                          if (activeParamObj.key === 'videoCreativeId') {
                            const list = dynamicFilter.videoCreativeIds && dynamicFilter.videoCreativeIds.length > 0
                              ? dynamicFilter.videoCreativeIds
                              : dynamicFilter.videoCreativeId !== 'ALL'
                              ? [dynamicFilter.videoCreativeId]
                              : [];
                            return list.includes(opt.value);
                          }
                          if (activeParamObj.key === 'telephonyStatus') {
                            const list = dynamicFilter.telephonyStatuses && dynamicFilter.telephonyStatuses.length > 0
                              ? dynamicFilter.telephonyStatuses
                              : dynamicFilter.telephonyStatus !== 'ALL'
                              ? [dynamicFilter.telephonyStatus]
                              : [];
                            return list.includes(opt.value);
                          }
                          if (activeParamObj.key === 'company') {
                            return dynamicFilter.company === opt.value;
                          }
                          if (activeParamObj.key === 'category') {
                            return dynamicFilter.category === opt.value;
                          }
                          return false;
                        })();

                        return (
                          <div
                            key={opt.value}
                            onClick={() => {
                              if (activeParamObj.key === 'paymentStatus') {
                                setDynamicFilter(prev => {
                                  const currentList = prev.paymentStatuses && prev.paymentStatuses.length > 0
                                    ? [...prev.paymentStatuses]
                                    : prev.paymentStatus !== 'ALL'
                                    ? [prev.paymentStatus]
                                    : [];
                                  const nextList = currentList.includes(opt.value)
                                    ? currentList.filter(v => v !== opt.value)
                                    : [...currentList, opt.value];
                                  return {
                                    ...prev,
                                    paymentStatuses: nextList,
                                    paymentStatus: nextList.length === 1 ? (nextList[0] as any) : 'ALL'
                                  };
                                });
                              } else if (activeParamObj.key === 'failureReason') {
                                setDynamicFilter(prev => {
                                  const currentList = prev.failureReasons || [];
                                  const nextList = currentList.includes(opt.value)
                                    ? currentList.filter(v => v !== opt.value)
                                    : [...currentList, opt.value];
                                  return {
                                    ...prev,
                                    failureReasons: nextList
                                  };
                                });
                              } else if (activeParamObj.key === 'landingPageSlug') {
                                setDynamicFilter(prev => {
                                  const currentList = prev.landingPageSlugs && prev.landingPageSlugs.length > 0
                                    ? [...prev.landingPageSlugs]
                                    : prev.landingPageSlug !== 'ALL'
                                    ? [prev.landingPageSlug]
                                    : [];
                                  const nextList = currentList.includes(opt.value)
                                    ? currentList.filter(v => v !== opt.value)
                                    : [...currentList, opt.value];
                                  return {
                                    ...prev,
                                    landingPageSlugs: nextList,
                                    landingPageSlug: nextList.length === 1 ? nextList[0] : 'ALL'
                                  };
                                });
                              } else if (activeParamObj.key === 'videoCreativeId') {
                                setDynamicFilter(prev => {
                                  const currentList = prev.videoCreativeIds && prev.videoCreativeIds.length > 0
                                    ? [...prev.videoCreativeIds]
                                    : prev.videoCreativeId !== 'ALL'
                                    ? [prev.videoCreativeId]
                                    : [];
                                  const nextList = currentList.includes(opt.value)
                                    ? currentList.filter(v => v !== opt.value)
                                    : [...currentList, opt.value];
                                  return {
                                    ...prev,
                                    videoCreativeIds: nextList,
                                    videoCreativeId: nextList.length === 1 ? nextList[0] : 'ALL'
                                  };
                                });
                              } else if (activeParamObj.key === 'telephonyStatus') {
                                setDynamicFilter(prev => {
                                  const currentList = prev.telephonyStatuses && prev.telephonyStatuses.length > 0
                                    ? [...prev.telephonyStatuses]
                                    : prev.telephonyStatus !== 'ALL'
                                    ? [prev.telephonyStatus]
                                    : [];
                                  const nextList = currentList.includes(opt.value)
                                    ? currentList.filter(v => v !== opt.value)
                                    : [...currentList, opt.value];
                                  return {
                                    ...prev,
                                    telephonyStatuses: nextList,
                                    telephonyStatus: nextList.length === 1 ? (nextList[0] as any) : 'ALL'
                                  };
                                });
                              } else if (activeParamObj.key === 'company') {
                                setSelectedCompany(isChecked ? 'ALL' : (opt.value as any));
                                setDynamicFilter(prev => ({
                                  ...prev,
                                  company: isChecked ? 'ALL' : (opt.value as any)
                                }));
                              } else if (activeParamObj.key === 'category') {
                                setSelectedVertical(isChecked ? 'ALL' : (opt.value as any));
                                setDynamicFilter(prev => ({
                                  ...prev,
                                  category: isChecked ? 'ALL' : (opt.value as any)
                                }));
                              }
                            }}
                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-semibold'
                                : 'text-zinc-300 hover:bg-zinc-800/60 border border-transparent'
                            }`}
                          >
                            <span className="truncate pr-2">{opt.label}</span>
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                isChecked
                                  ? 'border-blue-500 bg-blue-600 text-white'
                                  : 'border-zinc-700 bg-zinc-900'
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Done Button */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Date Range Picker Integrated Inline */}
        <div className="shrink-0">
          <EnterpriseDateRangePicker />
        </div>
      </div>

      {/* 3. ACTIVE FILTER CHIPS ROW (Unlimited parameters rendered as removable pills) */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mr-1">
            Active Parameters ({activeFilterChips.length}):
          </span>

          {activeFilterChips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 animate-in fade-in zoom-in-95"
            >
              <span className="text-zinc-400">{chip.label}:</span>
              <span className="font-bold text-white">{chip.valueLabel}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="rounded p-0.5 hover:bg-blue-500/20 text-blue-300 hover:text-white"
                title={`Remove ${chip.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-[11px] text-zinc-400 hover:text-white underline ml-1 cursor-pointer transition-colors"
          >
            Clear all parameters
          </button>
        </div>
      )}
    </div>
  );
};
