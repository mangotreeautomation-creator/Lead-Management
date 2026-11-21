/**
 * LeadPulse Enterprise API Client
 * Connects frontend Next.js to Fastify Backend (http://localhost:4000/api/v1)
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  async autoLogin(): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'admin@leadpulse.io', password: 'Admin@2026!' }),
      });
      if (res.ok) {
        const data = await res.json();
        this.token = data.token;
        return data.token;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token && !endpoint.includes('/auth/login') && !endpoint.includes('/health')) {
      await this.autoLogin();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include HTTP-only session cookies
    });

    if (!response.ok) {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }
      throw new Error(errorBody.detail || errorBody.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async checkHealth(): Promise<{ status: string; uptimeSeconds: number; database: { ok: boolean } }> {
    const res = await fetch('http://localhost:4000/health');
    return res.json();
  }

  // Overview
  async getOverviewStats(params: { companyCode?: string; categoryCode?: string; startDate?: string; endDate?: string } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.companyCode && params.companyCode !== 'ALL') searchParams.set('companyCode', params.companyCode);
    if (params.categoryCode && params.categoryCode !== 'ALL') searchParams.set('categoryCode', params.categoryCode);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return this.request(`/overview/stats${query ? `?${query}` : ''}`);
  }

  // Leads
  async getLeads(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    companyCode?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    creative?: string;
    landingPage?: string;
    reportLanguage?: string;
    metaCampaign?: string;
    utmTerm?: string;
    utmSource?: string;
    utmMedium?: string;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params.category && params.category !== 'ALL') searchParams.set('category', params.category);
    if (params.companyCode && params.companyCode !== 'ALL') searchParams.set('companyCode', params.companyCode);
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.creative && params.creative !== 'ALL') searchParams.set('creative', params.creative);
    if (params.landingPage && params.landingPage !== 'ALL') searchParams.set('landingPage', params.landingPage);
    if (params.reportLanguage && params.reportLanguage !== 'ALL') searchParams.set('reportLanguage', params.reportLanguage);
    if (params.metaCampaign && params.metaCampaign !== 'ALL') searchParams.set('metaCampaign', params.metaCampaign);
    if (params.utmTerm && params.utmTerm !== 'ALL') searchParams.set('utmTerm', params.utmTerm);
    if (params.utmSource && params.utmSource !== 'ALL') searchParams.set('utmSource', params.utmSource);
    if (params.utmMedium && params.utmMedium !== 'ALL') searchParams.set('utmMedium', params.utmMedium);

    const query = searchParams.toString();
    return this.request(`/leads${query ? `?${query}` : ''}`);
  }

  async getLeadById(id: string): Promise<any> {
    return this.request(`/leads/${id}`);
  }

  async updateLeadStatus(id: string, status: string, reason?: string): Promise<any> {
    return this.request(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  // Customers
  async getCustomers(params: { page?: number; limit?: number; search?: string } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.request(`/customers${query ? `?${query}` : ''}`);
  }

  async getCustomerById(id: string): Promise<any> {
    return this.request(`/customers/${id}`);
  }

  // Razorpay Payments
  async getPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    landingPage?: string;
    reportLanguage?: string;
    companyCode?: string;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.landingPage && params.landingPage !== 'ALL') searchParams.set('landingPage', params.landingPage);
    if (params.reportLanguage && params.reportLanguage !== 'ALL') searchParams.set('reportLanguage', params.reportLanguage);
    if (params.companyCode && params.companyCode !== 'ALL') searchParams.set('companyCode', params.companyCode);

    const query = searchParams.toString();
    return this.request(`/payments${query ? `?${query}` : ''}`);
  }

  // Attribution & Landing Page Registry
  async getLandingPages(): Promise<any> {
    return this.request('/attribution/landing-pages');
  }

  async registerLandingPage(body: { routeSlug: string; fullUrl?: string; title?: string; categoryCode?: string }): Promise<any> {
    return this.request('/attribution/landing-pages', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getReportLanguages(params: { landingPage?: string; startDate?: string; endDate?: string } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.landingPage && params.landingPage !== 'ALL') searchParams.set('landingPage', params.landingPage);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return this.request(`/attribution/report-languages${query ? `?${query}` : ''}`);
  }

  async getFb4Summary(): Promise<any> {
    return this.request('/attribution/fb4-summary');
  }

  async getAttributionFilterOptions(params: { companyCode?: string; categoryCode?: string; landingPage?: string } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.companyCode && params.companyCode !== 'ALL') searchParams.set('companyCode', params.companyCode);
    if (params.categoryCode && params.categoryCode !== 'ALL') searchParams.set('categoryCode', params.categoryCode);
    if (params.landingPage && params.landingPage !== 'ALL') searchParams.set('landingPage', params.landingPage);
    const query = searchParams.toString();
    return this.request(`/attribution/filter-options${query ? `?${query}` : ''}`);
  }

  // Meta Marketing API
  async getMetaStatus(): Promise<any> {
    return this.request('/meta-ads/status');
  }

  async syncMetaAds(): Promise<any> {
    return this.request('/meta-ads/sync', { method: 'POST' });
  }

  async syncMetaRealtime(): Promise<any> {
    return this.request('/meta-ads/sync/realtime', { method: 'POST' });
  }

  async syncMetaHistorical30d(): Promise<any> {
    return this.request('/meta-ads/sync/historical-30d', { method: 'POST' });
  }

  async getMetaInsightsSummary(): Promise<any> {
    return this.request('/meta-ads/insights/summary');
  }

  async getMetaRealtimeInsights(): Promise<any> {
    return this.request('/meta-ads/insights/realtime');
  }

  async getMetaDailyInsights(days: number = 30): Promise<any> {
    return this.request(`/meta-ads/insights/daily?days=${days}`);
  }

  async getMetaCampaigns(): Promise<any> {
    return this.request('/meta-ads/campaigns');
  }

  async getMetaCampaignPerformance(): Promise<any> {
    return this.request('/meta-ads/campaign-performance');
  }

  async getVideoCreatives(): Promise<any> {
    return this.request('/meta-ads/creatives');
  }

  // Razorpay
  async getPaymentsStatus(): Promise<any> {
    return this.request('/payments/status');
  }

  async getPaymentsSummary(categoryId?: string): Promise<any> {
    return this.request(`/payments/summary${categoryId ? `?categoryId=${categoryId}` : ''}`);
  }

  async importRazorpay30d(account: string = 'vastuwheel-report'): Promise<any> {
    return this.request(`/payments/import/historical-30d?account=${account}`, { method: 'POST' });
  }

  async getRefunds(): Promise<any> {
    return this.request('/payments/refunds');
  }

  // WhatsApp AI Portal
  async getWhatsAppConversations(): Promise<any> {
    return this.request('/whatsapp-ai/conversations');
  }

  async getWhatsAppMessages(convoId: string): Promise<any> {
    return this.request(`/whatsapp-ai/conversations/${convoId}/messages`);
  }

  // Integrations status
  async getIntegrationsStatus(): Promise<any> {
    return this.request('/integrations/status');
  }
}

export const apiClient = new ApiClient();
