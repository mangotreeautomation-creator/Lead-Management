'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Mic, ChevronUp, Layers, PhoneCall, FileSpreadsheet, X, Check } from 'lucide-react';
import { exportToXLSX } from '../../utils/exportUtils';

export const SidekickFloatingBar: React.FC = () => {
  const {
    setIsCategorySelectorOpen,
    selectedVertical,
    setSelectedVertical,
    setActiveModule,
    db
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleQuickCallingExport = () => {
    const activeLeads = selectedVertical === 'ALL'
      ? db.leads
      : db.leads.filter(l => l.businessUnit === selectedVertical);

    const rows = activeLeads.map(lead => {
      const customer = db.customers.find(c => c.id === lead.customerId);
      return {
        'Customer Name': customer?.fullName || 'Prospect Visitor',
        'Mobile Phone': customer?.phone || customer?.primaryPhone || 'N/A',
        'City': customer?.city || 'N/A',
        'Category': lead.businessUnit,
        'Sub Category': lead.subCategory || 'General',
        'Video Ad Creative': lead.adCreativeName || 'Default Campaign',
        'Lead Status': (lead.status || lead.leadStatus || 'NEW').replace(/_/g, ' '),
        'AI Call Status': lead.aiCallStatus || 'NOT_TRIGGERED',
        'Captured Revenue': lead.capturedRevenue || 0
      };
    });

    exportToXLSX(rows, `Sidekick_Calling_List_${selectedVertical}_${new Date().toISOString().slice(0, 10)}`);
    setFeedbackMessage(`Exported ${rows.length} calling contacts to Excel!`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCategorySwitch = (cat: any) => {
    setSelectedVertical(cat);
    setActiveModule(cat === 'ALL' ? 'overview' : 'category-workspace');
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto min-w-[340px] max-w-xl">
      {/* Expanded Quick Action Drawer */}
      {isExpanded && (
        <div className="mb-2 rounded-2xl border border-[#e1e3e5] bg-white p-4 shadow-shopify-modal dark:border-[#27272a] dark:bg-[#18181b] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Shopify Sidekick AI Copilot</span>
            </span>
            <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-black">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-[#616161] dark:text-[#a1a1aa]">
            Instant quick actions for telecalling team, ad creative filtering, and category navigation:
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleQuickCallingExport}
              className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 font-medium text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 shopify-interactive text-left"
            >
              <PhoneCall className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="font-semibold">Export Calling List</p>
                <p className="text-[10px] text-emerald-600">Download active phones</p>
              </div>
            </button>

            <button
              onClick={() => { setIsCategorySelectorOpen(true); setIsExpanded(false); }}
              className="flex items-center gap-2 rounded-lg bg-purple-50 p-2.5 font-medium text-purple-800 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 shopify-interactive text-left"
            >
              <Layers className="h-4 w-4 text-purple-600" />
              <div>
                <p className="font-semibold">Category Portal</p>
                <p className="text-[10px] text-purple-600">Switch active vertical</p>
              </div>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">Switch:</span>
            {['ALL', 'VASTU', 'WEBINAR', 'PALMISTRY', 'ASTROLOGY', 'ASTROSHI', 'CONSULTANCY'].map(c => (
              <button
                key={c}
                onClick={() => handleCategorySwitch(c)}
                className={`rounded px-2 py-0.5 font-medium ${
                  selectedVertical === c
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Floating Pill (Exact Shopify Sidekick Look from User Image 2 & 3) */}
      <div className="flex items-center justify-between gap-3 rounded-full border border-[#e1e3e5] bg-white/95 px-4 py-2.5 shadow-shopify-modal backdrop-blur-md dark:border-[#27272a] dark:bg-[#18181b]/95 shopify-interactive">
        <div
          onClick={() => setIsExpanded(prev => !prev)}
          className="flex items-center gap-2.5 cursor-pointer flex-1"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-[#1a1a1a] dark:text-white">
            Work with Sidekick
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {selectedVertical} Active
          </span>
        </div>

        {feedbackMessage && (
          <span className="text-[11px] font-semibold text-emerald-600 animate-in fade-in">
            {feedbackMessage}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleQuickCallingExport}
            title="Quick Export Calling List"
            className="flex h-7 items-center gap-1 rounded-full bg-[#008060] px-2.5 text-[11px] font-semibold text-white hover:bg-[#006e52] shopify-interactive"
          >
            <PhoneCall className="h-3 w-3" />
            <span className="hidden sm:inline">Calling List</span>
          </button>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-black dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ChevronUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
