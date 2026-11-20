'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

export type NavigationModule = 
  | 'overview'
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
        markNotificationAsRead
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
