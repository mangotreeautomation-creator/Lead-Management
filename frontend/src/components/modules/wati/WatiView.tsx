'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';
import { MetricCard } from '../../ui/MetricCard';
import { formatDate, formatNumber } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  MessageSquare,
  CheckCircle2,
  CheckCheck,
  Send,
  AlertCircle,
  Download,
  Search,
  BookOpen,
  Phone,
  Layers
} from 'lucide-react';

export const WatiView: React.FC = () => {
  const {
    db,
    setSelectedLeadId,
    globalSearch
  } = useApp();

  const [activeAccountTab, setActiveAccountTab] = useState<'ALL' | 'WATI_ACC_1' | 'WATI_ACC_2' | 'WATI_ACC_3'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const effectiveSearch = searchTerm || globalSearch;

  // Filter messages
  const filteredMessages = useMemo(() => {
    return db.watiMessages.filter(msg => {
      const acc = msg.accountCode || msg.watiAccountName || 'WATI_ACC_1';
      if (activeAccountTab !== 'ALL' && acc !== activeAccountTab) return false;
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const ph = msg.phone || msg.customerPhone || '';
        const st = (msg.status || msg.deliveryStatus || '').toLowerCase();
        return (
          msg.id.toLowerCase().includes(query) ||
          msg.templateName.toLowerCase().includes(query) ||
          ph.includes(query) ||
          st.includes(query)
        );
      }
      return true;
    });
  }, [db.watiMessages, activeAccountTab, effectiveSearch]);

  // Aggregate Metrics
  const totalSent = filteredMessages.length;
  const delivered = filteredMessages.filter(m => (m.status || m.deliveryStatus) === 'DELIVERED' || (m.status || m.deliveryStatus) === 'READ').length;
  const read = filteredMessages.filter(m => (m.status || m.deliveryStatus) === 'READ').length;
  const failed = filteredMessages.filter(m => (m.status || m.deliveryStatus) === 'FAILED').length;
  const readRate = totalSent > 0 ? (read / totalSent) * 100 : 0;
  const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;

  const templates = [
    { name: 'cart_recovery_offer', category: 'Recovery', desc: 'Sent 15m after payment failure with 10% coupon link' },
    { name: 'webinar_reminder_1hr', category: 'Utility', desc: 'Sent 60m before live webinar session with Zoom URL' },
    { name: 'consultancy_confirmation', category: 'Utility', desc: 'Sent upon private consultation booking confirmation' },
    { name: 'report_ready_download', category: 'Marketing', desc: 'Sent when automated PDF chart is generated for customer' }
  ];

  const handleExport = () => {
    const rows = filteredMessages.map(m => ({
      'Message ID': m.id,
      'WATI Account': m.accountCode || m.watiAccountName || 'WATI_ACC_1',
      'Recipient Phone': m.phone || m.customerPhone || 'N/A',
      'Template Name': m.templateName,
      'Status': m.status || m.deliveryStatus || 'SENT',
      'Sent Date': m.sentAt
    }));
    exportToXLSX(rows, 'WATI_WhatsApp_Messages_Log');
  };

  const accountTabs = [
    { id: 'ALL', label: 'All 3 WATI Accounts', badge: db.watiMessages.length },
    { id: 'WATI_ACC_1', label: 'WATI 1 (Reports & Palmistry)' },
    { id: 'WATI_ACC_2', label: 'WATI 2 (Webinars)' },
    { id: 'WATI_ACC_3', label: 'WATI 3 (Consultancy)' }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              WATI WhatsApp Central Communications
            </h1>
            <Badge variant="success" size="sm">
              3 ACTIVE SPHERES
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Automated WhatsApp notifications, cart recovery broadcasts, template deliveries, and read receipt metrics.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span>Export WhatsApp Logs</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={accountTabs} activeTab={activeAccountTab} onChange={(id: any) => setActiveAccountTab(id)} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Total Outbound Messages"
          value={formatNumber(totalSent)}
          trend={{ value: 12.0, isPositive: true }}
          icon={<Send className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          subtitle="All automated triggers"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${deliveryRate.toFixed(1)}%`}
          trend={{ value: 0.5, isPositive: true }}
          icon={<CheckCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          subtitle={`${delivered} messages delivered`}
        />
        <MetricCard
          title="Read Rate"
          value={`${readRate.toFixed(1)}%`}
          trend={{ value: 4.2, isPositive: true }}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          subtitle={`${read} blue ticks verified`}
        />
        <MetricCard
          title="Failed Messages"
          value={formatNumber(failed)}
          icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
          subtitle="Invalid numbers / Opt-outs"
        />
      </div>

      {/* Template Library */}
      <Card title="Approved Meta WhatsApp Templates" subtitle="Active pre-approved HSM templates used across 3 WATI accounts">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map(t => (
            <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                  {t.name}
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {t.category}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by phone, template, or message ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Messages Table */}
      <Card title="WhatsApp Delivery Logs" subtitle="Real-time transmission status across accounts">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">Message ID</th>
                <th className="py-3 px-3 font-semibold">Account</th>
                <th className="py-3 px-3 font-semibold">Recipient Phone</th>
                <th className="py-3 px-3 font-semibold">Template</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Sent Timestamp</th>
                <th className="py-3 px-3 font-semibold text-right">Lead Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMessages.slice(0, 50).map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                    {m.id}
                  </td>

                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {m.accountCode || m.watiAccountName || 'WATI_ACC_1'}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-emerald-500" />
                    <span>{m.phone || m.customerPhone || 'N/A'}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {m.templateName}
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        (m.status || m.deliveryStatus) === 'READ'
                          ? 'success'
                          : (m.status || m.deliveryStatus) === 'DELIVERED'
                          ? 'primary'
                          : (m.status || m.deliveryStatus) === 'SENT'
                          ? 'neutral'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {m.status || m.deliveryStatus || 'SENT'}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-slate-500">
                    {formatDate(m.sentAt)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {m.leadId && (
                      <button
                        onClick={() => setSelectedLeadId(m.leadId!)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        Inspect Lead
                      </button>
                    )}
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
