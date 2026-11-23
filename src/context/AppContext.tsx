'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  BusinessUnitCode,
  RazorpayAccountCode,
  CompanyCode,
  DemoRole,
  UserAccount,
  MockDatabase,
  Lead,
  Customer,
  AppStage,
  SelectedLens,
  DynamicTelemetryPreset,
  DynamicFilterParams,
  DateRangeOption,
  CustomDateRange
} from '../data/types';
import { generateFullEnterpriseMockData, DEMO_USERS } from '../data/mockDataGenerator';
import { apiClient } from '../lib/api';

export function resolveActiveDateRange(
  preset: DateRangeOption,
  custom?: CustomDateRange | null
): { startDate?: string; endDate?: string } {
  if (preset === 'CUSTOM' && custom?.startDate && custom?.endDate) {
    return { startDate: custom.startDate, endDate: custom.endDate };
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  switch (preset) {
    case 'TODAY': {
      const todayStr = fmt(new Date(year, month, date));
      return { startDate: todayStr, endDate: todayStr };
    }
    case 'YESTERDAY': {
      const yestStr = fmt(new Date(year, month, date - 1));
      return { startDate: yestStr, endDate: yestStr };
    }
    case 'LAST_7_DAYS': {
      const s = fmt(new Date(year, month, date - 6));
      const e = fmt(new Date(year, month, date));
      return { startDate: s, endDate: e };
    }
    case 'LAST_30_DAYS': {
      const s = fmt(new Date(year, month, date - 29));
      const e = fmt(new Date(year, month, date));
      return { startDate: s, endDate: e };
    }
    case 'THIS_MONTH': {
      return { startDate: `${year}-11-01`, endDate: `${year}-11-30` };
    }
    case 'LAST_MONTH': {
      return { startDate: `${year}-10-01`, endDate: `${year}-10-31` };
    }
    case 'ALL_TIME':
    default:
      if (custom?.startDate && custom?.endDate) {
        return { startDate: custom.startDate, endDate: custom.endDate };
      }
      return { startDate: undefined, endDate: undefined };
  }
}

export type NavigationModule = 
  | 'overview'
  | 'analytics'
  | 'category-workspace'
  | 'leads'
  | 'customers'
  | 'automation-hub'
  | 'vertical-palmistry'
  | 'vertical-vastu'
  | 'vertical-webinar'
  | 'vertical-consultancy'
  | 'landing-pages'
  | 'marketing'
  | 'razorpay'
  | 'ai-element'
  | 'wati'
  | 'whatsapp-ai'
  | 'reports'
  | 'integration-health'
  | 'users'
  | 'audit'
  | 'settings';

interface AppContextType {
  // Theme & Production Visual Studio
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeFontId: string;
  setActiveFontId: (id: string) => void;

  // Active Navigation
  activeModule: NavigationModule;
  setActiveModule: (mod: NavigationModule) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Stage & Lens Navigation Flow
  appStage: AppStage;
  setAppStage: (stage: AppStage) => void;
  selectedCompany: CompanyCode;
  setSelectedCompany: (c: CompanyCode) => void;
  dynamicFilter: DynamicFilterParams;
  setDynamicFilter: React.Dispatch<React.SetStateAction<DynamicFilterParams>>;
  updateFilterPreset: (preset: DynamicTelemetryPreset) => void;
  enterCompanyWorkflow: (company: CompanyCode) => void;
  enterCategoryWorkflow: (company: CompanyCode, category: 'ALL' | BusinessUnitCode) => void;
  selectedLens: SelectedLens;
  setSelectedLens: (lens: SelectedLens) => void;
  enterCategoryWorkspace: (bu: 'ALL' | BusinessUnitCode) => void;
  enterRazorpayWorkspace: (acc: 'ALL' | RazorpayAccountCode) => void;
  returnToGateway: (stage?: AppStage) => void;

  // Category Gateway
  isCategorySelectorOpen: boolean;
  setIsCategorySelectorOpen: (open: boolean) => void;

  // Selected Lead / Customer Drawers
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;

  // Global Filters
  selectedVertical: 'ALL' | BusinessUnitCode;
  setSelectedVertical: (v: 'ALL' | BusinessUnitCode) => void;
  selectedAccount: 'ALL' | RazorpayAccountCode;
  setSelectedAccount: (a: 'ALL' | RazorpayAccountCode) => void;
  dateRange: DateRangeOption;
  setDateRange: (d: DateRangeOption) => void;
  customDateRange: CustomDateRange | null;
  setCustomDateRange: (r: CustomDateRange | null) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;

  // Demo Authentication
  currentUser: UserAccount;
  switchDemoRole: (role: DemoRole) => void;
  demoUsers: UserAccount[];
  addDemoUser: (u: UserAccount) => void;
  updateDemoUser: (u: UserAccount) => void;
  toggleUserStatus: (id: string) => void;
  isDemoAuthModalOpen: boolean;
  setIsDemoAuthModalOpen: (open: boolean) => void;

  // Database
  db: MockDatabase;
  resetDemoData: () => void;

  // Notifications
  notifications: Array<{ id: string; text: string; time: string; read: boolean; type: 'success' | 'warning' | 'info' }>;
  markNotificationAsRead: (id: string) => void;

  // Live Backend Connection
  isBackendConnected: boolean;
  refreshBackendStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Production 10-Theme and 10-Font System
  const [activeThemeId, setActiveThemeId] = useState<string>('obsidian');
  const [activeFontId, setActiveFontId] = useState<string>('inter');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load persisted theme and font from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('leadpulse_theme');
        if (savedTheme) setActiveThemeId(savedTheme);
        const savedFont = localStorage.getItem('leadpulse_font');
        if (savedFont) setActiveFontId(savedFont);
      } catch {
        // ignore localStorage access issues
      }
    }
  }, []);

  // Sync active theme to html data-theme and dark class
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeThemeId);
    if (activeThemeId === 'polar') {
      root.classList.remove('dark');
      setTheme('light');
    } else {
      root.classList.add('dark');
      setTheme('dark');
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('leadpulse_theme', activeThemeId);
      } catch {
        // ignore
      }
    }
  }, [activeThemeId]);

  // Sync active font to html data-font
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font', activeFontId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('leadpulse_font', activeFontId);
      } catch {
        // ignore
      }
    }
  }, [activeFontId]);

  const toggleTheme = () => {
    if (activeThemeId === 'polar') {
      setActiveThemeId('obsidian');
    } else {
      setActiveThemeId('polar');
    }
  };

  // Nav state
  const [activeModule, setActiveModule] = useState<NavigationModule>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Entrance & Stage Flow
  const [appStage, setAppStage] = useState<AppStage>('LOGIN');
  const [selectedLens, setSelectedLens] = useState<SelectedLens>('CATEGORY');
  const [selectedCompany, setSelectedCompany] = useState<CompanyCode>('ALL');

  const defaultFilter: DynamicFilterParams = {
    preset: 'ALL',
    company: 'ALL',
    category: 'ALL',
    paymentStatus: 'ALL',
    leadStatus: 'ALL',
    landingPageSlug: 'ALL',
    videoCreativeId: 'ALL',
    telephonyStatus: 'ALL',
    dateRange: 'ALL_TIME',
    searchQuery: '',
    visibleColumns: {
      customerName: true,
      customerPhone: true,
      city: true,
      landingPage: true,
      videoCreative: true,
      orderAmount: true,
      paymentStatus: true,
      failureReason: true,
      aiCallStatus: true,
      actions: true
    }
  };

  const [dynamicFilter, setDynamicFilter] = useState<DynamicFilterParams>(defaultFilter);

  const updateFilterPreset = (preset: DynamicTelemetryPreset) => {
    setDynamicFilter(prev => {
      if (preset === 'FAILED_PAYMENTS_QUEUE') {
        return {
          ...prev,
          preset,
          paymentStatus: 'FAILED',
          leadStatus: 'ALL',
          visibleColumns: {
            ...prev.visibleColumns,
            failureReason: true,
            customerPhone: true,
            orderAmount: true
          }
        };
      }
      if (preset === 'CONVERTED_CUSTOMERS') {
        return {
          ...prev,
          preset,
          paymentStatus: 'CAPTURED',
          leadStatus: 'ALL'
        };
      }
      if (preset === 'AI_VOICE_RECOVERY') {
        return {
          ...prev,
          preset,
          telephonyStatus: 'CONNECTED'
        };
      }
      if (preset === 'ADS_VS_RAZORPAY_ROAS') {
        return {
          ...prev,
          preset
        };
      }
      // 'ALL'
      return {
        ...defaultFilter,
        company: prev.company,
        category: prev.category
      };
    });
  };

  const enterCompanyWorkflow = (company: CompanyCode) => {
    setSelectedCompany(company);
    setDynamicFilter(prev => ({ ...prev, company, category: 'ALL' }));
    if (company === 'ALL') {
      setSelectedVertical('ALL');
      setSelectedAccount('ALL');
      setActiveModule('overview');
      setAppStage('PORTAL');
    } else {
      setAppStage('CATEGORY_SELECT');
    }
  };

  const enterCategoryWorkflow = (company: CompanyCode, category: 'ALL' | BusinessUnitCode) => {
    setSelectedCompany(company);
    setSelectedVertical(category);
    setDynamicFilter(prev => ({ ...prev, company, category }));

    if (company === 'VASTU_SHIKHAR') setSelectedAccount('VASTU_SHIKHAR');
    else if (company === 'GLOBALINCH') setSelectedAccount('GLOBAL_INCH');
    else if (company === 'MANGO_TREE') setSelectedAccount('MANGO_TREE');
    else setSelectedAccount('ALL');

    setActiveModule('overview');
    setAppStage('PORTAL');
  };

  const enterCategoryWorkspace = (bu: 'ALL' | BusinessUnitCode) => {
    setSelectedVertical(bu);
    setSelectedAccount('ALL');
    setSelectedLens('CATEGORY');
    setActiveModule(bu === 'ALL' ? 'overview' : 'category-workspace');
    setAppStage('PORTAL');
  };

  const enterRazorpayWorkspace = (acc: 'ALL' | RazorpayAccountCode) => {
    setSelectedAccount(acc);
    setSelectedVertical('ALL');
    setSelectedLens('RAZORPAY');
    setActiveModule('razorpay');
    setAppStage('PORTAL');
  };

  const returnToGateway = (stage: AppStage = 'COMPANY_SELECT') => {
    setAppStage(stage);
  };

  // Global Filter State
  const [selectedVertical, setSelectedVertical] = useState<'ALL' | BusinessUnitCode>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<'ALL' | RazorpayAccountCode>('ALL');
  const [dateRange, setDateRange] = useState<DateRangeOption>('ALL_TIME');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Demo Users & Role Management
  const [demoUsers, setDemoUsers] = useState<UserAccount[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEMO_USERS[0]); // Default: Super Admin
  const [isDemoAuthModalOpen, setIsDemoAuthModalOpen] = useState(false);

  // Database container
  const [db, setDb] = useState<MockDatabase>(() => generateFullEnterpriseMockData());

  const resetDemoData = () => {
    setDb(generateFullEnterpriseMockData());
    alert('Demo environment data successfully re-seeded to initial state.');
  };

  const switchDemoRole = (role: DemoRole) => {
    const found = demoUsers.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const addDemoUser = (user: UserAccount) => {
    setDemoUsers(prev => [user, ...prev]);
  };

  const updateDemoUser = (user: UserAccount) => {
    setDemoUsers(prev => prev.map(u => (u.id === user.id ? user : u)));
  };

  const toggleUserStatus = (id: string) => {
    setDemoUsers(prev => prev.map(u => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  // Sample Notifications
  const [notifications, setNotifications] = useState([
    { id: 'notif_1', text: '₹999 Payment Captured: Ravi Kumar (Palmistry LP 1)', time: '5m ago', read: false, type: 'success' as const },
    { id: 'notif_2', text: 'AI Element Voice Recovery: Call connected with Sunita Sharma (135s)', time: '12m ago', read: false, type: 'info' as const },
    { id: 'notif_3', text: 'Meta Daily Insights Ingested: 24 completed campaigns synced', time: '1h ago', read: false, type: 'info' as const },
    { id: 'notif_4', text: 'UPI Timeout Alert: 3 failed attempts on Vastu Wheel LP', time: '2h ago', read: true, type: 'warning' as const }
  ]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // Live Backend Health State & Periodic Polling
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Authoritative Ref for persistent active filters across background polls
  const activeFilterParamsRef = useRef({
    customDateRange,
    dateRange,
    selectedCompany,
    selectedVertical,
    dynamicFilter,
  });

  useEffect(() => {
    activeFilterParamsRef.current = {
      customDateRange,
      dateRange,
      selectedCompany,
      selectedVertical,
      dynamicFilter,
    };
  }, [customDateRange, dateRange, selectedCompany, selectedVertical, dynamicFilter]);

  const syncLiveDataFromBackend = async () => {
    try {
      const {
        customDateRange: activeCustom,
        dateRange: activePreset,
        selectedCompany: activeCompany,
        selectedVertical: activeVertical,
        dynamicFilter: activeDynFilter,
      } = activeFilterParamsRef.current;

      const { startDate: activeStartDate, endDate: activeEndDate } = resolveActiveDateRange(activePreset, activeCustom);
      const companyCode = activeCompany !== 'ALL' ? activeCompany : undefined;
      const categoryCode = activeVertical !== 'ALL' ? activeVertical : undefined;
      const landingPage = activeDynFilter.landingPageSlug !== 'ALL' ? activeDynFilter.landingPageSlug : undefined;
      const reportLanguage = activeDynFilter.reportLanguage !== 'ALL' ? activeDynFilter.reportLanguage : undefined;
      const metaCampaign = activeDynFilter.metaCampaign !== 'ALL' ? activeDynFilter.metaCampaign : undefined;

      const [leadsRes, payRes, refRes, creativesRes, campPerfRes] = await Promise.all([
        apiClient.getLeads({
          limit: 1000,
          startDate: activeStartDate,
          endDate: activeEndDate,
          companyCode,
          category: categoryCode,
          landingPage,
          reportLanguage,
          metaCampaign,
        }),
        apiClient.getPayments({
          limit: 1000,
          startDate: activeStartDate,
          endDate: activeEndDate,
          landingPage,
          reportLanguage,
          companyCode,
        }),
        apiClient.getRefunds(),
        apiClient.getVideoCreatives().catch(() => ({ data: [] })),
        apiClient.getMetaCampaignPerformance().catch(() => ({ data: [] })),
      ]);

      if (leadsRes?.data && payRes?.data) {
        // Map backend leads
        const mappedLeads = leadsRes.data.map((l: any) => ({
          id: l.id,
          customerId: l.customerId || l.customer?.id || `cust_${l.id}`,
          customerName: l.customer?.fullName || 'VastuWheel Customer',
          customerPhone: l.customer?.phone || '',
          customerEmail: l.customer?.email || '',
          businessUnit: (l.category?.code === 'vastuwheel' ? 'VASTU_REPORT' : l.category?.code?.toUpperCase()) || 'VASTU_REPORT',
          company: l.company?.code || 'GLOBALINCH',
          subCategory: 'Vastu Wheel Automated Report',
          productName: l.metadata?.product === 'report' ? '16-Zone VastuWheel Report' : (l.metadata?.product || '16-Zone VastuWheel Report'),
          landingPageId: l.metadata?.route || 'fb4',
          landingPageCode: l.metadata?.route || 'fb4',
          landingPageSlug: l.metadata?.route || l.metadata?.campaign || 'fb4',
          reportLanguage: l.metadata?.reportLanguage || null,
          uniqueCustomerId: l.metadata?.uniqueCustomerId || null,
          propertyType: l.metadata?.propertyType || null,
          entranceDirection: l.metadata?.entranceDirection || null,
          paymentType: l.metadata?.paymentType || 'vastu_report',
          adCreativeId: l.tracking?.utmContent || 'vid_vastu_03',
          adCreativeName: l.tracking?.utmContent || 'VastuWheel 16-Zone Directional Diagnostic',
          leadStatus: l.status,
          status: l.status,
          score: l.score,
          stage: l.stage,
          enquirySource: l.source || 'META_ADS',
          createdAt: l.createdAt,
          utmSource: l.tracking?.utmSource || 'facebook',
          utmMedium: l.tracking?.utmMedium || 'cpc',
          utmCampaign: l.tracking?.utmCampaign || 'vastuwheel_meta',
          utmTerm: l.tracking?.utmTerm || null,
          utmContent: l.tracking?.utmContent || null,
          capturedRevenue: l.status === 'CONVERTED' ? 1499.0 : 0,
        }));

        // Map backend captured payments
        const mappedCaptured = payRes.data.map((p: any) => ({
          id: p.id,
          paymentId: p.paymentId,
          gatewayPaymentId: p.paymentId,
          razorpayPaymentId: p.paymentId,
          orderId: p.orderId,
          gatewayOrderId: p.orderId,
          razorpayOrderId: p.orderId,
          amount: p.amount,
          capturedAmount: p.amount,
          fee: p.fee,
          tax: p.tax,
          net: p.net,
          currency: p.currency,
          status: 'CAPTURED',
          paymentMethod: p.method,
          accountCode: 'GLOBAL_INCH',
          razorpayAccount: 'RZP_GLOBALINCH',
          landingPageSlug: p.notes?.route || p.notes?.campaign || 'fb4',
          reportLanguage: p.notes?.report_language || null,
          uniqueCustomerId: p.notes?.unique_customer_id || null,
          notes: p.notes,
          capturedAt: p.capturedAt,
          createdAt: p.capturedAt,
        }));

        // Map converted leads and captured payments to orders
        const capturedOrders = mappedCaptured.map((cp: any, i: number) => {
          const leadMatch = mappedLeads.find((l: any) => l.customerId === cp.customerId) || mappedLeads[i % Math.max(1, mappedLeads.length)];
          return {
            id: cp.orderId,
            orderNumber: `ORD-LIVE-${i + 1}`,
            gatewayOrderId: cp.orderId,
            razorpayOrderId: cp.orderId,
            customerId: leadMatch?.customerId || cp.customerId,
            customerName: leadMatch?.customerName || 'VastuWheel Customer',
            leadId: leadMatch?.id || `ld_${cp.id}`,
            businessUnit: 'VASTU_REPORT',
            company: 'GLOBALINCH',
            razorpayAccount: 'RZP_GLOBALINCH',
            accountCode: 'GLOBAL_INCH',
            productName: '16-Zone VastuWheel Report',
            amount: cp.amount,
            amountPaid: cp.amount,
            amountDue: 0.0,
            currency: 'INR',
            orderStatus: 'PAID',
            status: 'PAID',
            createdAt: cp.capturedAt,
          };
        });

        // Orders from failed leads
        const failedLeads = mappedLeads.filter((l: any) => l.leadStatus === 'NEW');
        const failedOrders = failedLeads.map((fl: any, i: number) => ({
          id: `ord_fail_${fl.id}`,
          orderNumber: `ORD-FAIL-${i + 1}`,
          gatewayOrderId: `ord_fail_${fl.id}`,
          razorpayOrderId: `ord_fail_${fl.id}`,
          customerId: fl.customerId,
          customerName: fl.customerName,
          leadId: fl.id,
          businessUnit: 'VASTU_REPORT',
          company: 'GLOBALINCH',
          razorpayAccount: 'RZP_GLOBALINCH',
          accountCode: 'GLOBAL_INCH',
          productName: '16-Zone VastuWheel Report',
          amount: 1499.0,
          amountPaid: 0.0,
          amountDue: 1499.0,
          currency: 'INR',
          orderStatus: 'PENDING',
          status: 'PENDING',
          createdAt: fl.createdAt,
        }));

        const mappedOrders = [...capturedOrders, ...failedOrders];

        // Map Payment Attempts (Captured + Failed)
        const capturedAttempts = mappedCaptured.map((cp: any) => ({
          id: `att_${cp.id}`,
          orderId: cp.orderId,
          gatewayPaymentId: cp.paymentId,
          razorpayPaymentId: cp.paymentId,
          amount: cp.amount,
          status: 'CAPTURED',
          attemptStatus: 'CAPTURED',
          paymentMethod: cp.paymentMethod || 'UPI',
          accountCode: 'GLOBAL_INCH',
          razorpayAccount: 'RZP_GLOBALINCH',
          createdAt: cp.capturedAt,
        }));

        const failedAttempts = failedLeads.map((fl: any) => ({
          id: `att_fail_${fl.id}`,
          orderId: `ord_fail_${fl.id}`,
          gatewayPaymentId: `pay_fail_${fl.id.slice(-8)}`,
          razorpayPaymentId: `pay_fail_${fl.id.slice(-8)}`,
          amount: 1499.0,
          status: 'FAILED',
          attemptStatus: 'FAILED',
          paymentMethod: 'UPI',
          errorCode: 'PAYMENT_FAILED',
          errorMessage: 'Transaction timed out / user aborted',
          accountCode: 'GLOBAL_INCH',
          razorpayAccount: 'RZP_GLOBALINCH',
          createdAt: fl.createdAt,
        }));

        const mappedAttempts = [...capturedAttempts, ...failedAttempts];

        // Map Customers
        const mappedCustomers = mappedLeads.map((l: any) => ({
          id: l.customerId,
          fullName: l.customerName,
          name: l.customerName,
          phone: l.customerPhone,
          primaryPhone: l.customerPhone,
          email: l.customerEmail,
          company: 'GLOBALINCH',
          city: 'India',
          state: 'India',
          country: 'India',
          totalOrders: l.leadStatus === 'CONVERTED' ? 1 : 0,
          totalSpent: l.leadStatus === 'CONVERTED' ? 1499.0 : 0,
          createdAt: l.createdAt,
        }));

        // Map Refunds
        const mappedRefunds = (refRes?.data || []).map((r: any) => ({
          id: r.id,
          gatewayRefundId: r.refundId,
          razorpayRefundId: r.refundId,
          paymentId: r.paymentId,
          amount: r.amount,
          refundAmount: r.amount,
          currency: 'INR',
          refundStatus: 'PROCESSED',
          status: 'PROCESSED',
          reason: r.reason || 'Customer refund',
          businessUnit: 'VASTU_REPORT',
          razorpayAccount: 'RZP_GLOBALINCH',
          createdAt: r.createdAt,
        }));

        // Map Creatives with Genuine Leads & Converted Revenue
        const mappedCreatives = (creativesRes?.data || []).map((c: any) => {
          const leadsForCreative = mappedLeads.filter((l: any) =>
            l.adCreativeName === c.title ||
            l.adCreativeId === c.metaCreativeId ||
            l.adCreativeId === c.title
          );
          const totalLeads = leadsForCreative.length || Number(c.totalLeads || 0);
          const convertedLeads = leadsForCreative.filter((l: any) => l.leadStatus === 'CONVERTED').length || Number(c.convertedLeads || 0);
          const capturedRevenue = leadsForCreative.reduce((sum: number, l: any) => sum + (l.capturedRevenue || 0), 0) || Number(c.capturedRevenueInr || 0);

          return {
            id: c.title || c.metaCreativeId || c.id,
            code: c.metaCreativeId || c.id,
            name: c.title || 'Video Ad Creative',
            creativeName: c.title || 'Video Ad Creative',
            title: c.title || 'Video Ad Creative',
            vertical: 'VASTU_REPORT' as BusinessUnitCode,
            videoDuration: '0:45',
            hookHeadline: c.title || 'Vastu Diagnostic',
            thumbnailGradient: 'from-blue-600 to-indigo-900',
            spend: 0,
            impressions: totalLeads * 18,
            clicks: totalLeads * 2,
            leadsCount: totalLeads,
            capturedRevenue: capturedRevenue,
            roas: 0,
          };
        });

        // Map Meta Campaign Insights with Genuine Razorpay Attribution
        const mappedDailyInsights = (campPerfRes?.data || []).map((cp: any) => ({
          id: cp.id || cp.metaCampaignId,
          campaignId: cp.id || cp.metaCampaignId,
          metaCampaignId: cp.metaCampaignId,
          campaignName: cp.campaignName,
          businessUnit: 'VASTU_REPORT' as BusinessUnitCode,
          date: cp.startTime ? new Date(cp.startTime).toISOString().split('T')[0] : '2026-10-01',
          status: cp.status || 'ACTIVE' as const,
          spend: 0,
          impressions: cp.totalLeads * 18,
          clicks: cp.totalLeads * 2,
          leads: cp.totalLeads,
          purchases: cp.convertedLeads,
          purchaseValue: cp.capturedRevenueInr,
          roas: 0,
        }));

        setDb((prev: any) => {
          return {
            ...prev,
            leads: mappedLeads,
            orders: mappedOrders,
            capturedPayments: mappedCaptured,
            paymentAttempts: mappedAttempts,
            customers: mappedCustomers,
            refunds: mappedRefunds,
            videoCreatives: mappedCreatives.length > 0 ? mappedCreatives : prev.videoCreatives,
            metaDailyInsights: mappedDailyInsights.length > 0 ? mappedDailyInsights : prev.metaDailyInsights,
          };
        });
      }
    } catch (e) {
      console.warn('[AppContext] Failed to hydrate live PostgreSQL data:', e);
    }
  };

  const refreshBackendStatus = async () => {
    try {
      const health = await apiClient.checkHealth();
      const isOk = health.database?.ok === true;
      setIsBackendConnected(isOk);
      if (isOk) {
        await syncLiveDataFromBackend();
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    refreshBackendStatus();
    const interval = setInterval(refreshBackendStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isBackendConnected) {
      syncLiveDataFromBackend();
    }
  }, [
    dateRange,
    customDateRange,
    selectedCompany,
    selectedVertical,
    dynamicFilter.landingPageSlug,
    dynamicFilter.reportLanguage,
    dynamicFilter.metaCampaign,
  ]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeThemeId,
        setActiveThemeId,
        activeFontId,
        setActiveFontId,
        activeModule,
        setActiveModule,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isCategorySelectorOpen,
        setIsCategorySelectorOpen,
        appStage,
        setAppStage,
        selectedCompany,
        setSelectedCompany,
        dynamicFilter,
        setDynamicFilter,
        updateFilterPreset,
        enterCompanyWorkflow,
        enterCategoryWorkflow,
        selectedLens,
        setSelectedLens,
        enterCategoryWorkspace,
        enterRazorpayWorkspace,
        returnToGateway,
        selectedLeadId,
        setSelectedLeadId,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedVertical,
        setSelectedVertical,
        selectedAccount,
        setSelectedAccount,
        dateRange,
        setDateRange,
        customDateRange,
        setCustomDateRange,
        globalSearch,
        setGlobalSearch,
        currentUser,
        switchDemoRole,
        demoUsers,
        addDemoUser,
        updateDemoUser,
        toggleUserStatus,
        isDemoAuthModalOpen,
        setIsDemoAuthModalOpen,
        db,
        resetDemoData,
        notifications,
        markNotificationAsRead,
        isBackendConnected,
        refreshBackendStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
