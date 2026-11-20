'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MetricCard } from '../../ui/MetricCard';
import { formatCurrency, formatDuration, formatDate, formatNumber } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  PhoneCall,
  PhoneForwarded,
  Sparkles,
  Play,
  Pause,
  Volume2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  ExternalLink,
  MessageSquare,
  Bot
} from 'lucide-react';

export const AiElementView: React.FC = () => {
  const {
    db,
    setSelectedLeadId,
    setSelectedCustomerId,
    globalSearch
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState<any | null>(null);

  const effectiveSearch = searchTerm || globalSearch;

  // Filtered AI Calls
  const filteredCalls = useMemo(() => {
    return db.aiCalls.filter(call => {
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const lead = db.leads.find(l => l.id === call.leadId);
        const customer = db.customers.find(c => c.id === call.customerId);
        const st = (call.status || call.callStatus || '').toLowerCase();
        const ph = customer?.phone || customer?.primaryPhone || '';
        const lp = (lead?.landingPageSlug || lead?.landingPageCode || '').toLowerCase();
        return (
          call.id.toLowerCase().includes(query) ||
          call.agentName.toLowerCase().includes(query) ||
          st.includes(query) ||
          (customer && customer.fullName.toLowerCase().includes(query)) ||
          ph.includes(query) ||
          lp.includes(query)
        );
      }
      return true;
    });
  }, [db.aiCalls, db.leads, db.customers, effectiveSearch]);

  // Aggregate Metrics
  const totalCalls = db.aiCalls.length;
  const connectedCalls = db.aiCalls.filter(c => (c.status || c.callStatus) === 'CONNECTED').length;
  const connectionRate = totalCalls > 0 ? (connectedCalls / totalCalls) * 100 : 0;
  const totalDurationSeconds = db.aiCalls.reduce((sum, c) => sum + c.durationSeconds, 0);

  // AI-Assisted Recovered Revenue (Payments captured for leads that had a connected call)
  const connectedLeadIds = new Set(
    db.aiCalls
      .filter(c => (c.status || c.callStatus) === 'CONNECTED' && c.leadId)
      .map(c => c.leadId as string)
  );
  const recoveredPayments = db.capturedPayments.filter(cp => {
    const order = db.orders.find(o => o.id === cp.orderId);
    return order && connectedLeadIds.has(order.leadId);
  });
  const totalRecoveredRevenue = recoveredPayments.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);

  const handleExport = () => {
    const rows = filteredCalls.map(c => {
      const customer = db.customers.find(cust => cust.id === c.customerId);
      return {
        'Call ID': c.id,
        'Agent Name': c.agentName,
        'Customer Name': customer?.fullName || 'N/A',
        'Customer Phone': customer?.phone || customer?.primaryPhone || 'N/A',
        'Status': c.status || c.callStatus || 'UNKNOWN',
        'Duration (Seconds)': c.durationSeconds,
        'Customer Sentiment': c.sentiment || 'POSITIVE',
        'Call Date': c.createdAt || c.callStartAt || '',
        'Transcript Preview': c.transcript || ''
      };
    });
    exportToXLSX(rows, 'AI_Element_Voice_Calls_Log');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Element Voice Calling Intelligence
            </h1>
            <Badge variant="primary" size="sm">
              AUTONOMOUS VOICE AI
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Outbound automated conversational voice agents instantly recovering payment drop-offs and scheduling consults.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span>Export Call Logs (XLSX)</span>
        </Button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="Total Outbound Calls"
          value={formatNumber(totalCalls)}
          trend={{ value: 21.5, isPositive: true }}
          icon={<PhoneCall className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          subtitle="Triggered post-failure"
        />
        <MetricCard
          title="Connected Calls"
          value={formatNumber(connectedCalls)}
          trend={{ value: 14.2, isPositive: true }}
          icon={<PhoneForwarded className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Customer answered"
        />
        <MetricCard
          title="Connection Rate"
          value={`${connectionRate.toFixed(1)}%`}
          trend={{ value: 4.8, isPositive: true }}
          icon={<CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          subtitle="Answer / Dial ratio"
        />
        <MetricCard
          title="Total Talk Time"
          value={formatDuration(totalDurationSeconds)}
          icon={<Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          subtitle="Voice AI airtime"
        />
        <MetricCard
          title="AI-Assisted Revenue"
          value={formatCurrency(totalRecoveredRevenue)}
          trend={{ value: 28.4, isPositive: true }}
          icon={<Sparkles className="h-5 w-5 text-amber-500" />}
          subtitle={`${recoveredPayments.length} recovered payments`}
        />
      </div>

      {/* Ravi Scenario Highlight */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider">
                Audited Voice Recovery: Ravi Kumar (Palmistry LP 1)
              </h4>
              <p className="text-xs text-violet-700 dark:text-violet-300">
                Agent <strong>Pooja</strong> called after Attempt 2 failed (Card decline). Talk time: <strong>135 seconds</strong>. Customer answered, received checkout link, and captured <strong>₹999.00</strong>.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedLeadId('lead_ravi_001')}
            className="shrink-0"
          >
            Inspect Lead Journey
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by agent, customer, status, or lead..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Main AI Call Log Table */}
      <Card title="AI Outbound Voice Logs" subtitle="Chronological call events with audio waveform and transcripts">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">Call ID</th>
                <th className="py-3 px-3 font-semibold">Voice Agent</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Duration</th>
                <th className="py-3 px-3 font-semibold">Sentiment</th>
                <th className="py-3 px-3 font-semibold">Audio & Transcript</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold text-right">Lead Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCalls.map(call => {
                const customer = db.customers.find(c => c.id === call.customerId);
                const lead = db.leads.find(l => l.id === call.leadId);
                const isPlaying = playingCallId === call.id;

                return (
                  <tr key={call.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-violet-600 dark:text-violet-400">
                      {call.id}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-violet-500" />
                      <span>{call.agentName}</span>
                    </td>

                    <td className="py-3 px-3">
                      {customer ? (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{customer.fullName}</p>
                          <p className="text-[11px] text-slate-400">{customer.phone || customer.primaryPhone}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Anonymous</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          (call.status || call.callStatus) === 'CONNECTED'
                            ? 'success'
                            : (call.status || call.callStatus) === 'NO_ANSWER'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {call.status || call.callStatus || 'UNKNOWN'}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {formatDuration(call.durationSeconds)}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          (call.sentiment || 'POSITIVE') === 'POSITIVE'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : call.sentiment === 'NEGATIVE'
                            ? 'text-rose-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {call.sentiment || 'POSITIVE'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPlayingCallId(isPlaying ? null : call.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                          title="Simulate call playback"
                        >
                          {isPlaying ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5 ml-0.5" />}
                        </button>
                        {call.transcript && (
                          <button
                            onClick={() => setSelectedTranscriptCall(call)}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                          >
                            Transcript
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(call.createdAt || call.callStartAt)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {lead && (
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          Journey
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transcript Drawer / Modal */}
      {selectedTranscriptCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Call Transcript: Agent {selectedTranscriptCall.agentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTranscriptCall(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed italic dark:bg-slate-800/60 dark:text-slate-300">
              "{selectedTranscriptCall.transcript}"
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Duration: {formatDuration(selectedTranscriptCall.durationSeconds)} • Sentiment: {selectedTranscriptCall.sentiment}
              </span>
              <Button size="sm" variant="outline" onClick={() => setSelectedTranscriptCall(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
