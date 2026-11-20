'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { UserAccount, DemoRole } from '../../../data/types';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { formatDate } from '../../../utils/formatters';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Key,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    demoUsers,
    currentUser,
    switchDemoRole,
    addDemoUser,
    toggleUserStatus
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<DemoRole>('PERFORMANCE_MARKETER');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    addDemoUser(newUser);
    setIsAddModalOpen(false);
    setNewFullName('');
    setNewEmail('');
  };

  const rolesList: { role: DemoRole; title: string; desc: string; access: string }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Administrator',
      desc: 'Complete unfettered access across all 4 verticals, 3 Razorpay accounts, users, and audit logs.',
      access: 'Full Read & Write'
    },
    {
      role: 'EXECUTIVE_LEADERSHIP',
      title: 'Executive Leadership (CEO / CMO / CFO)',
      desc: 'High-level business telemetry, gross & net margins, ROAS, and executive export reports.',
      access: 'Executive Analytics & Reports'
    },
    {
      role: 'PERFORMANCE_MARKETER',
      title: 'Performance Marketer',
      desc: 'Meta ad campaigns, landing page conversion funnels, and UTM source attribution.',
      access: 'Marketing, Leads & LPs'
    },
    {
      role: 'SALES_CALLING_TEAM',
      title: 'Sales & Calling Team',
      desc: 'Lead contact info, payment drop-off recovery, AI voice call transcripts, and manual calling.',
      access: 'Leads, Calls & WhatsApp'
    },
    {
      role: 'CUSTOMER_SUPPORT',
      title: 'Customer Support Representative',
      desc: 'Customer 360 profile, lead history, order status, report download status, and dispute triage.',
      access: 'Customer 360 & Orders'
    },
    {
      role: 'FINANCE_RECONCILIATION',
      title: 'Finance & Reconciliation Specialist',
      desc: 'Razorpay settlement ledgers, refunds, payment attempts, MDR fees, and GST tax reports.',
      access: 'Razorpay & Financial Reports'
    },
    {
      role: 'TECHNICAL_ADMIN',
      title: 'Technical Admin & Data Engineer',
      desc: 'Database schema, webhook health monitoring, raw JSON payload inspector, and ngrok tunnels.',
      access: 'Integrations & System Health'
    }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              User Access & Role-Based Permissions (RBAC)
            </h1>
            <Badge variant="primary" size="sm">
              7 DEMO ROLES
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage administrative personnel, switch live viewing roles, and evaluate permissions enforcement.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Demo User</span>
        </Button>
      </div>

      {/* Role Switcher Matrix */}
      <Card title="RBAC Role Matrix & Fast Impersonation" subtitle="Click any role to test view permissions instantly">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rolesList.map(r => {
            const isCurrent = currentUser.role === r.role;
            return (
              <div
                key={r.role}
                onClick={() => switchDemoRole(r.role)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-50/80 shadow-md dark:border-brand-500/80 dark:bg-brand-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${isCurrent ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {r.title}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-brand-600 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
                      ACTIVE ROLE
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {r.desc}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Access Scope:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{r.access}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Demo Users Table */}
      <Card title="Active User Accounts" subtitle="Configured demo profiles with role assignments">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3 px-3 font-semibold">User</th>
                <th className="py-3 px-3 font-semibold">Assigned Role</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Last Active</th>
                <th className="py-3 px-3 font-semibold">Created Date</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {demoUsers.map(u => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white text-xs">
                          {(u.fullName || u.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.fullName || u.name || 'User'}</span>
                            {isCurrent && (
                              <span className="rounded bg-brand-500/10 text-brand-600 text-[9px] px-1.5 py-0.5 font-bold uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant="primary" size="sm">
                        {u.role.replace(/_/g, ' ')}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                        {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(u.lastLoginAt || u.lastLogin)}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(u.createdAt || u.createdDate)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => switchDemoRole(u.role)}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-600 transition-colors"
                          >
                            Switch to Role
                          </button>
                        )}
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Demo User"
        subtitle="Create a new administrative demo profile"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={newFullName}
              onChange={e => setNewFullName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="e.g. rahul@mangotree.com"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assigned Demo Role
            </label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as DemoRole)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {rolesList.map(r => (
                <option key={r.role} value={r.role}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create User Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
