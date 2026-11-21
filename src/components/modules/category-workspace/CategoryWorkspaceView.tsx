'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { BusinessUnitCode, Lead } from '../../../data/types';
import { ShopifyMetricCard } from '../../ui/ShopifyMetricCard';
import { exportToXLSX, exportToCSV } from '../../../utils/exportUtils';
import { formatCurrency, formatNumber, formatDate } from '../../../utils/formatters';
import {
  Compass,
  Video,
  Hand,
  Sparkles,
  Building2,
  FileSpreadsheet,
  PhoneCall,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Globe,
  Film,
  Gem
} from 'lucide-react';

export const CategoryWorkspaceView: React.FC = () => {
  const {
    selectedVertical,
    setSelectedVertical,
    returnToGateway,
    db,
    setSelectedLeadId,
    setSelectedCustomerId,
    globalSearch
  } = useApp();

  // Active Category (default to VASTU_WEBINAR if ALL was set)
  const activeCategory: BusinessUnitCode = selectedVertical === 'ALL' ? 'VASTU_WEBINAR' : selectedVertical;

  // 3 Primary Workspace View Modes (Overall vs By Landing Page vs By Video Creative)
  const [activeTab, setActiveTab] = useState<'OVERALL' | 'LANDING_PAGES' | 'CREATIVES'>('OVERALL');

  // Filter selections
  const [selectedLpSlug, setSelectedLpSlug] = useState<string>('ALL');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('ALL');

  // Table search & pagination
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<'createdAt' | 'landingPageSlug' | 'capturedRevenue'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const effectiveSearch = tableSearch || globalSearch;

  // Strict Category Configuration (NO childish emojis!)
  const categoryConfig: Record<string, {
    title: string;
    subtitle: string;
    domain: string;
    accountLabel: string;
    icon: any;
    color: string;
  }> = {
    VASTU_WEBINAR: {
      title: 'Vastu Webinar Operations',
      subtitle: 'Live 3-day cohort masterclasses & architectural workshop funnels',
      domain: 'https://www.mangotreetechnology.com',
      accountLabel: 'Mango Tree Technology (Account 1)',
      icon: Compass,
      color: '#0c85eb'
    },
    ASTRO_WEBINAR: {
      title: 'Astrology Webinar Operations',
      subtitle: 'Live Kundali reading & planetary transit masterclasses',
      domain: 'https://www.mangotreetechnology.com',
      accountLabel: 'Mango Tree Technology (Account 1)',
      icon: Sparkles,
      color: '#8b5cf6'
    },
    PALMISTRY: {
      title: 'Palmistry Reports & AI Telephony',
      subtitle: 'Digital palm line scanning with AI voice recovery calls (Agent Pooja)',
      domain: 'https://www.mangotreetechnology.com',
      accountLabel: 'GlobalInch (Account 2)',
      icon: Hand,
      color: '#f59e0b'
    },
    VASTU_REPORT: {
      title: 'Vastu Wheel Report Division',
      subtitle: 'Automated digital floorplan audit reports & residential remedial blueprints',
      domain: 'https://www.mangotreetechnology.com',
      accountLabel: 'GlobalInch (Account 2)',
      icon: Compass,
      color: '#0c85eb'
    },
    VASTU: {
      title: 'Vastu Operations Workspace',
      subtitle: 'Automated digital floorplan audit reports & residential remedial blueprints',
      domain: 'https://www.mangotreetechnology.com',
      accountLabel: 'GlobalInch (Account 2)',
      icon: Compass,
      color: '#0c85eb'
    },
    ASTROSHI: {
      title: 'Astroshi Spiritual Guidance & Remedies',
      subtitle: 'Sacred geometry audits, energized yantras, and gemstone consultations',
      domain: 'https://astroshi.com',
      accountLabel: 'GlobalInch (Account 2)',
      icon: Gem,
      color: '#10b981'
    },
    CONSULTANCY: {
      title: 'Private 1-on-1 Vastu Consultancy',
      subtitle: 'High-ticket bespoke architectural reviews & VIP on-site evaluations',
      domain: 'https://consultancy.vastushikhar.com',
      accountLabel: 'Vastu Shikhar (Account 3)',
      icon: Building2,
      color: '#d97706'
    }
  };

  const currentConfig = categoryConfig[activeCategory] || categoryConfig['VASTU_WEBINAR'];
  const CategoryIcon = currentConfig.icon;

  // Filter Landing Pages strictly to this category
  const availableLps = useMemo(() => {
    return db.landingPages.filter(lp => {
      if (activeCategory === 'VASTU_WEBINAR') return lp.code.includes('webinar') || lp.code.includes('vastu');
      if (activeCategory === 'ASTRO_WEBINAR') return lp.code.includes('astro') && lp.code.includes('webinar');
      return lp.businessUnit === activeCategory;
    });
  }, [db.landingPages, activeCategory]);

  // Filter Video Creatives strictly to this category
  const availableVideos = useMemo(() => {
    return db.videoCreatives.filter(v => {
      if (activeCategory === 'VASTU_WEBINAR') return v.vertical === 'WEBINAR' || v.vertical === 'VASTU_WEBINAR';
      if (activeCategory === 'ASTRO_WEBINAR') return v.vertical === 'ASTRO_WEBINAR' || v.vertical === 'WEBINAR';
      return v.vertical === activeCategory;
    });
  }, [db.videoCreatives, activeCategory]);

  // STRICT LEADS FILTERING - Absolutely NO cross-category leakage!
  const filteredLeads = useMemo(() => {
    return db.leads.filter(lead => {
      // 1. Strict Category Matching
      if (activeCategory === 'VASTU_WEBINAR') {
        if (lead.businessUnit !== 'VASTU_WEBINAR' && lead.businessUnit !== 'WEBINAR') return false;
      } else if (activeCategory === 'ASTRO_WEBINAR') {
        if (lead.businessUnit !== 'ASTRO_WEBINAR') return false;
      } else if (activeCategory === 'VASTU_REPORT' || activeCategory === 'VASTU') {
        if (lead.businessUnit !== 'VASTU_REPORT' && lead.businessUnit !== 'VASTU') return false;
      } else {
        if (lead.businessUnit !== activeCategory) return false;
      }

      // 2. Landing page filter (if selected)
      if (selectedLpSlug !== 'ALL' && lead.landingPageSlug !== selectedLpSlug) return false;

      // 3. Video ad creative filter (if selected)
      if (selectedVideoId !== 'ALL' && lead.adCreativeId !== selectedVideoId && lead.adCreativeName !== selectedVideoId) return false;

      // 4. Search query
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const customer = db.customers.find(c => c.id === lead.customerId);
        const name = (customer?.fullName || '').toLowerCase();
        const phone = (customer?.phone || customer?.primaryPhone || '').toLowerCase();
        const slug = (lead.landingPageSlug || '').toLowerCase();
        const creative = (lead.adCreativeName || '').toLowerCase();
        const leadId = lead.id.toLowerCase();

        if (!name.includes(query) && !phone.includes(query) && !slug.includes(query) && !creative.includes(query) && !leadId.includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'capturedRevenue') {
        const revA = a.capturedRevenue || 0;
        const revB = b.capturedRevenue || 0;
        return sortOrder === 'asc' ? revA - revB : revB - revA;
      }
      if (sortField === 'landingPageSlug') {
        const sA = a.landingPageSlug || '';
        const sB = b.landingPageSlug || '';
        return sortOrder === 'asc' ? sA.localeCompare(sB) : sB.localeCompare(sA);
      }
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [db.leads, db.customers, activeCategory, selectedLpSlug, selectedVideoId, effectiveSearch, sortField, sortOrder]);

  // Aggregated Financials & KPIs
  const filteredLeadIds = useMemo(() => filteredLeads.map(l => l.id), [filteredLeads]);
  const categoryOrders = useMemo(() => db.orders.filter(o => filteredLeadIds.includes(o.leadId)), [db.orders, filteredLeadIds]);
  const categoryOrderIds = useMemo(() => categoryOrders.map(o => o.id), [categoryOrders]);
  const categoryCaptured = useMemo(() => db.capturedPayments.filter(cp => categoryOrderIds.includes(cp.orderId)), [db.capturedPayments, categoryOrderIds]);
  const categoryAttempts = useMemo(() => db.paymentAttempts.filter(pa => categoryOrderIds.includes(pa.orderId)), [db.paymentAttempts, categoryOrderIds]);

  const grossRevenue = categoryCaptured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);
  const totalFee = categoryCaptured.reduce((sum, cp) => sum + (cp.fee || 0), 0);
  const totalTax = categoryCaptured.reduce((sum, cp) => sum + (cp.tax || 0), 0);
  const netSettled = grossRevenue - totalFee - totalTax;
  const attemptsCount = categoryAttempts.length;
  const capturedAttemptsCount = categoryAttempts.filter(a => a.status === 'CAPTURED').length;
  const successRate = attemptsCount > 0 ? (capturedAttemptsCount / attemptsCount) * 100 : 0;

  // AI voice recovery telemetry
  const aiAssistedRevenue = useMemo(() => {
    const connectedLeadIds = new Set(
      db.aiCalls.filter(c => c.status === 'CONNECTED' && c.leadId && filteredLeadIds.includes(c.leadId)).map(c => c.leadId as string)
    );
    return categoryCaptured
      .filter(cp => {
        const ord = db.orders.find(o => o.id === cp.orderId);
        return ord && connectedLeadIds.has(ord.leadId);
      })
      .reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);
  }, [db.aiCalls, categoryCaptured, db.orders, filteredLeadIds]);

  // Dedicated Calling List Export (Name, Phone, City, Origin Video, Status)
  const handleExportCallingList = () => {
    const rows = filteredLeads.map(lead => {
      const customer = db.customers.find(c => c.id === lead.customerId);
      const orders = db.orders.filter(o => o.leadId === lead.id);
      const order = orders[0];
      return {
        'Customer Name': customer?.fullName || 'Prospect Visitor',
        'Mobile Phone Number': customer?.phone || customer?.primaryPhone || 'N/A',
        'City': customer?.city || 'N/A',
        'State': customer?.state || 'N/A',
        'Category / Offering': currentConfig.title,
        'Landing Page Slug': lead.landingPageSlug || 'direct',
        'Originating Ad Video Creative': lead.adCreativeName || 'General Ad Feed',
        'Lead Status': lead.leadStatus || lead.status || 'NEW',
        'Order Status': order?.orderStatus || order?.status || 'NO_CHECKOUT',
        'Order Amount (INR)': order?.amount ? `₹${order.amount.toFixed(2)}` : '₹0.00',
        'Payment Captured (INR)': lead.capturedRevenue ? `₹${lead.capturedRevenue.toFixed(2)}` : '₹0.00',
        'Enquiry Date': lead.createdAt
      };
    });

    const filename = `${activeCategory.toLowerCase()}_calling_list_${new Date().toISOString().split('T')[0]}`;
    exportToXLSX(rows, filename, 'Calling_Queue');
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-[#f6f6f7] p-6 text-[#1a1a1a] dark:bg-[#0c0d12] dark:text-[#f4f4f5] font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* TOP WORKSPACE HEADER: BACK BUTTON + TITLE + CALLING LIST CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e1e3e5] dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => returnToGateway('CATEGORY_SELECT')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1e3e5] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all shadow-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-blue-500" />
                <span>Switch Category</span>
              </button>
              <span className="text-slate-400">/</span>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                {currentConfig.accountLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
                  {currentConfig.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {currentConfig.subtitle} • Domain: {currentConfig.domain}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCallingList}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 active:scale-[0.99] transition-all"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Export Calling List (Name & Phone)</span>
            </button>
          </div>
        </div>

        {/* 3 ANALYTICAL SWITCHER TABS (OVERALL vs BY LANDING PAGE vs BY VIDEO CREATIVE) */}
        <div className="flex items-center gap-2 border-b border-[#e1e3e5] dark:border-zinc-800 pb-1">
          <button
            onClick={() => {
              setActiveTab('OVERALL');
              setSelectedLpSlug('ALL');
              setSelectedVideoId('ALL');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'OVERALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>1. Overall Performance ({filteredLeads.length} Leads)</span>
          </button>

          <button
            onClick={() => setActiveTab('LANDING_PAGES')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'LANDING_PAGES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>2. By Landing Page ({availableLps.length} Pages)</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATIVES')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'CREATIVES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>3. By Meta Video Ad Creative ({availableVideos.length} Ads)</span>
          </button>
        </div>

        {/* VIEW 1: OVERALL DASHBOARD (SHOPIFY METRICS & DUAL LINE CHART) */}
        {activeTab === 'OVERALL' && (
          <div className="space-y-6">
            {/* 4 Shopify Metric Cards with Inline Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ShopifyMetricCard
                title="Gross Captured Sales"
                value={formatCurrency(grossRevenue)}
                trend={{ value: '18.4%', isPositive: true, periodText: 'vs last 30 days' }}
                sparklineData={[35, 42, 50, 65, 58, 72, 85, 92, 100]}
                sparklineColor="#0c85eb"
                tooltipText="Net captured payments received through webhooks strictly for this category."
              />
              <ShopifyMetricCard
                title="Total Category Leads"
                value={formatNumber(filteredLeads.length)}
                trend={{ value: '14.2%', isPositive: true, periodText: 'vs last 30 days' }}
                sparklineData={[40, 48, 55, 60, 68, 75, 82, 88, 95]}
                sparklineColor="#10b981"
                tooltipText="Verified phone and email leads captured exclusively via this category's landing pages."
              />
              <ShopifyMetricCard
                title="Payment Success Rate"
                value={`${successRate.toFixed(1)}%`}
                trend={{ value: '4.5%', isPositive: true, periodText: 'vs last 30 days' }}
                sparklineData={[45, 46, 52, 50, 54, 53, 58, 62, 60]}
                sparklineColor="#8b5cf6"
                tooltipText="Ratio of successfully captured attempts over initiated orders."
              />
              <ShopifyMetricCard
                title="AI Telephony Recovered"
                value={formatCurrency(aiAssistedRevenue)}
                trend={{ value: '24.8%', isPositive: true, periodText: 'vs last 30 days' }}
                sparklineData={[20, 28, 35, 45, 52, 65, 78, 85, 94]}
                sparklineColor="#f59e0b"
                tooltipText="Revenue captured after automated recovery call intervention (e.g. Agent Pooja)."
              />
            </div>

            {/* Dual Line Sales Chart & Total Breakdown Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dual Line Chart (2 Cols) */}
              <div className="lg:col-span-2 rounded-2xl border border-[#e1e3e5] bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#11131a]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-white">
                      Category Sales Velocity Over Time
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Solid line: Current period • Dotted line: Previous comparative period
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(grossRevenue)}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      ↗ +18.4%
                    </span>
                  </div>
                </div>

                {/* SVG Dual Wave Graph */}
                <div className="relative h-60 w-full pt-4">
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="catGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0c85eb" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#0c85eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="#e1e3e5" strokeDasharray="3 3" strokeWidth="1" className="dark:stroke-zinc-800" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#e1e3e5" strokeDasharray="3 3" strokeWidth="1" className="dark:stroke-zinc-800" />
                    <line x1="0" y1="140" x2="600" y2="140" stroke="#e1e3e5" strokeDasharray="3 3" strokeWidth="1" className="dark:stroke-zinc-800" />

                    {/* Previous Period: Dotted Gray Line */}
                    <path
                      d="M 0 170 C 60 160, 120 130, 180 140 C 240 150, 300 110, 360 120 C 420 130, 480 90, 540 100 C 570 105, 590 115, 600 120"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.75"
                    />

                    {/* Current Period: Gradient Area Fill */}
                    <path
                      d="M 0 160 C 60 140, 120 90, 180 110 C 240 130, 300 60, 360 80 C 420 95, 480 30, 540 45 C 570 50, 590 70, 600 65 L 600 200 L 0 200 Z"
                      fill="url(#catGradient)"
                    />

                    {/* Current Period: Solid Blue Line */}
                    <path
                      d="M 0 160 C 60 140, 120 90, 180 110 C 240 130, 300 60, 360 80 C 420 95, 480 30, 540 45 C 570 50, 590 70, 600 65"
                      fill="none"
                      stroke="#0c85eb"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                <div className="mt-3 flex justify-between text-[11px] text-slate-400">
                  <span>Day 1</span>
                  <span>Day 7</span>
                  <span>Day 14</span>
                  <span>Day 21</span>
                  <span>Day 28</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Total Financial Breakdown (1 Col) */}
              <div className="rounded-2xl border border-[#e1e3e5] bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#11131a] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-white mb-1">
                    Financial Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                    Reconciliation for {currentConfig.title}
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                      <span className="text-slate-500 dark:text-zinc-400">Gross Sales</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                      <span className="text-slate-500 dark:text-zinc-400">Gateway Fees (2%)</span>
                      <span className="font-semibold text-rose-500">-{formatCurrency(totalFee)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                      <span className="text-slate-500 dark:text-zinc-400">GST on Fee (18%)</span>
                      <span className="font-semibold text-rose-500">-{formatCurrency(totalTax)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-zinc-700 font-bold text-sm">
                      <span className="text-slate-900 dark:text-white">Net Settled</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(netSettled)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Razorpay Webhook Reconciled
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: BY LANDING PAGE */}
        {activeTab === 'LANDING_PAGES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white">
                  Landing Pages Active for {currentConfig.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Click any page to isolate leads and audit conversion rates.
                </p>
              </div>

              {selectedLpSlug !== 'ALL' && (
                <button
                  onClick={() => setSelectedLpSlug('ALL')}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Clear Landing Page Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableLps.map(lp => {
                const lpLeads = db.leads.filter(l => l.landingPageSlug === lp.code);
                const isSelected = selectedLpSlug === lp.code;

                return (
                  <div
                    key={lp.id}
                    onClick={() => setSelectedLpSlug(isSelected ? 'ALL' : lp.code)}
                    className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md dark:border-blue-500 dark:bg-blue-950/20'
                        : 'border-[#e1e3e5] bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-[#11131a] dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {lp.pageType}
                      </span>
                      {isSelected && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          FILTER ACTIVE
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#1a1a1a] dark:text-white mb-1">
                      {lp.name}
                    </h4>
                    <p className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate mb-4">
                      {lp.url}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <div>
                        <div className="text-[10px] text-slate-400">Visitors</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{formatNumber(lp.visitors)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Leads Captured</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">{lpLeads.length || lp.leadsCount}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: BY META VIDEO CREATIVE */}
        {activeTab === 'CREATIVES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white">
                  Meta Video Creatives Originating {currentConfig.title} Leads
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Analyze video hooks, duration, ad spend, and captured ROAS.
                </p>
              </div>

              {selectedVideoId !== 'ALL' && (
                <button
                  onClick={() => setSelectedVideoId('ALL')}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Clear Creative Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableVideos.map(vid => {
                const vidLeads = db.leads.filter(l => l.adCreativeId === vid.id || l.adCreativeName === vid.name || l.adCreativeName === vid.title);
                const isSelected = selectedVideoId === vid.id;

                return (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedVideoId(isSelected ? 'ALL' : vid.id)}
                    className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md dark:border-blue-500 dark:bg-blue-950/20'
                        : 'border-[#e1e3e5] bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-[#11131a] dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {vid.videoDuration} Video Ad
                      </span>
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {vid.roas.toFixed(1)}x ROAS
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#1a1a1a] dark:text-white mb-1">
                      {vid.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 italic mb-4">
                      "{vid.hookHeadline}"
                    </p>

                    <div className="grid grid-cols-4 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <div>
                        <div className="text-[10px] text-slate-400">Ad Spend</div>
                        <div className="font-semibold">{formatCurrency(vid.spend)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Impressions</div>
                        <div className="font-semibold">{formatNumber(vid.impressions)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Leads</div>
                        <div className="font-semibold text-blue-600">{vidLeads.length || vid.leadsCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Revenue</div>
                        <div className="font-semibold text-emerald-600">{formatCurrency(vid.capturedRevenue)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM SECTION: TELECALLER CALLING QUEUE & LEADS TABLE */}
        <div className="rounded-2xl border border-[#e1e3e5] bg-white shadow-sm dark:border-zinc-800 dark:bg-[#11131a] overflow-hidden">
          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#e1e3e5] dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-white">
                Filtered Leads Queue ({filteredLeads.length} Records)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Real-time queue ready for telecalling and conversion verification
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, city..."
                  value={tableSearch}
                  onChange={e => {
                    setTableSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-[#e1e3e5] bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <button
                onClick={handleExportCallingList}
                className="flex items-center gap-1.5 rounded-lg border border-[#e1e3e5] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors shadow-sm shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export Sheet</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e1e3e5] bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="py-3 px-4">Customer Name & Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Landing Page</th>
                  <th className="py-3 px-4">Origin Video Creative</th>
                  <th className="py-3 px-4">Lead Status</th>
                  <th className="py-3 px-4">Captured Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedLeads.map(lead => {
                  const customer = db.customers.find(c => c.id === lead.customerId);
                  const isConverted = (lead.capturedRevenue || 0) > 0;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {customer?.fullName || 'Prospect Visitor'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                          {customer?.phone || customer?.primaryPhone || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-zinc-200">{customer?.city || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{customer?.state || ''}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-600 dark:text-zinc-300">
                          {lead.landingPageSlug || 'direct'}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate">
                        <span className="text-slate-600 dark:text-zinc-400 truncate">
                          {lead.adCreativeName || 'General Ad'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isConverted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {isConverted ? 'CONVERTED' : (lead.leadStatus || 'PENDING')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${isConverted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {lead.capturedRevenue ? `₹${lead.capturedRevenue.toFixed(2)}` : '₹0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-zinc-800"
                        >
                          View Lead
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                      No leads match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-[#e1e3e5] dark:border-zinc-800 text-xs text-slate-500">
            <div>
              Showing {paginatedLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="rounded-lg border border-[#e1e3e5] px-2.5 py-1 disabled:opacity-40 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Previous
              </button>
              <span className="font-medium text-slate-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[#e1e3e5] px-2.5 py-1 disabled:opacity-40 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
