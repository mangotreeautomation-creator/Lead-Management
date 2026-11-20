'use client';

import React, { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { BusinessUnitCode } from '../../../data/types';
import { MetricCard } from '../../ui/MetricCard';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { AreaChart, HorizontalBar } from '../../ui/ChartComponents';
import { formatCurrency, formatNumber, formatPercent, formatDate } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  PhoneCall,
  Sparkles,
  Download,
  Globe,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface VerticalDashboardProps {
  verticalCode: BusinessUnitCode;
}

export const VerticalDashboard: React.FC<VerticalDashboardProps> = ({ verticalCode }) => {
  const {
    db,
    setSelectedLeadId,
    setActiveModule
  } = useApp();

  const vastuReportsMeta = {
    title: 'Vastu Wheel & Floorplan Reports',
    desc: 'Residential and commercial compass-aligned architectural Vastu audits.',
    domain: 'https://www.mangotreetechnology.com',
    defaultAccount: 'GlobalInch (Acc 1)',
    color: 'blue'
  };

  const webinarMeta = {
    title: 'Live Vastu Masterclass & Webinars',
    desc: 'High-ticket live interactive masterclasses and student registrations.',
    domain: 'https://www.mangotreetechnology.com',
    defaultAccount: 'Razorpay Account 2',
    color: 'emerald'
  };

  const verticalMeta: Partial<Record<BusinessUnitCode, { title: string; desc: string; domain: string; defaultAccount: string; color: string }>> = {
    PALMISTRY: {
      title: 'Palmistry Reports & Kundali Division',
      desc: 'Digital automated palm reading and birth chart analysis offerings.',
      domain: 'https://www.mangotreetechnology.com',
      defaultAccount: 'GlobalInch (Acc 1)',
      color: 'violet'
    },
    VASTU: vastuReportsMeta,
    VASTU_REPORT: vastuReportsMeta,
    VASTU_REPORTS: vastuReportsMeta,
    WEBINAR: webinarMeta,
    VASTU_WEBINAR: webinarMeta,
    ASTRO_WEBINAR: webinarMeta,
    ASTROLOGY: {
      title: 'Astrology & Kundali Predictions',
      desc: 'Vedic astrology consultations, dosha analysis, and gemstone remedies.',
      domain: 'https://www.mangotreetechnology.com',
      defaultAccount: 'GlobalInch (Acc 1)',
      color: 'pink'
    },
    ASTROSHI: {
      title: 'Astroshi E-Commerce & Remedies',
      desc: 'Spiritual yantras, energized rudraksha, and sacred gemstones store.',
      domain: 'https://astroshi.com',
      defaultAccount: 'GlobalInch (Acc 1)',
      color: 'cyan'
    },
    CONSULTANCY: {
      title: 'Private 1-on-1 Vastu Consultancy',
      desc: 'High-ticket bespoke consultations and physical on-site evaluations.',
      domain: 'https://consultancy.vastushikhar.com',
      defaultAccount: 'Vastu Shikhar (Acc 3)',
      color: 'amber'
    }
  };

  const defaultMeta = {
    title: 'Business Unit Operations',
    desc: 'Enterprise operations, lead tracking and revenue analytics.',
    domain: 'https://www.mangotreetechnology.com',
    defaultAccount: 'GlobalInch (Acc 1)',
    color: 'blue'
  };

  const meta = verticalMeta[verticalCode] || verticalMeta.PALMISTRY || defaultMeta;

  const matchesVertical = (bu: string) => {
    if (verticalCode === 'VASTU_REPORT' || verticalCode === 'VASTU_REPORTS') {
      return bu === 'VASTU_REPORT' || bu === 'VASTU_REPORTS';
    }
    if (verticalCode === 'WEBINAR' || verticalCode === 'VASTU_WEBINAR') {
      return bu === 'WEBINAR' || bu === 'VASTU_WEBINAR';
    }
    return bu === verticalCode;
  };

  // Filter db by this vertical
  const verticalLeads = useMemo(() => db.leads.filter(l => matchesVertical(l.businessUnit)), [db.leads, verticalCode]);
  const verticalOrders = useMemo(() => db.orders.filter(o => matchesVertical(o.businessUnit)), [db.orders, verticalCode]);
  const orderIds = useMemo(() => verticalOrders.map(o => o.id), [verticalOrders]);
  
  const verticalCaptured = useMemo(() => db.capturedPayments.filter(cp => orderIds.includes(cp.orderId)), [db.capturedPayments, orderIds]);
  const verticalAttempts = useMemo(() => db.paymentAttempts.filter(pa => orderIds.includes(pa.orderId)), [db.paymentAttempts, orderIds]);
  const verticalAiCalls = useMemo(() => {
    const leadIds = verticalLeads.map(l => l.id);
    return db.aiCalls.filter(c => c.leadId && leadIds.includes(c.leadId));
  }, [db.aiCalls, verticalLeads]);

  const verticalMetaCampaigns = useMemo(() => db.metaDailyInsights.filter(m => m.businessUnit && matchesVertical(m.businessUnit)), [db.metaDailyInsights, verticalCode]);

  // Aggregated KPIs
  const totalRevenue = verticalCaptured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);
  const totalLeadsCount = verticalLeads.length;
  const attemptsCount = verticalAttempts.length;
  const capturedAttemptsCount = verticalAttempts.filter(a => a.status === 'CAPTURED').length;
  const successRate = attemptsCount > 0 ? (capturedAttemptsCount / attemptsCount) * 100 : 0;
  const averageTicket = verticalCaptured.length > 0 ? totalRevenue / verticalCaptured.length : 0;
  const totalSpend = verticalMetaCampaigns.reduce((sum, m) => sum + (m.spend || 0), 0);
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const connectedAiCalls = verticalAiCalls.filter(c => c.status === 'CONNECTED').length;

  // Landing pages for this vertical
  const landingPages = useMemo(() => {
    const slugMap: Record<string, { leads: number; revenue: number; failures: number }> = {};
    verticalLeads.forEach(l => {
      const slug = l.landingPageSlug || 'direct';
      if (!slugMap[slug]) {
        slugMap[slug] = { leads: 0, revenue: 0, failures: 0 };
      }
      slugMap[slug].leads += 1;
    });

    verticalCaptured.forEach(cp => {
      const ord = db.orders.find(o => o.id === cp.orderId);
      const lead = ord ? db.leads.find(l => l.id === ord.leadId) : null;
      if (lead) {
        const slug = lead.landingPageSlug || 'direct';
        if (slugMap[slug]) {
          slugMap[slug].revenue += (cp.amount || cp.capturedAmount || 0);
        }
      }
    });

    verticalAttempts.filter(a => a.status === 'FAILED').forEach(fa => {
      const ord = db.orders.find(o => o.id === fa.orderId);
      const lead = ord ? db.leads.find(l => l.id === ord.leadId) : null;
      if (lead) {
        const slug = lead.landingPageSlug || 'direct';
        if (slugMap[slug]) {
          slugMap[slug].failures += 1;
        }
      }
    });

    return Object.entries(slugMap).map(([slug, data]) => ({
      slug,
      leads: data.leads,
      revenue: data.revenue,
      failures: data.failures
    }));
  }, [verticalLeads, verticalCaptured, verticalAttempts, db.orders]);

  const handleExport = () => {
    const rows = verticalLeads.map(l => ({
      'Lead ID': l.id,
      'Landing Page': l.landingPageSlug || '',
      'Status': l.status || l.leadStatus || 'NEW',
      'UTM Source': l.utmSource || '',
      'UTM Campaign': l.utmCampaign || '',
      'Created At': l.createdAt || ''
    }));
    exportToXLSX(rows, `${verticalCode}_Leads_Report`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Title & Domain Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {meta.title}
            </h1>
            <Badge variant="primary" size="sm">
              VERTICAL
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {meta.desc} • Primary Razorpay Account: <strong>{meta.defaultAccount}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            <span>Export Vertical Data</span>
          </Button>

          <a
            href={meta.domain}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <Globe className="h-4 w-4 text-brand-500" />
            <span>Visit Domain</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 6 Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Captured Revenue"
          value={formatCurrency(totalRevenue)}
          trend={{ value: 16.4, isPositive: true }}
          icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <MetricCard
          title="Total Leads"
          value={formatNumber(totalLeadsCount)}
          trend={{ value: 9.2, isPositive: true }}
          icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        />
        <MetricCard
          title="Avg Ticket Size"
          value={formatCurrency(averageTicket)}
          icon={<CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <MetricCard
          title="Payment Success Rate"
          value={`${successRate.toFixed(1)}%`}
          trend={{ value: 4.5, isPositive: true }}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <MetricCard
          title="AI Voice Recoveries"
          value={`${connectedAiCalls} calls`}
          trend={{ value: 22.0, isPositive: true }}
          icon={<PhoneCall className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
        />
        <MetricCard
          title="Meta ROAS"
          value={`${roas.toFixed(2)}x`}
          trend={{ value: 14.1, isPositive: true }}
          icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {/* Landing Pages Performance Table */}
      <Card
        title="Landing Pages & Traffic Conversion"
        subtitle="Performance by landing page variant"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Landing Page Slug</th>
                <th className="py-2.5 px-3 font-semibold">Total Leads</th>
                <th className="py-2.5 px-3 font-semibold">Captured Revenue</th>
                <th className="py-2.5 px-3 font-semibold">Payment Failures</th>
                <th className="py-2.5 px-3 font-semibold">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {landingPages.map((lp, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-500" />
                    <span>/{lp.slug}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {lp.leads} leads
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(lp.revenue)}
                  </td>
                  <td className="py-3 px-3 font-medium text-rose-600 dark:text-rose-400">
                    {lp.failures} failures
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={lp.revenue > 0 ? 'success' : 'neutral'} size="sm">
                      {lp.revenue > 0 ? 'ACTIVE TRAFFIC' : 'LOW VOLUME'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent High-Intent Leads */}
      <Card
        title={`Recent Leads in ${meta.title}`}
        subtitle="Click any row to open the complete customer journey timeline"
        action={
          <Button variant="ghost" size="sm" onClick={() => setActiveModule('leads')}>
            <span>All Leads</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Lead ID</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Campaign / Source</th>
                <th className="py-2.5 px-3 font-semibold">Created At</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {verticalLeads.slice(0, 8).map(l => {
                const customer = db.customers.find(c => c.id === l.customerId);
                return (
                  <tr
                    key={l.id}
                    onClick={() => setSelectedLeadId(l.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-brand-600 dark:text-brand-400">
                      {l.id}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {customer?.fullName || 'Anonymous'}
                      </p>
                      <p className="text-[11px] text-slate-500">{customer?.phone || customer?.primaryPhone || '—'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={(l.status || l.leadStatus) === 'CONVERTED' ? 'success' : 'primary'} size="sm">
                        {(l.status || l.leadStatus || 'NEW').replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <p className="font-medium">{l.utmSource}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{l.utmCampaign || 'Organic'}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(l.createdAt || '')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadId(l.id);
                        }}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
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
      </Card>
    </div>
  );
};
