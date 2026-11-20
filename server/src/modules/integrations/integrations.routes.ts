import { FastifyInstance } from 'fastify';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';

export async function integrationsRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/integrations/status
   * Reports live vs mock vs future-ready status of all connected services
   */
  app.get('/api/v1/integrations/status', { preHandler: [requireAuth] }, async (request, reply) => {
    return reply.status(200).send({
      integrations: [
        {
          id: 'razorpay',
          name: 'Razorpay Payment Gateway (3 Accounts)',
          status: 'LIVE_ACTIVE',
          type: 'PAYMENT_GATEWAY',
          accounts: [
            { name: 'GlobalInch (VastuWheel & Palmistry)', endpoint: '/api/v1/webhooks/razorpay/vastuwheel-report' },
            { name: 'Mango Tree Technology (Vastu Webinar)', endpoint: '/api/v1/webhooks/razorpay/vastu-webinar' },
            { name: 'Vastu Shikhar (Consultancy)', endpoint: '/api/v1/webhooks/razorpay/consultancy' },
          ],
        },
        {
          id: 'meta_ads',
          name: 'Meta Marketing API (v21.0)',
          status: process.env.META_SYSTEM_USER_ACCESS_TOKEN ? 'LIVE_ACTIVE' : 'READY_CONFIGURED',
          type: 'MARKETING_ADS',
          adAccountId: 'act_845822215217013',
          version: 'v21.0',
        },
        {
          id: 'whatsapp_ai_portal',
          name: 'In-House WhatsApp AI Portal',
          status: 'LIVE_ACTIVE',
          type: 'AI_CHAT_PORTAL',
          endpoint: '/api/v1/webhooks/whatsapp-ai/messages',
        },
        {
          id: 'wati',
          name: 'WATI WhatsApp Business API',
          status: 'NOT_CONNECTED',
          type: 'COMMUNICATION',
          notice: 'Future-ready connector. Awaiting WATI API Endpoint & Access Token.',
        },
        {
          id: 'ai_element',
          name: 'AI Element Voice Call Agent',
          status: 'NOT_CONNECTED',
          type: 'VOICE_AI',
          notice: 'Future-ready connector. Awaiting AI Element Webhook & Voice Agent ID.',
        },
        {
          id: 'google_ads',
          name: 'Google Ads Enhanced Conversions',
          status: 'NOT_CONNECTED',
          type: 'MARKETING_ADS',
          notice: 'Future-ready connector. Awaiting Developer Token & Customer ID.',
        },
      ],
    });
  });
}
