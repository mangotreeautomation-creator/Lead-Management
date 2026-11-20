'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Settings,
  Webhook,
  Key,
  Building2,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  ExternalLink,
  Layers,
  Database,
  Lock,
  Globe,
  Radio,
  FileCode,
  Sliders,
  CheckCheck,
  Sparkles
} from 'lucide-react';

type SettingsTab = 'webhooks' | 'api-keys' | 'companies' | 'team-rbac' | 'automation-alerts';

interface WebhookConfig {
  id: string;
  name: string;
  service: 'RAZORPAY' | 'META' | 'AI_VOICE' | 'WATI' | 'LANDING_PAGE';
  endpoint: string;
  secret: string;
  status: 'ACTIVE' | 'LISTENING' | 'DEGRADED';
  events: string[];
  lastPing: string;
  latencyMs: number;
}

export const SettingsView: React.FC = () => {
  const { selectedCompany, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('webhooks');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});
  const [pingSuccessId, setPingSuccessId] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState<string | null>(null);

  // Webhooks Configuration List
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: 'wh_rzp_01',
      name: 'Razorpay Payment Captured & Failed Gateway Webhook',
      service: 'RAZORPAY',
      endpoint: 'https://api.vastushikhar.com/api/v1/webhooks/razorpay',
      secret: 'rzp_sec_live_99a8x0013f9c_vastu_prod',
      status: 'ACTIVE',
      events: ['payment.captured', 'payment.failed', 'order.paid', 'refund.processed'],
      lastPing: '2 mins ago (HTTP 200 OK)',
      latencyMs: 14
    },
    {
      id: 'wh_meta_02',
      name: 'Meta Ads Graph API v21.0 Leadgen Ingestion Webhook',
      service: 'META',
      endpoint: 'https://api.vastushikhar.com/api/v1/webhooks/meta-leadgen',
      secret: 'meta_verify_token_vastu_leadgen_2026',
      status: 'ACTIVE',
      events: ['leadgen', 'ad_account_insights', 'campaign_sync'],
      lastPing: '4 mins ago (HTTP 200 OK)',
      latencyMs: 28
    },
    {
      id: 'wh_voice_03',
      name: 'AI Voice Telephony (Agent Pooja) Call Completion Webhook',
      service: 'AI_VOICE',
      endpoint: 'https://api.vastushikhar.com/api/v1/webhooks/ai-voice/completed',
      secret: 'pooja_voice_hook_sec_4418a99',
      status: 'ACTIVE',
      events: ['call.completed', 'transcript.generated', 'sentiment.positive_recovery'],
      lastPing: '7 mins ago (HTTP 200 OK)',
      latencyMs: 19
    },
    {
      id: 'wh_wati_04',
      name: 'WATI WhatsApp Interactive Response & Delivery Hook',
      service: 'WATI',
      endpoint: 'https://api.vastushikhar.com/api/v1/webhooks/wati/events',
      secret: 'wati_inbound_secret_token_8892',
      status: 'ACTIVE',
      events: ['message.delivered', 'message.read', 'button.quick_reply_clicked'],
      lastPing: '12 mins ago (HTTP 200 OK)',
      latencyMs: 32
    },
    {
      id: 'wh_lp_05',
      name: 'Custom WordPress & Webflow Funnel Direct Ingestion Webhook',
      service: 'LANDING_PAGE',
      endpoint: 'https://api.vastushikhar.com/api/v1/webhooks/funnel/lead-form',
      secret: 'lp_ingest_auth_bearer_990117',
      status: 'LISTENING',
      events: ['form.submitted', 'checkout.initiated', 'utm.tracked'],
      lastPing: '18 mins ago (HTTP 200 OK)',
      latencyMs: 11
    }
  ]);

  // Recent Webhook Event Deliveries Log
  const recentEvents = [
    {
      id: 'evt_01',
      source: 'Razorpay',
      event: 'payment.captured',
      amount: '₹999.00',
      customer: 'Ravi Kumar',
      time: '17:58:12',
      status: '200 OK',
      duration: '14ms'
    },
    {
      id: 'evt_02',
      source: 'AI Voice',
      event: 'call.completed',
      amount: '135s duration',
      customer: 'Pooja ➔ Ravi Kumar',
      time: '17:57:44',
      status: '200 OK',
      duration: '18ms'
    },
    {
      id: 'evt_03',
      source: 'Razorpay',
      event: 'payment.failed',
      amount: '₹999.00 (Bank Decline)',
      customer: 'Ravi Kumar',
      time: '17:55:02',
      status: '200 OK',
      duration: '16ms'
    },
    {
      id: 'evt_04',
      source: 'Meta Ads',
      event: 'leadgen (Palmistry AI Scan)',
      amount: '40s Quick Hook',
      customer: 'Tanvi Mehta',
      time: '17:52:19',
      status: '200 OK',
      duration: '29ms'
    },
    {
      id: 'evt_05',
      source: 'WATI',
      event: 'button.quick_reply_clicked',
      amount: 'WhatsApp Link Open',
      customer: 'Meera Gupta',
      time: '17:48:30',
      status: '200 OK',
      duration: '22ms'
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleShowSecret = (id: string) => {
    setShowSecretMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestPing = (id: string) => {
    setIsPinging(id);
    setTimeout(() => {
      setIsPinging(null);
      setPingSuccessId(id);
      setTimeout(() => setPingSuccessId(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 font-sans text-zinc-200">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Enterprise Settings & Integrations Vault</span>
                <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                  PRODUCTION v2.4
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure real-time webhooks, API secrets, multi-tenant company routing, and automated recovery SLA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All 5 Webhooks Listening</span>
          </span>
        </div>
      </div>

      {/* 2. TAB CONTROLS (Shopify / Linear Style) */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'webhooks'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
          }`}
        >
          <Webhook className="h-3.5 w-3.5" />
          <span>Webhooks & Endpoints</span>
          <span className="rounded bg-black/30 px-1.5 py-0.2 text-[10px] font-mono">5</span>
        </button>

        <button
          onClick={() => setActiveTab('api-keys')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'api-keys'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>API Credentials & Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'companies'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Multi-Tenant Companies</span>
        </button>

        <button
          onClick={() => setActiveTab('team-rbac')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'team-rbac'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Roles & Security (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('automation-alerts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'automation-alerts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Alerts & Auto-Calling SLA</span>
        </button>
      </div>

      {/* 3. TAB 1: WEBHOOKS & ENDPOINTS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Webhook Configuration Cards */}
          <div className="grid grid-cols-1 gap-4">
            {webhooks.map(wh => {
              const isSecretVisible = showSecretMap[wh.id] || false;
              const isCopied = copiedId === wh.id;
              const isPinged = pingSuccessId === wh.id;
              const pingLoading = isPinging === wh.id;

              return (
                <div
                  key={wh.id}
                  className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 shadow-lg space-y-4 hover:border-zinc-700 transition-colors"
                >
                  {/* Top line: Name, Status badge, and Ping Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
                        <Webhook className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{wh.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                          <span className="font-mono text-zinc-500">{wh.id}</span>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {wh.status} ({wh.latencyMs}ms avg)
                          </span>
                          <span>•</span>
                          <span>{wh.lastPing}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestPing(wh.id)}
                        disabled={pingLoading}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          isPinged
                            ? 'bg-emerald-600 text-white'
                            : 'border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                        }`}
                      >
                        {pingLoading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
                        ) : isPinged ? (
                          <CheckCheck className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Send className="h-3.5 w-3.5 text-blue-400" />
                        )}
                        <span>{isPinged ? 'Test Ping Received (200 OK)' : pingLoading ? 'Sending Ping...' : 'Test Webhook Ping'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Endpoint URL Row */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Public Inbound Webhook URL (POST):
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-xl border border-zinc-800 bg-[#0a0c12] px-3 py-2 font-mono text-xs text-blue-300 truncate select-all">
                        {wh.endpoint}
                      </div>
                      <button
                        onClick={() => handleCopy(wh.id, wh.endpoint)}
                        className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Secret Key & Subscribed Events */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Secret Key */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        HMAC Signature Secret Key:
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-xl border border-zinc-800 bg-[#0a0c12] px-3 py-2 font-mono text-xs text-zinc-300 truncate">
                          {isSecretVisible ? wh.secret : '••••••••••••••••••••••••••••••••'}
                        </div>
                        <button
                          onClick={() => toggleShowSecret(wh.id)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 hover:text-white"
                          title="Toggle secret visibility"
                        >
                          {isSecretVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(`${wh.id}_sec`, wh.secret)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 hover:text-white"
                          title="Copy Secret"
                        >
                          {copiedId === `${wh.id}_sec` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Subscribed Events */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Subscribed Event Triggers:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {wh.events.map(evt => (
                          <span
                            key={evt}
                            className="rounded-md border border-zinc-700/80 bg-zinc-800 px-2 py-1 font-mono text-[11px] text-zinc-300 font-semibold"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Webhook Ingestion Log (Live Stream) */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live Webhook Deliveries & Telemetry Stream</h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Reconciled in real-time</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-semibold uppercase text-zinc-500 bg-zinc-900/60">
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Gateway / Source</th>
                    <th className="p-2.5">Event Type</th>
                    <th className="p-2.5">Customer / Payload</th>
                    <th className="p-2.5">Amount / Metric</th>
                    <th className="p-2.5">Response</th>
                    <th className="p-2.5 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {recentEvents.map(evt => (
                    <tr key={evt.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-2.5 text-zinc-400">{evt.time}</td>
                      <td className="p-2.5 font-bold text-white font-sans">{evt.source}</td>
                      <td className="p-2.5">
                        <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-blue-300">
                          {evt.event}
                        </span>
                      </td>
                      <td className="p-2.5 text-zinc-300 font-sans">{evt.customer}</td>
                      <td className="p-2.5 font-bold text-emerald-400 font-sans">{evt.amount}</td>
                      <td className="p-2.5">
                        <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-zinc-400">{evt.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: API KEYS */}
      {activeTab === 'api-keys' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 shadow-lg space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Production API Keys Vault</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Encrypted credentials used by background cron sync workers, Meta Ads ingestors, and WhatsApp engines.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-[#0c0e14] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Razorpay Live Key ID</span>
                <span className="font-mono text-xs text-zinc-400">rzp_live_9901182A7BC390</span>
              </div>
              <button
                onClick={() => handleCopy('rzp_key', 'rzp_live_9901182A7BC390')}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
              >
                {copiedId === 'rzp_key' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === 'rzp_key' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#0c0e14] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Meta Ads Marketing Graph API Token</span>
                <span className="font-mono text-xs text-zinc-400">EAAG••••••••••••••••••••••••••••••••••••••••••••••••</span>
              </div>
              <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                Expires in 42 days
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#0c0e14] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">WATI WhatsApp Access Token</span>
                <span className="font-mono text-xs text-zinc-400">Bearer wati_sec_prod_9918002a••••••••</span>
              </div>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                Connected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 font-bold text-white text-xs">
                VS
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Vastu Shikhar</h4>
                <p className="text-[11px] text-zinc-400">consultancy.vastushikhar.com</p>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-xs space-y-1.5 text-zinc-300">
              <div className="flex justify-between"><span>Categories:</span><span className="font-bold text-white">Astrology, Vastu, Consultancy</span></div>
              <div className="flex justify-between"><span>Default Gateway:</span><span className="font-mono text-blue-400">Razorpay VS Account</span></div>
              <div className="flex justify-between"><span>Currency:</span><span>INR (₹)</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white text-xs">
                GI
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">GlobalInch</h4>
                <p className="text-[11px] text-zinc-400">mangotreetechnology.com</p>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-xs space-y-1.5 text-zinc-300">
              <div className="flex justify-between"><span>Categories:</span><span className="font-bold text-white">Vastu Report, Palmistry (AI)</span></div>
              <div className="flex justify-between"><span>Landmark:</span><span className="text-emerald-400 font-semibold">Ravi Kumar (₹999)</span></div>
              <div className="flex justify-between"><span>Currency:</span><span>INR (₹)</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
                MT
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Mango Tree Tech</h4>
                <p className="text-[11px] text-zinc-400">astroshi.com</p>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-xs space-y-1.5 text-zinc-300">
              <div className="flex justify-between"><span>Categories:</span><span className="font-bold text-white">Astroshi Sacred Remedies</span></div>
              <div className="flex justify-between"><span>Default Gateway:</span><span className="font-mono text-blue-400">Razorpay MTT Account</span></div>
              <div className="flex justify-between"><span>Currency:</span><span>INR (₹)</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: TEAM RBAC */}
      {activeTab === 'team-rbac' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Enterprise Role-Based Access Control (RBAC)</h3>
          <div className="space-y-3">
            {[
              { role: 'SUPER_ADMIN', desc: 'Full unrestricted access to all 3 companies, webhook keys, database export, and calling dials.', users: 'Alfaz Mansuri' },
              { role: 'EXECUTIVE_LEADERSHIP', desc: 'Read-only multi-channel financial metrics, blended ROAS, and net bank payouts.', users: 'Director Dashboard' },
              { role: 'PERFORMANCE_MARKETER', desc: 'Access to Meta Ads spend, CPL, CTR, and landing page conversion funnels.', users: 'Acquisition Team' },
              { role: 'SALES_CALLING_TEAM', desc: '1-Click Voice Dial, WhatsApp templates, and failed payments recovery calling sheet.', users: 'Agent Pooja & Team' },
              { role: 'FINANCE_RECONCILIATION', desc: 'Razorpay fee breakdown, GST calculation, and daily bank settlement audit.', users: 'Finance Dept' }
            ].map(r => (
              <div key={r.role} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-[#0c0e14] gap-3">
                <div>
                  <span className="font-mono font-bold text-blue-400 text-xs block">{r.role}</span>
                  <p className="text-xs text-zinc-400">{r.desc}</p>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 font-medium shrink-0">
                  {r.users}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: AUTOMATION ALERTS */}
      {activeTab === 'automation-alerts' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0f1117] p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Automated Recovery Calling & Failure Spike SLAs</h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0e14] flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Immediate AI Voice Dial Trigger</span>
                <span className="text-zinc-400">Trigger Agent Pooja call within 120 seconds of UPI/Card failure</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 border border-emerald-500/30">
                ENABLED (120s)
              </span>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0e14] flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">WATI WhatsApp Recovery Link Auto-Send</span>
                <span className="text-zinc-400">Auto-dispatch payment recovery link template if customer is unreachable by voice</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 border border-emerald-500/30">
                ENABLED
              </span>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0e14] flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Payment Decline Spike Alert</span>
                <span className="text-zinc-400">Send high-priority notification to Super Admin if failure rate exceeds 40%</span>
              </div>
              <span className="rounded-full bg-blue-500/20 text-blue-300 font-bold px-3 py-1 border border-blue-500/30">
                THRESHOLD: 40%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
