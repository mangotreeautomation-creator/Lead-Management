'use client';

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { BusinessUnitCode } from '../../../data/types';
import {
  Compass,
  Video,
  Hand,
  Sparkles,
  Building2,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

interface CategoryGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryGatewayModal: React.FC<CategoryGatewayModalProps> = ({ isOpen, onClose }) => {
  const { setSelectedVertical, setActiveModule, db } = useApp();

  if (!isOpen) return null;

  // Compute live stats per category
  const categories: Array<{
    id: BusinessUnitCode;
    title: string;
    subtypes: string[];
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    gradient: string;
    tag: string;
  }> = [
    {
      id: 'ALL',
      title: 'All Categories (Unified Hub)',
      subtypes: ['Vastu', 'Astrology', 'Palmistry', 'Astroshi', 'Webinars', 'Consultancy'],
      description: 'Master operational command center consolidating 3,120+ leads across all 6 commercial spheres and 3 payment accounts.',
      icon: Layers,
      accentColor: '#1a1a1a',
      gradient: 'from-slate-900 to-zinc-800',
      tag: 'MASTER PORTAL'
    },
    {
      id: 'VASTU',
      title: 'Vastu Operations',
      subtypes: ['Vastu Wheel Residential', 'Commercial Offices', 'Express Audits', 'Factory Architecture'],
      description: '4 dedicated landing pages, 4 Meta video creatives, and complete residential / commercial spatial audits.',
      icon: Compass,
      accentColor: '#0c85eb',
      gradient: 'from-blue-600 to-cyan-700',
      tag: '4 LANDING PAGES'
    },
    {
      id: 'WEBINAR',
      title: 'Webinars (Astro & Vastu)',
      subtypes: ['Astro Webinar Leads', 'Vastu Webinar Leads', '3-Day Live Cohort'],
      description: 'Live masterclass cohorts with specialized drill-down for Astro Webinar vs Vastu Webinar leads and video creatives.',
      icon: Video,
      accentColor: '#8b5cf6',
      gradient: 'from-purple-600 to-violet-800',
      tag: '2 WEBINAR TRACKS'
    },
    {
      id: 'PALMISTRY',
      title: 'Palmistry Reports',
      subtypes: ['Comprehensive Palm Report', 'Instant Hand Reading', 'AI Voice Telephony'],
      description: 'Hand analysis funnel with AI voice recovery (verified Ravi Kumar ₹999.00 captured benchmark).',
      icon: Hand,
      accentColor: '#f59e0b',
      gradient: 'from-amber-500 to-orange-700',
      tag: 'RAVI SCENARIO PROOF'
    },
    {
      id: 'ASTROLOGY',
      title: 'Astrology & Kundali',
      subtypes: ['Janam Kundali Blueprint', 'Career & Wealth Transit', 'Gemstone Remedies'],
      description: 'Vedic astrology birth chart audits, planetary dasha consultations, and high-conversion transit video ads.',
      icon: Sparkles,
      accentColor: '#ec4899',
      gradient: 'from-pink-600 to-rose-700',
      tag: '520+ LEADS'
    },
    {
      id: 'ASTROSHI',
      title: 'Astroshi Spiritual Guidance',
      subtypes: ['Spiritual Guidance', 'Energy Audits', 'Energized Gemstones & Yantras'],
      description: 'Sacred Vedic geometry and spatial energy harmonization leads with integrated WhatsApp AI nurturing.',
      icon: Sparkles,
      accentColor: '#10b981',
      gradient: 'from-emerald-600 to-teal-800',
      tag: 'SACRED ENERGY'
    },
    {
      id: 'CONSULTANCY',
      title: 'Vastu Shikhar Consultancy',
      subtypes: ['Bespoke Vastu Shikhar Site Audits', 'VIP HNW Architecture Audits'],
      description: 'High-ticket personal site visits (₹21,000+ ticket size) managed via Vastu Shikhar Razorpay Account.',
      icon: Building2,
      accentColor: '#d97706',
      gradient: 'from-amber-600 to-yellow-800',
      tag: 'HIGH-TICKET ₹21K+'
    }
  ];

  const handleSelectCategory = (catId: BusinessUnitCode) => {
    setSelectedVertical(catId);
    setActiveModule(catId === 'ALL' ? 'overview' : 'category-workspace');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 bg-[#f6f6f7] p-6 sm:p-8 shadow-shopify-modal dark:border-slate-800 dark:bg-[#111111] my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-[#e1e3e5] pb-5 dark:border-[#27272a]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1a1a1a] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white dark:bg-white dark:text-black">
                Shopify-Grade Gateway
              </span>
              <span className="text-xs text-[#616161] dark:text-[#a1a1aa]">Multi-Category Portal</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
              Choose a Category Workspace to Begin
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#616161] dark:text-[#a1a1aa]">
              Select an operational vertical for dedicated drill-down analytics, landing page filtering, and video creative attribution.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#616161] hover:bg-slate-200 hover:text-black dark:text-[#a1a1aa] dark:hover:bg-slate-800 dark:hover:text-white shopify-interactive"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 7 Category Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            // Get category specific leads count
            const categoryLeads = cat.id === 'ALL'
              ? db.leads
              : db.leads.filter(l => l.businessUnit === cat.id);
            const captured = db.capturedPayments.filter(cp => {
              if (cat.id === 'ALL') return true;
              const ord = db.orders.find(o => o.id === cp.orderId);
              return ord && ord.businessUnit === cat.id;
            });
            const totalRev = captured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);

            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`group relative flex flex-col justify-between rounded-xl border border-[#e1e3e5] bg-white p-5 shadow-shopify hover:border-[#1a1a1a] hover:shadow-md dark:border-[#27272a] dark:bg-[#18181b] dark:hover:border-white shopify-interactive cursor-pointer ${
                  cat.id === 'ALL' ? 'md:col-span-2 lg:col-span-3 bg-gradient-to-r from-slate-900 to-zinc-900 text-white border-slate-800 hover:border-slate-600' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${
                          cat.id === 'ALL'
                            ? 'bg-white/10 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#1a1a1a] dark:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`text-base font-semibold tracking-tight ${
                          cat.id === 'ALL' ? 'text-white' : 'text-[#1a1a1a] dark:text-white'
                        }`}>
                          {cat.title}
                        </h3>
                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                          cat.id === 'ALL' ? 'text-cyan-400' : 'text-slate-400'
                        }`}>
                          {cat.tag}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                      cat.id === 'ALL' ? 'text-white' : 'text-slate-400 group-hover:text-black dark:group-hover:text-white'
                    }`} />
                  </div>

                  <p className={`mt-3 text-xs leading-relaxed line-clamp-2 ${
                    cat.id === 'ALL' ? 'text-slate-300' : 'text-[#616161] dark:text-[#a1a1aa]'
                  }`}>
                    {cat.description}
                  </p>

                  {/* Subtypes Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cat.subtypes.slice(0, 3).map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          cat.id === 'ALL'
                            ? 'bg-white/15 text-slate-200'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {sub}
                      </span>
                    ))}
                    {cat.subtypes.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{cat.subtypes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer KPI bar */}
                <div className={`mt-4 pt-3 flex items-center justify-between border-t ${
                  cat.id === 'ALL' ? 'border-white/10 text-slate-300' : 'border-[#e1e3e5] dark:border-[#27272a] text-slate-500'
                } text-xs`}>
                  <div>
                    <span className="text-[10px] uppercase font-medium text-slate-400">Total Leads</span>
                    <p className={`font-semibold ${cat.id === 'ALL' ? 'text-white' : 'text-[#1a1a1a] dark:text-white'}`}>
                      {formatNumber(categoryLeads.length)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-medium text-slate-400">Captured Revenue</span>
                    <p className={`font-semibold ${cat.id === 'ALL' ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(totalRev)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Shortcut Reminder */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#616161] dark:text-[#a1a1aa] border-t border-[#e1e3e5] pt-4 dark:border-[#27272a]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#008060]" />
            <span>You can switch categories anytime from the top navigation or sidebar dropdown.</span>
          </span>
          <button
            onClick={() => handleSelectCategory('ALL')}
            className="rounded-lg bg-[#1a1a1a] px-4 py-2 font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 shopify-interactive"
          >
            Enter Unified Hub →
          </button>
        </div>
      </div>
    </div>
  );
};
