import { FastifyInstance } from 'fastify';
import { metaAdsService } from './meta-ads.service';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';
import { db } from '../../database/client';
import {
  videoCreatives,
  metaCampaigns,
  trackingParameters,
  leads,
  paymentOrders,
  capturedPayments,
} from '../../database/schema/index';
import { desc, eq, sql } from 'drizzle-orm';

export async function metaAdsRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/meta-ads/status
   */
  app.get('/api/v1/meta-ads/status', { preHandler: [requireAuth] }, async (request, reply) => {
    const status = await metaAdsService.getConnectionStatus();
    return reply.status(200).send(status);
  });

  /**
   * POST /api/v1/meta-ads/sync (Campaigns)
   */
  app.post('/api/v1/meta-ads/sync', { preHandler: [requireAuth, requirePermission('marketing:sync')] }, async (request, reply) => {
    const result = await metaAdsService.syncCampaigns();
    return reply.status(200).send(result);
  });

  /**
   * POST /api/v1/meta-ads/sync/realtime (Dataset A: Intraday Realtime Insights)
   */
  app.post('/api/v1/meta-ads/sync/realtime', { preHandler: [requireAuth, requirePermission('marketing:sync')] }, async (request, reply) => {
    const result = await metaAdsService.syncRealtimeIntraday();
    return reply.status(200).send(result);
  });

  /**
   * POST /api/v1/meta-ads/sync/historical-30d (Dataset B: 30-Day Historical Backfill)
   */
  app.post('/api/v1/meta-ads/sync/historical-30d', { preHandler: [requireAuth, requirePermission('marketing:sync')] }, async (request, reply) => {
    const result = await metaAdsService.backfillHistoricalDaily30Days();
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/meta-ads/insights/summary
   */
  app.get('/api/v1/meta-ads/insights/summary', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const summary = await metaAdsService.getInsightsSummary();
    return reply.status(200).send(summary);
  });

  /**
   * GET /api/v1/meta-ads/insights/realtime
   */
  app.get('/api/v1/meta-ads/insights/realtime', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const records = await metaAdsService.getRealtimeInsights();
    return reply.status(200).send({ data: records });
  });

  /**
   * GET /api/v1/meta-ads/insights/daily
   */
  app.get('/api/v1/meta-ads/insights/daily', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const query = request.query as { days?: string };
    const days = query.days ? parseInt(query.days, 10) : 30;
    const records = await metaAdsService.getDailyInsights(days);
    return reply.status(200).send({ data: records });
  });

  /**
   * GET /api/v1/meta-ads/campaigns
   */
  app.get('/api/v1/meta-ads/campaigns', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const campaigns = await metaAdsService.listCampaigns();
    return reply.status(200).send({ data: campaigns });
  });

  /**
   * GET /api/v1/meta-ads/campaign-performance (Cross-Platform Attribution)
   */
  app.get('/api/v1/meta-ads/campaign-performance', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const performance = await db
      .select({
        id: metaCampaigns.id,
        metaCampaignId: metaCampaigns.metaCampaignId,
        campaignName: metaCampaigns.name,
        objective: metaCampaigns.objective,
        status: metaCampaigns.status,
        startTime: metaCampaigns.startTime,
        totalLeads: sql<number>`cast(count(distinct ${leads.id}) as integer)`,
        convertedLeads: sql<number>`cast(count(distinct case when ${leads.status} = 'CONVERTED' then ${leads.id} end) as integer)`,
        capturedRevenueInr: sql<number>`coalesce(cast(sum(${capturedPayments.amountPaise})/100 as double precision), 0)`,
      })
      .from(metaCampaigns)
      .leftJoin(trackingParameters, eq(trackingParameters.utmCampaign, metaCampaigns.name))
      .leftJoin(leads, eq(leads.id, trackingParameters.leadId))
      .leftJoin(paymentOrders, eq(paymentOrders.leadId, leads.id))
      .leftJoin(capturedPayments, eq(capturedPayments.paymentOrderId, paymentOrders.id))
      .groupBy(metaCampaigns.id, metaCampaigns.name, metaCampaigns.metaCampaignId, metaCampaigns.objective, metaCampaigns.status, metaCampaigns.startTime)
      .orderBy(desc(sql`coalesce(sum(${capturedPayments.amountPaise}), 0)`));

    return reply.status(200).send({ data: performance });
  });

  /**
   * GET /api/v1/meta-ads/creatives (With Genuine Lead & Revenue Attribution)
   */
  app.get('/api/v1/meta-ads/creatives', { preHandler: [requireAuth, requirePermission('marketing:view')] }, async (request, reply) => {
    const creatives = await db
      .select({
        id: videoCreatives.id,
        metaCreativeId: videoCreatives.metaCreativeId,
        title: videoCreatives.title,
        aspectRatio: videoCreatives.aspectRatio,
        hookType: videoCreatives.hookType,
        totalLeads: sql<number>`cast(count(distinct ${leads.id}) as integer)`,
        convertedLeads: sql<number>`cast(count(distinct case when ${leads.status} = 'CONVERTED' then ${leads.id} end) as integer)`,
        capturedRevenueInr: sql<number>`coalesce(cast(sum(${capturedPayments.amountPaise})/100 as double precision), 0)`,
      })
      .from(videoCreatives)
      .leftJoin(trackingParameters, eq(trackingParameters.utmContent, videoCreatives.title))
      .leftJoin(leads, eq(leads.id, trackingParameters.leadId))
      .leftJoin(paymentOrders, eq(paymentOrders.leadId, leads.id))
      .leftJoin(capturedPayments, eq(capturedPayments.paymentOrderId, paymentOrders.id))
      .groupBy(videoCreatives.id, videoCreatives.metaCreativeId, videoCreatives.title, videoCreatives.aspectRatio, videoCreatives.hookType)
      .orderBy(desc(sql`coalesce(sum(${capturedPayments.amountPaise}), 0)`), desc(videoCreatives.createdAt));

    return reply.status(200).send({ data: creatives });
  });
}
