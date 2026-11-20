import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { razorpayService } from './razorpay.service';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';
import { db } from '../../database/client';
import { rawWebhookEvents } from '../../database/schema/index';
import { desc } from 'drizzle-orm';

export async function razorpayRoutes(app: FastifyInstance) {
  /**
   * Helper handler for Razorpay Webhook Ingress
   */
  const handleRazorpayWebhook = async (slug: string, request: FastifyRequest, reply: FastifyReply) => {
    const signature = (request.headers['x-razorpay-signature'] as string) || '';
    const rawBody = (request as any).rawBody || JSON.stringify(request.body);

    const result = await razorpayService.handleWebhook(slug, rawBody, signature, request.headers);

    if (result.status === 'INVALID_SIGNATURE') {
      return reply.status(401).send(result);
    }

    if (result.status === 'FAILED') {
      return reply.status(400).send(result);
    }

    return reply.status(200).send(result);
  };

  /**
   * Dedicated Webhook Route 1: GlobalInch (VastuWheel Reports & Palmistry)
   */
  app.post('/api/v1/webhooks/razorpay/vastuwheel-report', async (request, reply) => {
    return handleRazorpayWebhook('vastuwheel-report', request, reply);
  });

  /**
   * Dedicated Webhook Route 2: Mango Tree Technology (Vastu Webinar)
   */
  app.post('/api/v1/webhooks/razorpay/vastu-webinar', async (request, reply) => {
    return handleRazorpayWebhook('vastu-webinar', request, reply);
  });

  /**
   * Dedicated Webhook Route 3: Vastu Shikhar (Consultancy)
   */
  app.post('/api/v1/webhooks/razorpay/consultancy', async (request, reply) => {
    return handleRazorpayWebhook('consultancy', request, reply);
  });

  /**
   * Universal Webhook Ingress (fallback with slug query or header)
   */
  app.post('/api/v1/webhooks/razorpay', async (request, reply) => {
    const slug = (request.query as any)?.account || (request.headers['x-account-slug'] as string) || 'vastuwheel-report';
    return handleRazorpayWebhook(slug, request, reply);
  });

  /**
   * Protected API: List Payments
   * GET /api/v1/payments
   */
  app.get('/api/v1/payments', { preHandler: [requireAuth, requirePermission('payments:view')] }, async (request, reply) => {
    const query = request.query as any;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '25', 10);

    const result = await razorpayService.listPayments({ page, limit, status: query.status });
    return reply.status(200).send(result);
  });

  /**
   * Protected API: Raw Webhook Audit Log
   * GET /api/v1/payments/raw-events
   */
  app.get('/api/v1/payments/raw-events', { preHandler: [requireAuth, requirePermission('payments:view')] }, async (request, reply) => {
    const events = await db
      .select({
        id: rawWebhookEvents.id,
        eventId: rawWebhookEvents.eventId,
        eventType: rawWebhookEvents.eventType,
        signatureValid: rawWebhookEvents.signatureValid,
        status: rawWebhookEvents.status,
        receivedAt: rawWebhookEvents.receivedAt,
        processedAt: rawWebhookEvents.processedAt,
        processingError: rawWebhookEvents.processingError,
      })
      .from(rawWebhookEvents)
      .orderBy(desc(rawWebhookEvents.receivedAt))
      .limit(50);

    return reply.status(200).send({ data: events });
  });
}
