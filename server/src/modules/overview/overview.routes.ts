import { FastifyInstance } from 'fastify';
import { sql, desc, eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  leads,
  customers,
  capturedPayments,
  refunds,
  categories,
  companies,
  leadTouchpoints,
  gatewayAccounts,
} from '../../database/schema/index';
import { requireAuth } from '../../middleware/auth.middleware';

export async function overviewRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/overview/stats
   * Supports query parameters: companyCode, categoryCode, startDate, endDate
   */
  app.get('/api/v1/overview/stats', { preHandler: [requireAuth] }, async (request, reply) => {
    const query = request.query as {
      companyCode?: string;
      categoryCode?: string;
      startDate?: string;
      endDate?: string;
    };

    let categoryFilterId: string | null = null;
    let companyFilterId: string | null = null;

    let targetCatCode = query.categoryCode;
    if (targetCatCode && targetCatCode !== 'ALL') {
      if (targetCatCode.toUpperCase() === 'VASTU_REPORT') {
        targetCatCode = 'vastuwheel';
      }
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.code, targetCatCode))
        .limit(1);
      categoryFilterId = cat?.id || null;
    }

    if (query.companyCode && query.companyCode !== 'ALL') {
      const [comp] = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.code, query.companyCode))
        .limit(1);
      companyFilterId = comp?.id || null;
    }

    // Helper for date conditions
    const dateConditions = (column: any) => {
      const conds: any[] = [];
      if (query.startDate) {
        conds.push(gte(column, new Date(query.startDate)));
      }
      if (query.endDate) {
        const endStr = query.endDate.length === 10 ? `${query.endDate}T23:59:59.999Z` : query.endDate;
        conds.push(lte(column, new Date(endStr)));
      }
      return conds;
    };

    // 1. Leads Count
    const leadsConds: any[] = [...dateConditions(leads.createdAt)];
    if (categoryFilterId) leadsConds.push(eq(leads.categoryId, categoryFilterId));
    if (companyFilterId) leadsConds.push(eq(leads.companyId, companyFilterId));

    const [leadsCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(leadsConds.length > 0 ? and(...leadsConds) : undefined);

    // 2. Customers Count
    const custConds: any[] = [...dateConditions(customers.createdAt)];
    if (companyFilterId) custConds.push(eq(customers.companyId, companyFilterId));

    const [custCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(custConds.length > 0 ? and(...custConds) : undefined);

    // 3. Payments Aggregates
    const payConds: any[] = [...dateConditions(capturedPayments.capturedAt)];
    if (categoryFilterId) payConds.push(eq(gatewayAccounts.categoryId, categoryFilterId));
    if (companyFilterId) payConds.push(eq(gatewayAccounts.companyId, companyFilterId));

    const [payAggRow] = await db
      .select({
        count: sql<number>`count(*)`,
        totalGrossPaise: sql<number>`coalesce(sum(${capturedPayments.amountPaise}), 0)`,
        totalFeePaise: sql<number>`coalesce(sum(${capturedPayments.feePaise}), 0)`,
        totalTaxPaise: sql<number>`coalesce(sum(${capturedPayments.taxPaise}), 0)`,
        totalNetPaise: sql<number>`coalesce(sum(${capturedPayments.netPaise}), 0)`,
      })
      .from(capturedPayments)
      .innerJoin(gatewayAccounts, eq(capturedPayments.gatewayAccountId, gatewayAccounts.id))
      .where(payConds.length > 0 ? and(...payConds) : undefined);

    // 4. Refunds Aggregates
    const refConds: any[] = [...dateConditions(refunds.createdAt)];
    if (categoryFilterId) refConds.push(eq(gatewayAccounts.categoryId, categoryFilterId));
    if (companyFilterId) refConds.push(eq(gatewayAccounts.companyId, companyFilterId));

    const [refundAggRow] = await db
      .select({
        count: sql<number>`count(*)`,
        totalRefundPaise: sql<number>`coalesce(sum(${refunds.amountPaise}), 0)`,
      })
      .from(refunds)
      .innerJoin(capturedPayments, eq(refunds.capturedPaymentId, capturedPayments.id))
      .innerJoin(gatewayAccounts, eq(capturedPayments.gatewayAccountId, gatewayAccounts.id))
      .where(refConds.length > 0 ? and(...refConds) : undefined);

    // 5. Category breakdown of leads
    const categoryStats = await db
      .select({
        categoryCode: categories.code,
        categoryName: categories.name,
        leadCount: sql<number>`count(${leads.id})`,
      })
      .from(categories)
      .leftJoin(leads, eq(categories.id, leads.categoryId))
      .groupBy(categories.id, categories.code, categories.name);

    // 6. Recent 10 touchpoints / activities
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

    const gross = Number(payAggRow?.totalGrossPaise || 0) / 100;
    const fee = Number(payAggRow?.totalFeePaise || 0) / 100;
    const tax = Number(payAggRow?.totalTaxPaise || 0) / 100;
    const refAmt = Number(refundAggRow?.totalRefundPaise || 0) / 100;
    const net = gross - refAmt;

    return reply.status(200).send({
      summary: {
        totalLeads: Number(leadsCountRow?.count || 0),
        totalCustomers: Number(custCountRow?.count || 0),
        totalOrders: Number(payAggRow?.count || 0),
        grossRevenue: gross,
        refundsCount: Number(refundAggRow?.count || 0),
        refundsAmount: refAmt,
        netRevenue: net,
        gatewayFees: fee,
        gatewayTaxes: tax,
        currency: 'INR',
      },
      categoryStats,
      recentActivity,
    });
  });
}
