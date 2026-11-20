'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyCode, BusinessUnitCode } from '../../data/types';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Globe,
  Sparkles,
  Compass,
  Hand,
  Gem,
  Layers,
  Check,
  Zap,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';

export const CompanyCategoryDropdown: React.FC = () => {
  const {
    selectedCompany,
    setSelectedCompany,
    selectedVertical,
    setSelectedVertical,
    enterCategoryWorkflow,
    enterCompanyWorkflow,
    returnToGateway,
    db
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCompany, setHoveredCompany] = useState<CompanyCode>(selectedCompany);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keep hovered company in sync when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHoveredCompany(selectedCompany);
    }
  }, [isOpen, selectedCompany]);

  // Company definitions
  const companiesList: Array<{
    code: CompanyCode;
    name: string;
    sub: string;
    icon: any;
    color: string;
    badge: string;
    leadCount: number;
    categories: Array<{
      id: 'ALL' | BusinessUnitCode;
      title: string;
      desc: string;
      icon: any;
      leadCount: number;
    }>;
  }> = [
    {
      code: 'ALL',
      name: 'All Companies Combined',
      sub: 'Unified Master Hub (Consolidated)',
      icon: Layers,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'MASTER HUB',
      leadCount: db.leads.length,
      categories: [
        {
          id: 'ALL',
          title: 'All Consolidated Telemetry',
          desc: 'All 3 operating companies, 6 operational categories, and 3 Razorpay accounts.',
          icon: Layers,
          leadCount: db.leads.length
        },
        {
          id: 'ASTRO_WEBINAR',
          title: 'Astrology Webinar',
          desc: 'Live Janam Kundali readings & transit masterclasses.',
          icon: Sparkles,
          leadCount: 520
        },
        {
          id: 'VASTU_WEBINAR',
          title: 'Vastu Webinar',
          desc: 'Live 3-day cohort masterclasses & remedial blueprints.',
          icon: Compass,
          leadCount: 520
        },
        {
          id: 'PALMISTRY',
          title: 'Palmistry Reports',
          desc: 'AI Voice Pooja calling & ₹999 Ravi Kumar landmark proof.',
          icon: Hand,
          leadCount: 520
        },
        {
          id: 'VASTU_REPORT',
          title: 'Vastu Wheel Report',
          desc: 'Instant automated 16-zone digital energy audit PDF.',
          icon: Compass,
          leadCount: 520
        },
        {
          id: 'ASTROSHI',
          title: 'Astroshi Spiritual Guidance',
          desc: 'Sacred remedies, energized yantras, and rudraksha beads.',
          icon: Gem,
          leadCount: 520
        },
        {
          id: 'CONSULTANCY',
          title: 'Private Consultancy',
          desc: '1-on-1 VIP personal audits & architectural reviews.',
          icon: Building2,
          leadCount: 520
        }
      ]
    },
    {
      code: 'VASTU_SHIKHAR',
      name: 'Vastu Shikhar',
      sub: 'consultancy.vastushikhar.com',
      icon: Building2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'RZP ACC 3',
      leadCount: db.leads.filter(l => l.company === 'VASTU_SHIKHAR').length || 1560,
      categories: [
        {
          id: 'ALL',
          title: 'All 3 Categories Combined',
          desc: 'Consolidated overview for Astrology, Vastu & Consultancy.',
          icon: Layers,
          leadCount: 1560
        },
        {
          id: 'ASTROLOGY',
          title: 'Astrology Webinar',
          desc: 'Kundali dosha remedies, planetary transit predictions.',
          icon: Sparkles,
          leadCount: 520
        },
        {
          id: 'VASTU',
          title: 'Vastu Architecture',
          desc: 'Residential floorplan audits, industrial commercial energy maps.',
          icon: Compass,
          leadCount: 520
        },
        {
          id: 'CONSULTANCY',
          title: 'Private 1-on-1 Consultancy',
          desc: 'High-ticket bespoke personal architectural reviews.',
          icon: Building2,
          leadCount: 520
        }
      ]
    },
    {
      code: 'GLOBALINCH',
      name: 'GlobalInch',
      sub: 'mangotreetechnology.com',
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: 'RZP ACC 2',
      leadCount: db.leads.filter(l => l.company === 'GLOBALINCH').length || 1040,
      categories: [
        {
          id: 'ALL',
          title: 'Both Categories Combined',
          desc: 'Consolidated Vastu Wheel Reports and Palmistry AI Telephony.',
          icon: Layers,
          leadCount: 1040
        },
        {
          id: 'VASTU_REPORT',
          title: 'Vastu Wheel Report',
          desc: 'Automated 16-zone digital energy PDF report delivery.',
          icon: Compass,
          leadCount: 520
        },
        {
          id: 'PALMISTRY',
          title: 'Palmistry (AI Telephony Recovery)',
          desc: 'AI Agent Pooja voice calls & Ravi Kumar ₹999 payment case.',
          icon: Hand,
          leadCount: 520
        }
      ]
    },
    {
      code: 'MANGO_TREE',
      name: 'Mango Tree Technology',
      sub: 'astroshi.com',
      icon: Gem,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'RZP ACC 1',
      leadCount: db.leads.filter(l => l.company === 'MANGO_TREE').length || 520,
      categories: [
        {
          id: 'ALL',
          title: 'All Mango Tree Data',
          desc: 'Consolidated telemetry across all MTT digital marketing funnels.',
          icon: Layers,
          leadCount: 520
        },
        {
          id: 'ASTROSHI',
          title: 'Astroshi Spiritual Guidance',
          desc: 'Energized yantras, sacred rudraksha, and gemstone guidance.',
          icon: Gem,
          leadCount: 520
        }
      ]
    }
  ];

  // Helper for active label in trigger button
  const getTriggerLabel = () => {
    let companyName = 'All Companies';
    if (selectedCompany === 'VASTU_SHIKHAR') companyName = 'Vastu Shikhar';
    else if (selectedCompany === 'GLOBALINCH') companyName = 'GlobalInch';
    else if (selectedCompany === 'MANGO_TREE') companyName = 'Mango Tree Tech';

    let catName = 'All Combined';
    if (selectedVertical === 'ALL') {
      catName = selectedCompany === 'ALL' ? 'Master Hub' : 'All Combined';
    } else if (selectedVertical === 'ASTROLOGY' || selectedVertical === 'ASTRO_WEBINAR') {
      catName = 'Astrology';
    } else if (selectedVertical === 'VASTU' || selectedVertical === 'VASTU_WEBINAR') {
      catName = 'Vastu';
    } else if (selectedVertical === 'VASTU_REPORT') {
      catName = 'Vastu Wheel';
    } else if (selectedVertical === 'PALMISTRY') {
      catName = 'Palmistry';
    } else if (selectedVertical === 'ASTROSHI') {
      catName = 'Astroshi';
    } else if (selectedVertical === 'CONSULTANCY') {
      catName = 'Consultancy';
    }

    return { companyName, catName };
  };

  const { companyName, catName } = getTriggerLabel();

  // Active company item for categories pane
  const currentHoveredCompanyObj = companiesList.find(c => c.code === hoveredCompany) || companiesList[0];

  // Select category and close
  const handleSelectCategory = (companyCode: CompanyCode, categoryId: 'ALL' | BusinessUnitCode) => {
    enterCategoryWorkflow(companyCode, categoryId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* CASCADING TRIGGER BUTTON (Replaces both old buttons with single sleek control) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#0c0e14] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-all shadow-sm ${
          isOpen ? 'ring-1 ring-blue-500 border-blue-500/50 bg-zinc-900' : ''
        }`}
        title="Switch Company or Category dynamically"
      >
        <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span className="font-bold text-white">{companyName}</span>
        <span className="text-zinc-600 font-normal">›</span>
        <span className="text-blue-300 font-medium truncate max-w-[130px]">{catName}</span>
        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* MULTI-LEVEL CASCADING DROPDOWN POPOVER ("Sriyou ki trha flyout") */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-50 rounded-2xl border border-zinc-800 bg-[#10121a] shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-zinc-200"
          style={{ width: '680px' }}
        >
          {/* Top Bar: Title & Visual Portal Link */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0f17] border-b border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              Dynamic Multi-Company Switcher
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                returnToGateway('COMPANY_SELECT');
              }}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Full Screen Cards</span>
            </button>
          </div>

          {/* Cascading 2-Column Layout */}
          <div className="flex divide-x divide-zinc-800/80 min-h-[340px]">
            {/* COLUMN 1: COMPANIES LIST (Level 1) */}
            <div className="w-[280px] shrink-0 p-2.5 bg-[#0d0f17] flex flex-col justify-between">
              <div>
                <span className="block px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Select Operating Entity
                </span>
                <div className="space-y-1">
                  {companiesList.map(comp => {
                    const isHovered = hoveredCompany === comp.code;
                    const isCurrentlySelected = selectedCompany === comp.code;
                    const Icon = comp.icon;

                    return (
                      <div
                        key={comp.code}
                        onMouseEnter={() => setHoveredCompany(comp.code)}
                        onClick={() => {
                          setHoveredCompany(comp.code);
                          if (comp.code === 'ALL') {
                            handleSelectCategory('ALL', 'ALL');
                          }
                        }}
                        className={`group flex items-center justify-between rounded-xl px-2.5 py-2 cursor-pointer transition-all ${
                          isHovered
                            ? 'bg-zinc-800/90 text-white shadow-sm'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 ${comp.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 leading-tight">
                              <span className="text-xs font-bold text-white truncate">
                                {comp.name}
                              </span>
                              {isCurrentlySelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 truncate block">
                              {comp.sub}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isHovered ? 'text-blue-400 translate-x-0.5' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Hub Switch */}
              <div className="pt-2 border-t border-zinc-800/80 mt-2 px-1">
                <button
                  onClick={() => handleSelectCategory('ALL', 'ALL')}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-purple-300 hover:bg-purple-500/10 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="h-3.5 w-3.5 text-purple-400" />
                    <span>View All Combined Hub</span>
                  </span>
                  <span className="font-mono text-[10px] text-purple-400">3,120+</span>
                </button>
              </div>
            </div>

            {/* COLUMN 2: CASCADED CATEGORIES / FUNNELS (Level 2 Flyout) */}
            <div className="flex-1 p-3 bg-[#10121a] flex flex-col justify-between">
              <div>
                {/* Active Company Subheader */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentHoveredCompanyObj.name} Tracks</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Hovered entity • Click category to enter telemetry
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    {currentHoveredCompanyObj.badge}
                  </span>
                </div>

                {/* Categories List */}
                <div className="space-y-1">
                  {currentHoveredCompanyObj.categories.map(cat => {
                    const isSelected =
                      selectedCompany === currentHoveredCompanyObj.code &&
                      selectedVertical === cat.id;
                    const CatIcon = cat.icon;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(currentHoveredCompanyObj.code, cat.id)}
                        className={`group flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                            : 'hover:bg-zinc-800/70 border border-transparent text-zinc-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 ${
                            isSelected
                              ? 'border-blue-500/30 bg-blue-500/20 text-blue-400'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 group-hover:text-blue-400'
                          }`}>
                            <CatIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {cat.title}
                              </span>
                              {isSelected && (
                                <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-bold text-blue-300">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                              {cat.desc}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right pl-2">
                          <span className="block text-[10px] font-mono font-semibold text-zinc-500 group-hover:text-zinc-300">
                            {cat.leadCount} leads
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Direct CTA */}
              <div className="pt-2 border-t border-zinc-800/80 mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Direct 1-click workspace switch</span>
                <span className="text-blue-400 text-[11px] font-medium flex items-center gap-1">
                  <span>Enter scoped telemetry</span>
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
