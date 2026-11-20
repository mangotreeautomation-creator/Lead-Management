import { FastifyInstance } from 'fastify';
import { sql, desc, eq } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  leads,
  customers,
  capturedPayments,
  categories,
  leadTouchpoints,
} from '../../database/schema/index';
import { requireAuth } from '../../middleware/auth.middleware';

export async function overviewRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/overview/stats
   */
  app.get('/api/v1/overview/stats', { preHandler: [requireAuth] }, async (request, reply) => {
    // 1. Leads Count
    const [leadsCountRow] = await db.select({ count: sql<number>`count(*)` }).from(leads);

    // 2. Customers Count
    const [custCountRow] = await db.select({ count: sql<number>`count(*)` }).from(customers);

    // 3. Payments Aggregates
    const [payAggRow] = await db
      .select({
        count: sql<number>`count(*)`,
        totalGrossPaise: sql<number>`coalesce(sum(${capturedPayments.amountPaise}), 0)`,
        totalFeePaise: sql<number>`coalesce(sum(${capturedPayments.feePaise}), 0)`,
        totalTaxPaise: sql<number>`coalesce(sum(${capturedPayments.taxPaise}), 0)`,
        totalNetPaise: sql<number>`coalesce(sum(${capturedPayments.netPaise}), 0)`,
      })
      .from(capturedPayments);

    // 4. Category breakdown of leads
    const categoryStats = await db
      .select({
        categoryCode: categories.code,
        categoryName: categories.name,
        leadCount: sql<number>`count(${leads.id})`,
      })
      .from(categories)
      .leftJoin(leads, eq(categories.id, leads.categoryId))
      .groupBy(categories.id, categories.code, categories.name);

    // 5. Recent 10 touchpoints / activities
    const recentActivity = await db
      .select({
        id: leadTouchpoints.id,
        channel: leadTouchpoints.channel,
        touchpointType: leadTouchpoints.touchpointType,
        summary: leadTouchpoints.summary,
        createdAt: leadTouchpoints.createdAt,
      })
      .from(leadTouchpoints)
      .orderBy(desc(leadTouchpoints.createdAt))
      .limit(10);

    const totalGross = Number(payAggRow?.totalGrossPaise || 0) / 100;
    const totalFee = Number(payAggRow?.totalFeePaise || 0) / 100;
    const totalTax = Number(payAggRow?.totalTaxPaise || 0) / 100;
    const totalNet = Number(payAggRow?.totalNetPaise || 0) / 100;

    return reply.status(200).send({
      summary: {
        totalLeads: Number(leadsCountRow?.count || 0),
        totalCustomers: Number(custCountRow?.count || 0),
        totalOrders: Number(payAggRow?.count || 0),
        grossRevenue: totalGross,
        netRevenue: totalNet,
        gatewayFees: totalFee,
        gatewayTaxes: totalTax,
        currency: 'INR',
      },
      categoryStats,
      recentActivity,
    });
  });
}
