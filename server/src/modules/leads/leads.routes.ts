import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { leadsService } from './leads.service';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'WON']),
  reason: z.string().optional(),
});

export async function leadsRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/leads
   */
  app.get('/api/v1/leads', { preHandler: [requireAuth, requirePermission('leads:view')] }, async (request, reply) => {
    const query = request.query as any;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '25', 10);
    const status = query.status;
    const categoryCode = query.category;
    const search = query.search;

    const result = await leadsService.listLeads({
      page,
      limit,
      status,
      categoryCode,
      companyCode: query.companyCode || query.company,
      companyId: query.companyId,
      search,
      startDate: query.startDate,
      endDate: query.endDate,
      creative: query.creative,
    });

    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/leads/:id
   */
  app.get('/api/v1/leads/:id', { preHandler: [requireAuth, requirePermission('leads:view')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const lead = await leadsService.getLeadById(id);
    return reply.status(200).send({ data: lead });
  });

  /**
   * PATCH /api/v1/leads/:id/status
   */
  app.patch('/api/v1/leads/:id/status', { preHandler: [requireAuth, requirePermission('leads:edit')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = updateStatusSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.format(),
      });
    }

    const updated = await leadsService.updateLeadStatus(
      id,
      parseResult.data.status,
      request.user?.id,
      parseResult.data.reason
    );

    return reply.status(200).send({
      success: true,
      data: updated,
    });
  });
}
