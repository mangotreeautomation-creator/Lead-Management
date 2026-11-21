'use client';

import React, { useMemo, useState } from 'react';
import { useApp, resolveActiveDateRange } from '../../../context/AppContext';
import { BusinessUnitCode, CompanyCode } from '../../../data/types';
import { ShopifyMetricCard } from '../../ui/ShopifyMetricCard';
import { ShopifyDynamicFilterEngine } from '../../ui/ShopifyDynamicFilterEngine';
import { exportToXLSX } from '../../../utils/exportUtils';
import { formatCurrency, formatNumber, formatDate } from '../../../utils/formatters';
import {
  TrendingUp,
  Download,
  Eye,
  ArrowUpRight,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronRight,
  FileSpreadsheet,
  Building2,
  Globe,
  CreditCard,
  MessageSquare,
  Bot,
  Zap,
  RotateCcw,
  ShieldCheck,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Check,
  Clock,
  Filter,
  Play,
  Video,
  Copy,
  CheckCheck,
  ExternalLink,
  Sliders,
  Flame
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    db,
    selectedCompany,
    setSelectedCompany,
    selectedVertical,
    setSelectedVertical,
    selectedAccount,
    setSelectedLeadId,
    setSelectedCustomerId,
    setActiveModule,
    setIsCategorySelectorOpen,
    dynamicFilter,
    setDynamicFilter,
    updateFilterPreset,
    dateRange,
    customDateRange
  } = useApp();

  // Top Perspective Lens Tab: 'ALL' | 'META' | 'RAZORPAY'
  const [perspectiveTab, setPerspectiveTab] = useState<'ALL' | 'META' | 'RAZORPAY'>('ALL');

  const [tableSearch, setTableSearch] = useState('');
  const [metaSearch, setMetaSearch] = useState('');
  const [razorpaySearch, setRazorpaySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Interactive controls for Meta & Razorpay intelligence views
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null);
  const [creativeFilter, setCreativeFilter] = useState<'ALL' | 'WINNERS' | 'SCALING'>('ALL');
  const [expandedScriptId, setExpandedScriptId] = useState<string | null>(null);
  const [razorpayMethodFilter, setRazorpayMethodFilter] = useState<'ALL' | 'UPI' | 'CARD' | 'NETBANKING'>('ALL');

  const handleCopyPaymentId = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedPaymentId(id);
      setTimeout(() => setCopiedPaymentId(null), 2000);
    }
  };

  // 1. Resolve Effective Company and Category from Global Context + Dynamic Filter
  const effectiveCompany: CompanyCode = dynamicFilter.company !== 'ALL' ? dynamicFilter.company : selectedCompany;
  const effectiveCategory: 'ALL' | BusinessUnitCode = dynamicFilter.category !== 'ALL' ? dynamicFilter.category : selectedVertical;

  // Authoritative Date Range Resolution from global dateRange & customDateRange
  const { startDate, endDate } = useMemo(() => {
    return resolveActiveDateRange(dateRange, customDateRange);
  }, [dateRange, customDateRange]);

  const checkDateMatch = (isoDate?: string | null) => {
    if (!startDate && !endDate) return true;
    if (!isoDate) return true;
    const d = isoDate.slice(0, 10);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  };

  // 2. Filter Leads dynamically
  const filteredLeads = useMemo(() => {
    return db.leads.filter(lead => {
      // Company match
      if (effectiveCompany !== 'ALL' && lead.company && lead.company !== effectiveCompany) return false;
      // Category match
      if (effectiveCategory !== 'ALL' && lead.businessUnit !== effectiveCategory) return false;

      // Date Range Filter (universal across all presets)
      if (!checkDateMatch(lead.createdAt)) return false;

      // Landing page filter (multi-select supported)
      const activeFunnels = dynamicFilter.landingPageSlugs && dynamicFilter.landingPageSlugs.length > 0
        ? dynamicFilter.landingPageSlugs
        : dynamicFilter.landingPageSlug !== 'ALL'
        ? [dynamicFilter.landingPageSlug]
        : [];
      if (activeFunnels.length > 0 && lead.landingPageSlug && !activeFunnels.includes(lead.landingPageSlug)) return false;

      // Report Language filter (multi-select supported)
      const activeReportLangs = dynamicFilter.reportLanguages && dynamicFilter.reportLanguages.length > 0
        ? dynamicFilter.reportLanguages
        : dynamicFilter.reportLanguage && dynamicFilter.reportLanguage !== 'ALL'
        ? [dynamicFilter.reportLanguage]
        : [];
      if (activeReportLangs.length > 0 && (!lead.reportLanguage || !activeReportLangs.includes(lead.reportLanguage))) return false;

      // Meta Campaign filter
      if (dynamicFilter.metaCampaign && dynamicFilter.metaCampaign !== 'ALL') {
        if (lead.utmCampaign !== dynamicFilter.metaCampaign && lead.campaignName !== dynamicFilter.metaCampaign) return false;
      }

      // Meta Ad Set filter
      if (dynamicFilter.metaAdSet && dynamicFilter.metaAdSet !== 'ALL') {
        if (lead.utmTerm !== dynamicFilter.metaAdSet && lead.adSetName !== dynamicFilter.metaAdSet) return false;
      }

      // UTM Source filter
      if (dynamicFilter.utmSource && dynamicFilter.utmSource !== 'ALL') {
        if (lead.utmSource !== dynamicFilter.utmSource) return false;
      }

      // UTM Medium filter
      if (dynamicFilter.utmMedium && dynamicFilter.utmMedium !== 'ALL') {
        if (lead.utmMedium !== dynamicFilter.utmMedium) return false;
      }

      // Video creative filter (multi-select supported)
      const activeCreatives = dynamicFilter.videoCreativeIds && dynamicFilter.videoCreativeIds.length > 0
        ? dynamicFilter.videoCreativeIds
        : dynamicFilter.videoCreativeId !== 'ALL'
        ? [dynamicFilter.videoCreativeId]
        : [];
      if (activeCreatives.length > 0 && lead.adCreativeName && !activeCreatives.includes(lead.adCreativeName)) return false;

      // Telephony filter (multi-select supported)
      const activeTelephony = dynamicFilter.telephonyStatuses && dynamicFilter.telephonyStatuses.length > 0
        ? dynamicFilter.telephonyStatuses
        : dynamicFilter.telephonyStatus !== 'ALL'
        ? [dynamicFilter.telephonyStatus]
        : [];
      if (activeTelephony.length > 0 && (!lead.aiCallStatus || !activeTelephony.includes(lead.aiCallStatus))) return false;

      // Payment status check via linked order/attempt (multi-select: CAPTURED, FAILED, PENDING, REFUNDED)
      const activePaymentStatuses = dynamicFilter.paymentStatuses && dynamicFilter.paymentStatuses.length > 0
        ? dynamicFilter.paymentStatuses
        : dynamicFilter.paymentStatus !== 'ALL'
        ? [dynamicFilter.paymentStatus]
        : [];

      if (activePaymentStatuses.length > 0) {
        const order = db.orders.find(o => o.leadId === lead.id);
        const attempt = order ? db.paymentAttempts.find(p => p.orderId === order.id) : null;
        const currentLeadPaymentStatus = attempt?.status || (lead.status === 'PAYMENT_COMPLETED' ? 'CAPTURED' : 'PENDING');
        if (!activePaymentStatuses.includes(currentLeadPaymentStatus as any)) return false;
      }

      // Quick Search input inside table
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        const customer = db.customers.find(c => c.id === lead.customerId);
        const nameMatch = customer?.fullName?.toLowerCase().includes(q);
        const phoneMatch = customer?.phone?.includes(q) || customer?.primaryPhone?.includes(q);
        const cityMatch = customer?.city?.toLowerCase().includes(q);
        const creativeMatch = lead.adCreativeName?.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !cityMatch && !creativeMatch) return false;
      }

      return true;
    });
  }, [db.leads, db.customers, db.orders, db.paymentAttempts, effectiveCompany, effectiveCategory, dynamicFilter, tableSearch, startDate, endDate]);

  // 3. Filter Orders for active leads
  const filteredOrders = useMemo(() => {
    const leadIds = new Set(filteredLeads.map(l => l.id));
    return db.orders.filter(o => {
      if (effectiveCompany !== 'ALL' && o.company && o.company !== effectiveCompany) return false;
      if (effectiveCategory !== 'ALL' && o.businessUnit && o.businessUnit !== effectiveCategory) return false;
      if (!checkDateMatch(o.createdAt)) return false;
      return leadIds.has(o.leadId) || (o.company === 'GLOBALINCH' && effectiveCompany === 'GLOBALINCH');
    });
  }, [db.orders, filteredLeads, effectiveCompany, effectiveCategory, startDate, endDate]);

  // 4. Filter Captured Payments
  const filteredCaptured = useMemo(() => {
    const orderIds = new Set(filteredOrders.map(o => o.id));
    return db.capturedPayments.filter(cp => {
      const capDate = cp.capturedAt || (cp as any).createdAt;
      if (!checkDateMatch(capDate)) return false;
      if (effectiveCompany === 'GLOBALINCH' && (cp.accountCode === 'GLOBAL_INCH' || cp.razorpayAccount === 'RZP_GLOBALINCH')) {
        return true;
      }
      return orderIds.has(cp.orderId);
    });
  }, [db.capturedPayments, filteredOrders, effectiveCompany, startDate, endDate]);

  // 5. Filter Payment Attempts (Captured vs Failed)
  const filteredAttempts = useMemo(() => {
    const orderIds = new Set(filteredOrders.map(o => o.id));
    return db.paymentAttempts.filter(pa => {
      const attDate = pa.timestamp || pa.createdAt;
      if (!checkDateMatch(attDate)) return false;
      if (effectiveCompany === 'GLOBALINCH' && (pa.accountCode === 'GLOBAL_INCH' || pa.razorpayAccount === 'RZP_GLOBALINCH')) {
        return true;
      }
      return orderIds.has(pa.orderId);
    });
  }, [db.paymentAttempts, filteredOrders, effectiveCompany, startDate, endDate]);

  // Failed attempts for recovery calculations
  const failedAttempts = useMemo(() => {
    return filteredAttempts.filter(a => a.status === 'FAILED');
  }, [filteredAttempts]);

  const failedRevenue = useMemo(() => {
    return failedAttempts.reduce((sum, a) => sum + (a.amount || 0), 0);
  }, [failedAttempts]);

  // Aggregated KPI numbers
  const grossCapturedRevenue = filteredCaptured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);
  const totalFees = filteredCaptured.reduce((sum, cp) => sum + (cp.fee || 0), 0);
  const totalTax = filteredCaptured.reduce((sum, cp) => sum + (cp.tax || 0), 0);
  
  const filteredRefunds = useMemo(() => {
    return db.refunds.filter(r => {
      const refDate = r.processedAt || r.createdAt;
      if (!checkDateMatch(refDate)) return false;
      if (effectiveCompany === 'GLOBALINCH') {
        return r.razorpayAccount === 'RZP_GLOBALINCH' || !r.razorpayAccount;
      }
      return true;
    });
  }, [db.refunds, effectiveCompany, startDate, endDate]);

  const totalRefundAmount = filteredRefunds.reduce((sum, r) => sum + (r.amount || r.refundAmount || 0), 0);
  const netRevenue = grossCapturedRevenue - totalRefundAmount - totalFees - totalTax;
  const totalLeads = filteredLeads.length;

  // Dynamic Report Language Intelligence Breakdown (Section 2B of requirements)
  const reportLanguageMetrics = useMemo(() => {
    const activeLp = dynamicFilter.landingPageSlug !== 'ALL' ? dynamicFilter.landingPageSlug : 'fb4';

    const lpLeads = db.leads.filter(l => {
      const slugMatch = l.landingPageSlug === activeLp || (!l.landingPageSlug && activeLp === 'fb4');
      if (!slugMatch) return false;
      if (!checkDateMatch(l.createdAt)) return false;
      return true;
    });

    const leadIds = new Set(lpLeads.map(l => l.id));
    const lpOrders = db.orders.filter(o => leadIds.has(o.leadId) && checkDateMatch(o.createdAt));

    // Discover distinct languages
    const languages = Array.from(new Set(lpLeads.map(l => l.reportLanguage).filter(Boolean))) as string[];
    if (!languages.some(lang => lang.toLowerCase().includes('english'))) languages.push('Vastu Wheels English FB4');
    if (!languages.some(lang => lang.toLowerCase().includes('hindi'))) languages.push('Vastu Wheels Hindi FB4');

    const result = languages.map(lang => {
      const isEnglish = lang.toLowerCase().includes('english');
      const isHindi = lang.toLowerCase().includes('hindi');

      const langLeads = lpLeads.filter(l => l.reportLanguage === lang || (isEnglish && l.reportLanguage?.toLowerCase().includes('english')) || (isHindi && l.reportLanguage?.toLowerCase().includes('hindi')));
      const langLeadIds = new Set(langLeads.map(l => l.id));
      const langOrders = lpOrders.filter(o => langLeadIds.has(o.leadId));
      const langOrderIds = new Set(langOrders.map(o => o.id));

      const langCaptured = db.capturedPayments.filter(cp => langOrderIds.has(cp.orderId) && checkDateMatch(cp.capturedAt || (cp as any).createdAt));
      const langAttempts = db.paymentAttempts.filter(pa => langOrderIds.has(pa.orderId) && checkDateMatch(pa.timestamp || pa.createdAt));
      const langFailed = langAttempts.filter(pa => pa.status === 'FAILED');

      const capturedRevenue = langCaptured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);
      const totalOrdersCount = langOrders.length || langLeads.length;
      const paidCount = langCaptured.length;
      const failedCount = langFailed.length;
      const conversionRate = totalOrdersCount > 0 ? (paidCount / totalOrdersCount) * 100 : 0;

      return {
        language: lang,
        displayName: isEnglish ? 'English Reports (FB4)' : isHindi ? 'Hindi Reports (FB4)' : lang,
        totalReports: totalOrdersCount,
        paidCount,
        capturedRevenue,
        failedCount,
        conversionRate,
      };
    });

    const totalReports = result.reduce((s, r) => s + r.totalReports, 0);
    const totalPaid = result.reduce((s, r) => s + r.paidCount, 0);
    const totalRevenue = result.reduce((s, r) => s + r.capturedRevenue, 0);
    const totalFailed = result.reduce((s, r) => s + r.failedCount, 0);
    const overallConversion = totalReports > 0 ? (totalPaid / totalReports) * 100 : 0;

    return {
      activeLp,
      languages: result,
      totalReports,
      totalPaid,
      totalRevenue,
      totalFailed,
      overallConversion,
    };
  }, [db.leads, db.orders, db.capturedPayments, db.paymentAttempts, dynamicFilter.landingPageSlug, startDate, endDate]);

  const totalAttempts = filteredAttempts.length;
  const capturedAttemptsCount = filteredAttempts.filter(a => a.status === 'CAPTURED').length;
  const successRate = totalAttempts > 0 ? (capturedAttemptsCount / totalAttempts) * 100 : 0;

  // AI-Assisted Revenue
  const connectedLeadIds = new Set(
    db.aiCalls.filter(c => c.status === 'CONNECTED' && c.leadId).map(c => c.leadId as string)
  );
  const aiAssistedRevenue = filteredCaptured
    .filter(cp => {
      const order = db.orders.find(o => o.id === cp.orderId);
      return order && connectedLeadIds.has(order.leadId);
    })
    .reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);

  // Meta Marketing spend calculation for active scope
  const totalMetaSpend = useMemo(() => {
    let insights = db.metaDailyInsights;
    if (effectiveCategory !== 'ALL') {
      insights = insights.filter(m => m.businessUnit === effectiveCategory);
    }
    const spend = insights.reduce((sum, m) => sum + (m.spend || 0), 0);
    return spend > 0 ? spend : 142500;
  }, [db.metaDailyInsights, effectiveCategory]);

  const blendedRoas = totalMetaSpend > 0 ? grossCapturedRevenue / totalMetaSpend : 0;
  const metaImpressions = Math.round(totalMetaSpend * 22.4);
  const metaClicks = Math.round(totalMetaSpend * 0.48);
  const metaCpl = totalLeads > 0 ? Math.round(totalMetaSpend / totalLeads) : 48;
  const metaCtr = metaImpressions > 0 ? (metaClicks / metaImpressions) * 100 : 2.14;
  const metaCpc = metaClicks > 0 ? totalMetaSpend / metaClicks : 2.08;

  // Filtered Meta Campaigns for Deep Dive
  const filteredMetaCampaigns = useMemo(() => {
    let list = db.metaDailyInsights;
    if (effectiveCategory !== 'ALL') {
      list = list.filter(m => m.businessUnit === effectiveCategory);
    }
    if (metaSearch) {
      const q = metaSearch.toLowerCase();
      list = list.filter(m =>
        m.campaignName.toLowerCase().includes(q) ||
        (m.metaCampaignId && m.metaCampaignId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [db.metaDailyInsights, effectiveCategory, metaSearch]);

  // Filtered Razorpay Transactions for Deep Dive
  const filteredRazorpayTx = useMemo(() => {
    let list = filteredCaptured;
    if (razorpayMethodFilter !== 'ALL') {
      list = list.filter(cp => {
        const method = (cp.paymentMethod || 'UPI').toUpperCase();
        if (razorpayMethodFilter === 'UPI') return method.includes('UPI');
        if (razorpayMethodFilter === 'CARD') return method.includes('CARD') || method.includes('VISA') || method.includes('MASTERCARD');
        if (razorpayMethodFilter === 'NETBANKING') return method.includes('NETBANKING') || method.includes('BANK');
        return true;
      });
    }
    if (razorpaySearch) {
      const q = razorpaySearch.toLowerCase();
      list = list.filter(cp => {
        const order = db.orders.find(o => o.id === cp.orderId);
        const lead = order ? db.leads.find(l => l.id === order.leadId) : null;
        const customer = lead ? db.customers.find(c => c.id === lead.customerId) : null;
        return (
          (cp.razorpayPaymentId && cp.razorpayPaymentId.toLowerCase().includes(q)) ||
          (cp.razorpayOrderId && cp.razorpayOrderId.toLowerCase().includes(q)) ||
          (customer?.fullName && customer.fullName.toLowerCase().includes(q)) ||
          (customer?.phone && customer.phone.includes(q))
        );
      });
    }
    return list;
  }, [filteredCaptured, db.orders, db.leads, db.customers, razorpaySearch, razorpayMethodFilter]);

  // Paginated Leads
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calling List Export
  const handleExportCallingList = () => {
    const rows = filteredLeads.map(lead => {
      const customer = db.customers.find(c => c.id === lead.customerId);
      const order = db.orders.find(o => o.leadId === lead.id);
      const attempt = db.paymentAttempts.find(p => p.orderId === order?.id);
      return {
        'Customer Name': customer?.fullName || 'Prospect Visitor',
        'Mobile Phone Number': customer?.phone || customer?.primaryPhone || 'N/A',
        'City': customer?.city || 'N/A',
        'Company': lead.company || 'Mango Tree Technology',
        'Category': lead.businessUnit,
        'Order Amount (INR)': order?.amount || 0,
        'Payment Status': attempt?.status || (lead.status === 'PAYMENT_COMPLETED' ? 'CAPTURED' : 'PENDING'),
        'Decline Reason': attempt?.errorMessage || (attempt?.status === 'FAILED' ? 'Bank Gateway Timeout' : 'None'),
        'Landing Page': lead.landingPageSlug || '',
        'Ad Creative': lead.adCreativeName || 'Default Creative',
        'AI Call': lead.aiCallStatus || 'None',
        'Captured Revenue': lead.capturedRevenue || 0,
        'Created Date': lead.createdAt || ''
      };
    });
    const filename = dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE'
      ? `Failed_Payment_Recovery_${new Date().toISOString().slice(0, 10)}`
      : `Master_Calling_Sheet_${new Date().toISOString().slice(0, 10)}`;
    exportToXLSX(rows, filename);
  };

  const handleExportSnapshot = () => {
    const rows = [
      { Metric: 'Active Scope Company', Value: effectiveCompany },
      { Metric: 'Active Scope Category', Value: effectiveCategory },
      { Metric: 'Gross Captured Revenue', Value: grossCapturedRevenue },
      { Metric: 'Net Bank Settled Revenue', Value: netRevenue },
      { Metric: 'Gateway Fees & Tax', Value: totalFees + totalTax },
      { Metric: 'Total Leads Ingested', Value: totalLeads },
      { Metric: 'Payment Attempts', Value: totalAttempts },
      { Metric: 'Payment Success Rate', Value: `${successRate.toFixed(1)}%` },
      { Metric: 'At-Risk / Failed Revenue', Value: failedRevenue },
      { Metric: 'Failed Payment Count', Value: failedAttempts.length },
      { Metric: 'AI-Assisted Revenue', Value: aiAssistedRevenue },
      { Metric: 'Meta Marketing Spend', Value: totalMetaSpend },
      { Metric: 'Blended ROAS', Value: `${blendedRoas.toFixed(2)}x` }
    ];
    exportToXLSX(rows, 'Merged_Company_Analytics_Snapshot');
  };

  const handleExportMeta = () => {
    const rows = filteredMetaCampaigns.map(c => ({
      'Campaign Name': c.campaignName,
      'Meta Campaign ID': c.metaCampaignId || c.campaignId || '',
      'Business Unit': c.businessUnit,
      'Spend (INR)': c.spend || 0,
      'Impressions': c.impressions || 0,
      'Clicks': c.clicks || 0,
      'CTR': c.impressions ? ((c.clicks / c.impressions) * 100).toFixed(2) + '%' : '0%',
      'Leads': c.leads || 0,
      'CPL (INR)': c.leads ? Math.round((c.spend || 0) / c.leads) : 0,
      'Purchases Value (INR)': c.purchaseValue || 0,
      'ROAS': c.spend ? ((c.purchaseValue || 0) / c.spend).toFixed(2) + 'x' : '0x'
    }));
    exportToXLSX(rows, `Meta_Ads_Analytics_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportRazorpay = () => {
    const rows = filteredRazorpayTx.map(cp => {
      const order = db.orders.find(o => o.id === cp.orderId);
      const lead = order ? db.leads.find(l => l.id === order.leadId) : null;
      const customer = lead ? db.customers.find(c => c.id === lead.customerId) : null;
      return {
        'Razorpay Payment ID': cp.razorpayPaymentId || cp.id,
        'Razorpay Order ID': cp.razorpayOrderId || cp.orderId,
        'Customer Name': customer?.fullName || 'Customer',
        'Customer Phone': customer?.phone || 'N/A',
        'Gross Amount (INR)': cp.amount || cp.capturedAmount || 0,
        'Gateway Fee (INR)': cp.fee || 0,
        'Tax (INR)': cp.tax || 0,
        'Net Bank Settlement': (cp.amount || 0) - (cp.fee || 0) - (cp.tax || 0),
        'Payment Method': cp.paymentMethod || 'UPI',
        'Status': 'CAPTURED',
        'Timestamp': cp.capturedAt || '2026-10-30'
      };
    });
    exportToXLSX(rows, `Razorpay_Settlement_Sheet_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* =========================================================================
          TOP LEVEL PERSPECTIVE SWITCHER: ALL | META ADS | RAZORPAY
          Positioned directly between TopNav (Vastu Shikhar Astrology) & KPI Cards!
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-[#10121a] p-1.5 shadow-xl">
            {/* 1. ALL UNIFIED OVERVIEW */}
            <button
              onClick={() => setPerspectiveTab('ALL')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                perspectiveTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>All Unified Overview</span>
            </button>

            {/* 2. META ADS DEEP DIVE */}
            <button
              onClick={() => setPerspectiveTab('META')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                perspectiveTab === 'META'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Globe className="h-4 w-4 text-blue-400" />
              <span>Meta Ads Intelligence</span>
              <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-1.5 py-0.2 text-[9px] font-mono text-blue-300">
                META API
              </span>
            </button>

            {/* 3. RAZORPAY GATEWAY DEEP DIVE */}
            <button
              onClick={() => setPerspectiveTab('RAZORPAY')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                perspectiveTab === 'RAZORPAY'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>Razorpay Financial Gateway</span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                SETTLEMENTS
              </span>
            </button>
          </div>
        </div>

        {/* Active Scope Badge */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span>Active Scope:</span>
          <span className="rounded-lg border border-zinc-700 bg-zinc-800/90 px-2.5 py-1 text-zinc-100 font-bold">
            {effectiveCompany.replace(/_/g, ' ')} › {effectiveCategory}
          </span>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ALL UNIFIED OVERVIEW (EXISTING FULL VIEW)
          ========================================================================= */}
      {perspectiveTab === 'ALL' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. DYNAMIC KPI SECTION: ADAPTS TO FILTER PRESET */}
          {dynamicFilter.preset === 'FAILED_PAYMENTS_QUEUE' ? (
            // RECOVERY KPI CARDS
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ShopifyMetricCard
                title="At-Risk / Lost Revenue"
                tooltipText="Total amount in cart checkouts that failed at bank or UPI gateway"
                value={formatCurrency(failedRevenue || 78500)}
                trend={{ value: '18% at risk', isPositive: false }}
                subtitle="Needs tele-calling recovery"
                sparklineData={[40, 55, 60, 75, 65, 80, 85, 95]}
                sparklineColor="#de3618"
              />

              <ShopifyMetricCard
                title="Failed Payment Attempts"
                tooltipText="Total attempts declined by issuing bank, UPI timeout, or card limit"
                value={formatNumber(failedAttempts.length || 78)}
                trend={{ value: `${failedAttempts.length} leads`, isPositive: false }}
                subtitle="Direct customer callback queue"
                sparklineData={[20, 28, 35, 45, 52, 60, 70, 78]}
                sparklineColor="#de3618"
              />

              <ShopifyMetricCard
                title="AI Voice Recovery Rate"
                tooltipText="Percentage of failed leads converted to captured after Pooja automated call"
                value="41.2%"
                trend={{ value: '41.2%', isPositive: true }}
                subtitle="Pooja AI Voice Telephony"
                sparklineData={[15, 20, 25, 30, 32, 38, 40, 41]}
                sparklineColor="#008060"
              />

              <ShopifyMetricCard
                title="Target Calling Queue"
                tooltipText="Unique customer phone numbers ready for immediate 1-click agent dial"
                value={formatNumber(filteredLeads.length)}
                trend={{ value: 'Active Queue', isPositive: true }}
                subtitle="1-Click WhatsApp & Voice dial"
                sparklineData={[10, 20, 30, 45, 60, 75, 90, 100]}
                sparklineColor="#2c6ecb"
              />
            </div>
          ) : dynamicFilter.preset === 'ADS_VS_RAZORPAY_ROAS' ? (
            // ROAS KPI CARDS
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ShopifyMetricCard
                title="Total Meta Ad Spend"
                tooltipText="Combined advertising capital invested across Meta Facebook & Instagram campaigns"
                value={formatCurrency(totalMetaSpend)}
                trend={{ value: 'Meta Verified', isPositive: true }}
                subtitle={`${formatNumber(metaImpressions)} Impressions`}
                sparklineData={[12, 18, 24, 32, 45, 60, 72, 85]}
                sparklineColor="#7c3aed"
              />

              <ShopifyMetricCard
                title="Gross Razorpay Volume"
                tooltipText="Total payments successfully captured across Razorpay accounts"
                value={formatCurrency(grossCapturedRevenue)}
                trend={{ value: '64%', isPositive: true }}
                subtitle={`${formatNumber(filteredOrders.length)} Orders Captured`}
                sparklineData={[15, 22, 30, 42, 55, 68, 80, 95]}
                sparklineColor="#008060"
              />

              <ShopifyMetricCard
                title="Blended Multi-Channel ROAS"
                tooltipText="Return on Ad Spend: Razorpay Gross Captured Revenue divided by Meta Ads Spend"
                value={`${blendedRoas.toFixed(2)}x`}
                trend={{ value: `${blendedRoas.toFixed(2)}x ROAS`, isPositive: blendedRoas >= 2.0 }}
                subtitle="Profitable Unit Economics"
                sparklineData={[1.8, 2.1, 2.4, 2.8, 3.1, 3.3, 3.42, 3.5]}
                sparklineColor="#008060"
              />

              <ShopifyMetricCard
                title="Cost Per Lead (CPL)"
                tooltipText="Average Meta advertising cost incurred per ingested lead form"
                value={formatCurrency(metaCpl)}
                trend={{ value: 'Target < ₹60', isPositive: true }}
                subtitle={`${formatNumber(totalLeads)} Ingested Leads`}
                sparklineData={[65, 62, 58, 55, 52, 50, 48, 46]}
                sparklineColor="#2c6ecb"
              />
            </div>
          ) : (
            // DEFAULT MERGED KPI CARDS
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ShopifyMetricCard
                title="Gross captured sales"
                tooltipText="Total gross sales settled across active company and category scopes"
                value={formatCurrency(grossCapturedRevenue)}
                trend={{ value: '63%', isPositive: true }}
                subtitle={`${effectiveCompany.replace(/_/g, ' ')} • ${effectiveCategory}`}
                sparklineData={[12, 14, 18, 24, 30, 28, 45, 62, 75]}
                sparklineColor="#2c6ecb"
              />

              <ShopifyMetricCard
                title="Payment Success Rate"
                tooltipText="Percentage of checkout payment attempts captured without bank decline"
                value={`${successRate.toFixed(1)}%`}
                trend={{ value: `${successRate.toFixed(1)}%`, isPositive: successRate >= 70 }}
                subtitle={`${capturedAttemptsCount} of ${totalAttempts} Attempts`}
                sparklineData={[65, 68, 70, 72, 75, 78, 81, 84]}
                sparklineColor="#008060"
              />

              <ShopifyMetricCard
                title="Orders fulfilled"
                tooltipText="Total digital reports, yantras, and consultation links delivered"
                value={formatNumber(filteredOrders.length)}
                trend={{ value: '50%', isPositive: true }}
                subtitle="100% digital webhook delivery"
                sparklineData={[15, 25, 40, 35, 60, 75, 85, 98]}
                sparklineColor="#008060"
              />

              <ShopifyMetricCard
                title="Total Leads Ingested"
                tooltipText="Total verified prospects ingested across landing pages and webinar funnels"
                value={formatNumber(totalLeads)}
                trend={{ value: '+520 / category', isPositive: true }}
                subtitle="Meta Ads + Direct Organic"
                sparklineData={[10, 15, 20, 30, 45, 60, 80, 95]}
                sparklineColor="#2c6ecb"
              />
            </div>
          )}

          {/* 1.5. REPORT LANGUAGE INTELLIGENCE (SECTION 2B: FB4 ENGLISH VS HINDI DYNAMIC BREAKDOWN) */}
          <div className="rounded-xl border border-zinc-800 bg-[#0f1117] p-5 shadow-xl text-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Landing Page Report Language Intelligence: /{reportLanguageMetrics.activeLp}
                    </h3>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/20">
                      NOTES ATTRIBUTION
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Verified Razorpay Notes report_language breakdown for funnel route <code className="text-purple-300 font-mono">https://report.globalinch.com/{reportLanguageMetrics.activeLp}</code>
                  </p>
                </div>
              </div>

              {/* Language Filter Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  onClick={() => setDynamicFilter(prev => ({ ...prev, reportLanguage: 'ALL', reportLanguages: [] }))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    dynamicFilter.reportLanguage === 'ALL' && (!dynamicFilter.reportLanguages || dynamicFilter.reportLanguages.length === 0)
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({reportLanguageMetrics.totalReports})
                </button>
                {reportLanguageMetrics.languages.map(l => {
                  const isLangActive = dynamicFilter.reportLanguage === l.language || (dynamicFilter.reportLanguages && dynamicFilter.reportLanguages.includes(l.language));
                  return (
                    <button
                      key={l.language}
                      onClick={() => setDynamicFilter(prev => ({ ...prev, reportLanguage: l.language, reportLanguages: [l.language] }))}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        isLangActive
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {l.displayName.includes('English') ? 'English' : l.displayName.includes('Hindi') ? 'Hindi' : l.displayName} ({l.totalReports})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Language Performance Breakdown */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {reportLanguageMetrics.languages.map(l => {
                const isEnglish = l.language.toLowerCase().includes('english');
                return (
                  <div
                    key={l.language}
                    className={`rounded-xl p-3.5 border transition-all ${
                      isEnglish
                        ? 'border-blue-500/30 bg-blue-950/20 shadow-sm'
                        : 'border-amber-500/30 bg-amber-950/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                      <span className={`text-xs font-bold ${isEnglish ? 'text-blue-300' : 'text-amber-300'}`}>
                        {l.displayName}
                      </span>
                      <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-300">
                        {l.conversionRate.toFixed(1)}% CVR
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Total Orders</span>
                        <span className="text-base font-extrabold text-white">{formatNumber(l.totalReports)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Paid / Captured</span>
                        <span className="text-base font-extrabold text-emerald-400">{formatNumber(l.paidCount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Captured Rev</span>
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">{formatCurrency(l.capturedRevenue)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Failed Orders</span>
                        <span className="text-sm font-extrabold text-rose-400 font-mono">{formatNumber(l.failedCount)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total Summary Column */}
              <div className="rounded-xl p-3.5 border border-purple-500/30 bg-purple-950/20 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <span className="text-xs font-bold text-purple-300">
                    Total Funnel Aggregation
                  </span>
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                    {reportLanguageMetrics.overallConversion.toFixed(1)}% Avg CVR
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase">Total Orders</span>
                    <span className="text-base font-extrabold text-white">{formatNumber(reportLanguageMetrics.totalReports)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase">Paid / Captured</span>
                    <span className="text-base font-extrabold text-emerald-400">{formatNumber(reportLanguageMetrics.totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase">Total Captured Rev</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">{formatCurrency(reportLanguageMetrics.totalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase">Failed Orders</span>
                    <span className="text-sm font-extrabold text-rose-400 font-mono">{formatNumber(reportLanguageMetrics.totalFailed)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SIDE-BY-SIDE: META ADS RECONCILIATION VS RAZORPAY FINANCIAL GATEWAY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT: META ADS PERFORMANCE RECONCILIATION */}
            <div className="rounded-xl border border-zinc-800 bg-[#0f1117] p-5 shadow-xl text-zinc-200">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Meta Ads Performance</h3>
                    <p className="text-[11px] text-zinc-400">Paid Acquisition Attribution (Facebook & Instagram)</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/20">
                  Live API Sync
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Ad Spend</span>
                  <p className="text-base font-bold text-white mt-0.5">{formatCurrency(totalMetaSpend)}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Impressions</span>
                  <p className="text-base font-bold text-zinc-200 mt-0.5">{formatNumber(metaImpressions)}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Clicks / CTR</span>
                  <p className="text-base font-bold text-zinc-200 mt-0.5">{formatNumber(metaClicks)} <span className="text-xs text-emerald-400">(2.1%)</span></p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Cost Per Lead</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{formatCurrency(metaCpl)}</p>
                </div>
              </div>

              {/* Top Video Creatives Breakdown */}
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Top Meta Video Creatives</span>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 p-2 border border-zinc-800/80">
                    <span className="text-zinc-300 truncate max-w-[240px]">Video 01 - Problem Agitation & House Energy</span>
                    <span className="text-emerald-400 font-semibold">₹42 CPL • 3.8x ROAS</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 p-2 border border-zinc-800/80">
                    <span className="text-zinc-300 truncate max-w-[240px]">Video 02 - Kundali Dosha Remedies Testimonial</span>
                    <span className="text-emerald-400 font-semibold">₹48 CPL • 3.2x ROAS</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 p-2 border border-zinc-800/80">
                    <span className="text-zinc-300 truncate max-w-[240px]">Video 03 - Palmistry AI Scanning Feature</span>
                    <span className="text-blue-400 font-semibold">₹54 CPL • 2.9x ROAS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: RAZORPAY FINANCIAL GATEWAY RECONCILIATION */}
            <div className="rounded-xl border border-zinc-800 bg-[#0f1117] p-5 shadow-xl text-zinc-200">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Razorpay Financial Gateway</h3>
                    <p className="text-[11px] text-zinc-400">Direct Webhook Reconciled Net Payouts</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
                  Settled Daily
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Gross Captured</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{formatCurrency(grossCapturedRevenue)}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Success Rate</span>
                  <p className="text-base font-bold text-white mt-0.5">{successRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Fees + Tax</span>
                  <p className="text-base font-bold text-zinc-400 mt-0.5">{formatCurrency(totalFees + totalTax)}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Net Bank Payout</span>
                  <p className="text-base font-bold text-white mt-0.5">{formatCurrency(netRevenue)}</p>
                </div>
              </div>

              {/* Unit Economics Summary */}
              <div className="mt-4 divide-y divide-zinc-800 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-zinc-400">Blended Marketing ROAS</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{blendedRoas.toFixed(2)}x Multiple</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-zinc-400">At-Risk Failed Checkout Volume</span>
                  <span className="font-mono text-rose-400 font-semibold">{formatCurrency(failedRevenue)} ({failedAttempts.length} leads)</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-zinc-400">AI Voice Telephony Recovered Sales</span>
                  <span className="font-mono text-blue-400 font-semibold">{formatCurrency(aiAssistedRevenue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. LANDMARK CASE: RAVI KUMAR PROOF BANNER */}
          <div className="rounded-xl border border-zinc-800 bg-[#0f1117] p-4 text-zinc-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Recovery Landmark Proof: Ravi Kumar (lead_ravi_001 • GlobalInch Palmistry)
                    </span>
                    <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                      ₹999.00 CAPTURED
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Attempt 1 FAILED (Insufficient funds) ➔ Attempt 2 FAILED (Timeout) ➔ AI Call CONNECTED (Agent Pooja, 135s) ➔ Attempt 3 CAPTURED (₹999).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLeadId('lead_ravi_001')}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all shrink-0"
              >
                <span>Inspect Ravi Timeline</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* 4. UNIFIED LEADS & RECOVERY TABLE WITH INTEGRATED SHOPIFY FILTER ENGINE */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] shadow-xl text-zinc-200 relative overflow-visible">
            <ShopifyDynamicFilterEngine isAttachedToTable={true} />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase text-zinc-400 bg-zinc-900/50">
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">Company & Track</th>
                    <th className="p-3.5">Ad Creative</th>
                    <th className="p-3.5">Payment State</th>
                    <th className="p-3.5">AI Telephony</th>
                    <th className="p-3.5">Order Value</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {paginatedLeads.map(lead => {
                    const customer = db.customers.find(c => c.id === lead.customerId);
                    const order = db.orders.find(o => o.leadId === lead.id);
                    const attempt = order ? db.paymentAttempts.find(p => p.orderId === order.id) : null;
                    const paymentState = attempt?.status || (lead.status === 'PAYMENT_COMPLETED' ? 'CAPTURED' : 'PENDING');

                    return (
                      <tr key={lead.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{customer?.fullName || 'Prospect Lead'}</span>
                          <span className="font-mono text-[11px] text-zinc-400">{customer?.phone || 'N/A'} • {customer?.city || 'India'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-zinc-200 block">{lead.company?.replace(/_/g, ' ') || 'Vastu Shikhar'}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{lead.businessUnit}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-zinc-300 font-medium">{lead.adCreativeName || 'Video 01 (House Energy)'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            paymentState === 'CAPTURED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : paymentState === 'FAILED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {paymentState}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-mono text-zinc-300">{lead.aiCallStatus || 'NOT_DIALED'}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {formatCurrency(order?.amount || 999)}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800">
              <span>
                Page {currentPage} of {totalPages} ({filteredLeads.length} total records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: META ADS DEEP DIVE COMMAND CENTER
          Everything needed to analyze Meta performance, creatives & campaigns
          ========================================================================= */}
      {perspectiveTab === 'META' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Meta KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ShopifyMetricCard
              title="Total Meta Ad Spend"
              tooltipText="Combined advertising capital invested across active Meta campaigns"
              value={formatCurrency(totalMetaSpend)}
              trend={{ value: '100% Paced', isPositive: true }}
              subtitle="Daily Pacing on Budget"
              sparklineData={[25, 35, 45, 60, 75, 85, 90, 100]}
              sparklineColor="#3b82f6"
            />

            <ShopifyMetricCard
              title="Total Leads Ingested"
              tooltipText="Verified leads generated through Meta Lead Gen & Webhook forms"
              value={formatNumber(totalLeads)}
              trend={{ value: `${totalLeads} Leads`, isPositive: true }}
              subtitle="Verified Form Submissions"
              sparklineData={[15, 25, 40, 55, 70, 85, 95, 100]}
              sparklineColor="#3b82f6"
            />

            <ShopifyMetricCard
              title="Cost Per Lead (CPL)"
              tooltipText="Average Meta advertising cost incurred per verified ingested lead"
              value={formatCurrency(metaCpl)}
              trend={{ value: 'Target < ₹60', isPositive: metaCpl <= 80 }}
              subtitle="Blended Acquisition Cost"
              sparklineData={[85, 80, 78, 75, 72, 70, 68, 65]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="Blended Multi-Channel ROAS"
              tooltipText="Return on Ad Spend: Razorpay Gross Collections divided by Meta Ad Spend"
              value={`${blendedRoas.toFixed(2)}x`}
              trend={{ value: `${blendedRoas.toFixed(2)}x ROAS`, isPositive: blendedRoas >= 2.0 }}
              subtitle="High Margin Multiplier"
              sparklineData={[2.1, 2.5, 2.8, 3.1, 3.3, 3.5, 3.82, 3.9]}
              sparklineColor="#008060"
            />
          </div>

          {/* Secondary Meta Telemetry Strip - Matching Shopify Analytics Design Standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ShopifyMetricCard
              title="Total Impressions & Reach"
              tooltipText="Pan-India advertising reach across Facebook Reels, Instagram Feed & Audience Network"
              value={formatNumber(metaImpressions)}
              trend={{ value: 'Pan-India Reach', isPositive: true }}
              subtitle="CPM: ₹48.20 • 98.4% Mobile Ingestion"
              sparklineData={[30, 42, 58, 70, 78, 85, 92, 100]}
              sparklineColor="#3b82f6"
            />

            <ShopifyMetricCard
              title="Link Clicks & Outbound CTR"
              tooltipText="Total outbound link clicks navigating prospects to Vastu & Astrology landing pages"
              value={formatNumber(metaClicks)}
              trend={{ value: `${metaCtr.toFixed(2)}% CTR`, isPositive: true }}
              subtitle="High Intent Funnel Traffic"
              sparklineData={[18, 28, 42, 54, 66, 78, 88, 98]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="Average CPC (Cost Per Click)"
              tooltipText="Effective blended cost per unique outbound link click across campaigns"
              value={formatCurrency(metaCpc)}
              trend={{ value: 'Target < ₹3.00', isPositive: metaCpc <= 3.0 }}
              subtitle="Optimized Broad Bid Strategy"
              sparklineData={[3.8, 3.4, 3.1, 2.8, 2.5, 2.2, 2.08]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="Creative Frequency Pacing"
              tooltipText="Average impressions served per unique user before creative ad fatigue"
              value="2.41 Avg"
              trend={{ value: 'Optimal Buffer', isPositive: true }}
              subtitle="Sub-3.0 Saturation Threshold"
              sparklineData={[1.8, 1.9, 2.1, 2.2, 2.3, 2.38, 2.41]}
              sparklineColor="#8b5cf6"
            />
          </div>

          {/* Video Creatives Attribution & ROAS Studio (Motion App & Triple Whale Standard) */}
          <div className="rounded-2xl border border-zinc-800 bg-[#12141c] p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">Meta Video Creatives Attribution Studio</h3>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      4 ASSETS IN ROTATION
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">Creative-level ROAS, 3-sec hook retention, drop-off hold rate, and scaling recommendations</p>
                </div>
              </div>

              {/* Creative Filter Tabs */}
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                <button
                  onClick={() => setCreativeFilter('ALL')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    creativeFilter === 'ALL'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All Creatives (4)
                </button>
                <button
                  onClick={() => setCreativeFilter('WINNERS')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    creativeFilter === 'WINNERS'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🏆 Top ROAS &gt; 3.0x
                </button>
                <button
                  onClick={() => setCreativeFilter('SCALING')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    creativeFilter === 'SCALING'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⚡ Active Scaling
                </button>
              </div>
            </div>

            {/* Creative Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                {
                  id: 'vid_01',
                  name: 'Video 01 - House Energy & Negative Vastu Agitation',
                  format: '9:16 Vertical Reel & Feed',
                  duration: '0:45',
                  spend: 156000,
                  leads: 2100,
                  cpl: 42.00,
                  roas: 3.82,
                  views: '384.2K',
                  hookRate: 78.4,
                  holdRate: 44.2,
                  ctr: 2.84,
                  tier: 'WINNER',
                  badgeText: '🏆 TOP ROAS WINNER • 3.82x',
                  badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                  hook: 'Kya aapke ghar me negative energy ka vaas hai? 3 lakshan jo batate hain ki aapka main entrance vastu dosha se prabhavit hai...',
                  scriptVO: 'Visual: Grandfather sitting stressed at main entrance. Voiceover: "Agar ghar me har mahine koi na koi beemar rehta hai ya paisa aakar bhi nahi tikta, toh ye South-West entrance dosha ho sakta hai. Vastu Shikhar expert se 1-on-1 live consultation book karein."',
                  ctaText: 'Swipe Up to Consult Vastu Acharya'
                },
                {
                  id: 'vid_02',
                  name: 'Video 02 - Kundali Dosha Remedies Testimonial',
                  format: '9:16 UGC Testimonial Reel',
                  duration: '1:00',
                  spend: 120000,
                  leads: 1600,
                  cpl: 48.00,
                  roas: 3.20,
                  views: '298.5K',
                  hookRate: 71.2,
                  holdRate: 38.6,
                  ctr: 2.45,
                  tier: 'SCALING',
                  badgeText: '🔥 SCALING ASSET • 3.20x',
                  badgeColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                  hook: '15 din me badla grah gochar - Sunita Sharma live case study sharing how Vedic gem remedy solved marriage delay...',
                  scriptVO: 'Visual: Mother and daughter smiling. Voiceover: "3 saal se beti ke rishte me rukawat aa rahi thi, Manglik dosha ki wajah se. Vastu Shikhar acharya ji ke bataye ek simple gemstone remedy se 15 din me baat pakki ho gayi!"',
                  ctaText: 'Get Kundali Matchmaking Report'
                },
                {
                  id: 'vid_03',
                  name: 'Video 03 - Palmistry AI Instant Hand Scanner',
                  format: '9:16 Interactive Demo',
                  duration: '0:30',
                  spend: 85000,
                  leads: 1150,
                  cpl: 54.00,
                  roas: 2.90,
                  views: '210.4K',
                  hookRate: 68.5,
                  holdRate: 35.1,
                  ctr: 3.12,
                  tier: 'SCALING',
                  badgeText: '⚡ HIGH CTR DEMO • 2.90x',
                  badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                  hook: 'Apni hatheli ka photo upload karein aur 30 seconds me payein kundali aur bhagya rekha ka satik vishleshan...',
                  scriptVO: 'Visual: Screen scanning user palm with green laser guide. Voiceover: "Kya aapki hatheli me \'M\' ka nishan hai? Scan karein apni palm aur jaaniye 2026 me kab shuru hoga aapka golden time."',
                  ctaText: 'Scan Palm Now on WhatsApp'
                },
                {
                  id: 'vid_04',
                  name: 'Video 04 - Astrology Live Masterclass Cohort',
                  format: '16:9 Direct Offer Promo',
                  duration: '0:40',
                  spend: 29000,
                  leads: 350,
                  cpl: 82.00,
                  roas: 2.10,
                  views: '94.1K',
                  hookRate: 52.0,
                  holdRate: 24.3,
                  ctr: 1.65,
                  tier: 'FATIGUE',
                  badgeText: '⚠️ AUDIENCE FATIGUE • 2.10x',
                  badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                  hook: '3 din me seekhein vedic astrology ke gupt sutra with certificate - batch starting this Saturday...',
                  scriptVO: 'Visual: Astrologer analyzing live chart on digital screen. Voiceover: "Astrology seekhna ab aasan hai. Bina kisi kathin shlok ke, practical Kundali reading seekhein Vastu Shikhar ke saath."',
                  ctaText: 'Reserve Masterclass Seat ₹999'
                }
              ]
                .filter(c => {
                  if (creativeFilter === 'WINNERS') return c.roas >= 3.0;
                  if (creativeFilter === 'SCALING') return c.tier === 'SCALING' || c.tier === 'WINNER';
                  return true;
                })
                .map(creative => (
                  <div
                    key={creative.id}
                    className="rounded-xl border border-zinc-800 bg-[#161824] hover:border-zinc-700/80 transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg group"
                  >
                    {/* Header: Title & Badges */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                              {creative.format}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {creative.duration}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">
                            {creative.name}
                          </h4>
                        </div>
                        <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono font-bold whitespace-nowrap ${creative.badgeColor}`}>
                          {creative.badgeText}
                        </span>
                      </div>

                      {/* Simulated 16:9 Video Canvas Player */}
                      <div className="relative rounded-xl overflow-hidden border border-zinc-800/90 bg-gradient-to-br from-zinc-900 via-indigo-950/20 to-zinc-950 p-4">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2">
                          <span className="flex items-center gap-1.5 font-mono">
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                            {creative.views} Views
                          </span>
                          <span className="rounded bg-black/40 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                            🔥 {creative.hookRate}% 3s Hook
                          </span>
                        </div>

                        {/* Centered Mock Play Button & Hook Quote */}
                        <div className="my-2.5 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg backdrop-blur-sm group-hover:bg-blue-600 transition-all">
                            <Play className="h-4 w-4 fill-white ml-0.5" />
                          </div>
                          <p className="text-xs text-zinc-300 italic font-sans leading-relaxed line-clamp-2">
                            "{creative.hook}"
                          </p>
                        </div>

                        {/* Retention & Funnel Drop-off Bar */}
                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span>3s Hook: <strong className="text-white">{creative.hookRate}%</strong></span>
                          <span>15s Hold: <strong className="text-white">{creative.holdRate}%</strong></span>
                          <span>Outbound CTR: <strong className="text-emerald-400">{creative.ctr}%</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Attribution Telemetry (Shopify Standard 4-Col Grid) */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-center">
                      <div className="rounded-lg bg-zinc-900/60 p-2">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Spend</span>
                        <span className="text-xs font-bold font-mono text-white mt-0.5 block">
                          {formatCurrency(creative.spend)}
                        </span>
                      </div>
                      <div className="rounded-lg bg-zinc-900/60 p-2">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Leads</span>
                        <span className="text-xs font-bold font-mono text-blue-400 mt-0.5 block">
                          {formatNumber(creative.leads)}
                        </span>
                      </div>
                      <div className="rounded-lg bg-zinc-900/60 p-2">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">CPL</span>
                        <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
                          {formatCurrency(creative.cpl)}
                        </span>
                      </div>
                      <div className="rounded-lg bg-zinc-900/60 p-2">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">ROAS</span>
                        <span className="text-xs font-bold font-mono text-amber-400 mt-0.5 block">
                          {creative.roas.toFixed(2)}x
                        </span>
                      </div>
                    </div>

                    {/* Expandable Script & VO Drawer */}
                    {expandedScriptId === creative.id && (
                      <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 p-3 space-y-2 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                          <span>Creative Script & Voiceover Breakdown</span>
                          <span className="text-[10px] font-mono text-zinc-500">CTA: {creative.ctaText}</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed font-sans bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
                          {creative.scriptVO}
                        </p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => setExpandedScriptId(expandedScriptId === creative.id ? null : creative.id)}
                        className="text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>{expandedScriptId === creative.id ? 'Hide Script' : 'View Full Script'}</span>
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedScriptId === creative.id ? 'rotate-90' : ''}`} />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`Ad set inspection for ${creative.name}: Target audience Pan-India 25-55, Broad targeting active.`)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                        >
                          Inspect Ad Set
                        </button>
                        {creative.tier === 'WINNER' || creative.tier === 'SCALING' ? (
                          <button
                            onClick={() => alert(`Scaling recommendation applied: Meta Campaign budget scaled +25% for ${creative.name}`)}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-sm shadow-emerald-950"
                          >
                            Scale Budget +25%
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Creative angle refresh queued for ${creative.name}`)}
                            className="rounded-lg bg-amber-600/80 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600 transition-all"
                          >
                            Refresh Hook
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Live Meta Campaigns & Ad Sets Table (High-Density Enterprise Grid) */}
          <div className="rounded-2xl border border-zinc-800 bg-[#12141c] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Live Meta Campaigns & Ad Sets</h3>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-400">
                    {filteredMetaCampaigns.length} Active Campaigns
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Ingested via Meta Marketing Graph API • Real-time budget pacing and conversion metrics</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={metaSearch}
                    onChange={e => setMetaSearch(e.target.value)}
                    placeholder="Search campaign name or ID..."
                    className="rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none w-56 sm:w-64"
                  />
                </div>

                <button
                  onClick={handleExportMeta}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Meta Sheet</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase text-zinc-400 bg-zinc-900/60">
                    <th className="p-3.5">Campaign & Strategy</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Daily Budget</th>
                    <th className="p-3.5">Spend (INR)</th>
                    <th className="p-3.5">Impressions</th>
                    <th className="p-3.5">Clicks & CTR</th>
                    <th className="p-3.5">Leads Ingested</th>
                    <th className="p-3.5">Cost / Lead (CPL)</th>
                    <th className="p-3.5">Purchases (GMV)</th>
                    <th className="p-3.5">Blended ROAS</th>
                    <th className="p-3.5 text-right">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans text-xs">
                  {filteredMetaCampaigns.map(c => {
                    const cpl = c.leads ? Math.round((c.spend || 0) / c.leads) : 0;
                    const roas = c.spend ? ((c.purchaseValue || 0) / c.spend).toFixed(2) : '0';

                    return (
                      <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold text-white block">{c.campaignName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-zinc-500">ID: {c.metaCampaignId || c.campaignId || '1202081198'}</span>
                            <span className="text-[10px] text-zinc-400">• Advantage+ CBO</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                            {c.businessUnit}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-zinc-200">
                          {formatCurrency(c.dailyBudget || 15000)}
                          <div className="w-16 h-1 rounded-full bg-zinc-800 mt-1 overflow-hidden">
                            <div className="w-[92%] h-full bg-blue-500 rounded-full" />
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {formatCurrency(c.spend || 0)}
                        </td>
                        <td className="p-3.5 font-mono text-zinc-300">
                          {formatNumber(c.impressions || 0)}
                        </td>
                        <td className="p-3.5 font-mono text-zinc-300">
                          {formatNumber(c.clicks || 0)} <span className="text-[10px] text-emerald-400">({c.impressions ? ((c.clicks / c.impressions) * 100).toFixed(2) : 2.1}%)</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-blue-400">
                          <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                            {formatNumber(c.leads || 0)}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          <span className={`rounded px-2 py-0.5 text-xs ${cpl <= 60 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                            {formatCurrency(cpl)}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {formatCurrency(c.purchaseValue || 0)}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-300">
                            {roas}x
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: RAZORPAY FINANCIAL GATEWAY & SETTLEMENTS COMMAND CENTER
          Everything needed to reconcile collections, bank payouts, UPI & fees
          ========================================================================= */}
      {perspectiveTab === 'RAZORPAY' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Razorpay KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ShopifyMetricCard
              title="Gross Captured Collections"
              tooltipText="Total payment volume captured across all Razorpay merchant accounts"
              value={formatCurrency(grossCapturedRevenue)}
              trend={{ value: '100% Reconciled', isPositive: true }}
              subtitle={`${formatNumber(filteredCaptured.length)} Captured Payments`}
              sparklineData={[30, 42, 55, 68, 75, 82, 90, 100]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="Net Bank Settlement"
              tooltipText="Actual net funds transferred to bank account after 2% MDR fee and GST deductions"
              value={formatCurrency(netRevenue)}
              trend={{ value: 'T+1 Daily Payout', isPositive: true }}
              subtitle="Transferred to HDFC ••4921"
              sparklineData={[28, 40, 52, 65, 72, 80, 88, 98]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="Gateway Fees & GST (MDR)"
              tooltipText="Total transaction fee deducted by Razorpay (2% MDR + 18% GST)"
              value={formatCurrency(totalFees + totalTax)}
              trend={{ value: '2.36% Blended', isPositive: false }}
              subtitle="Gateway Processing Charges"
              sparklineData={[10, 15, 20, 25, 30, 35, 40, 45]}
              sparklineColor="#64748b"
            />

            <ShopifyMetricCard
              title="Payment Success Rate"
              tooltipText="Percentage of total checkout attempts successfully captured by issuing banks"
              value={`${successRate.toFixed(1)}%`}
              trend={{ value: `${successRate.toFixed(1)}%`, isPositive: successRate >= 70 }}
              subtitle={`${capturedAttemptsCount} of ${totalAttempts} Attempts`}
              sparklineData={[65, 68, 70, 72, 75, 78, 81, 84]}
              sparklineColor="#008060"
            />
          </div>

          {/* Secondary Financial Reconciliations - Matching Shopify Analytics Design Standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ShopifyMetricCard
              title="Average Order Value (AOV)"
              tooltipText="Weighted average transaction value across captured webinar and consultation orders"
              value="₹999.00"
              trend={{ value: 'Standard Tier', isPositive: true }}
              subtitle="Webinar & Consultation Fixed Ticket"
              sparklineData={[999, 999, 999, 999, 999, 999, 999]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="At-Risk Failed Checkout Volume"
              tooltipText="Checkout revenue declined by customer banks or interrupted at OTP screen"
              value={formatCurrency(failedRevenue)}
              trend={{ value: `${failedAttempts.length} Leads`, isPositive: false }}
              subtitle="Automated AI Voice Tele-Recovery Active"
              sparklineData={[95, 90, 85, 82, 80, 78, 75, 78.5]}
              sparklineColor="#de3618"
            />

            <ShopifyMetricCard
              title="Next Bank Settlement Sweep"
              tooltipText="Automated daily scheduled transfer of settled funds to merchant primary bank"
              value="T+1 Auto Sweep"
              trend={{ value: 'HDFC ••4921', isPositive: true }}
              subtitle="Sweeps Daily at 06:00 AM IST"
              sparklineData={[15, 25, 40, 55, 70, 85, 95, 100]}
              sparklineColor="#008060"
            />

            <ShopifyMetricCard
              title="Dispute & Chargeback Health"
              tooltipText="Official Razorpay merchant risk score and customer dispute ratio"
              value="0.00%"
              trend={{ value: 'Tier-1 Rating', isPositive: true }}
              subtitle="Clean Razorpay Merchant Profile"
              sparklineData={[0, 0, 0, 0, 0, 0, 0, 0]}
              sparklineColor="#008060"
            />
          </div>

          {/* Side-by-side: Payment Methods Rails Split vs Bank Gateway Health Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Payment Methods Rails Distribution (Stripe / RazorpayX Standard) */}
            <div className="rounded-2xl border border-zinc-800 bg-[#12141c] p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CreditCard className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Razorpay Payment Rails Distribution</h3>
                    <p className="text-xs text-zinc-400">Multi-rail volume breakdown and instrument conversion efficiency</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                  30-DAY ROLLING
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'UPI Rail (PhonePe, Google Pay, Paytm, BHIM, Cred)',
                    share: 68.4,
                    volume: '₹35,04,816.00',
                    count: '3,508 txns',
                    badge: '⚡ FASTEST CONVERTING RAIL (1.2s avg latency)',
                    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                    barColor: 'from-emerald-500 to-teal-400'
                  },
                  {
                    name: 'Credit & Debit Cards (Visa, Mastercard, RuPay)',
                    share: 21.8,
                    volume: '₹11,17,032.00',
                    count: '1,118 txns',
                    badge: '98.1% 3DS OTP Authentication',
                    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                    barColor: 'from-blue-500 to-indigo-500'
                  },
                  {
                    name: 'Netbanking Direct Bank Highway (HDFC, SBI, ICICI, Axis)',
                    share: 7.9,
                    volume: '₹4,04,796.00',
                    count: '405 txns',
                    badge: 'Corporate & High-Ticket Accounts',
                    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                    barColor: 'from-amber-500 to-orange-500'
                  },
                  {
                    name: 'Wallets & PayLater (Paytm Wallet, LazyPay, Simpl)',
                    share: 1.9,
                    volume: '₹97,356.00',
                    count: '93 txns',
                    badge: 'Instant 1-Click Checkout',
                    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                    barColor: 'from-purple-500 to-pink-500'
                  }
                ].map(rail => (
                  <div key={rail.name} className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-200 font-bold">{rail.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">{rail.volume}</span>
                        <span className="font-mono text-xs text-zinc-400">({rail.share}%)</span>
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        style={{ width: `${rail.share}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${rail.barColor}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Volume: {rail.count}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${rail.badgeColor}`}>
                        {rail.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Gateway Health & Timeout Diagnostics (Stripe Status / Node Telemetry) */}
            <div className="rounded-2xl border border-zinc-800 bg-[#12141c] p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Issuing Bank Gateway Latency & Health</h3>
                    <p className="text-xs text-zinc-400">Live operational telemetry across customer payment issuing banks</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="space-y-3">
                {/* ICICI */}
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-bold text-white">ICICI Bank Gateway Node</span>
                    </div>
                    <span className="text-xs text-zinc-400 block font-mono pl-4">Direct Fast-Route UPI 2.0 & Netbanking Pipes</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold text-xs block">98.8% Success</span>
                    <span className="text-[11px] text-zinc-400 font-mono">1.2s Latency</span>
                  </div>
                </div>

                {/* HDFC */}
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-bold text-white">HDFC Bank Gateway Node</span>
                    </div>
                    <span className="text-xs text-zinc-400 block font-mono pl-4">Cards & SmartHub Direct Settlement Highway</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold text-xs block">94.2% Success</span>
                    <span className="text-[11px] text-zinc-400 font-mono">1.8s Latency</span>
                  </div>
                </div>

                {/* Axis */}
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-bold text-white">Axis Bank Gateway Node</span>
                    </div>
                    <span className="text-xs text-zinc-400 block font-mono pl-4">Multi-Tenant Webhook Pipeline</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold text-xs block">97.5% Success</span>
                    <span className="text-[11px] text-zinc-400 font-mono">1.4s Latency</span>
                  </div>
                </div>

                {/* SBI WARNING NODE */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-200">State Bank of India (SBI UPI Route)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-400 font-bold text-xs block">89.4% Success</span>
                      <span className="text-[11px] text-amber-300/80 font-mono">3.4s Latency</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-200/80 font-sans leading-relaxed bg-amber-950/30 p-2 rounded border border-amber-500/20">
                    ⚠️ <strong>Intermittent server timeouts during 8 PM - 10 PM peak hours.</strong> AI Voice tele-recovery automatically detects dropped checkouts and sends instant WhatsApp 1-click retry payment links.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Razorpay Captured Transactions Feed Table (Stripe / RazorpayX Enterprise Standard) */}
          <div className="rounded-2xl border border-zinc-800 bg-[#12141c] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Live Razorpay Captured Transactions Feed</h3>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                    {filteredRazorpayTx.length} Reconciled Transactions
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Reconciled payments captured across active merchant accounts • Auto-sweep SLA: T+1 to HDFC ••4921</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Method Filters */}
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                    onClick={() => setRazorpayMethodFilter('ALL')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      razorpayMethodFilter === 'ALL'
                        ? 'bg-zinc-800 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    All Rails
                  </button>
                  <button
                    onClick={() => setRazorpayMethodFilter('UPI')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      razorpayMethodFilter === 'UPI'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    UPI
                  </button>
                  <button
                    onClick={() => setRazorpayMethodFilter('CARD')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      razorpayMethodFilter === 'CARD'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setRazorpayMethodFilter('NETBANKING')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      razorpayMethodFilter === 'NETBANKING'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Netbanking
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={razorpaySearch}
                    onChange={e => setRazorpaySearch(e.target.value)}
                    placeholder="Search payment ID, order, phone, customer..."
                    className="rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none w-56 sm:w-64"
                  />
                </div>

                <button
                  onClick={handleExportRazorpay}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Razorpay Sheet</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase text-zinc-400 bg-zinc-900/60">
                    <th className="p-3.5">Razorpay Payment ID</th>
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">Gross Amount</th>
                    <th className="p-3.5">Gateway Fee & GST</th>
                    <th className="p-3.5">Net Bank Settlement</th>
                    <th className="p-3.5">Payment Rail</th>
                    <th className="p-3.5">Settlement SLA</th>
                    <th className="p-3.5 text-right">Gateway Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans text-xs">
                  {filteredRazorpayTx.slice(0, 15).map(cp => {
                    const order = db.orders.find(o => o.id === cp.orderId);
                    const lead = order ? db.leads.find(l => l.id === order.leadId) : null;
                    const customer = lead ? db.customers.find(c => c.id === lead.customerId) : null;
                    const amount = cp.amount || cp.capturedAmount || 999;
                    const fee = cp.fee || Math.round(amount * 0.0236);
                    const net = amount - fee;
                    const paymentId = cp.razorpayPaymentId || `pay_${cp.id}`;

                    return (
                      <tr key={cp.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white block">{paymentId}</span>
                            <button
                              onClick={() => handleCopyPaymentId(paymentId)}
                              title="Copy Payment ID"
                              className="text-zinc-500 hover:text-white transition-colors"
                            >
                              {copiedPaymentId === paymentId ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono block">Order: {cp.razorpayOrderId || cp.orderId}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-white block">{customer?.fullName || 'Verified Customer'}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{customer?.phone || customer?.primaryPhone || '+91 ••••••••98'}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                          {formatCurrency(amount)}
                        </td>
                        <td className="p-3.5 font-mono text-zinc-400">
                          {formatCurrency(fee)}
                          <span className="text-[10px] text-zinc-500 block">2% + 18% GST</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white text-sm">
                          {formatCurrency(net)}
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-mono text-zinc-200">
                            {cp.paymentMethod || 'UPI'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-zinc-300 text-[11px] font-mono block">T+1 Auto-Sweep</span>
                          <span className="text-[10px] text-zinc-500">HDFC ••4921</span>
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            CAPTURED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
