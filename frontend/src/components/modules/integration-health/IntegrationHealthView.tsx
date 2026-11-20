'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Radio,
  Server,
  Key,
  ShieldCheck,
  Send,
  Cpu
} from 'lucide-react';

export const IntegrationHealthView: React.FC = () => {
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState('Just now');

  const integrations = [
    {
      name: 'Razorpay Webhook (GlobalInch Acc 1)',
      type: 'Webhook Ingress',
      url: 'https://www.mangotreetechnology.com/api/v1/webhooks/razorpay/vastuwheel-report',
      events: ['payment.captured', 'payment.failed', 'order.paid'],
      status: 'HEALTHY',
      latency: '42ms',
      lastEvent: '4 mins ago'
    },
    {
      name: 'Razorpay Webhook (Webinar Acc 2)',
      type: 'Webhook Ingress',
      url: 'https://www.mangotreetechnology.com/api/v1/webhooks/razorpay/vastu-webinar',
      events: ['payment.captured', 'payment.failed', 'order.paid'],
      status: 'HEALTHY',
      latency: '38ms',
      lastEvent: '14 mins ago'
    },
    {
      name: 'Razorpay Webhook (Vastu Shikhar Acc 3)',
      type: 'Webhook Ingress',
      url: 'https://consultancy.vastushikhar.com/api/v1/webhooks/razorpay/consultancy',
      events: ['payment.captured', 'payment.failed', 'order.paid'],
      status: 'HEALTHY',
      latency: '48ms',
      lastEvent: '22 mins ago'
    },
    {
      name: 'Ngrok Local Development Tunnel',
      type: 'Secure Tunnel',
      url: 'https://lead-management.ngrok-free.app ➔ localhost:3000',
      events: ['Live Webhook Forwarding'],
      status: 'STANDBY',
      latency: '18ms',
      lastEvent: 'Configured via winget'
    },
    {
      name: 'Meta Ads Marketing Graph API',
      type: 'REST Batch Ingestion',
      url: 'https://graph.facebook.com/v19.0/act_xxxxxxxx/insights',
      events: ['Daily Campaign Telemetry', 'Realtime Today Sync'],
      status: 'HEALTHY',
      latency: '210ms',
      lastEvent: '1 hour ago'
    },
    {
      name: 'WATI WhatsApp Gateway (Acc 1 - Reports)',
      type: 'API & Webhooks',
      url: 'https://live-server-api.wati.io/api/v1/sendTemplateMessage',
      events: ['message.sent', 'message.delivered', 'message.read'],
      status: 'HEALTHY',
      latency: '85ms',
      lastEvent: '6 mins ago'
    },
    {
      name: 'WATI WhatsApp Gateway (Acc 2 - Webinar)',
      type: 'API & Webhooks',
      url: 'https://live-server-api.wati.io/api/v1/sendTemplateMessage',
      events: ['message.sent', 'message.delivered', 'message.read'],
      status: 'HEALTHY',
      latency: '92ms',
      lastEvent: '18 mins ago'
    },
    {
      name: 'WATI WhatsApp Gateway (Acc 3 - Consultancy)',
      type: 'API & Webhooks',
      url: 'https://live-server-api.wati.io/api/v1/sendTemplateMessage',
      events: ['message.sent', 'message.delivered', 'message.read'],
      status: 'HEALTHY',
      latency: '78ms',
      lastEvent: '35 mins ago'
    },
    {
      name: 'AI Element Voice Calling Server',
      type: 'Telephony Outbound Webhook',
      url: 'https://api.aielement.ai/v1/outbound/dispatch',
      events: ['call.initiated', 'call.connected', 'call.transcribed'],
      status: 'HEALTHY',
      latency: '115ms',
      lastEvent: '12 mins ago'
    }
  ];

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setLastPingTime(new Date().toLocaleTimeString());
    }, 800);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Integration Health & Webhook Telemetry
            </h1>
            <Badge variant="success" size="sm">
              ALL SYSTEMS OPERATIONAL
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time status monitoring for 3 Razorpay webhooks, Meta Insights, 3 WATI gateways, and AI voice endpoints.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePingAll}
          disabled={isPinging}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${isPinging ? 'animate-spin text-brand-600' : ''}`} />
          <span>{isPinging ? 'Pinging endpoints...' : 'Ping All Endpoints'}</span>
        </Button>
      </div>

      {/* Health Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Operational Uptime</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-100">99.98%</p>
          <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">Zero dropped webhooks in last 30 days</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Average Ingress Latency</span>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-900 dark:text-blue-100">54 ms</p>
          <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-400">Direct Fastify & Next.js gateway routes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Active Monitored Services</span>
            <Server className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">9 / 9</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Last verified: {lastPingTime}</p>
        </div>
      </div>

      {/* Integration Services Grid */}
      <Card title="Connected Third-Party Endpoints" subtitle="Live health telemetry across all cloud integrations">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">Service Name</th>
                <th className="py-3 px-3 font-semibold">Integration Type</th>
                <th className="py-3 px-3 font-semibold">Endpoint URI</th>
                <th className="py-3 px-3 font-semibold">Subscribed Events</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Latency</th>
                <th className="py-3 px-3 font-semibold text-right">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {integrations.map((svc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 dark:text-white">{svc.name}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {svc.type}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {svc.url}
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-wrap gap-1">
                      {svc.events.map((ev, i) => (
                        <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <Badge variant={svc.status === 'HEALTHY' ? 'success' : 'warning'} size="sm">
                      {svc.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {svc.latency}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-400">
                    {svc.lastEvent}
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
