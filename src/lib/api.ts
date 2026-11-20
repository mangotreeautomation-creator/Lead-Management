/**
 * LeadPulse Enterprise API Client
 * Connects frontend Next.js to Fastify Backend (http://localhost:4000/api/v1)
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
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
  async getOverviewStats(): Promise<any> {
    return this.request('/overview/stats');
  }

  // Leads
  async getLeads(params: { page?: number; limit?: number; status?: string; category?: string; search?: string } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params.category && params.category !== 'ALL') searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);

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
  async getPayments(params: { page?: number; limit?: number; status?: string } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request(`/payments${query ? `?${query}` : ''}`);
  }

  // Meta Marketing API
  async getMetaStatus(): Promise<any> {
    return this.request('/meta-ads/status');
  }

  async syncMetaAds(): Promise<any> {
    return this.request('/meta-ads/sync', { method: 'POST' });
  }

  async getMetaCampaigns(): Promise<any> {
    return this.request('/meta-ads/campaigns');
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
