'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { CompanyCode, BusinessUnitCode } from '../../../data/types';
import {
  Zap,
  Clock,
  Mail,
  Send,
  Calendar,
  Building2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Users2,
  Trash2,
  Play,
  Pause,
  Plus,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  CreditCard,
  PhoneCall,
  Sparkles,
  Bot,
  AlertOctagon,
  Download,
  Copy,
  Eye,
  Check,
  Filter,
  ShieldCheck,
  Sliders,
  ArrowUpRight,
  Activity,
  Terminal,
  RefreshCw,
  Hash,
  Laptop,
  Smartphone,
  Share2,
  ArrowLeft,
  Paperclip,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export type CadenceType = 'RECURRING' | 'CUSTOM_DATE';
export type AutomationFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'BI_MONTHLY';

export interface RecipientContact {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatarColor: string;
}

export interface AutomatedBriefing {
  id: string;
  code: string;
  title: string;
  company: CompanyCode;
  category: 'ALL' | BusinessUnitCode;
  cadenceType: CadenceType;
  frequencies: AutomationFrequency[];
  dailyTime: string;
  weeklyDays: string[];
  monthlyDate: number;
  exactExecutionDate?: string;
  exactExecutionTime?: string;
  dataScope: 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM_RANGE';
  customDataStartDate?: string;
  customDataEndDate?: string;
  recipients: RecipientContact[];
  channels: {
    emailHtml: boolean;
    pdfAttachment: boolean; // Compulsory
    whatsappDigest: boolean;
    slackWebhook: boolean;
  };
  status: 'ACTIVE' | 'PAUSED';
  createdAt: string;
  nextRun: string;
  totalRuns: number;
  optionalMemo?: string;
  metricsSnapshot: {
    grossRevenue: string;
    adSpend: string;
    roas: string;
    netPayout: string;
    blendedCac: string;
    leadsGenerated: number;
    paymentsCaptured: number;
    telephonyCalls: number;
    telephonyRecoveredGmv: string;
    weakPoint: {
      headline: string;
      lossAmount: string;
      rootCause: string;
      channel: string;
    };
    keyStrength: {
      headline: string;
      metric: string;
      driver: string;
    };
    chartData: Array<{
      date: string;
      spend: number;
      revenue: number;
      payout: number;
    }>;
  };
}

export const AutomationHubView: React.FC = () => {
  const { selectedCompany, db } = useApp();

  // Page View Mode (IN-PAGE SWITCH: NO POPUPS!)
  const [pageMode, setPageMode] = useState<'HUB' | 'STUDIO' | 'DOSSIER_VIEW'>('HUB');
  const [activeHubTab, setActiveHubTab] = useState<'PIPELINES' | 'AUDIT_LOG' | 'DELIVERY_TELEMETRY'>('PIPELINES');
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<'ALL' | CompanyCode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');

  // Studio Flow Node Navigation
  const [studioActiveNode, setStudioActiveNode] = useState<1 | 2 | 3 | 4>(1);
  const [previewTab, setPreviewTab] = useState<'EMAIL_BRIEF' | 'PDF_DOSSIER' | 'WHATSAPP_DIGEST'>('EMAIL_BRIEF');
  const [chartType, setChartType] = useState<'FINANCIAL_TREND' | 'CHANNEL_ATTRIBUTION'>('FINANCIAL_TREND');

  // Currently Inspected Pipeline in Dossier View
  const [selectedPipelineForDossier, setSelectedPipelineForDossier] = useState<AutomatedBriefing | null>(null);
  const [testSentSuccess, setTestSentSuccess] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Corporate Directory Contacts for Google Workspace Style Autocomplete
  const directoryContacts: RecipientContact[] = [
    { id: 'c1', name: 'Alfaz Mansuri', email: 'alfaz.mansuri@vastushikhar.com', role: 'Super Admin / Platform Lead', avatarColor: 'bg-blue-600' },
    { id: 'c2', name: 'Managing Director (Boss)', email: 'director.office@vastushikhar.com', role: 'Chief Executive Officer', avatarColor: 'bg-purple-600' },
    { id: 'c3', name: 'Finance Controller', email: 'finance.lead@vastushikhar.com', role: 'Head of Accounts & Reconciliation', avatarColor: 'bg-emerald-600' },
    { id: 'c4', name: 'Performance Marketing Head', email: 'acquisition@vastushikhar.com', role: 'Head of Meta Ads & Media Buying', avatarColor: 'bg-amber-600' },
    { id: 'c5', name: 'Agent Pooja Telephony Lead', email: 'calling.desk@vastushikhar.com', role: 'AI Tele-Calling Desk Manager', avatarColor: 'bg-rose-600' },
    { id: 'c6', name: 'GlobalInch Operations Hub', email: 'leadership@mangotreetechnology.com', role: 'Managing Partner', avatarColor: 'bg-indigo-600' },
    { id: 'c7', name: 'Vastu Tech Operations', email: 'ops@vastushikhar.com', role: 'Lead Operations & CRM', avatarColor: 'bg-cyan-600' },
  ];

  // Studio Form States
  const [studioTitle, setStudioTitle] = useState('Vastu Shikhar Astrology Leadership Daily Briefing');
  const [studioCompany, setStudioCompany] = useState<CompanyCode>('VASTU_SHIKHAR');
  const [studioCategory, setStudioCategory] = useState<'ALL' | BusinessUnitCode>('ASTROLOGY');
  
  // Cadence States
  const [cadenceMode, setCadenceMode] = useState<CadenceType>('RECURRING');
  const [selectedFrequencies, setSelectedFrequencies] = useState<AutomationFrequency[]>(['DAILY', 'WEEKLY']);
  const [dailyTime, setDailyTime] = useState('09:00 AM IST');
  const [weeklyDays, setWeeklyDays] = useState<string[]>(['Monday']);
  const [monthlyDate, setMonthlyDate] = useState<number>(1);
  
  // Exact Custom Date Execution
  const [exactCustomDate, setExactCustomDate] = useState('2026-11-15');
  const [exactCustomTime, setExactCustomTime] = useState('18:30 IST');
  
  // Data Scope States
  const [dataScope, setDataScope] = useState<'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM_RANGE'>('YESTERDAY');
  const [customDataStart, setCustomDataStart] = useState('2026-11-01');
  const [customDataEnd, setCustomDataEnd] = useState('2026-11-04');

  // Contact Chips State
  const [recipients, setRecipients] = useState<RecipientContact[]>([
    directoryContacts[1], // Boss
    directoryContacts[0]  // Alfaz
  ]);
  const [contactSearchInput, setContactSearchInput] = useState('');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const contactInputRef = useRef<HTMLInputElement>(null);

  // Channels (PDF is COMPULSORY)
  const [channelEmail, setChannelEmail] = useState(true);
  const channelPdfCompulsory = true; // Always compulsory as per user instruction
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelSlack, setChannelSlack] = useState(false);

  // Optional Executive Memo (No preachy "boss directive")
  const [optionalMemo, setOptionalMemo] = useState('Campaign ad spend scaled +15% yesterday. Razorpay UPI gateway timeout on HDFC monitored.');

  // Default Chart Data (7-Day Financial Performance)
  const defaultChartData = [
    { date: '29 Oct', spend: 320000, revenue: 4210000, payout: 4115000 },
    { date: '30 Oct', spend: 345000, revenue: 4580000, payout: 4475000 },
    { date: '31 Oct', spend: 370000, revenue: 4890000, payout: 4776000 },
    { date: '01 Nov', spend: 380000, revenue: 5020000, payout: 4902000 },
    { date: '02 Nov', spend: 360000, revenue: 4740000, payout: 4630000 },
    { date: '03 Nov', spend: 390000, revenue: 5124000, payout: 5003000 },
    { date: '04 Nov (Today)', spend: 280000, revenue: 3890000, payout: 3798000 },
  ];

  // Seeded Production Pipelines
  const [automations, setAutomations] = useState<AutomatedBriefing[]>([
    {
      id: 'pipe_vs_astro_01',
      code: 'PIP-8021',
      title: 'Vastu Shikhar Astrology Daily Leadership Briefing',
      company: 'VASTU_SHIKHAR',
      category: 'ASTROLOGY',
      cadenceType: 'RECURRING',
      frequencies: ['DAILY', 'WEEKLY'],
      dailyTime: '09:00 AM IST',
      weeklyDays: ['Monday'],
      monthlyDate: 1,
      dataScope: 'YESTERDAY',
      recipients: [directoryContacts[1], directoryContacts[0], directoryContacts[3]],
      channels: { emailHtml: true, pdfAttachment: true, whatsappDigest: true, slackWebhook: false },
      status: 'ACTIVE',
      createdAt: '2026-10-15',
      nextRun: 'Tomorrow at 09:00 AM IST',
      totalRuns: 68,
      optionalMemo: 'Video 01 scaling active; Razorpay HDFC node monitoring in progress.',
      metricsSnapshot: {
        grossRevenue: '₹51,24,000.00',
        adSpend: '₹3,90,000.00',
        roas: '13.14x',
        netPayout: '₹50,03,073.60',
        blendedCac: '₹75.00',
        leadsGenerated: 5200,
        paymentsCaptured: 5124,
        telephonyCalls: 135,
        telephonyRecoveredGmv: '₹1,34,865.00',
        weakPoint: {
          headline: 'UPI Payment Pin Verification Timeout (47.0% Drop)',
          lossAmount: '₹42,800.00',
          rootCause: 'HDFC & SBI UPI Server gateway response latency > 42s causing abandoned checkouts',
          channel: 'Razorpay UPI'
        },
        keyStrength: {
          headline: 'Video Ad Creative #01 (House Energy) Driving 3.82x ROAS',
          metric: '41.2% Cold Conversion',
          driver: 'Meta Video Ad Set B (Hindi Vernacular)'
        },
        chartData: defaultChartData
      }
    },
    {
      id: 'pipe_gi_palm_02',
      code: 'PIP-8022',
      title: 'GlobalInch Palmistry AI Telephony Pulse',
      company: 'GLOBALINCH',
      category: 'PALMISTRY',
      cadenceType: 'RECURRING',
      frequencies: ['DAILY', 'WEEKLY', 'MONTHLY'],
      dailyTime: '09:30 AM IST',
      weeklyDays: ['Monday', 'Thursday'],
      monthlyDate: 1,
      dataScope: 'YESTERDAY',
      recipients: [directoryContacts[1], directoryContacts[5]],
      channels: { emailHtml: true, pdfAttachment: true, whatsappDigest: false, slackWebhook: true },
      status: 'ACTIVE',
      createdAt: '2026-10-20',
      nextRun: 'Tomorrow at 09:30 AM IST',
      totalRuns: 45,
      optionalMemo: '₹999 package conversion rate steady across Tier-2 cities.',
      metricsSnapshot: {
        grossRevenue: '₹28,45,000.00',
        adSpend: '₹2,10,000.00',
        roas: '13.54x',
        netPayout: '₹27,88,100.00',
        blendedCac: '₹73.81',
        leadsGenerated: 2845,
        paymentsCaptured: 2840,
        telephonyCalls: 98,
        telephonyRecoveredGmv: '₹97,902.00',
        weakPoint: {
          headline: 'Checkout Dropout at ₹999 Ticket Pin Entry',
          lossAmount: '₹31,968.00',
          rootCause: 'Tier-2 leads encountering daily bank UPI limit error',
          channel: 'Mobile Web Checkout'
        },
        keyStrength: {
          headline: 'Agent Pooja Tele-Recovery Converting 46.8% of Failed Leads',
          metric: '₹97,902 Recovered',
          driver: 'Instant 60s Call Dispatch'
        },
        chartData: defaultChartData
      }
    },
    {
      id: 'pipe_all_master_03',
      code: 'PIP-8023',
      title: 'Unified 3-Company Combined Board Audit',
      company: 'ALL',
      category: 'ALL',
      cadenceType: 'RECURRING',
      frequencies: ['WEEKLY', 'MONTHLY'],
      dailyTime: '10:00 AM IST',
      weeklyDays: ['Monday'],
      monthlyDate: 1,
      dataScope: 'LAST_7_DAYS',
      recipients: [directoryContacts[1], directoryContacts[0], directoryContacts[2]],
      channels: { emailHtml: true, pdfAttachment: true, whatsappDigest: true, slackWebhook: true },
      status: 'ACTIVE',
      createdAt: '2026-10-01',
      nextRun: 'Monday at 10:00 AM IST',
      totalRuns: 16,
      optionalMemo: 'Reconciled GST and Razorpay monthly statement attached for CA.',
      metricsSnapshot: {
        grossRevenue: '₹1,02,48,000.00',
        adSpend: '₹7,80,000.00',
        roas: '13.14x',
        netPayout: '₹1,00,06,147.20',
        blendedCac: '₹75.00',
        leadsGenerated: 10400,
        paymentsCaptured: 10248,
        telephonyCalls: 310,
        telephonyRecoveredGmv: '₹3,12,000.00',
        weakPoint: {
          headline: 'Consultancy High-Ticket Lead Drop-Off (₹5,100 Slot Booking)',
          lossAmount: '₹76,500.00',
          rootCause: 'Delay in manual astrologer call-back exceeding 15 minutes',
          channel: 'High-Ticket CRM'
        },
        keyStrength: {
          headline: 'Blended Cross-Company ROAS Sustained at 13.14x',
          metric: '₹1.02 Cr Monthly Run Rate',
          driver: 'Triangulated Meta Ads Attribution'
        },
        chartData: defaultChartData
      }
    },
    {
      id: 'pipe_diwali_custom_04',
      code: 'PIP-8024',
      title: 'Mid-Month Strategic Campaign Retrospective',
      company: 'VASTU_SHIKHAR',
      category: 'VASTU',
      cadenceType: 'CUSTOM_DATE',
      frequencies: [],
      dailyTime: '',
      weeklyDays: [],
      monthlyDate: 15,
      exactExecutionDate: '2026-11-15',
      exactExecutionTime: '18:00 IST',
      dataScope: 'CUSTOM_RANGE',
      customDataStartDate: '2026-11-01',
      customDataEndDate: '2026-11-15',
      recipients: [directoryContacts[1], directoryContacts[0], directoryContacts[4]],
      channels: { emailHtml: true, pdfAttachment: true, whatsappDigest: false, slackWebhook: false },
      status: 'ACTIVE',
      createdAt: '2026-11-02',
      nextRun: '15 Nov 2026 at 06:00 PM IST',
      totalRuns: 0,
      optionalMemo: 'Comprehensive review of Diwali marketing spend vs revenue.',
      metricsSnapshot: {
        grossRevenue: '₹34,12,000.00',
        adSpend: '₹2,60,000.00',
        roas: '13.12x',
        netPayout: '₹33,31,600.00',
        blendedCac: '₹76.10',
        leadsGenerated: 3412,
        paymentsCaptured: 3380,
        telephonyCalls: 85,
        telephonyRecoveredGmv: '₹84,915.00',
        weakPoint: {
          headline: 'Vastu Wheel Form Abandonment on Mobile Viewports',
          lossAmount: '₹28,500.00',
          rootCause: 'Compass rendering lag on older Android browsers',
          channel: 'Landing Page Wheel'
        },
        keyStrength: {
          headline: 'Vastu Course Upsell Rate at Record 24.8%',
          metric: '₹8.4L Secondary GMV',
          driver: 'Live Webinar Conversion'
        },
        chartData: defaultChartData
      }
    }
  ]);

  // Audit Log History
  const [auditLogs] = useState([
    {
      id: 'log_01',
      pipelineCode: 'PIP-8021',
      pipelineTitle: 'Vastu Shikhar Astrology Daily Leadership Briefing',
      dispatchedAt: 'Today, 09:00:02 AM IST',
      recipientsCount: 3,
      status: 'DELIVERED',
      latency: '1.2s',
      channels: ['Email', 'Compulsory PDF', 'WhatsApp'],
      revenueReported: '₹51,24,000.00',
      roas: '13.14x',
      weakPointIdentified: 'UPI Timeout (₹42.8k)'
    },
    {
      id: 'log_02',
      pipelineCode: 'PIP-8022',
      pipelineTitle: 'GlobalInch Palmistry AI Telephony Pulse',
      dispatchedAt: 'Yesterday, 09:30:04 AM IST',
      recipientsCount: 2,
      status: 'DELIVERED',
      latency: '1.4s',
      channels: ['Email', 'Compulsory PDF', 'Slack'],
      revenueReported: '₹28,45,000.00',
      roas: '13.54x',
      weakPointIdentified: '₹999 Pin Drop'
    },
    {
      id: 'log_03',
      pipelineCode: 'PIP-8023',
      pipelineTitle: 'Unified 3-Company Combined Board Audit',
      dispatchedAt: '03 Nov 2026, 10:00:01 AM IST',
      recipientsCount: 3,
      status: 'DELIVERED',
      latency: '2.1s',
      channels: ['Email', 'Compulsory PDF', 'WhatsApp', 'Slack'],
      revenueReported: '₹1,02,48,000.00',
      roas: '13.14x',
      weakPointIdentified: 'Consultancy Drop (₹76.5k)'
    }
  ]);

  // Filtered Automations
  const filteredAutomations = useMemo(() => {
    return automations.filter(a => {
      const matchSearch =
        a.title.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        a.recipients.some(r => r.name.toLowerCase().includes(pipelineSearch.toLowerCase()) || r.email.toLowerCase().includes(pipelineSearch.toLowerCase()));
      const matchCompany = companyFilter === 'ALL' || a.company === companyFilter;
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSearch && matchCompany && matchStatus;
    });
  }, [automations, pipelineSearch, companyFilter, statusFilter]);

  // Company helper
  const getCompanyDetails = (comp: CompanyCode) => {
    switch (comp) {
      case 'VASTU_SHIKHAR':
        return { name: 'Vastu Shikhar', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300', initials: 'VS' };
      case 'GLOBALINCH':
        return { name: 'GlobalInch', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', initials: 'GI' };
      case 'MANGO_TREE':
        return { name: 'Mango Tree Technology', badge: 'bg-blue-500/10 border-blue-500/30 text-blue-300', initials: 'MT' };
      default:
        return { name: 'Unified Master Hub (All 3)', badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300', initials: 'ALL' };
    }
  };

  // Dynamic Categories per Company in Studio
  const getCategoriesForSelectedCompany = () => {
    if (studioCompany === 'VASTU_SHIKHAR') {
      return [
        { id: 'ALL', label: 'All 3 Categories Combined' },
        { id: 'ASTROLOGY', label: 'Astrology Webinar' },
        { id: 'VASTU', label: 'Vastu Webinar' },
        { id: 'CONSULTANCY', label: 'Consultancy (High Ticket)' }
      ];
    }
    if (studioCompany === 'GLOBALINCH') {
      return [
        { id: 'ALL', label: 'All GlobalInch Tracks' },
        { id: 'PALMISTRY', label: 'Palmistry (AI Telephony)' },
        { id: 'VASTU_REPORT', label: 'Vastu Wheel Report' }
      ];
    }
    if (studioCompany === 'MANGO_TREE') {
      return [
        { id: 'ALL', label: 'All MTT Tracks' },
        { id: 'ASTROSHI', label: 'Astroshi Sacred Remedies' }
      ];
    }
    return [
      { id: 'ALL', label: 'All 3 Companies & All Categories Combined' },
      { id: 'ASTROLOGY', label: 'Astrology (Vastu Shikhar)' },
      { id: 'VASTU', label: 'Vastu (Vastu Shikhar)' },
      { id: 'PALMISTRY', label: 'Palmistry (GlobalInch)' },
      { id: 'CONSULTANCY', label: 'Consultancy' }
    ];
  };

  // Contact Autocomplete Filtering
  const filteredDirectory = directoryContacts.filter(
    c =>
      !recipients.some(r => r.id === c.id) &&
      (c.name.toLowerCase().includes(contactSearchInput.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearchInput.toLowerCase()) ||
        c.role.toLowerCase().includes(contactSearchInput.toLowerCase()))
  );

  const handleAddRecipient = (contact: RecipientContact) => {
    if (!recipients.some(r => r.id === contact.id)) {
      setRecipients([...recipients, contact]);
    }
    setContactSearchInput('');
    setIsContactDropdownOpen(false);
  };

  const handleRemoveRecipient = (id: string) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleCustomEmailAdd = () => {
    if (!contactSearchInput.includes('@') || !contactSearchInput.includes('.')) return;
    const newContact: RecipientContact = {
      id: `custom_${Date.now()}`,
      name: contactSearchInput.split('@')[0],
      email: contactSearchInput.trim(),
      role: 'Executive Recipient',
      avatarColor: 'bg-zinc-700'
    };
    handleAddRecipient(newContact);
  };

  const toggleFrequency = (freq: AutomationFrequency) => {
    setSelectedFrequencies(prev => {
      if (prev.includes(freq)) {
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== freq);
      }
      return [...prev, freq];
    });
  };

  const toggleWeeklyDay = (day: string) => {
    setWeeklyDays(prev => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  };

  const togglePipelineStatus = (id: string) => {
    setAutomations(prev =>
      prev.map(a => (a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : a))
    );
  };

  const deletePipeline = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  const handleTriggerNow = (briefing: AutomatedBriefing) => {
    setTestSentSuccess(briefing.id);
    setTimeout(() => {
      setTestSentSuccess(null);
    }, 4500);
  };

  const handleSavePipeline = () => {
    const newCode = `PIP-${Math.floor(8025 + Math.random() * 900)}`;
    const newPipeline: AutomatedBriefing = {
      id: `pipe_${Date.now()}`,
      code: newCode,
      title: studioTitle || `${getCompanyDetails(studioCompany).name} Executive Briefing`,
      company: studioCompany,
      category: studioCategory,
      cadenceType: cadenceMode,
      frequencies: selectedFrequencies,
      dailyTime: dailyTime,
      weeklyDays: weeklyDays,
      monthlyDate: monthlyDate,
      exactExecutionDate: cadenceMode === 'CUSTOM_DATE' ? exactCustomDate : undefined,
      exactExecutionTime: cadenceMode === 'CUSTOM_DATE' ? exactCustomTime : undefined,
      dataScope: dataScope,
      customDataStartDate: dataScope === 'CUSTOM_RANGE' ? customDataStart : undefined,
      customDataEndDate: dataScope === 'CUSTOM_RANGE' ? customDataEnd : undefined,
      recipients: recipients,
      channels: {
        emailHtml: channelEmail,
        pdfAttachment: true, // Always compulsory
        whatsappDigest: channelWhatsapp,
        slackWebhook: channelSlack
      },
      status: 'ACTIVE',
      createdAt: '2026-11-04',
      nextRun:
        cadenceMode === 'CUSTOM_DATE'
          ? `${exactCustomDate} at ${exactCustomTime}`
          : 'Tomorrow at 09:00 AM IST',
      totalRuns: 0,
      optionalMemo: optionalMemo,
      metricsSnapshot: {
        grossRevenue: '₹51,24,000.00',
        adSpend: '₹3,90,000.00',
        roas: '13.14x',
        netPayout: '₹50,03,073.60',
        blendedCac: '₹75.00',
        leadsGenerated: 5200,
        paymentsCaptured: 5124,
        telephonyCalls: 135,
        telephonyRecoveredGmv: '₹1,34,865.00',
        weakPoint: {
          headline: 'UPI Payment Pin Verification Timeout (47.0% Drop)',
          lossAmount: '₹42,800.00',
          rootCause: 'HDFC & SBI UPI Server gateway response latency > 42s causing abandoned checkouts',
          channel: 'Razorpay UPI Gateway'
        },
        keyStrength: {
          headline: 'Video Ad Creative #01 (House Energy) Driving 3.82x ROAS',
          metric: '41.2% Cold Conversion',
          driver: 'Meta Video Ad Set B (Hindi Vernacular)'
        },
        chartData: defaultChartData
      }
    };

    setAutomations([newPipeline, ...automations]);
    setPageMode('HUB');
    handleTriggerNow(newPipeline);
  };

  // =========================================================================
  // VIEW MODE 1: DEDICATED FULL-PAGE AUTOMATION STUDIO (NO POPUP!)
  // =========================================================================
  if (pageMode === 'STUDIO') {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto animate-in fade-in duration-200 font-sans text-zinc-200">
        
        {/* Studio Top Action Bar */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0f17] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPageMode('HUB')}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Pipelines</span>
            </button>
            <div className="h-6 w-[1px] bg-zinc-800" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Executive Automation Studio</span>
                <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-400">
                  FULL PAGE DESIGNER
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Design custom schedule, Google Workspace contacts, and visual charts with compulsory PDF dossier.
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1.5 bg-[#12141e] p-1 rounded-xl border border-zinc-800 text-xs">
            {[
              { node: 1, label: '1. Scope & Track' },
              { node: 2, label: '2. Cadence & Calendar' },
              { node: 3, label: '3. Data & Visual Chart' },
              { node: 4, label: '4. Contacts & Delivery' }
            ].map(step => (
              <button
                key={step.node}
                onClick={() => setStudioActiveNode(step.node as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  studioActiveNode === step.node
                    ? 'bg-blue-600 text-white shadow font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePipeline}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
            >
              <Check className="h-4 w-4" />
              <span>Save & Activate Pipeline</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Studio Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: CONFIGURATION DECK (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800/80 bg-[#10121a]/95 p-6 shadow-2xl space-y-6">
            
            {/* NODE 1: SCOPE */}
            {studioActiveNode === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block mb-1">
                    STEP 1 OF 4: ENTERPRISE SCOPE
                  </span>
                  <h3 className="text-base font-bold text-white">Target Company & Category Track</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select the business unit and webinar/consultancy track to analyze.
                  </p>
                </div>

                {/* Company Scope */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">1. Select Company:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'VASTU_SHIKHAR' as CompanyCode, name: 'Vastu Shikhar', subtitle: 'Astrology, Vastu & Consult' },
                      { id: 'GLOBALINCH' as CompanyCode, name: 'GlobalInch', subtitle: 'Palmistry & AI Telephony' },
                      { id: 'MANGO_TREE' as CompanyCode, name: 'Mango Tree Technology', subtitle: 'Astroshi Sacred Remedies' },
                      { id: 'ALL' as CompanyCode, name: 'Unified Master Hub', subtitle: 'All 3 Companies Combined' }
                    ].map(comp => (
                      <div
                        key={comp.id}
                        onClick={() => {
                          setStudioCompany(comp.id);
                          setStudioCategory('ALL');
                        }}
                        className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                          studioCompany === comp.id
                            ? 'border-blue-500 bg-blue-600/10 ring-1 ring-blue-500'
                            : 'border-zinc-800 bg-[#12141e] hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{comp.name}</span>
                          {studioCompany === comp.id && <Check className="h-4 w-4 text-blue-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-1">{comp.subtitle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Track */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">2. Select Category Track:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {getCategoriesForSelectedCompany().map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => setStudioCategory(cat.id as any)}
                        className={`rounded-xl border p-3 cursor-pointer transition-all ${
                          studioCategory === cat.id
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                            : 'border-zinc-800 bg-[#12141e] hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-200">{cat.label}</span>
                          {studioCategory === cat.id && <Check className="h-4 w-4 text-amber-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Title */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300">Pipeline Dossier Title:</label>
                  <input
                    type="text"
                    value={studioTitle}
                    onChange={e => setStudioTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#12141e] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStudioActiveNode(2)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                  >
                    <span>Next: Cadence & Calendar</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* NODE 2: CADENCE & INTERACTIVE CALENDAR */}
            {studioActiveNode === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                    STEP 2 OF 4: SMART CADENCE & CUSTOM CALENDAR
                  </span>
                  <h3 className="text-base font-bold text-white">Execution Schedule & Trigger Engine</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Schedule recurring pulses or click any specific date on the interactive calendar.
                  </p>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-[#12141e] p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    onClick={() => setCadenceMode('RECURRING')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                      cadenceMode === 'RECURRING'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Recurring Multi-Pulse</span>
                  </button>

                  <button
                    onClick={() => setCadenceMode('CUSTOM_DATE')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                      cadenceMode === 'CUSTOM_DATE'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Exact Custom Date Run</span>
                  </button>
                </div>

                {/* Recurring Options */}
                {cadenceMode === 'RECURRING' && (
                  <div className="space-y-4 rounded-2xl border border-zinc-800 bg-[#12141e] p-4">
                    <label className="text-xs font-bold text-zinc-200 block">
                      Delivery Frequencies (Multi-Select Allowed):
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: 'DAILY' as AutomationFrequency, title: 'Daily Morning Pulse', desc: 'Everyday at 09:00 AM IST' },
                        { id: 'WEEKLY' as AutomationFrequency, title: 'Weekly Monday Digest', desc: 'Monday 09:30 AM IST' },
                        { id: 'MONTHLY' as AutomationFrequency, title: 'Monthly 1st Audit', desc: '1st of every month 10:00 AM' },
                        { id: 'BI_MONTHLY' as AutomationFrequency, title: '60-Day Strategic Pulse', desc: 'Every 2 months' }
                      ].map(f => {
                        const active = selectedFrequencies.includes(f.id);
                        return (
                          <div
                            key={f.id}
                            onClick={() => toggleFrequency(f.id)}
                            className={`rounded-xl border p-3 cursor-pointer transition-all flex items-start gap-2.5 ${
                              active
                                ? 'border-blue-500 bg-blue-600/10 ring-1 ring-blue-500'
                                : 'border-zinc-800 bg-[#090b10] hover:border-zinc-700'
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border mt-0.5 ${
                                active ? 'border-blue-500 bg-blue-600 text-white' : 'border-zinc-700 bg-zinc-900'
                              }`}
                            >
                              {active && <Check className="h-3 w-3" />}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">{f.title}</span>
                              <span className="text-[10px] text-zinc-400">{f.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Weekly Days Selection */}
                    {selectedFrequencies.includes('WEEKLY') && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block">
                          Select Weekly Delivery Days:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const isDay = weeklyDays.includes(day);
                            return (
                              <button
                                key={day}
                                onClick={() => toggleWeeklyDay(day)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                  isDay
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                {day.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Daily Time Input */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                      <div>
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                          Execution Time:
                        </label>
                        <input
                          type="text"
                          value={dailyTime}
                          onChange={e => setDailyTime(e.target.value)}
                          placeholder="09:00 AM IST"
                          className="w-full rounded-xl border border-zinc-800 bg-[#090b10] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                          Timezone:
                        </label>
                        <div className="rounded-xl border border-zinc-800 bg-[#090b10] px-3 py-2 text-xs text-zinc-300">
                          Asia/Kolkata (IST • UTC+5:30)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exact Custom Date Calendar */}
                {cadenceMode === 'CUSTOM_DATE' && (
                  <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-[#12141e] p-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-amber-400" />
                        <span>Interactive Calendar Date Picker:</span>
                      </label>
                      <span className="font-mono text-xs text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                        Selected: {exactCustomDate}
                      </span>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-[#090b10] p-3.5">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                        <span className="text-xs font-bold text-white font-mono">November 2026</span>
                        <span className="text-[10px] text-zinc-500">Click any day to select</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-zinc-500 mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <div key={d}>{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
                        {Array.from({ length: 30 }, (_, i) => {
                          const dayNum = i + 1;
                          const dateStr = `2026-11-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                          const isSelected = exactCustomDate === dateStr;
                          const isToday = dayNum === 4;

                          return (
                            <button
                              key={dayNum}
                              onClick={() => setExactCustomDate(dateStr)}
                              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30 scale-105'
                                  : isToday
                                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                                  : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                          Execution Time:
                        </label>
                        <input
                          type="text"
                          value={exactCustomTime}
                          onChange={e => setExactCustomTime(e.target.value)}
                          placeholder="18:30 IST"
                          className="w-full rounded-xl border border-zinc-800 bg-[#090b10] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                          Audit Context:
                        </label>
                        <input
                          type="text"
                          defaultValue="Board Strategy Review"
                          className="w-full rounded-xl border border-zinc-800 bg-[#090b10] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStudioActiveNode(1)}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:text-white"
                  >
                    Back: Scope
                  </button>
                  <button
                    onClick={() => setStudioActiveNode(3)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                  >
                    <span>Next: Visual Chart & Metrics</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* NODE 3: DATA TIMEFRAME & VISUAL CHART CONFIGURATION */}
            {studioActiveNode === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block mb-1">
                    STEP 3 OF 4: FINANCIAL INTELLIGENCE & VISUAL CHARTS
                  </span>
                  <h3 className="text-base font-bold text-white">Data Period Scope & Visual Analytics</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configure data analysis window and visual graph embedded inside the executive PDF & email.
                  </p>
                </div>

                {/* Data Scope */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">1. Data Period to Analyze:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'TODAY' as const, label: 'Today (Live So Far)' },
                      { id: 'YESTERDAY' as const, label: 'Yesterday (Full Day)' },
                      { id: 'LAST_7_DAYS' as const, label: 'Last 7 Days Rolling' },
                      { id: 'LAST_30_DAYS' as const, label: 'Last 30 Days' },
                      { id: 'CUSTOM_RANGE' as const, label: 'Custom Date Range' }
                    ].map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDataScope(d.id)}
                        className={`rounded-xl border p-2 text-xs font-medium text-left transition-all ${
                          dataScope === d.id
                            ? 'border-blue-500 bg-blue-600/15 text-blue-300 font-bold'
                            : 'border-zinc-800 bg-[#12141e] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {dataScope === 'CUSTOM_RANGE' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">From Date:</label>
                        <input
                          type="date"
                          value={customDataStart}
                          onChange={e => setCustomDataStart(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-[#090b10] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">To Date:</label>
                        <input
                          type="date"
                          value={customDataEnd}
                          onChange={e => setCustomDataEnd(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-[#090b10] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual Chart Embed Mode */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300">2. Embedded Executive Visual Chart Style:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setChartType('FINANCIAL_TREND')}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        chartType === 'FINANCIAL_TREND'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-zinc-800 bg-[#12141e] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Spend vs Revenue Trend</span>
                    </button>

                    <button
                      onClick={() => setChartType('CHANNEL_ATTRIBUTION')}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        chartType === 'CHANNEL_ATTRIBUTION'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-bold'
                          : 'border-zinc-800 bg-[#12141e] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <LineChart className="h-4 w-4" />
                      <span>Triangulated Attribution Funnel</span>
                    </button>
                  </div>
                </div>

                {/* Optional Executive Note (No preachy directive) */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300">
                    3. Executive Memo / Internal Note (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={optionalMemo}
                    onChange={e => setOptionalMemo(e.target.value)}
                    placeholder="Add an optional operational note or context..."
                    className="w-full rounded-xl border border-zinc-800 bg-[#12141e] p-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Pure factual data is presented without preachy AI commands. You can include your own internal notes here.
                  </p>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStudioActiveNode(2)}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:text-white"
                  >
                    Back: Cadence
                  </button>
                  <button
                    onClick={() => setStudioActiveNode(4)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                  >
                    <span>Next: Google Contacts & PDF</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* NODE 4: CONTACTS & COMPULSORY PDF DELIVERY */}
            {studioActiveNode === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                    STEP 4 OF 4: RECIPIENTS & COMPULSORY PDF
                  </span>
                  <h3 className="text-base font-bold text-white">Google Workspace Contacts & Delivery Protocols</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Assign C-suite leadership inboxes. High-resolution PDF attachment is automatically included on every run.
                  </p>
                </div>

                {/* Google Workspace Contact Chips Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-200">
                    Assigned Leadership Inboxes ({recipients.length}):
                  </label>

                  <div className="rounded-2xl border border-zinc-700 bg-[#12141e] p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all space-y-2">
                    {/* Chips container */}
                    <div className="flex flex-wrap items-center gap-2">
                      {recipients.map(r => (
                        <div
                          key={r.id}
                          className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/90 pl-1.5 pr-2.5 py-1 text-xs text-white shadow-sm"
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${r.avatarColor}`}
                          >
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-xs">{r.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400">({r.email})</span>
                          <button
                            onClick={() => handleRemoveRecipient(r.id)}
                            className="ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Autocomplete Search input */}
                    <div className="relative">
                      <input
                        ref={contactInputRef}
                        type="text"
                        value={contactSearchInput}
                        onChange={e => {
                          setContactSearchInput(e.target.value);
                          setIsContactDropdownOpen(true);
                        }}
                        onFocus={() => setIsContactDropdownOpen(true)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCustomEmailAdd();
                          }
                        }}
                        placeholder="Type name or email to add recipient..."
                        className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none py-1"
                      />

                      {/* Dropdown Suggestions */}
                      {isContactDropdownOpen && filteredDirectory.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-zinc-700 bg-[#161922] p-1.5 shadow-2xl max-h-56 overflow-y-auto">
                          <span className="text-[9px] font-mono uppercase text-zinc-500 px-2 py-1 block">
                            Suggested Corporate Directory Contacts:
                          </span>
                          {filteredDirectory.map(c => (
                            <div
                              key={c.id}
                              onClick={() => handleAddRecipient(c)}
                              className="flex items-center justify-between rounded-lg p-2 hover:bg-zinc-800/80 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${c.avatarColor}`}
                                >
                                  {c.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-white block">{c.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">{c.email}</span>
                                </div>
                              </div>
                              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                                {c.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Channels with COMPULSORY PDF HIGHLIGHT */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-200">Delivery Channels & Attachments:</label>
                  
                  {/* COMPULSORY PDF NOTICE */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2.5">
                      <Paperclip className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Signed Executive PDF Dossier Attachment:</strong> Always generated with visual charts and attached to every dispatch.
                      </span>
                    </div>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 font-mono">
                      COMPULSORY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#12141e] p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelEmail}
                        onChange={e => setChannelEmail(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                      />
                      <span className="text-white font-medium">Leadership HTML Email</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#12141e] p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelWhatsapp}
                        onChange={e => setChannelWhatsapp(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                      />
                      <span className="text-white font-medium">WATI WhatsApp Digest</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStudioActiveNode(3)}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:text-white"
                  >
                    Back: Visual Chart
                  </button>
                  <button
                    onClick={handleSavePipeline}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
                  >
                    <Check className="h-4 w-4" />
                    <span>Complete & Activate Pipeline</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LIVE DYNAMIC EXECUTIVE DOSSIER & PDF PREVIEW (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-800/80 bg-[#090b10] p-6 shadow-2xl space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Executive Briefing & PDF Dossier
                </span>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono">
                  LIVE RENDER
                </span>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#12141e] p-1 text-xs">
                <button
                  onClick={() => setPreviewTab('EMAIL_BRIEF')}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    previewTab === 'EMAIL_BRIEF'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Executive Email
                </button>
                <button
                  onClick={() => setPreviewTab('PDF_DOSSIER')}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    previewTab === 'PDF_DOSSIER'
                      ? 'bg-zinc-200 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Signed PDF Sheet
                </button>
                <button
                  onClick={() => setPreviewTab('WHATSAPP_DIGEST')}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    previewTab === 'WHATSAPP_DIGEST'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* PREVIEW VIEW 1: EXECUTIVE EMAIL TEMPLATE */}
            {previewTab === 'EMAIL_BRIEF' && (
              <div className="rounded-2xl border border-zinc-700 bg-[#0d0f17] p-5 shadow-2xl text-zinc-200 space-y-4 font-sans animate-in fade-in">
                {/* Email Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 font-bold text-white text-xs">
                      {getCompanyDetails(studioCompany).initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs tracking-wide">
                          {getCompanyDetails(studioCompany).name.toUpperCase()} › {String(studioCategory).toUpperCase()}
                        </span>
                        <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                          CONFIDENTIAL
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Daily Leadership Intelligence & Performance Triangulation
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[9px] text-zinc-500">
                    <div>HASH: 9F8A-7721</div>
                    <div>04 Nov 2026 • 09:00 IST</div>
                  </div>
                </div>

                {/* 1. Hero Financial Bottom-Line Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#121520] p-3.5 rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-[9px] font-semibold uppercase font-mono text-zinc-500 block">Gross Collections</span>
                    <span className="text-sm font-bold font-mono text-white">₹51,24,000.00</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase font-mono text-zinc-500 block">Meta Ad Spend</span>
                    <span className="text-sm font-bold font-mono text-amber-300">₹3,90,000.00</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase font-mono text-zinc-500 block">Blended ROAS</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">13.14x</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase font-mono text-zinc-500 block">Net Bank Payout</span>
                    <span className="text-sm font-bold font-mono text-blue-400">₹50,03,073.60</span>
                  </div>
                </div>

                {/* 2. Triangulated Channels Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-zinc-800 bg-[#10121a] p-3">
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Meta Ads Channel</span>
                    </div>
                    <span className="text-xs font-mono text-white block">₹3.90L Spend • 5,200 Leads</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Blended CAC: ₹75.00 / Lead</span>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#10121a] p-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Razorpay Gateway</span>
                    </div>
                    <span className="text-xs font-mono text-white block">₹51.24L Captured • 5,124 Tx</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Gateway Deductions: ₹1.20L</span>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#10121a] p-3">
                    <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>AI Voice Calling Desk</span>
                    </div>
                    <span className="text-xs font-mono text-white block">Agent Pooja: 135 Calls</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Recovered GMV: ₹1.34L</span>
                  </div>
                </div>

                {/* 3. 🚨 Critical Weak Point Box */}
                <div className="rounded-2xl border-2 border-rose-500/80 bg-[#180a0e] p-4 shadow-lg">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/50">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-rose-400" />
                      <span className="font-extrabold text-xs text-rose-300 uppercase tracking-wide">
                        🚨 REVENUE LEAKAGE IDENTIFIED: ₹42,800.00
                      </span>
                    </div>
                    <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold">
                      UPI GATEWAY
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 font-semibold">
                    47.0% Checkout Drop (62% Bank UPI Server Timeout on HDFC/SBI)
                  </p>
                  <p className="text-[11px] text-rose-300/80 mt-1">
                    Gateway response latency exceeded 42 seconds, resulting in abandoned transactions before OTP pin entry.
                  </p>
                </div>

                {/* 4. 🏆 Proven Strength Box */}
                <div className="rounded-2xl border-2 border-emerald-500/80 bg-[#071710] p-4 shadow-lg">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span className="font-extrabold text-xs text-emerald-300 uppercase tracking-wide">
                        🏆 HIGHEST ROAS AD CREATIVE
                      </span>
                    </div>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono font-bold">
                      3.82x ROAS
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-semibold">
                    Video 01 (House Energy) driving 3.82x ROAS & 41.2% Cold Conversion
                  </p>
                  <p className="text-[11px] text-emerald-300/80 mt-1">
                    Meta Video Ad Set B (Hindi Vernacular) outperforming all static image creatives by +148%.
                  </p>
                </div>

                {/* 5. 📊 VISUAL PERFORMANCE ANALYSIS CHART (Compulsory in Email & PDF) */}
                <div className="rounded-2xl border border-zinc-800 bg-[#10121a] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Executive Financial Performance Chart (7-Day Rolling Trend)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Gross Collections
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-400" /> Ad Spend
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <span className="h-2 w-2 rounded-full bg-blue-400" /> Net Payout
                      </span>
                    </div>
                  </div>

                  {/* Visual Chart Bars Representation */}
                  <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2 border-b border-zinc-800">
                    {defaultChartData.map((d, idx) => {
                      const revenueHeightPercent = Math.min(100, Math.round((d.revenue / 5500000) * 100));
                      const spendHeightPercent = Math.min(100, Math.round((d.spend / 550000) * 80));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="w-full flex items-end justify-center gap-1 h-28">
                            {/* Revenue Bar */}
                            <div
                              style={{ height: `${revenueHeightPercent}%` }}
                              className="w-1/2 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-110 transition-all relative"
                            >
                              <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 bg-black px-1 py-0.5 rounded text-[8px] font-mono text-emerald-400 whitespace-nowrap transition-opacity">
                                ₹{(d.revenue / 100000).toFixed(1)}L
                              </span>
                            </div>
                            {/* Spend Bar */}
                            <div
                              style={{ height: `${spendHeightPercent}%` }}
                              className="w-1/3 rounded-t bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-110 transition-all relative"
                            >
                              <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 bg-black px-1 py-0.5 rounded text-[8px] font-mono text-amber-300 whitespace-nowrap transition-opacity">
                                ₹{(d.spend / 100000).toFixed(1)}L
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400 truncate w-full text-center">
                            {d.date.replace(' (Today)', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Peak Collection: ₹51.24L (03 Nov)</span>
                    <span>Average ROAS: 13.14x</span>
                  </div>
                </div>

                {/* 6. COMPULSORY SIGNED PDF ATTACHMENT CARD */}
                <div className="rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Attached: Executive_Intelligence_Dossier_20261104.pdf
                        </span>
                        <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                          COMPULSORY ATTACHMENT
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        1.4 MB • High-Resolution Vector Charts • Cryptographically Signed
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewTab('PDF_DOSSIER')}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View PDF</span>
                  </button>
                </div>

                {/* Optional Memo Footer */}
                {optionalMemo && (
                  <div className="rounded-xl border border-zinc-800 bg-[#12141e] p-3 text-xs text-zinc-300">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">Internal Memo:</span>
                    <span>{optionalMemo}</span>
                  </div>
                )}
              </div>
            )}

            {/* PREVIEW VIEW 2: EXECUTIVE PDF LIGHT SHEET */}
            {previewTab === 'PDF_DOSSIER' && (
              <div className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl text-zinc-900 space-y-4 font-sans animate-in fade-in">
                {/* PDF Header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900">
                  <div>
                    <h3 className="text-base font-black text-black tracking-tight">
                      {getCompanyDetails(studioCompany).name.toUpperCase()} EXECUTIVE INTELLIGENCE DOSSIER
                    </h3>
                    <span className="text-xs text-zinc-600 font-mono">
                      Category Track: {String(studioCategory).toUpperCase()} • Board Reference Standard
                    </span>
                  </div>
                  <span className="rounded bg-zinc-100 border border-zinc-300 px-2 py-1 text-[10px] font-mono font-bold text-zinc-800">
                    CONFIDENTIAL
                  </span>
                </div>

                {/* PDF Financial Summary */}
                <div className="grid grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block">Gross Revenue</span>
                    <span className="text-sm font-bold font-mono text-black">₹51,24,000.00</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block">Meta Ad Spend</span>
                    <span className="text-sm font-bold font-mono text-black">₹3,90,000.00</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block">Blended ROAS</span>
                    <span className="text-sm font-bold font-mono text-emerald-700">13.14x</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block">Net Bank Settlement</span>
                    <span className="text-sm font-bold font-mono text-blue-700">₹50,03,073.60</span>
                  </div>
                </div>

                {/* PDF Leakage Box */}
                <div className="rounded-xl border-l-4 border-rose-600 bg-rose-50 p-3">
                  <span className="text-xs font-bold text-rose-800 block">🚨 CRITICAL WEAK POINT: REVENUE LEAKAGE ₹42,800.00</span>
                  <p className="text-xs text-rose-950 mt-1">47.0% Checkout Drop due to HDFC/SBI UPI server response timeouts.</p>
                </div>

                {/* PDF Chart */}
                <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50">
                  <span className="text-xs font-bold text-zinc-800 block mb-2">7-Day Financial Performance Graph</span>
                  <div className="h-28 flex items-end justify-between gap-2 border-b border-zinc-300 pb-2">
                    {defaultChartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          style={{ height: `${(d.revenue / 5500000) * 100}%` }}
                          className="w-full bg-emerald-600 rounded-t"
                        />
                        <span className="text-[8px] font-mono text-zinc-600 mt-1">{d.date.slice(0, 6)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-200">
                  Page 1 of 1 • Generated via Antigravity Automated Intelligence Engine
                </div>
              </div>
            )}

            {/* PREVIEW VIEW 3: WHATSAPP DIGEST */}
            {previewTab === 'WHATSAPP_DIGEST' && (
              <div className="max-w-sm mx-auto rounded-3xl border-4 border-zinc-800 bg-[#0b141a] p-4 shadow-2xl text-zinc-200 space-y-3 font-sans animate-in fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[9px]">
                    VS
                  </div>
                  <span className="font-bold text-emerald-400">Vastu Shikhar Intelligence Bot</span>
                </div>

                <div className="rounded-2xl bg-[#1f2c34] p-3.5 text-xs text-zinc-200 space-y-2 leading-relaxed">
                  <div className="font-bold text-white">
                    *📊 LEADERSHIP BRIEFING: {getCompanyDetails(studioCompany).name}*
                  </div>
                  <div className="font-mono text-[11px] text-zinc-300">
                    • Gross: *₹51,24,000.00*
                    <br />• Spend: *₹3,90,000.00* (ROAS: *13.14x*)
                    <br />• Net Payout: *₹50,03,073.60*
                  </div>
                  <div className="text-[11px] text-rose-300">
                    *🚨 Weak Point:* UPI Timeout drop loss ₹42,800.
                  </div>
                  <div className="text-[11px] text-emerald-300">
                    *🏆 Strength:* Video 01 ROAS 3.82x.
                  </div>
                  <div className="text-[11px] text-amber-300">
                    *📎 Attached:* Executive_Intelligence_Dossier.pdf (1.4 MB)
                  </div>
                </div>
              </div>
            )}

            {/* Live Test Trigger Button */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                Cadence: {cadenceMode === 'CUSTOM_DATE' ? `Exact Date ${exactCustomDate}` : selectedFrequencies.join(', ')}
              </span>
              <button
                onClick={() => {
                  setTestSentSuccess('studio_test');
                  setTimeout(() => setTestSentSuccess(null), 3500);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <Send className="h-3.5 w-3.5 text-amber-400" />
                <span>Send Test Briefing & PDF to My Inbox</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: DEDICATED FULL-PAGE DOSSIER VIEW (INSPECT EXISTING PIPELINE)
  // =========================================================================
  if (pageMode === 'DOSSIER_VIEW' && selectedPipelineForDossier) {
    const pipeline = selectedPipelineForDossier;

    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto animate-in fade-in duration-200 font-sans text-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setPageMode('HUB');
                setSelectedPipelineForDossier(null);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Hub</span>
            </button>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{pipeline.title}</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  #{pipeline.code}
                </span>
              </h2>
              <span className="text-xs text-zinc-400">
                Scope: {pipeline.company} › {pipeline.category} • Next scheduled run: {pipeline.nextRun}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerNow(pipeline)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Execute Immediate Dispatch</span>
            </button>
          </div>
        </div>

        {/* Dossier Content Sheet */}
        <div className="rounded-3xl border border-zinc-800 bg-[#0d0f17] p-6 shadow-2xl space-y-6">
          {/* Financials Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#121520] p-4 rounded-2xl border border-zinc-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Gross Revenue</span>
              <span className="text-base font-bold font-mono text-white">{pipeline.metricsSnapshot.grossRevenue}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Meta Ad Spend</span>
              <span className="text-base font-bold font-mono text-amber-300">{pipeline.metricsSnapshot.adSpend}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Blended ROAS</span>
              <span className="text-base font-bold font-mono text-emerald-400">{pipeline.metricsSnapshot.roas}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Net Bank Settlement</span>
              <span className="text-base font-bold font-mono text-blue-400">{pipeline.metricsSnapshot.netPayout}</span>
            </div>
          </div>

          {/* Weak Point & Strength Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-rose-500/80 bg-[#180a0e] p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/50">
                <span className="font-extrabold text-xs text-rose-300 uppercase tracking-wide">
                  🚨 REVENUE LEAKAGE: {pipeline.metricsSnapshot.weakPoint.headline}
                </span>
                <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold">
                  {pipeline.metricsSnapshot.weakPoint.lossAmount}
                </span>
              </div>
              <p className="text-xs text-rose-200">{pipeline.metricsSnapshot.weakPoint.rootCause}</p>
            </div>

            <div className="rounded-2xl border-2 border-emerald-500/80 bg-[#071710] p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/50">
                <span className="font-extrabold text-xs text-emerald-300 uppercase tracking-wide">
                  🏆 TOP DRIVER: {pipeline.metricsSnapshot.keyStrength.headline}
                </span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono font-bold">
                  {pipeline.metricsSnapshot.keyStrength.metric}
                </span>
              </div>
              <p className="text-xs text-emerald-200">{pipeline.metricsSnapshot.keyStrength.driver}</p>
            </div>
          </div>

          {/* Visual Performance Chart */}
          <div className="rounded-2xl border border-zinc-800 bg-[#10121a] p-5 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Embedded 7-Day Performance Graph
            </span>
            <div className="h-36 flex items-end justify-between gap-3 border-b border-zinc-800 pb-2">
              {pipeline.metricsSnapshot.chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    style={{ height: `${(d.revenue / 5500000) * 100}%` }}
                    className="w-full bg-emerald-500 rounded-t"
                  />
                  <span className="text-[9px] font-mono text-zinc-400 mt-1">{d.date.slice(0, 6)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compulsory PDF Attachment Info */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Paperclip className="h-5 w-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Compulsory PDF Dossier Attached to All Dispatches
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Delivered to {pipeline.recipients.map(r => r.name).join(', ')}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                alert('Downloading signed high-resolution executive PDF dossier...');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 3: MAIN AUTOMATION HUB DASHBOARD (DEFAULT)
  // =========================================================================
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto animate-in fade-in duration-300 font-sans text-zinc-200">
      
      {/* 1. TOP TELEMETRY KERNEL COMMAND HEADER */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#0d0f17]/90 p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    Executive Automation Hub
                  </h1>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CRON ENGINE v4.2 • ONLINE
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Autonomous 1-glance C-suite intelligence briefings delivering triangulated Meta Ads, Razorpay reconciliations, and compulsory PDF attachments.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Telemetry KPI Pills & PRIMARY BUTTON (PAGE TRANSITION: NO MODAL!) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-[#121520] px-3.5 py-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Pipelines</span>
              <span className="text-base font-bold font-mono text-white">
                {automations.filter(a => a.status === 'ACTIVE').length} / {automations.length}
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121520] px-3.5 py-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Dispatched Today</span>
              <span className="text-base font-bold font-mono text-emerald-400">142 Briefs</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121520] px-3.5 py-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Delivery SLA</span>
              <span className="text-base font-bold font-mono text-blue-400">99.98%</span>
            </div>

            {/* Launch Studio Button transitions cleanly to Full Page Studio */}
            <button
              onClick={() => {
                setPageMode('STUDIO');
                setStudioActiveNode(1);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>+ Launch Automation Studio</span>
            </button>
          </div>
        </div>

        {/* Global Test Trigger Notification Banner */}
        {testSentSuccess && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Test Dispatch Executed:</strong> Executive 1-Glance Briefing & Compulsory PDF Dossier successfully pushed to leadership inboxes via Amazon SES & WATI API.
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80">HTTP 200 OK • 1.2s</span>
          </div>
        )}
      </div>

      {/* 2. SUB-NAVIGATION TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#10121a] p-1 text-xs">
          <button
            onClick={() => setActiveHubTab('PIPELINES')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
              activeHubTab === 'PIPELINES'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Active Pipelines ({automations.length})</span>
          </button>

          <button
            onClick={() => setActiveHubTab('AUDIT_LOG')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
              activeHubTab === 'AUDIT_LOG'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Telemetry & Audit Log ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveHubTab('DELIVERY_TELEMETRY')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
              activeHubTab === 'DELIVERY_TELEMETRY'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Gateway Health</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={pipelineSearch}
              onChange={e => setPipelineSearch(e.target.value)}
              placeholder="Search pipelines or contacts..."
              className="w-56 sm:w-64 rounded-xl border border-zinc-800 bg-[#11131a] pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-800 bg-[#11131a] px-3 py-1.5 text-xs text-zinc-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            <option value="VASTU_SHIKHAR">Vastu Shikhar</option>
            <option value="GLOBALINCH">GlobalInch</option>
            <option value="MANGO_TREE">Mango Tree Technology</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-800 bg-[#11131a] px-3 py-1.5 text-xs text-zinc-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      {/* 3. TAB 1: PIPELINES GRID VIEW */}
      {activeHubTab === 'PIPELINES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {filteredAutomations.map(pipeline => {
              const compMeta = getCompanyDetails(pipeline.company);

              return (
                <div
                  key={pipeline.id}
                  className="rounded-2xl border border-zinc-800/80 bg-[#10121a]/90 hover:border-zinc-700/80 p-5 shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Topline */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${compMeta.badge}`}>
                          {compMeta.name}
                        </span>
                        <span className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                          {pipeline.category}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">#{pipeline.code}</span>
                      </div>

                      {/* Status toggle */}
                      <button
                        onClick={() => togglePipelineStatus(pipeline.id)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                          pipeline.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            pipeline.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                          }`}
                        />
                        <span>{pipeline.status}</span>
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {pipeline.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>
                          {pipeline.cadenceType === 'CUSTOM_DATE' ? (
                            <strong className="text-amber-400">Exact Date: {pipeline.exactExecutionDate} ({pipeline.exactExecutionTime})</strong>
                          ) : (
                            <>
                              Frequencies: <strong className="text-zinc-200">{pipeline.frequencies.join(' + ')}</strong> • Next:{' '}
                              <strong className="text-emerald-400">{pipeline.nextRun}</strong>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Google Workspace Contact Avatars Stack */}
                    <div className="rounded-xl border border-zinc-800/80 bg-[#090b10] p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Recipients:</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {pipeline.recipients.map(r => (
                            <div
                              key={r.id}
                              title={`${r.name} (${r.email}) - ${r.role}`}
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[#090b10] ${r.avatarColor}`}
                            >
                              {r.name.slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        <span>Compulsory PDF Included</span>
                      </span>
                    </div>

                    {/* 1-Glance Metric Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-[#141724]/60 p-2.5 rounded-xl border border-zinc-800/60">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-zinc-500 block">Gross Revenue</span>
                        <span className="text-xs font-bold font-mono text-white">
                          {pipeline.metricsSnapshot.grossRevenue}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-zinc-500 block">Meta Ad Spend</span>
                        <span className="text-xs font-bold font-mono text-amber-300">
                          {pipeline.metricsSnapshot.adSpend}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-zinc-500 block">Blended ROAS</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {pipeline.metricsSnapshot.roas}
                        </span>
                      </div>
                    </div>

                    {/* Critical Weak Point */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 px-3 py-2 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertOctagon className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="truncate text-[11px] text-rose-200">
                          {pipeline.metricsSnapshot.weakPoint.headline}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-400 shrink-0">
                        {pipeline.metricsSnapshot.weakPoint.lossAmount}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <span>Channels:</span>
                      {pipeline.channels.emailHtml && <span title="Email HTML"><Mail className="h-3.5 w-3.5 text-blue-400" /></span>}
                      {pipeline.channels.pdfAttachment && <span title="Compulsory PDF"><FileText className="h-3.5 w-3.5 text-amber-400" /></span>}
                      {pipeline.channels.whatsappDigest && <span title="WhatsApp Digest"><MessageSquare className="h-3.5 w-3.5 text-emerald-400" /></span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTriggerNow(pipeline)}
                        className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        <Send className="h-3 w-3 text-amber-400" />
                        <span>Trigger Now</span>
                      </button>

                      {/* Opens Full Page Dossier View */}
                      <button
                        onClick={() => {
                          setSelectedPipelineForDossier(pipeline);
                          setPageMode('DOSSIER_VIEW');
                        }}
                        className="flex items-center gap-1 rounded-lg bg-blue-600/20 border border-blue-500/30 px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Preview Dossier</span>
                      </button>

                      <button
                        onClick={() => deletePipeline(pipeline.id)}
                        className="rounded-lg p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: AUDIT LOG */}
      {activeHubTab === 'AUDIT_LOG' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#10121a] overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Execution Stream & Dispatch Audit History</h3>
              <p className="text-xs text-zinc-400">Complete audit trail of every executive briefing generated and delivered.</p>
            </div>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
              {auditLogs.length} Records Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-sans">
              <thead className="bg-[#0b0d14] text-[10px] uppercase font-mono text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Pipeline Code</th>
                  <th className="px-4 py-3">Briefing Title</th>
                  <th className="px-4 py-3">Reported GMV</th>
                  <th className="px-4 py-3">ROAS</th>
                  <th className="px-4 py-3">Flagged Weak Point</th>
                  <th className="px-4 py-3">Channels</th>
                  <th className="px-4 py-3">Delivery Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{log.dispatchedAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-blue-400 font-bold">{log.pipelineCode}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans font-medium text-white">{log.pipelineTitle}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-200">{log.revenueReported}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-400">{log.roas}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans text-rose-300 text-[10px]">{log.weakPointIdentified}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-sans">
                        {log.channels.join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                        {log.status} ({log.latency})
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          const matched = automations.find(a => a.code === log.pipelineCode) || automations[0];
                          setSelectedPipelineForDossier(matched);
                          setPageMode('DOSSIER_VIEW');
                        }}
                        className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-sans font-medium text-zinc-200 hover:text-white"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: GATEWAY HEALTH */}
      {activeHubTab === 'DELIVERY_TELEMETRY' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#10121a] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Amazon SES SMTP Gateway</span>
              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Executive emails are signed with DKIM and SPF records for 100% leadership inboxing. Zero spam folder drop rate.
            </p>
            <div className="pt-2 text-[11px] font-mono text-zinc-500">
              Sender: leadership-briefing@vastushikhar.com
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#10121a] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">WATI WhatsApp Cloud API</span>
              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
                WEBHOOK ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instant smartphone summary card pushed to Managing Director's registered mobile number simultaneously with email.
            </p>
            <div className="pt-2 text-[11px] font-mono text-zinc-500">
              Gateway SLA: 99.99% • Latency: 420ms
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#10121a] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Telemetry & Anomaly Engine</span>
              <span className="rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono">
                MONITORING
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Continuously correlates Razorpay webhook logs with Meta Ad campaigns every 5 minutes to detect checkout drop-offs.
            </p>
            <div className="pt-2 text-[11px] font-mono text-zinc-500">
              Anomaly Sensitivity: High (Threshold: 35%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
