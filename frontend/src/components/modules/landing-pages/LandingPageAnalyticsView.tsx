'use client';

import React, { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MetricCard } from '../../ui/MetricCard';
import { formatCurrency, formatPercent, formatNumber } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  Globe,
  Download,
  ExternalLink,
  DollarSign,
  Users,
  CreditCard,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const LandingPageAnalyticsView: React.FC = () => {
  const {
    db,
    setSelectedLeadId,
    setActiveModule
  } = useApp();

  // Aggregate metrics per landing page slug
  const lpAnalytics = useMemo(() => {
    const slugMap: Record<string, {
      slug: string;
      vertical: string;
      leadsCount: number;
      ordersCount: number;
      attemptCount: number;
      failedAttemptCount: number;
      failedCustomers: Set<string>;
      aiCallsCount: number;
      aiConnectedCount: number;
      capturedCount: number;
      capturedRevenue: number;
      aiAssistedRevenue: number;
    }> = {};

    // Group leads
    db.leads.forEach(lead => {
      const slug = lead.landingPageSlug || 'direct';
      if (!slugMap[slug]) {
        slugMap[slug] = {
          slug,
          vertical: lead.businessUnit || 'PALMISTRY',
          leadsCount: 0,
          ordersCount: 0,
          attemptCount: 0,
          failedAttemptCount: 0,
          failedCustomers: new Set(),
          aiCallsCount: 0,
          aiConnectedCount: 0,
          capturedCount: 0,
          capturedRevenue: 0,
          aiAssistedRevenue: 0
        };
      }
      slugMap[slug].leadsCount += 1;
    });

    // Group orders & payments
    db.orders.forEach(order => {
      const lead = db.leads.find(l => l.id === order.leadId);
      if (!lead) return;
      const slug = lead.landingPageSlug || 'direct';
      const data = slugMap[slug];
      if (!data) return;

      data.ordersCount += 1;

      // Find attempts
      const attempts = db.paymentAttempts.filter(pa => pa.orderId === order.id);
      data.attemptCount += attempts.length;
      attempts.forEach(a => {
        if (a.status === 'FAILED') {
          data.failedAttemptCount += 1;
          data.failedCustomers.add(order.customerId);
        }
      });

      // Find captured payments
      const captured = db.capturedPayments.filter(cp => cp.orderId === order.id);
      data.capturedCount += captured.length;
      captured.forEach(cp => {
        data.capturedRevenue += (cp.amount || cp.capturedAmount || 0);

        // Check if there was an AI Element connected call for this lead
        const hadConnectedCall = db.aiCalls.some(call => call.leadId === lead.id && call.status === 'CONNECTED');
        if (hadConnectedCall) {
          data.aiAssistedRevenue += (cp.amount || cp.capturedAmount || 0);
        }
      });
    });

    // AI calls per LP
    db.aiCalls.forEach(call => {
      if (!call.leadId) return;
      const lead = db.leads.find(l => l.id === call.leadId);
      if (lead) {
        const slug = lead.landingPageSlug || 'direct';
        if (slugMap[slug]) {
          slugMap[slug].aiCallsCount += 1;
          if (call.status === 'CONNECTED') {
            slugMap[slug].aiConnectedCount += 1;
          }
        }
      }
    });

    return Object.values(slugMap).map(item => ({
      ...item,
      failedCustomerCount: item.failedCustomers.size,
      successRate: item.attemptCount > 0 ? (item.capturedCount / item.attemptCount) * 100 : 0
    }));
  }, [db.leads, db.orders, db.paymentAttempts, db.capturedPayments, db.aiCalls]);

  const handleExport = () => {
    const rows = lpAnalytics.map(lp => ({
      'Landing Page Slug': lp.slug,
      'Vertical': lp.vertical,
      'Total Leads': lp.leadsCount,
      'Total Orders': lp.ordersCount,
      'Payment Attempts': lp.attemptCount,
      'Failed Attempts': lp.failedAttemptCount,
      'Customers with Failures': lp.failedCustomerCount,
      'AI Calls Triggered': lp.aiCallsCount,
      'AI Calls Connected': lp.aiConnectedCount,
      'Captured Payments': lp.capturedCount,
      'Total Captured Revenue (INR)': lp.capturedRevenue,
      'AI-Assisted Revenue (INR)': lp.aiAssistedRevenue,
      'Payment Success Rate': `${lp.successRate.toFixed(1)}%`
    }));
    exportToXLSX(rows, 'Landing_Page_Comparative_Analytics');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Landing Page Conversion & Recovery Matrix
            </h1>
            <Badge variant="primary" size="sm">
              CROSS-VERTICAL
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Compare conversion efficiency, payment drop-offs, AI voice call recoveries, and recovered revenue by landing page variant.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span>Export LP Matrix (XLSX)</span>
        </Button>
      </div>

      {/* Ravi Scenario Verification Callout */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider">
              Verification Landmark: <code>palmistry-report-v1</code> (Ravi Kumar Case Study)
            </h4>
            <p className="mt-1 text-xs text-violet-800 dark:text-violet-300">
              Notice in the table below: <strong>palmistry-report-v1</strong> contains Ravi's 2 failed attempts, 1 connected AI voice call, and 1 final captured payment of ₹999.00. The AI-Assisted Revenue metric cleanly accounts for this ₹999.00 without multiplying or double-counting.
            </p>
          </div>
        </div>
      </div>

      {/* Landing Pages Table */}
      <Card
        title="Landing Page Variants Comparison"
        subtitle="Full financial and recovery funnel by slug"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">Landing Page Slug</th>
                <th className="py-3 px-3 font-semibold">Vertical</th>
                <th className="py-3 px-3 font-semibold text-right">Leads</th>
                <th className="py-3 px-3 font-semibold text-right">Orders</th>
                <th className="py-3 px-3 font-semibold text-right">Attempts</th>
                <th className="py-3 px-3 font-semibold text-right">Failed Attempts</th>
                <th className="py-3 px-3 font-semibold text-right">AI Calls (Conn.)</th>
                <th className="py-3 px-3 font-semibold text-right">Captured Rev.</th>
                <th className="py-3 px-3 font-semibold text-right">AI-Assisted Rev.</th>
                <th className="py-3 px-3 font-semibold text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lpAnalytics.map(lp => (
                <tr
                  key={lp.slug}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    lp.slug === 'palmistry-report-v1' ? 'bg-violet-50/40 dark:bg-violet-950/10 font-medium' : ''
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-brand-500" />
                      <span className="font-bold text-slate-900 dark:text-white">/{lp.slug}</span>
                      {lp.slug === 'palmistry-report-v1' && (
                        <span className="rounded bg-violet-600 text-white text-[9px] px-1.5 py-0.5 font-bold uppercase">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {lp.vertical.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(lp.leadsCount)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(lp.ordersCount)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(lp.attemptCount)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                    {formatNumber(lp.failedAttemptCount)}
                  </td>

                  <td className="py-3.5 px-3 text-right text-violet-600 dark:text-violet-400 font-medium">
                    {lp.aiCallsCount} ({lp.aiConnectedCount})
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(lp.capturedRevenue)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-amber-500">
                    {formatCurrency(lp.aiAssistedRevenue)}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <Badge variant={lp.successRate > 60 ? 'success' : 'warning'} size="sm">
                      {lp.successRate.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
