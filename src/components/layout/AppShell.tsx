'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { LeadDetailDrawer } from '../modules/leads/LeadDetailDrawer';
import { CustomerDetailModal } from '../modules/customers/CustomerDetailModal';
import { DemoAuthModal } from '../modules/auth/DemoAuthModal';
import { CategoryGatewayModal } from '../modules/gateway/CategoryGatewayModal';
import { SidekickFloatingBar } from '../ui/SidekickFloatingBar';

// Module views
import { OverviewDashboard } from '../modules/overview/OverviewDashboard';
import { CategoryWorkspaceView } from '../modules/category-workspace/CategoryWorkspaceView';
import { VerticalDashboard } from '../modules/verticals/VerticalDashboard';
import { LeadManagementView } from '../modules/leads/LeadManagementView';
import { CustomerListView } from '../modules/customers/CustomerListView';
import { LandingPageAnalyticsView } from '../modules/landing-pages/LandingPageAnalyticsView';
import { RazorpayPaymentsView } from '../modules/razorpay/RazorpayPaymentsView';
import { AiElementView } from '../modules/ai-element/AiElementView';
import { WatiView } from '../modules/wati/WatiView';
import { WhatsAppAiView } from '../modules/whatsapp-ai/WhatsAppAiView';
import { MarketingView } from '../modules/marketing/MarketingView';
import { ReportsCentreView } from '../modules/reports/ReportsCentreView';
import { IntegrationHealthView } from '../modules/integration-health/IntegrationHealthView';
import { UserManagementView } from '../modules/users/UserManagementView';
import { AuditLogsView } from '../modules/audit/AuditLogsView';
import { SettingsView } from '../modules/settings/SettingsView';
import { AutomationHubView } from '../modules/automation/AutomationHubView';

import { MasterGatewayPortal } from '../modules/gateway/MasterGatewayPortal';

export const AppShell: React.FC = () => {
  const { activeModule, appStage, isCategorySelectorOpen, setIsCategorySelectorOpen } = useApp();

  if (appStage !== 'PORTAL') {
    return <MasterGatewayPortal />;
  }

  const renderActiveView = () => {
    switch (activeModule) {
      case 'overview':
      case 'analytics':
        return <OverviewDashboard />;
      case 'category-workspace':
        return <CategoryWorkspaceView />;
      case 'leads':
        return <LeadManagementView />;
      case 'customers':
        return <CustomerListView />;
      case 'automation-hub':
        return <AutomationHubView />;
      case 'vertical-palmistry':
        return <CategoryWorkspaceView />;
      case 'vertical-vastu':
        return <CategoryWorkspaceView />;
      case 'vertical-webinar':
        return <CategoryWorkspaceView />;
      case 'vertical-consultancy':
        return <CategoryWorkspaceView />;
      case 'landing-pages':
        return <LandingPageAnalyticsView />;
      case 'marketing':
        return <MarketingView />;
      case 'razorpay':
        return <RazorpayPaymentsView />;
      case 'ai-element':
        return <AiElementView />;
      case 'wati':
        return <WatiView />;
      case 'whatsapp-ai':
        return <WhatsAppAiView />;
      case 'reports':
        return <ReportsCentreView />;
      case 'integration-health':
        return <IntegrationHealthView />;
      case 'users':
        return <UserManagementView />;
      case 'audit':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f8fd] text-[#1a1a1a] antialiased">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header TopNav */}
        <TopNav />

        {/* Dynamic Scrollable Content Canvas with Smooth Page Slide Transition */}
        <main className="flex-1 overflow-y-auto pb-16 bg-[#f7f8fd]">
          <div key={activeModule} className="animate-page-slide">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <LeadDetailDrawer />
      <CustomerDetailModal />
      <DemoAuthModal />
      <CategoryGatewayModal
        isOpen={isCategorySelectorOpen}
        onClose={() => setIsCategorySelectorOpen(false)}
      />

      {/* Floating Sidekick AI Copilot (Shopify Style) */}
      <SidekickFloatingBar />
    </div>
  );
};
