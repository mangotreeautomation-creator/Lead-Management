'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Drawer } from '../../ui/Drawer';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { formatCurrency, formatDate, formatDuration } from '../../../utils/formatters';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Globe,
  CreditCard,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  ChevronRight,
  Code,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';

export const LeadDetailDrawer: React.FC = () => {
  const {
    selectedLeadId,
    setSelectedLeadId,
    setSelectedCustomerId,
    db
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showJsonPayload, setShowJsonPayload] = useState(false);

  if (!selectedLeadId) return null;

  const lead = db.leads.find(l => l.id === selectedLeadId);
  if (!lead) return null;

  const customer = db.customers.find(c => c.id === lead.customerId);
  const orders = db.orders.filter(o => o.leadId === lead.id || (customer && o.customerId === customer.id));
  const orderIds = orders.map(o => o.id);
  const attempts = db.paymentAttempts.filter(pa => orderIds.includes(pa.orderId));
  const capturedPayments = db.capturedPayments.filter(cp => orderIds.includes(cp.orderId));
  const aiCalls = db.aiCalls.filter(call => call.leadId === lead.id || (customer && call.customerId === customer.id));
  const watiMessages = db.watiMessages.filter(w => w.leadId === lead.id || (customer && w.customerId === customer.id));
  const touchpoints = db.touchpoints.filter(t => t.leadId === lead.id);
  const attribution = db.attributions.find(a => a.leadId === lead.id);

  // Calculate captured sum
  const capturedSum = capturedPayments.reduce((acc, curr) => acc + (curr.amount || curr.capturedAmount || 0), 0);

  // Status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'CONVERTED': return 'success';
      case 'PAYMENT_PENDING': return 'warning';
      case 'CALL_SCHEDULED': return 'info';
      case 'LOST': return 'danger';
      case 'NEW': return 'primary';
      default: return 'neutral';
    }
  };

  return (
    <Drawer
      isOpen={!!selectedLeadId}
      onClose={() => setSelectedLeadId(null)}
      title="Lead Journey & Attribution Detail"
      subtitle={`ID: ${lead.id} • ${(lead.businessUnit || 'PALMISTRY').replace(/_/g, ' ')}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Top Profile Card */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-sm">
                {(customer?.fullName || lead.landingPageSlug || 'L').charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {customer?.fullName || 'Anonymous Visitor'}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {customer?.phone || customer?.primaryPhone || 'N/A'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer?.email || customer?.primaryEmail || 'N/A'}
                  </span>
                  {customer?.city && (
                    <>
                      <span>•</span>
                      <span>{customer.city}, {customer.state}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={getStatusVariant(lead.status || lead.leadStatus)}>
                {(lead.status || lead.leadStatus || 'NEW').replace(/_/g, ' ')}
              </Badge>
              {customer && (
                <button
                  onClick={() => {
                    setSelectedCustomerId(customer.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <span>Customer 360</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Captured Revenue</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(capturedSum)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Payment Attempts</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {attempts.length} attempts
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">AI Voice Calling</p>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {aiCalls.length > 0 ? (
                  aiCalls[0].status === 'CONNECTED' ? 'Recovered via AI' : 'Attempted'
                ) : 'Not Triggered'}
              </p>
            </div>
          </div>
        </div>

        {/* Marketing UTM & Source Breakdown */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/20">
          <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Globe className="h-4 w-4 text-brand-500" />
            <span>Campaign Attribution & Source Tracking</span>
          </h5>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Landing Page Slug</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {lead.landingPageSlug}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">UTM Source / Medium</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {lead.utmSource} / {lead.utmMedium}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">UTM Campaign</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={lead.utmCampaign || 'None'}>
                {lead.utmCampaign || 'Direct / None'}
              </p>
            </div>
            {lead.utmContent && (
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Creative / Ad ID</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {lead.utmContent}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">First Touchpoint</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(lead.createdAt || '')}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Attribution Model</span>
              <p className="font-semibold text-brand-600 dark:text-brand-400">
                {attribution?.attributionModel || 'Last-Touch Non-Direct'}
              </p>
            </div>
          </div>
        </div>

        {/* 12-Step Chronological Journey Timeline */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Clock className="h-4 w-4 text-brand-500" />
              <span>Full Chronological Event Timeline</span>
            </h5>
            <span className="text-[11px] text-slate-400">Sorted by event timestamp</span>
          </div>

          <div className="relative mt-5 pl-6 space-y-6 before:absolute before:bottom-0 before:left-2.5 before:top-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {/* Step 1: Initial Page View & Ad Click */}
            <div className="relative">
              <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white ring-4 ring-white dark:ring-slate-900">
                <Globe className="h-2.5 w-2.5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Ad Click & Landing Page View
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDate(lead.createdAt || '')}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Visitor arrived from <strong>{lead.utmSource || 'Direct'}</strong> campaign: <em>{lead.utmCampaign || 'Organic'}</em> on page <code>/{lead.landingPageSlug || ''}</code>.
                </p>
              </div>
            </div>

            {/* Step 2: Lead Submission */}
            <div className="relative">
              <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white ring-4 ring-white dark:ring-slate-900">
                <User className="h-2.5 w-2.5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Lead Captured on Landing Page
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDate(lead.createdAt || '')}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Lead form submitted with verified phone <strong>{customer?.phone || customer?.primaryPhone || 'Unknown'}</strong>. Customer profile linked.
                </p>
              </div>
            </div>

            {/* Step 3: Orders created */}
            {orders.map((ord, idx) => (
              <div key={ord.id} className="relative">
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white ring-4 ring-white dark:ring-slate-900">
                  <CreditCard className="h-2.5 w-2.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Razorpay Order Created: {ord.razorpayOrderId}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(ord.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Order for <strong>{formatCurrency(ord.amount)}</strong> generated on account <em>{ord.accountCode}</em>.
                  </p>
                </div>
              </div>
            ))}

            {/* Step 4: Payment Attempts (Failed & Captures) */}
            {attempts.map((pa, idx) => {
              const isCaptured = pa.status === 'CAPTURED';
              return (
                <div key={pa.id} className="relative">
                  <div
                    className={`absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-4 ring-white dark:ring-slate-900 ${
                      isCaptured ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  >
                    {isCaptured ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                  </div>
                  <div className={`rounded-lg p-2.5 ${isCaptured ? 'bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40' : 'bg-rose-50/70 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isCaptured ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                        Attempt #{pa.attemptNumber}: {pa.status} ({formatCurrency(pa.amount)})
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(pa.createdAt)}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      <p>Method: <strong className="uppercase">{pa.paymentMethod}</strong> • ID: <code>{pa.razorpayPaymentId}</code></p>
                      {pa.errorMessage && (
                        <p className="text-rose-600 dark:text-rose-400 font-medium">
                          Reason: {pa.errorCode} - {pa.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Step 5: AI Element Voice Call */}
            {aiCalls.map((call) => (
              <div key={call.id} className="relative">
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white ring-4 ring-white dark:ring-slate-900">
                  <PhoneCall className="h-2.5 w-2.5" />
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3.5 dark:border-violet-900/40 dark:bg-violet-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                        AI Element Voice Call: Agent {call.agentName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDate(call.createdAt)}</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Call Status</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{call.status}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{formatDuration(call.durationSeconds)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Customer Sentiment</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{call.sentiment}</p>
                    </div>
                  </div>

                  {/* Audio player preview */}
                  <div className="mt-3 rounded-lg bg-white p-2.5 border border-violet-100 dark:bg-slate-900 dark:border-violet-900/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsPlayingAudio(prev => !prev)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                          {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                        </button>
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {isPlayingAudio ? 'Playing simulated call recording...' : 'Listen to call recording (135s)'}
                        </span>
                      </div>
                      <Volume2 className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Transcript snippet */}
                  {call.transcript && (
                    <div className="mt-2.5 rounded-lg bg-violet-100/50 p-2 text-xs text-violet-900 dark:bg-violet-900/30 dark:text-violet-200">
                      <span className="font-semibold text-[10px] uppercase tracking-wider block text-violet-700 dark:text-violet-300 mb-0.5">
                        Transcript Excerpt:
                      </span>
                      <p className="italic leading-relaxed">
                        "{call.transcript}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Step 6: WATI WhatsApp follow-up */}
            {watiMessages.map(wm => (
              <div key={wm.id} className="relative">
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white ring-4 ring-white dark:ring-slate-900">
                  <MessageSquare className="h-2.5 w-2.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      WATI Automated Recovery Message ({wm.accountCode})
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(wm.sentAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Template: <code>{wm.templateName}</code> • Status: <strong className="text-emerald-600">{wm.status}</strong>
                  </p>
                </div>
              </div>
            ))}

            {/* Step 7: Captured Payment Confirmation */}
            {capturedPayments.map(cp => (
              <div key={cp.id} className="relative">
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white ring-4 ring-white dark:ring-slate-900">
                  <ShieldCheck className="h-2.5 w-2.5" />
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Payment Successfully Captured: {formatCurrency(cp.amount)}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(cp.capturedAt)}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    <p>Razorpay Payment ID: <code>{cp.razorpayPaymentId}</code></p>
                    <p>Razorpay Order ID: <code>{cp.razorpayOrderId}</code></p>
                    <p>Settlement Currency: <strong>{cp.currency}</strong> • Gateway Fee: <strong>{formatCurrency(cp.fee)}</strong> (Tax: {formatCurrency(cp.tax)})</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Webhook JSON Inspector */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-900 p-4 text-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Technical Webhook & Attribution Audit Payload
              </span>
            </div>
            <button
              onClick={() => setShowJsonPayload(prev => !prev)}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              {showJsonPayload ? 'Hide JSON' : 'Show JSON'}
            </button>
          </div>

          {showJsonPayload && (
            <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] font-mono text-emerald-400 scrollbar-thin scrollbar-thumb-slate-800">
              {JSON.stringify(
                {
                  lead_id: lead.id,
                  business_unit: lead.businessUnit || 'PALMISTRY',
                  landing_page: lead.landingPageSlug || 'direct',
                  customer: customer || null,
                  orders: orders,
                  payment_attempts: attempts,
                  captured_payments: capturedPayments,
                  ai_element_recovery: aiCalls,
                  wati_delivery: watiMessages,
                  attribution: attribution || null
                },
                null,
                2
              )}
            </pre>
          )}
        </div>
      </div>
    </Drawer>
  );
};
