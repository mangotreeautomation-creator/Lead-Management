import { FastifyInstance } from 'fastify';
import { metaAdsService } from './meta-ads.service';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';

export async function metaAdsRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/meta-ads/status
   */
  app.get('/api/v1/meta-ads/status', { preHandler: [requireAuth] }, async (request, reply) => {
    const status = await metaAdsService.getConnectionStatus();
    return reply.status(200).send(status);
  });

  /**
   * POST /api/v1/meta-ads/sync
   */
  app.post('/api/v1/meta-ads/sync', { preHandler: [requireAuth, requirePermission('marketing:sync')] }, async (request, reply) => {
    const result = await metaAdsService.syncMetaAds();
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/meta-ads/campaigns
   */
  app.get('/api/v1/meta-ads/campaigns', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const campaigns = await metaAdsService.listCampaigns();
    return reply.status(200).send({ data: campaigns });
  });
}
