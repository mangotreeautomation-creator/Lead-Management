'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MetricCard } from '../../ui/MetricCard';
import { formatCurrency, formatNumber, formatDate } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  TrendingUp,
  DollarSign,
  Users,
  Layers,
  Download,
  Search,
  ExternalLink,
  Target,
  Sparkles
} from 'lucide-react';

export const MarketingView: React.FC = () => {
  const {
    db,
    selectedVertical,
    globalSearch
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const effectiveSearch = searchTerm || globalSearch;

  // Filtered insights
  const filteredInsights = useMemo(() => {
    return db.metaDailyInsights.filter(m => {
      if (selectedVertical !== 'ALL' && m.businessUnit !== selectedVertical) return false;
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        return (
          m.campaignName.toLowerCase().includes(query) ||
          (m.metaCampaignId ? m.metaCampaignId.toLowerCase().includes(query) : false) ||
          (m.businessUnit ? m.businessUnit.toLowerCase().includes(query) : false)
        );
      }
      return true;
    });
  }, [db.metaDailyInsights, selectedVertical, effectiveSearch]);

  // Aggregated Meta totals
  const totalSpend = filteredInsights.reduce((sum, m) => sum + (m.spend || 0), 0);
  const totalImpressions = filteredInsights.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalClicks = filteredInsights.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalLeads = filteredInsights.reduce((sum, m) => sum + (m.leads || 0), 0);
  const totalPurchases = filteredInsights.reduce((sum, m) => sum + (m.purchases || 0), 0);
  const totalPurchaseValue = filteredInsights.reduce((sum, m) => sum + (m.purchaseValue || 0), 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const metaRoas = totalSpend > 0 ? totalPurchaseValue / totalSpend : 0;

  const handleExport = () => {
    const rows = filteredInsights.map(m => ({
      'Date': m.date || '2026-10-29',
      'Meta Campaign ID': m.metaCampaignId || m.campaignId || '',
      'Campaign Name': m.campaignName,
      'Business Unit': m.businessUnit || '',
      'Spend (INR)': m.spend || 0,
      'Impressions': m.impressions || 0,
      'Clicks': m.clicks || 0,
      'Leads': m.leads || 0,
      'Purchases': m.purchases || 0,
      'Purchase Value (INR)': m.purchaseValue || 0,
      'ROAS': (m.spend || 0) > 0 ? ((m.purchaseValue || 0) / (m.spend || 1)).toFixed(2) : '0'
    }));
    exportToXLSX(rows, 'Meta_Ads_Marketing_Performance');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Marketing Performance & Meta Ads Intelligence
            </h1>
            <Badge variant="primary" size="sm">
              META INSIGHTS API
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ingested campaign metrics, ad spend telemetry, cost per lead, and direct return on ad spend (ROAS).
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span>Export Meta Data (XLSX)</span>
        </Button>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Meta Ad Spend"
          value={formatCurrency(totalSpend)}
          trend={{ value: 8.2, isPositive: false }}
          icon={<DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          subtitle="Cumulative ad spend"
        />
        <MetricCard
          title="Purchases Value"
          value={formatCurrency(totalPurchaseValue)}
          trend={{ value: 16.5, isPositive: true }}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          subtitle={`${totalPurchases} purchases tracked`}
        />
        <MetricCard
          title="Blended ROAS"
          value={`${metaRoas.toFixed(2)}x`}
          trend={{ value: 12.0, isPositive: true }}
          icon={<Sparkles className="h-5 w-5 text-amber-500" />}
          subtitle="Value / Spend"
        />
        <MetricCard
          title="Cost Per Lead (CPL)"
          value={formatCurrency(cpl)}
          trend={{ value: 5.4, isPositive: true }}
          icon={<Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          subtitle={`${totalLeads} leads reported`}
        />
        <MetricCard
          title="Cost Per Click (CPC)"
          value={formatCurrency(cpc)}
          icon={<Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
          subtitle={`${totalClicks.toLocaleString()} link clicks`}
        />
        <MetricCard
          title="Click-Through (CTR)"
          value={`${ctr.toFixed(2)}%`}
          icon={<Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          subtitle={`${totalImpressions.toLocaleString()} views`}
        />
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaign name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Meta Daily Insights Table */}
      <Card title="Meta Campaign Daily Breakdown" subtitle="Ingested telemetry from Meta Marketing Graph API">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Campaign Name</th>
                <th className="py-3 px-3 font-semibold">Vertical</th>
                <th className="py-3 px-3 font-semibold text-right">Spend</th>
                <th className="py-3 px-3 font-semibold text-right">Clicks</th>
                <th className="py-3 px-3 font-semibold text-right">Leads</th>
                <th className="py-3 px-3 font-semibold text-right">Purchases</th>
                <th className="py-3 px-3 font-semibold text-right">Purchase Value</th>
                <th className="py-3 px-3 font-semibold text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInsights.map(m => {
                const spend = m.spend || 0;
                const pValue = m.purchaseValue || 0;
                const rowRoas = spend > 0 ? pValue / spend : 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {m.date || '2026-10-29'}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{m.campaignName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{m.metaCampaignId || m.campaignId || ''}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {m.businessUnit ? m.businessUnit.replace(/_/g, ' ') : 'MULTI'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(spend)}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatNumber(m.clicks || 0)}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatNumber(m.leads || 0)}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {m.purchases || 0}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(pValue)}
                    </td>

                    <td className="py-3 px-3 text-right font-extrabold text-brand-600 dark:text-brand-400">
                      {rowRoas.toFixed(2)}x
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
