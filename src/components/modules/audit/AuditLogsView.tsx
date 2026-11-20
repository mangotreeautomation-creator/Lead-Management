'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { formatDate } from '../../../utils/formatters';
import { exportToXLSX } from '../../../utils/exportUtils';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Code,
  Shield,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { db, globalSearch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const effectiveSearch = searchTerm || globalSearch;

  const filteredLogs = useMemo(() => {
    return db.auditLogs.filter(log => {
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const op = (log.performedBy || log.actorName || '').toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query) ||
          log.entityId.toLowerCase().includes(query) ||
          op.includes(query)
        );
      }
      return true;
    });
  }, [db.auditLogs, effectiveSearch]);

  const handleExport = () => {
    const rows = filteredLogs.map(l => ({
      'Log ID': l.id,
      'Action': l.action,
      'Entity Type': l.entityType,
      'Entity ID': l.entityId,
      'Performed By': l.performedBy || l.actorName || 'SYSTEM',
      'Timestamp': l.createdAt || l.timestamp || '',
      'IP Address': l.ipAddress || '127.0.0.1'
    }));
    exportToXLSX(rows, 'System_Audit_Logs');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              System Audit Trails & Governance
            </h1>
            <Badge variant="primary" size="sm">
              IMMUTABLE LOGS
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Cryptographically timestamped audit log of all webhook deliveries, RBAC privilege switches, and financial exports.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span>Export Audit Trail (XLSX)</span>
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, entity ID, or operator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Main Audit Table */}
      <Card title="Activity & Ingress Audit Events" subtitle="Chronological transaction and operational history">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">Timestamp</th>
                <th className="py-3 px-3 font-semibold">Action</th>
                <th className="py-3 px-3 font-semibold">Entity Type</th>
                <th className="py-3 px-3 font-semibold">Entity Reference</th>
                <th className="py-3 px-3 font-semibold">Operator / System</th>
                <th className="py-3 px-3 font-semibold">Origin IP</th>
                <th className="py-3 px-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.slice(0, 50).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {formatDate(log.createdAt || log.timestamp)}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {log.entityType}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-brand-600 dark:text-brand-400">
                    {log.entityId}
                  </td>

                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {log.performedBy || log.actorName || 'SYSTEM'}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      Payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Audit Payload: {selectedLog.action}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs font-mono text-emerald-400">
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>

            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
