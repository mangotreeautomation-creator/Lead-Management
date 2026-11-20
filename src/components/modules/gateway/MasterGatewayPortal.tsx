'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { CompanyCode, BusinessUnitCode } from '../../../data/types';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles,
  Compass,
  Hand,
  Gem,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
  Globe,
  Building,
  TrendingUp,
  Store
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

export const MasterGatewayPortal: React.FC = () => {
  const {
    appStage,
    setAppStage,
    selectedCompany,
    enterCompanyWorkflow,
    enterCategoryWorkflow,
    db
  } = useApp();

  // Login form state
  const [email, setEmail] = useState('admin@mangotreetechnology.com');
  const [password, setPassword] = useState('admin123');
  const [isLifting, setIsLifting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle Login submission with card lift animation
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginError('');
    setIsLifting(true);
    setTimeout(() => {
      setAppStage('COMPANY_SELECT');
      setIsLifting(false);
    }, 750);
  };

  // Stats helper per company
  const getCompanyStats = (comp: CompanyCode) => {
    if (comp === 'ALL') {
      const leads = db.leads.length;
      const rev = db.capturedPayments.reduce((s, p) => s + (p.amount || 0), 0);
      return { leads, rev, ordersCount: db.orders.length };
    }

    const compLeads = db.leads.filter(l => l.company === comp);
    const compOrders = db.orders.filter(o => o.company === comp);
    const orderIds = compOrders.map(o => o.id);
    const rev = db.capturedPayments
      .filter(cp => orderIds.includes(cp.orderId))
      .reduce((s, p) => s + (p.amount || 0), 0);

    return { leads: compLeads.length, rev, ordersCount: compOrders.length };
  };

  // Stats helper per category
  const getCategoryStats = (cat: BusinessUnitCode, comp: CompanyCode) => {
    let leads = db.leads.filter(l => l.businessUnit === cat);
    if (comp !== 'ALL') {
      leads = leads.filter(l => l.company === comp);
    }
    const orderIds = db.orders.filter(o => o.businessUnit === cat).map(o => o.id);
    const rev = db.capturedPayments
      .filter(cp => orderIds.includes(cp.orderId))
      .reduce((s, p) => s + (p.amount || 0), 0);
    return { leads: leads.length, rev };
  };

  // =========================================================================
  // RENDER: STEP 1 - LOGIN CARD WITH SMOOTH CARD-LIFT ANIMATION
  // =========================================================================
  if (appStage === 'LOGIN') {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#07090e] px-4 py-8 text-white selection:bg-brand-500 selection:text-white overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[140px]" />
          <div className="h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[150px] -translate-x-32" />
        </div>

        {/* The Login Card */}
        <div
          className={`relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0f1117]/95 p-8 shadow-2xl backdrop-blur-xl transition-all duration-700 ${
            isLifting ? 'animate-card-lift' : 'animate-fade-scale'
          }`}
        >
          {/* Header & Logo */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 shadow-inner">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-300 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MANGO TREE TECHNOLOGY
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              MTT Lead Management
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Enterprise CRM, Multi-Company Lead Telemetry & Razorpay Reconciliation
            </p>
          </div>

          {loginError && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Workstation Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700/70 bg-zinc-900/80 pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="name@mangotreetechnology.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                <span className="text-[11px] text-zinc-500">Security: Tier-1 SSL</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700/70 bg-zinc-900/80 pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                />
                Remember session
              </label>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@mangotreetechnology.com');
                  setPassword('admin123');
                }}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                Autofill Super Admin
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-[0.99] transition-all"
            >
              Sign In to MTT Lead Management
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center text-[11px] text-zinc-500">
            Protected by Enterprise Role-Based Access Control • v2.8
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STEP 2 - COMPANY SELECTION PORTAL (POST-LOGIN)
  // =========================================================================
  if (appStage === 'COMPANY_SELECT') {
    const companies: Array<{
      code: CompanyCode;
      name: string;
      tagline: string;
      domain: string;
      razorpayAccount: string;
      categoriesContained: string[];
      accentColor: string;
      icon: any;
      isMasterHub?: boolean;
    }> = [
      {
        code: 'VASTU_SHIKHAR',
        name: 'Vastu Shikhar',
        tagline: 'Astrology, Vastu Architecture & Private Bespoke Consultations',
        domain: 'https://consultancy.vastushikhar.com',
        razorpayAccount: 'Razorpay Account 3 (Vastu Shikhar)',
        categoriesContained: ['Astrology', 'Vastu', 'Consultancy'],
        accentColor: 'amber',
        icon: Building2
      },
      {
        code: 'GLOBALINCH',
        name: 'GlobalInch',
        tagline: 'Automated Digital Floorplan Reports, AI Palm Scanning & Voice Telephony',
        domain: 'https://www.mangotreetechnology.com',
        razorpayAccount: 'Razorpay Account 2 (GlobalInch)',
        categoriesContained: ['Vastu Wheel Report', 'Palmistry (Ravi Kumar proof)'],
        accentColor: 'blue',
        icon: Globe
      },
      {
        code: 'MANGO_TREE',
        name: 'Mango Tree Technology',
        tagline: 'Spiritual Life Guidance, Energized Yantras & Sacred Remedies',
        domain: 'https://astroshi.com',
        razorpayAccount: 'Razorpay Account 1 (Mango Tree)',
        categoriesContained: ['Astroshi Spiritual Guidance'],
        accentColor: 'emerald',
        icon: Gem
      },
      {
        code: 'ALL',
        name: 'All Companies Combined',
        tagline: 'Unified Enterprise Master Hub Consolidating All 3 Operating Companies',
        domain: 'All Connected Domains',
        razorpayAccount: 'All 3 Connected Razorpay Gateways',
        categoriesContained: ['All 6 Categories Consolidated', 'Cross-Company Telemetry'],
        accentColor: 'purple',
        icon: Layers,
        isMasterHub: true
      }
    ];

    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#07090e] px-6 py-12 text-white selection:bg-brand-500 selection:text-white">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
          <div className="h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[160px] translate-x-40" />
        </div>

        <div className="relative z-10 w-full max-w-5xl animate-fade-scale">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-3">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              AUTHENTICATED • STEP 1 OF 2
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Select Operating Company
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
              Choose which corporate entity's data, categories, and Razorpay flows you want to inspect.
            </p>
          </div>

          {/* 4 Company Cards Grid with Generous Spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map(comp => {
              const Icon = comp.icon;
              const stats = getCompanyStats(comp.code);

              return (
                <div
                  key={comp.code}
                  onClick={() => enterCompanyWorkflow(comp.code)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-7 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    comp.isMasterHub
                      ? 'border-purple-500/40 bg-gradient-to-br from-[#12101f] to-[#0f1117] hover:border-purple-500/80 hover:shadow-purple-500/10'
                      : 'border-zinc-800 bg-[#0f1117] hover:border-blue-500/60 hover:shadow-blue-500/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                        comp.isMasterHub
                          ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      } group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-wide border ${
                        comp.isMasterHub
                          ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      }`}>
                        {comp.isMasterHub ? 'MASTER HUB' : 'OPERATING COMPANY'}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {comp.name}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed mb-4">
                      {comp.tagline}
                    </p>

                    {/* Contained Categories */}
                    <div className="mb-4">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 font-semibold">
                        Categories & Funnels:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.categoriesContained.map((cat, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats & Action */}
                  <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500">Live Leads / Captured Rev</div>
                      <div className="text-sm font-semibold text-white">
                        {formatNumber(stats.leads)} leads • <span className="text-emerald-400">{formatCurrency(stats.rev)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>{comp.isMasterHub ? 'Enter Hub' : 'Select'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STEP 3 - CATEGORY SELECTION INSIDE SELECTED COMPANY
  // =========================================================================
  if (appStage === 'CATEGORY_SELECT') {
    // Define categories based on selectedCompany
    let categoryList: Array<{
      id: BusinessUnitCode;
      title: string;
      subtitle: string;
      description: string;
      icon: any;
      subTracks: string[];
    }> = [];

    let companyTitle = 'Vastu Shikhar';
    let companySubtitle = 'Select a category to audit inside Vastu Shikhar';

    if (selectedCompany === 'VASTU_SHIKHAR') {
      companyTitle = 'Vastu Shikhar';
      companySubtitle = 'Vedic Architecture, Astrology & Bespoke Consultations';
      categoryList = [
        {
          id: 'ALL',
          title: 'All Vastu Shikhar Categories',
          subtitle: 'Combined Data (Astrology + Vastu + Consultancy)',
          description: 'Consolidated overview combining all 3 vertical funnels under Vastu Shikhar.',
          icon: Layers,
          subTracks: ['Astrology Leads', 'Vastu Leads', 'Consultancy Leads']
        },
        {
          id: 'ASTROLOGY',
          title: 'Astrology',
          subtitle: 'Janam Kundali & Planetary Dasha Consultations',
          description: 'Vedic birth chart calculations, astrological consultations, and remedy leads.',
          icon: Sparkles,
          subTracks: ['Janam Kundali', 'Planetary Transit', 'Gemstone Remedies']
        },
        {
          id: 'VASTU',
          title: 'Vastu',
          subtitle: 'Residential & Commercial Vastu Architecture',
          description: 'Physical and virtual architectural audits for homes, offices, and factories.',
          icon: Compass,
          subTracks: ['Residential Vastu', 'Commercial Office', 'Factory Architecture']
        },
        {
          id: 'CONSULTANCY',
          title: 'Consultancy',
          subtitle: '1-on-1 Bespoke Vastu Shikhar Audits',
          description: 'High-ticket personal consultations and VIP on-site evaluations.',
          icon: Building2,
          subTracks: ['Bespoke Vastu Shikhar', 'VIP Personal Audit']
        }
      ];
    } else if (selectedCompany === 'GLOBALINCH') {
      companyTitle = 'GlobalInch';
      companySubtitle = 'Automated Digital Floorplans & AI Palm Scanning';
      categoryList = [
        {
          id: 'ALL',
          title: 'All GlobalInch Categories',
          subtitle: 'Combined Data (Vastu Wheel Report + Palmistry)',
          description: 'Consolidated overview combining Vastu Wheel automated reports and Palmistry funnels.',
          icon: Layers,
          subTracks: ['Vastu Wheel Leads', 'Palmistry Leads', 'AI Telephony Recovered']
        },
        {
          id: 'VASTU_REPORT',
          title: 'Vastu Wheel Report',
          subtitle: 'Instant Automated Floorplan Audit PDF',
          description: 'Automated 16-zone digital energy mapping reports for homes and corporate spaces.',
          icon: Compass,
          subTracks: ['Residential Wheel', 'Commercial Report', 'Express Audit']
        },
        {
          id: 'PALMISTRY',
          title: 'Palmistry',
          subtitle: 'Digital Palm Reading & AI Voice Recovery',
          description: 'Hand analysis funnels, AI phone calls (Agent Pooja), and verified ₹999 Ravi Kumar payment proof.',
          icon: Hand,
          subTracks: ['Comprehensive Report', 'Instant Hand Line Scan', 'AI Assisted Calls']
        }
      ];
    } else if (selectedCompany === 'MANGO_TREE') {
      companyTitle = 'Mango Tree Technology';
      companySubtitle = 'Spiritual E-Commerce & Sacred Energy Remedies';
      categoryList = [
        {
          id: 'ASTROSHI',
          title: 'Astroshi',
          subtitle: 'Spiritual Remedies & Sacred Energy Store',
          description: 'Energized yantras, sacred rudraksha beads, and customized astrological remedies.',
          icon: Gem,
          subTracks: ['Sacred Guidance', 'Energized Yantras', 'Gemstone Remedies']
        },
        {
          id: 'ALL',
          title: 'All Mango Tree Technology Data',
          subtitle: 'Full Company Telemetry',
          description: 'Unified marketing and payment metrics for all Mango Tree Technology assets.',
          icon: Layers,
          subTracks: ['All Astroshi Funnels', 'Razorpay Account 1 Settlements']
        }
      ];
    }

    return (
      <div className="relative min-h-screen w-full bg-[#07090e] px-6 py-10 text-white selection:bg-brand-500 selection:text-white animate-slide-in-left">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[180px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Top Bar with Clear Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-zinc-800/80 mb-8">
            <button
              onClick={() => setAppStage('COMPANY_SELECT')}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Company Selection
            </button>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              COMPANY: {companyTitle.toUpperCase()}
            </div>
          </div>

          {/* Section Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Choose Category inside {companyTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              {companySubtitle}. The entire CRM dashboard, ads attribution, and payment telemetry will isolate to your selection.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryList.map(cat => {
              const Icon = cat.icon;
              const stats = getCategoryStats(cat.id, selectedCompany);

              return (
                <div
                  key={cat.id}
                  onClick={() => enterCategoryWorkflow(selectedCompany, cat.id)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#0f1117] p-6 shadow-lg hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 text-blue-400 group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-blue-400 flex items-center gap-1">
                        Enter Workspace
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {cat.title}
                    </h3>
                    <div className="text-[11px] font-medium text-zinc-400 mb-2">
                      {cat.subtitle}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cat.subTracks.map((st, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-zinc-800/90 bg-zinc-900/90 px-2 py-0.5 text-[10px] text-zinc-300"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-500">Live Leads</div>
                      <div className="font-semibold text-white">{formatNumber(stats.leads)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500">Captured Rev</div>
                      <div className="font-semibold text-emerald-400">{formatCurrency(stats.rev)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
