'use client';

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { formatCurrency, formatDate, formatDuration } from '../../../utils/formatters';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  PhoneCall,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const CustomerDetailModal: React.FC = () => {
  const {
    selectedCustomerId,
    setSelectedCustomerId,
    setSelectedLeadId,
    db
  } = useApp();

  if (!selectedCustomerId) return null;

  const customer = db.customers.find(c => c.id === selectedCustomerId);
  if (!customer) return null;

  // Find all leads for this customer
  const customerLeads = db.leads.filter(l => l.customerId === customer.id);
  const leadIds = customerLeads.map(l => l.id);

  // Find all orders for this customer
  const customerOrders = db.orders.filter(o => o.customerId === customer.id || leadIds.includes(o.leadId));
  const orderIds = customerOrders.map(o => o.id);

  // Find all captured payments
  const capturedPayments = db.capturedPayments.filter(cp => orderIds.includes(cp.orderId));
  const totalLtv = capturedPayments.reduce((acc, curr) => acc + (curr.amount || curr.capturedAmount || 0), 0);

  // Find all AI calls & WATI messages
  const customerCalls = db.aiCalls.filter(c => c.customerId === customer.id || (c.leadId && leadIds.includes(c.leadId)));
  const customerWati = db.watiMessages.filter(w => w.customerId === customer.id || (w.leadId && leadIds.includes(w.leadId)));

  return (
    <Modal
      isOpen={!!selectedCustomerId}
      onClose={() => setSelectedCustomerId(null)}
      title="Customer 360° Profile"
      subtitle={`Customer ID: ${customer.id}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Customer Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-md">
              {(customer.fullName || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {customer.fullName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="h-3.5 w-3.5 text-brand-500" />
                  {customer.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {customer.email}
                </span>
                {customer.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {customer.city}, {customer.state} ({customer.pincode})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between border-t border-slate-200/80 pt-2 sm:border-0 sm:pt-0 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime Captured Value</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalLtv)}
            </span>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Leads</span>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {customerLeads.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Orders</span>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {customerOrders.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[10px] font-bold uppercase text-slate-400">AI Voice Calls</span>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {customerCalls.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[10px] font-bold uppercase text-slate-400">WhatsApp Messages</span>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {customerWati.length}
            </p>
          </div>
        </div>

        {/* Linked Leads Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/20">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <User className="h-4 w-4 text-brand-500" />
            <span>Associated Lead Enquiries ({customerLeads.length})</span>
          </h4>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {customerLeads.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {l.landingPageSlug}
                    </span>
                    <Badge variant={l.status === 'CONVERTED' ? 'success' : 'primary'} size="sm">
                      {l.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    <span>Vertical: {l.businessUnit}</span> • <span>Source: {l.utmSource}</span> • <span>{formatDate(l.createdAt)}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCustomerId(null);
                    setSelectedLeadId(l.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <span>View Journey</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Orders & Payments Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/20">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Receipt className="h-4 w-4 text-emerald-500" />
            <span>Financial Orders & Captured Transactions ({customerOrders.length})</span>
          </h4>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {customerOrders.map(ord => {
              const captured = capturedPayments.find(cp => cp.orderId === ord.id);
              return (
                <div key={ord.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {ord.razorpayOrderId}
                      </span>
                      <Badge variant={captured ? 'success' : 'warning'} size="sm">
                        {captured ? 'CAPTURED' : ord.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      <span>Account: {ord.accountCode}</span> • <span>Amount: {formatCurrency(ord.amount)}</span> • <span>{formatDate(ord.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(ord.amount)}
                    </span>
                    {captured && (
                      <span className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        {captured.razorpayPaymentId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI & Communication History */}
        {(customerCalls.length > 0 || customerWati.length > 0) && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/20">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span>AI Calling & WhatsApp Touchpoints</span>
            </h4>

            <div className="mt-3 space-y-2">
              {customerCalls.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-violet-50/60 p-2.5 text-xs dark:bg-violet-950/20">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-violet-600" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        AI Element Call ({c.agentName}): {c.status}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Duration: {formatDuration(c.durationSeconds)} • Sentiment: {c.sentiment}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(c.createdAt)}</span>
                </div>
              ))}

              {customerWati.map(w => (
                <div key={w.id} className="flex items-center justify-between rounded-lg bg-emerald-50/60 p-2.5 text-xs dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        WhatsApp Template: {w.templateName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Account: {w.accountCode} • Status: {w.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(w.sentAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
