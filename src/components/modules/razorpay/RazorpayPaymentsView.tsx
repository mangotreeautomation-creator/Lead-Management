'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Receipt,
  Download,
  Search,
  ExternalLink,
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export const RazorpayPaymentsView: React.FC = () => {
  const {
    db,
    selectedAccount,
    setSelectedAccount,
    returnToGateway,
    setSelectedLeadId,
    setSelectedCustomerId,
    globalSearch
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'attempts' | 'captured' | 'failed' | 'refunds' | 'reconciliation'>('captured');
  const [searchTerm, setSearchTerm] = useState('');

  const effectiveSearch = searchTerm || globalSearch;

  // Filter accounts accurately
  const filterByAccount = (itemAccount?: string, itemRzp?: string) => {
    if (selectedAccount === 'ALL') return true;
    if (selectedAccount === 'MANGO_TREE' || selectedAccount === 'RZP_MANGO_TREE') {
      return itemAccount === 'MANGO_TREE' || itemRzp === 'RZP_MANGO_TREE' || itemAccount === 'ACC_2_WEBINAR' || itemRzp === 'RZP_WEBINAR';
    }
    if (selectedAccount === 'GLOBAL_INCH' || selectedAccount === 'RZP_GLOBALINCH') {
      return itemAccount === 'GLOBAL_INCH' || itemRzp === 'RZP_GLOBALINCH';
    }
    if (selectedAccount === 'VASTU_SHIKHAR' || selectedAccount === 'RZP_VASTU_SHIKHAR') {
      return itemAccount === 'VASTU_SHIKHAR' || itemRzp === 'RZP_VASTU_SHIKHAR';
    }
    return itemAccount === selectedAccount || itemRzp === selectedAccount;
  };

  // Orders
  const filteredOrders = useMemo(() => {
    return db.orders.filter(o => {
      if (!filterByAccount(o.accountCode)) return false;
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const rId = (o.razorpayOrderId || o.gatewayOrderId || '').toLowerCase();
        const cId = (o.customerId || '').toLowerCase();
        return rId.includes(query) || cId.includes(query);
      }
      return true;
    });
  }, [db.orders, selectedAccount, effectiveSearch]);

  // Attempts
  const filteredAttempts = useMemo(() => {
    return db.paymentAttempts.filter(pa => {
      const ord = db.orders.find(o => o.id === pa.orderId);
      if (ord && !filterByAccount(ord.accountCode)) return false;
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const pId = (pa.razorpayPaymentId || pa.gatewayPaymentId || '').toLowerCase();
        const pMethod = (pa.paymentMethod || '').toLowerCase();
        const eCode = (pa.errorCode || '').toLowerCase();
        return pId.includes(query) || pMethod.includes(query) || eCode.includes(query);
      }
      return true;
    });
  }, [db.paymentAttempts, db.orders, selectedAccount, effectiveSearch]);

  // Captured
  const filteredCaptured = useMemo(() => {
    return db.capturedPayments.filter(cp => {
      if (!filterByAccount(cp.accountCode)) return false;
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const pId = (cp.razorpayPaymentId || cp.gatewayPaymentId || '').toLowerCase();
        const oId = (cp.razorpayOrderId || cp.gatewayOrderId || '').toLowerCase();
        return pId.includes(query) || oId.includes(query);
      }
      return true;
    });
  }, [db.capturedPayments, selectedAccount, effectiveSearch]);

  // Failed Attempts only
  const filteredFailed = useMemo(() => {
    return filteredAttempts.filter(a => a.status === 'FAILED');
  }, [filteredAttempts]);

  // Refunds
  const filteredRefunds = useMemo(() => {
    return db.refunds.filter(r => {
      const cap = db.capturedPayments.find(cp => cp.id === r.paymentId);
      if (cap && !filterByAccount(cap.accountCode)) return false;
      return true;
    });
  }, [db.refunds, db.capturedPayments, selectedAccount]);

  // Three Account Reconciliation Matrix
  const reconciliationData = useMemo(() => {
    const accounts = [
      { code: 'MANGO_TREE', name: 'Mango Tree Technology (Account 1)', domain: 'www.mangotreetechnology.com', verticals: 'Vastu Webinar & Astrology Webinar' },
      { code: 'GLOBAL_INCH', name: 'GlobalInch (Account 2)', domain: 'www.mangotreetechnology.com', verticals: 'Vastu Wheel Report, Palmistry, Astroshi' },
      { code: 'VASTU_SHIKHAR', name: 'Vastu Shikhar (Account 3)', domain: 'consultancy.vastushikhar.com', verticals: 'Consultancy (1-on-1)' }
    ];

    return accounts.map(acc => {
      const orders = db.orders.filter(o => o.accountCode === acc.code);
      const orderIds = orders.map(o => o.id);
      const attempts = db.paymentAttempts.filter(a => orderIds.includes(a.orderId));
      const captured = db.capturedPayments.filter(cp => cp.accountCode === acc.code);
      const capIds = captured.map(c => c.id);
      const refunds = db.refunds.filter(r => r.paymentId && capIds.includes(r.paymentId));

      const grossRevenue = captured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);
      const totalFee = captured.reduce((sum, cp) => sum + (cp.fee || 0), 0);
      const totalTax = captured.reduce((sum, cp) => sum + (cp.tax || 0), 0);
      const refundAmount = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);
      const netSettled = grossRevenue - totalFee - totalTax - refundAmount;

      return {
        ...acc,
        ordersCount: orders.length,
        attemptsCount: attempts.length,
        capturedCount: captured.length,
        failedCount: attempts.filter(a => a.status === 'FAILED').length,
        grossRevenue,
        totalFee,
        totalTax,
        refundAmount,
        netSettled
      };
    });
  }, [db.orders, db.paymentAttempts, db.capturedPayments, db.refunds]);

  const handleExportTab = () => {
    if (activeTab === 'captured') {
      const rows = filteredCaptured.map(cp => ({
        'Payment ID': cp.razorpayPaymentId,
        'Order ID': cp.razorpayOrderId,
        'Account Code': cp.accountCode,
        'Amount (INR)': cp.amount,
        'Fee (INR)': cp.fee,
        'Tax (INR)': cp.tax,
        'Captured At': cp.capturedAt
      }));
      exportToXLSX(rows, 'Captured_Payments_Ledger');
    } else if (activeTab === 'reconciliation') {
      const rows = reconciliationData.map(r => ({
        'Account Code': r.code,
        'Account Name': r.name,
        'Domain': r.domain,
        'Verticals': r.verticals,
        'Orders': r.ordersCount,
        'Captured Payments': r.capturedCount,
        'Failed Attempts': r.failedCount,
        'Gross Revenue (INR)': r.grossRevenue,
        'Gateway Fee': r.totalFee,
        'Tax': r.totalTax,
        'Refunds': r.refundAmount,
        'Net Settlement (INR)': r.netSettled
      }));
      exportToXLSX(rows, 'Razorpay_Account_Reconciliation');
    } else {
      const rows = filteredAttempts.map(a => ({
        'Attempt ID': a.id,
        'Payment ID': a.razorpayPaymentId,
        'Status': a.status,
        'Method': a.paymentMethod,
        'Amount': a.amount,
        'Error Code': a.errorCode || 'NONE',
        'Error Message': a.errorMessage || '',
        'Created At': a.createdAt
      }));
      exportToXLSX(rows, 'Payment_Attempts_Audit');
    }
  };

  const tabs = [
    { id: 'captured', label: 'Captured Payments', badge: filteredCaptured.length },
    { id: 'failed', label: 'Failed Attempts', badge: filteredFailed.length },
    { id: 'attempts', label: 'All Attempts', badge: filteredAttempts.length },
    { id: 'orders', label: 'Orders Registry', badge: filteredOrders.length },
    { id: 'refunds', label: 'Refunds Ledger', badge: filteredRefunds.length },
    { id: 'reconciliation', label: '3-Account Reconciliation' }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => returnToGateway('COMPANY_SELECT')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1e3e5] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-emerald-500" />
              <span>Switch Gateway</span>
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {selectedAccount === 'ALL' ? 'All 3 Merchant Gateways' : selectedAccount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Razorpay Central Gateway & Reconciliation
            </h1>
            <Badge variant="primary" size="sm">
              3 GATEWAY ACCOUNTS
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Multi-account settlement ledger, webhook audit trace, failure diagnostics, and financial net payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportTab} className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            <span>Export View (XLSX)</span>
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id: any) => setActiveTab(id)} />

      {/* Search Bar for tab views */}
      {activeTab !== 'reconciliation' && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search payment ID, order ID, or error code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* TAB 1: CAPTURED PAYMENTS */}
      {activeTab === 'captured' && (
        <Card title="Captured Payments Ledger" subtitle="Verified successful transactions settled by Razorpay">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3 px-3 font-semibold">Razorpay Payment ID</th>
                  <th className="py-3 px-3 font-semibold">Order ID</th>
                  <th className="py-3 px-3 font-semibold">Account Code</th>
                  <th className="py-3 px-3 font-semibold text-right">Gross Amount</th>
                  <th className="py-3 px-3 font-semibold text-right">Fee + Tax</th>
                  <th className="py-3 px-3 font-semibold text-right">Net Settlement</th>
                  <th className="py-3 px-3 font-semibold">Captured Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Lead Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCaptured.slice(0, 50).map(cp => {
                  const ord = db.orders.find(o => o.id === cp.orderId);
                  const amt = cp.amount || cp.capturedAmount || 0;
                  const fee = cp.fee || 0;
                  const tax = cp.tax || 0;
                  const net = amt - fee - tax;
                  return (
                    <tr key={cp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {cp.razorpayPaymentId}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {cp.razorpayOrderId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {cp.accountCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(amt)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {formatCurrency(fee + tax)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(net)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(cp.capturedAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {ord && (
                          <button
                            onClick={() => setSelectedLeadId(ord.leadId)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            Inspect Lead
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: FAILED PAYMENTS */}
      {activeTab === 'failed' && (
        <Card title="Failed Payment Attempts" subtitle="Incomplete attempts with failure codes and diagnostics">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3 px-3 font-semibold">Payment ID</th>
                  <th className="py-3 px-3 font-semibold">Attempt #</th>
                  <th className="py-3 px-3 font-semibold">Payment Method</th>
                  <th className="py-3 px-3 font-semibold">Error Code</th>
                  <th className="py-3 px-3 font-semibold">Error Description</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3 px-3 font-semibold">Failed Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFailed.slice(0, 50).map(fa => {
                  const ord = db.orders.find(o => o.id === fa.orderId);
                  return (
                    <tr key={fa.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-rose-600 dark:text-rose-400">
                        {fa.razorpayPaymentId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        #{fa.attemptNumber}
                      </td>
                      <td className="py-3 px-3 uppercase font-medium text-slate-700 dark:text-slate-300">
                        {fa.paymentMethod}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                          {fa.errorCode || 'PAYMENT_FAILED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {fa.errorMessage || 'Transaction declined by bank or user abandoned session'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(fa.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(fa.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {ord && (
                          <button
                            onClick={() => setSelectedLeadId(ord.leadId)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            Inspect Lead
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: ALL ATTEMPTS */}
      {activeTab === 'attempts' && (
        <Card title="Payment Attempts Registry" subtitle="Complete sequence of payment attempts per order">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3 px-3 font-semibold">Payment ID</th>
                  <th className="py-3 px-3 font-semibold">Attempt #</th>
                  <th className="py-3 px-3 font-semibold">Method</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAttempts.slice(0, 50).map(att => {
                  const ord = db.orders.find(o => o.id === att.orderId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {att.razorpayPaymentId}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                        #{att.attemptNumber}
                      </td>
                      <td className="py-3 px-3 uppercase font-medium text-slate-700 dark:text-slate-300">
                        {att.paymentMethod}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={att.status === 'CAPTURED' ? 'success' : 'danger'} size="sm">
                          {att.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(att.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(att.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {ord && (
                          <button
                            onClick={() => setSelectedLeadId(ord.leadId)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            Inspect Lead
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: ORDERS REGISTRY */}
      {activeTab === 'orders' && (
        <Card title="Razorpay Orders Master" subtitle="Server-side order references generated prior to payment checkout">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3 px-3 font-semibold">Razorpay Order ID</th>
                  <th className="py-3 px-3 font-semibold">Business Unit</th>
                  <th className="py-3 px-3 font-semibold">Account</th>
                  <th className="py-3 px-3 font-semibold text-right">Order Amount</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Created Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Lead Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.slice(0, 50).map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-brand-600 dark:text-brand-400">
                      {ord.razorpayOrderId}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {(ord.businessUnit || 'PALMISTRY').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {ord.accountCode}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(ord.amount || 0)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={ord.status === 'PAID' ? 'success' : 'warning'} size="sm">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedLeadId(ord.leadId)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        Inspect Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: REFUNDS */}
      {activeTab === 'refunds' && (
        <Card title="Refunds & Chargebacks" subtitle="Processed reversals and customer chargeback records">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3 px-3 font-semibold">Refund ID</th>
                  <th className="py-3 px-3 font-semibold">Payment Reference</th>
                  <th className="py-3 px-3 font-semibold text-right">Refund Amount</th>
                  <th className="py-3 px-3 font-semibold">Reason</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Initiated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRefunds.map(ref => {
                  const cap = db.capturedPayments.find(cp => cp.id === ref.paymentId);
                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {ref.razorpayRefundId}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {cap?.razorpayPaymentId || ref.paymentId}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(ref.amount || 0)}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {ref.reason}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="success" size="sm">
                          {ref.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(ref.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 6: 3-ACCOUNT RECONCILIATION MATRIX */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reconciliationData.map(acc => (
              <div key={acc.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {acc.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">{acc.domain}</p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {acc.code}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verticals:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{acc.verticals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Orders Created:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{acc.ordersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Captured Payments:</span>
                    <span className="font-bold text-emerald-600">{acc.capturedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Captured:</span>
                    <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(acc.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Gateway Fee (2%):</span>
                    <span className="text-slate-600 dark:text-slate-400">{formatCurrency(acc.totalFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST on Gateway Fee (18%):</span>
                    <span className="text-slate-600 dark:text-slate-400">{formatCurrency(acc.totalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Refunds Processed:</span>
                    <span className="text-rose-500">{formatCurrency(acc.refundAmount)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Net Settled Payout:</span>
                    <span className="font-black text-brand-600 dark:text-brand-400 text-base">
                      {formatCurrency(acc.netSettled)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
