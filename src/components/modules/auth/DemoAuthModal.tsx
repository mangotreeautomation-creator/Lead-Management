'use client';

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';
import { DemoRole } from '../../../data/types';
import {
  Shield,
  ShieldAlert,
  CheckCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  PhoneCall,
  UserCheck,
  Server
} from 'lucide-react';

export const DemoAuthModal: React.FC = () => {
  const {
    isDemoAuthModalOpen,
    setIsDemoAuthModalOpen,
    currentUser,
    switchDemoRole
  } = useApp();

  if (!isDemoAuthModalOpen) return null;

  const demoRolesData: {
    role: DemoRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    allowedViews: string[];
  }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Administrator',
      description: 'Full unconstrained privileges across all modules, webhooks, audit trails, and financial exports.',
      icon: <Shield className="h-5 w-5 text-brand-600" />,
      allowedViews: ['All 15 Modules', 'Export Any Data', 'User Administration', 'Raw Payloads']
    },
    {
      role: 'EXECUTIVE_LEADERSHIP',
      title: 'Executive Leadership (CEO / CMO / CFO)',
      description: 'Cross-vertical business performance, aggregate gross/net revenue, blended ROAS, and executive summaries.',
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      allowedViews: ['Executive Overview', 'Vertical Dashboards', 'Reports Centre', 'Attribution Matrix']
    },
    {
      role: 'PERFORMANCE_MARKETER',
      title: 'Performance Marketer',
      description: 'Ad campaign telemetry from Meta Ads, cost per lead, and landing page conversion optimization.',
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      allowedViews: ['Marketing View', 'Landing Pages Analytics', 'Lead Enquiries', 'UTM Attribution']
    },
    {
      role: 'SALES_CALLING_TEAM',
      title: 'Sales & Calling Team',
      description: 'Inbound lead contact details, failed payment drop-offs, AI voice call logs, and WhatsApp followup.',
      icon: <PhoneCall className="h-5 w-5 text-violet-600" />,
      allowedViews: ['Leads Registry', 'AI Voice Logs', 'WATI WhatsApp', 'Customer Timeline']
    },
    {
      role: 'CUSTOMER_SUPPORT',
      title: 'Customer Support Representative',
      description: 'Customer 360 profile, order history, report generation status, and communication history.',
      icon: <UserCheck className="h-5 w-5 text-blue-600" />,
      allowedViews: ['Customer 360 Profiles', 'Orders Lookup', 'WhatsApp Bot Chats']
    },
    {
      role: 'FINANCE_RECONCILIATION',
      title: 'Finance & Reconciliation Specialist',
      description: 'Settlement reconciliation across 3 Razorpay accounts, gateway fees, refunds, and accounting ledgers.',
      icon: <CreditCard className="h-5 w-5 text-emerald-600" />,
      allowedViews: ['Razorpay Settlements', 'Refunds & Disputes', 'Financial Reports', 'Reconciliation']
    },
    {
      role: 'TECHNICAL_ADMIN',
      title: 'Technical Admin & Data Engineer',
      description: 'System health monitoring, webhook ingress endpoints, ngrok tunnels, and raw payload audit.',
      icon: <Server className="h-5 w-5 text-indigo-600" />,
      allowedViews: ['Integration Health', 'Raw JSON Webhooks', 'Audit Logs', 'ngrok Tunnel']
    }
  ];

  const handleSelectRole = (role: DemoRole) => {
    switchDemoRole(role);
    setIsDemoAuthModalOpen(false);
  };

  return (
    <Modal
      isOpen={isDemoAuthModalOpen}
      onClose={() => setIsDemoAuthModalOpen(false)}
      title="Demo RBAC Role Switcher"
      subtitle="Evaluate the platform from different organizational roles with 1 click"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Security Clarification Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>DEMO SIMULATION NOTICE:</strong> Role switching is enabled here for stakeholder evaluation and architectural review. In production, authorization is strictly enforced server-side using cryptographic JWT tokens, Fastify middleware, and PostgreSQL Row-Level Security (RLS) policies.
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {demoRolesData.map(item => {
            const isSelected = currentUser.role === item.role;
            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 shadow-md ring-2 ring-brand-500/30 dark:border-brand-500 dark:bg-brand-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                        <CheckCircle className="h-3 w-3" />
                        <span>CURRENT</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {item.allowedViews.map((v, i) => (
                      <span
                        key={i}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
