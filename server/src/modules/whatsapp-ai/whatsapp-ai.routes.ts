import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { whatsappAiService } from './whatsapp-ai.service';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';

const inboundMsgSchema = z.object({
  externalConvoId: z.string().min(1),
  senderPhone: z.string().min(1),
  senderName: z.string().optional(),
  senderType: z.enum(['CUSTOMER', 'AI_AGENT', 'HUMAN_AGENT', 'SYSTEM']),
  messageType: z.string().optional(),
  content: z.string().min(1),
  mediaUrl: z.string().optional(),
  aiModel: z.string().optional(),
  sentiment: z.string().optional(),
  intent: z.string().optional(),
});

export async function whatsappAiRoutes(app: FastifyInstance) {
  /**
   * Webhook Ingress: Inbound message from WhatsApp AI Portal
   * POST /api/v1/webhooks/whatsapp-ai/messages
   */
  app.post('/api/v1/webhooks/whatsapp-ai/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = inboundMsgSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.format(),
      });
    }

    const result = await whatsappAiService.ingestMessage(parseResult.data);
    return reply.status(200).send(result);
  });

  /**
   * Protected API: List WhatsApp Conversations
   * GET /api/v1/whatsapp-ai/conversations
   */
  app.get('/api/v1/whatsapp-ai/conversations', { preHandler: [requireAuth, requirePermission('ai_chat:view')] }, async (request, reply) => {
    const conversations = await whatsappAiService.listConversations();
    return reply.status(200).send({ data: conversations });
  });

  /**
   * Protected API: Get Conversation Messages
   * GET /api/v1/whatsapp-ai/conversations/:id/messages
   */
  app.get('/api/v1/whatsapp-ai/conversations/:id/messages', { preHandler: [requireAuth, requirePermission('ai_chat:view')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const messages = await whatsappAiService.getMessages(id);
    return reply.status(200).send({ data: messages });
  });
}
