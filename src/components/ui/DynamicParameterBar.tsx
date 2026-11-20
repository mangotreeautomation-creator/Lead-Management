'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicTelemetryPreset, CompanyCode, BusinessUnitCode } from '../../data/types';
import {
  SlidersHorizontal,
  Filter,
  Columns,
  PhoneCall,
  Download,
  RotateCcw,
  AlertOctagon,
  TrendingUp,
  CheckCircle2,
  Bot,
  Search,
  Calendar,
  Layers,
  ChevronDown,
  Building2,
  X
} from 'lucide-react';
import { exportToXLSX } from '../../utils/exportUtils';
import { EnterpriseDateRangePicker } from './EnterpriseDateRangePicker';

export const DynamicParameterBar: React.FC = () => {
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

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);

  // Quick Preset Definitions
  const presets: { id: DynamicTelemetryPreset; label: string; icon: any; count?: number; alert?: boolean }[] = [
    {
      id: 'ALL',
      label: 'All Telemetry (Merged)',
      icon: Layers
    },
    {
      id: 'FAILED_PAYMENTS_QUEUE',
      label: 'Failed Payments (Name & Phone)',
      icon: AlertOctagon,
      alert: true,
      count: db.paymentAttempts.filter(p => p.status === 'FAILED').length
    },
    {
      id: 'ADS_VS_RAZORPAY_ROAS',
      label: 'Ads vs Razorpay ROAS',
      icon: TrendingUp
    },
    {
      id: 'CONVERTED_CUSTOMERS',
      label: 'Converted Customers',
      icon: CheckCircle2,
      count: db.paymentAttempts.filter(p => p.status === 'CAPTURED').length
    },
    {
      id: 'AI_VOICE_RECOVERY',
      label: 'AI Voice Recovery (Pooja)',
      icon: Bot,
      count: db.aiCalls.filter(c => c.status === 'CONNECTED').length
    }
  ];

  // Landing page list for dropdown
  const landingPages = Array.from(new Set(db.landingPages.map(lp => lp.code)));

  // Video creatives list for dropdown
  const videoCreatives = [
    'Video Creative 01 - Problem Agitation',
    'Video Creative 02 - Kundali Dosha Testimonial',
    'Video Creative 03 - Palmistry AI Scanning Feature',
    'Video Creative 04 - Commercial Architecture Blueprint',
    'Video Creative 05 - Astroshi Spiritual Sacred Geometry'
  ];

  // Export calling list for calling team
  const handleExportCallingList = () => {
    // Filter leads matching current dynamic filter & date range
    const matchedLeads = db.leads.filter(lead => {
      if (dynamicFilter.company !== 'ALL' && lead.company && lead.company !== dynamicFilter.company) return false;
      if (dynamicFilter.category !== 'ALL' && lead.businessUnit !== dynamicFilter.category) return false;
      
      // Date Range Filter
      if (dateRange === 'TODAY' && lead.createdAt && !lead.createdAt.startsWith('2026-11-03')) return false;
      if (dateRange === 'YESTERDAY' && lead.createdAt && !lead.createdAt.startsWith('2026-11-02')) return false;
      if (dateRange === 'LAST_7_DAYS' && lead.createdAt && lead.createdAt < '2026-10-27') return false;
      if (dateRange === 'LAST_30_DAYS' && lead.createdAt && lead.createdAt < '2026-10-04') return false;
      if (dateRange === 'LAST_90_DAYS' && lead.createdAt && lead.createdAt < '2026-08-05') return false;
      if (dateRange === 'THIS_MONTH' && lead.createdAt && lead.createdAt < '2026-11-01') return false;
      if (dateRange === 'LAST_MONTH' && lead.createdAt && (lead.createdAt < '2026-10-01' || lead.createdAt > '2026-10-31')) return false;
      if (dateRange === 'CUSTOM' && customDateRange && lead.createdAt) {
        const leadDate = lead.createdAt.slice(0, 10);
        if (leadDate < customDateRange.startDate || leadDate > customDateRange.endDate) return false;
      }
      return true;
    });

    const rows = matchedLeads.map(lead => {
      const customer = db.customers.find(c => c.id === lead.customerId);
      const order = db.orders.find(o => o.leadId === lead.id);
      const attempt = db.paymentAttempts.find(p => p.orderId === order?.id);
      return {
        'Customer Full Name': customer?.fullName || 'Prospect User',
        'Mobile Phone Number': customer?.phone || customer?.primaryPhone || 'N/A',
        'City': customer?.city || 'N/A',
        'Company': lead.company || 'Mango Tree Tech',
        'Category': lead.businessUnit,
        'Order Amount (INR)': order?.amount || 0,
        'Payment Status': attempt?.status || (lead.status === 'PAYMENT_COMPLETED' ? 'CAPTURED' : 'PENDING'),
        'Decline / Failure Reason': attempt?.errorMessage || (attempt?.status === 'FAILED' ? 'Bank Gateway Timeout' : 'None'),
        'Originating Landing Page': lead.landingPageSlug || '',
        'Ad Creative Video': lead.adCreativeName || 'Default Creative',
        'AI Pooja Call Status': lead.aiCallStatus || 'Unscheduled',
        'Lead Ingested Timestamp': lead.createdAt || ''
      };
    });

    const filename = dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE'
      ? `Failed_Payments_Calling_List_${new Date().toISOString().slice(0, 10)}`
      : `Dynamic_Calling_Sheet_${new Date().toISOString().slice(0, 10)}`;

    exportToXLSX(rows, filename);
  };

  const handleToggleColumn = (col: keyof typeof dynamicFilter.visibleColumns) => {
    setDynamicFilter(prev => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [col]: !prev.visibleColumns[col]
      }
    }));
  };

  const handleResetFilters = () => {
    updateFilterPreset('ALL');
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0c0e14] p-4 text-zinc-200 shadow-xl transition-all">
      {/* Top Header: Title, Presets Bar, and Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        {/* Preset Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="h-3 w-3 text-blue-400" />
            Preset:
          </span>
          {presets.map(p => {
            const isActive = dynamicFilter.preset === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => updateFilterPreset(p.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? p.alert
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950'
                      : 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                    : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? (p.alert ? 'text-rose-400' : 'text-white') : 'text-zinc-400'}`} />
                <span>{p.label}</span>
                {p.count !== undefined && (
                  <span
                    className={`ml-1 rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? p.alert
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-800 text-blue-100'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {p.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Action Tools: Date Range Picker, Filter Toggle, Columns Toggle, Calling Sheet Export */}
        <div className="flex items-center gap-2 shrink-0">
          <EnterpriseDateRangePicker />

          {/* Custom Parameters Toggle */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              isAdvancedOpen
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850'
            }`}
          >
            <Filter className="h-3.5 w-3.5 text-blue-400" />
            <span>Parameters</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Column Visibility Customizer Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-850 transition-all"
            >
              <Columns className="h-3.5 w-3.5 text-purple-400" />
              <span>Columns</span>
            </button>

            {/* Dropdown for Columns */}
            {isColumnsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-800 bg-[#11131a] p-3 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white">Visible Table Columns</span>
                  <button onClick={() => setIsColumnsOpen(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
                  {Object.entries(dynamicFilter.visibleColumns).map(([colKey, isVisible]) => (
                    <label
                      key={colKey}
                      className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-zinc-800/60 cursor-pointer text-zinc-300 capitalize"
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => handleToggleColumn(colKey as any)}
                        className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                      />
                      <span>{colKey.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Calling List Button */}
          <button
            onClick={handleExportCallingList}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-sm ${
              dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
            }`}
            title="Download formatted CSV/Excel for the calling and recovery team"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>
              {dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE' ? 'Export Failed Recovery List' : 'Export Calling List'}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Row (Collapsible) */}
      {isAdvancedOpen && (
        <div className="mt-3 pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs animate-in fade-in duration-200">
          {/* Company Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Company</label>
            <select
              value={dynamicFilter.company}
              onChange={e => {
                const comp = e.target.value as CompanyCode;
                setSelectedCompany(comp);
                setDynamicFilter(prev => ({ ...prev, company: comp, category: 'ALL' }));
              }}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Companies Combined</option>
              <option value="VASTU_SHIKHAR">Vastu Shikhar</option>
              <option value="GLOBALINCH">GlobalInch</option>
              <option value="MANGO_TREE">Mango Tree Technology</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Category</label>
            <select
              value={dynamicFilter.category}
              onChange={e => {
                const cat = e.target.value as BusinessUnitCode;
                setSelectedVertical(cat);
                setDynamicFilter(prev => ({ ...prev, category: cat }));
              }}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Operational Categories</option>
              {dynamicFilter.company === 'VASTU_SHIKHAR' && (
                <>
                  <option value="ASTROLOGY">Astrology</option>
                  <option value="VASTU">Vastu</option>
                  <option value="CONSULTANCY">Consultancy</option>
                </>
              )}
              {dynamicFilter.company === 'GLOBALINCH' && (
                <>
                  <option value="VASTU_REPORT">Vastu Wheel Report</option>
                  <option value="PALMISTRY">Palmistry</option>
                </>
              )}
              {dynamicFilter.company === 'MANGO_TREE' && (
                <option value="ASTROSHI">Astroshi Spiritual Guidance</option>
              )}
              {dynamicFilter.company === 'ALL' && (
                <>
                  <option value="VASTU_WEBINAR">Vastu Webinar</option>
                  <option value="ASTRO_WEBINAR">Astrology Webinar</option>
                  <option value="PALMISTRY">Palmistry</option>
                  <option value="VASTU_REPORT">Vastu Wheel Report</option>
                  <option value="ASTROSHI">Astroshi</option>
                  <option value="CONSULTANCY">Consultancy</option>
                </>
              )}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Payment Status</label>
            <select
              value={dynamicFilter.paymentStatus}
              onChange={e => setDynamicFilter(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="CAPTURED">Captured (Paid)</option>
              <option value="FAILED">Failed (Decline / Timeout)</option>
              <option value="PENDING">Pending Checkout</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Landing Page Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Landing Page</label>
            <select
              value={dynamicFilter.landingPageSlug}
              onChange={e => setDynamicFilter(prev => ({ ...prev, landingPageSlug: e.target.value }))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Landing Pages</option>
              {landingPages.map(lp => (
                <option key={lp} value={lp}>{lp}</option>
              ))}
            </select>
          </div>

          {/* Video Ad Creative Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Ad Creative Video</label>
            <select
              value={dynamicFilter.videoCreativeId}
              onChange={e => setDynamicFilter(prev => ({ ...prev, videoCreativeId: e.target.value }))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Video Creatives</option>
              {videoCreatives.map(vc => (
                <option key={vc} value={vc}>{vc}</option>
              ))}
            </select>
          </div>

          {/* Search by Customer Name / Phone */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Name / Phone Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Ravi Kumar, 98765..."
                value={dynamicFilter.searchQuery}
                onChange={e => setDynamicFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 pl-7 pr-2 text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Filter Mode Status Bar (When Failed Payments or custom filters active) */}
      {dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Active Mode: Failed Payments Recovery Queue.</span>
              <span className="text-rose-300 ml-1">
                Showing failed transactions with customer names, phone numbers, and bank decline reasons for immediate recovery calls.
              </span>
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/30"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset to All</span>
          </button>
        </div>
      )}

      {dynamicFilter.preset === 'ADS_VS_RAZORPAY_ROAS' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold">Active Mode: Meta Ads vs Razorpay Gateway Reconciliation.</span>
              <span className="text-blue-300 ml-1">
                Comparing ad spend, CPC, and CPL against Razorpay captured payouts and blended ROAS.
              </span>
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1 text-[11px] font-medium text-blue-300 hover:bg-blue-500/30"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset to All</span>
          </button>
        </div>
      )}
    </div>
  );
};
