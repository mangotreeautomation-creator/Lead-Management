'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { exportToXLSX, exportToCSV } from '../../../utils/exportUtils';
import {
  Search,
  Users,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

export const CustomerListView: React.FC = () => {
  const {
    db,
    setSelectedCustomerId,
    setSelectedLeadId,
    globalSearch
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'ltv' | 'fullName' | 'createdAt'>('ltv');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const effectiveSearch = searchTerm || globalSearch;

  // Compute LTV and lead counts per customer
  const enrichedCustomers = useMemo(() => {
    return db.customers.map(c => {
      const customerLeads = db.leads.filter(l => l.customerId === c.id);
      const leadIds = customerLeads.map(l => l.id);
      const customerOrders = db.orders.filter(o => o.customerId === c.id || leadIds.includes(o.leadId));
      const orderIds = customerOrders.map(o => o.id);
      const captured = db.capturedPayments.filter(cp => orderIds.includes(cp.orderId));
      const ltv = captured.reduce((sum, cp) => sum + (cp.amount || cp.capturedAmount || 0), 0);

      return {
        ...c,
        leadsCount: customerLeads.length,
        ordersCount: customerOrders.length,
        ltv
      };
    });
  }, [db.customers, db.leads, db.orders, db.capturedPayments]);

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter(c => {
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const phone = c.phone || c.primaryPhone || '';
        const email = c.email || c.primaryEmail || '';
        const fullName = c.fullName || '';
        return (
          fullName.toLowerCase().includes(query) ||
          phone.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          (c.city && c.city.toLowerCase().includes(query))
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortField === 'ltv') {
        return sortOrder === 'asc' ? a.ltv - b.ltv : b.ltv - a.ltv;
      }
      if (sortField === 'fullName') {
        return sortOrder === 'asc' ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName);
      }
      if (sortField === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });
  }, [enrichedCustomers, effectiveSearch, sortField, sortOrder]);

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleExport = () => {
    const rows = filteredCustomers.map(c => ({
      'Customer ID': c.id,
      'Full Name': c.fullName,
      'Phone': c.phone,
      'Email': c.email,
      'City': c.city || '',
      'State': c.state || '',
      'Total Leads': c.leadsCount,
      'Total Orders': c.ordersCount,
      'LTV (INR)': c.ltv,
      'Created At': c.createdAt
    }));
    exportToXLSX(rows, 'Customers_360_Directory');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Customer Directory (360° Profiles)
            </h1>
            <Badge variant="primary" size="sm">
              {filteredCustomers.length} CUSTOMERS
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Deduplicated client registry with unified lifetime value, leads history, and communication trace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Customers</span>
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or city..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th
                  onClick={() => {
                    if (sortField === 'fullName') setSortOrder(p => (p === 'asc' ? 'desc' : 'asc'));
                    else { setSortField('fullName'); setSortOrder('asc'); }
                  }}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Contact Info</th>
                <th className="py-3 px-3 font-semibold">Location</th>
                <th className="py-3 px-3 font-semibold text-center">Leads</th>
                <th className="py-3 px-3 font-semibold text-center">Orders</th>
                <th
                  onClick={() => {
                    if (sortField === 'ltv') setSortOrder(p => (p === 'asc' ? 'desc' : 'asc'));
                    else { setSortField('ltv'); setSortOrder('desc'); }
                  }}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <div className="flex items-center gap-1">
                    <span>Captured LTV</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Created At</th>
                <th className="py-3 px-3 font-semibold text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm">
                        {(c.fullName || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{c.fullName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{c.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                      <Phone className="h-3 w-3 text-brand-500" />
                      <span>{c.phone || c.primaryPhone || '—'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{c.email || c.primaryEmail || '—'}</span>
                    </p>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {c.city ? (
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{c.city}, {c.state}</span>
                      </p>
                    ) : (
                      <span className="text-slate-400 italic">Unknown</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                    {c.leadsCount}
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                    {c.ordersCount}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.ltv)}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-500">
                    {formatDate(c.createdAt)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCustomerId(c.id);
                      }}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-brand-600 transition-colors"
                    >
                      Customer 360
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> customers
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
