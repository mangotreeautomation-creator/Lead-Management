import { FastifyInstance } from 'fastify';
import { sql, eq, and, desc } from 'drizzle-orm';
import { db } from '../../database/client';
import { landingPages, categories, companies } from '../../database/schema/organizations';
import { paymentOrders, capturedPayments, gatewayAccounts } from '../../database/schema/payments';
import { leads } from '../../database/schema/customers_leads';
import { trackingParameters } from '../../database/schema/customers_leads';
import { videoCreatives, metaCampaigns, metaAdSets } from '../../database/schema/marketing';
import { requireAuth } from '../../middleware/auth.middleware';

export async function attributionRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/attribution/landing-pages
   * List all registered landing pages with live performance metrics
   */
  app.get('/api/v1/attribution/landing-pages', { preHandler: [requireAuth] }, async (request, reply) => {
    const pages = await db
      .select({
        id: landingPages.id,
        routeSlug: landingPages.routeSlug,
        urlPath: landingPages.urlPath,
        fullUrl: landingPages.fullUrl,
        title: landingPages.title,
        status: landingPages.status,
        categoryId: landingPages.categoryId,
        categoryCode: categories.code,
        categoryName: categories.name,
        createdAt: landingPages.createdAt,
      })
      .from(landingPages)
      .leftJoin(categories, eq(landingPages.categoryId, categories.id))
      .orderBy(desc(landingPages.createdAt));

    // Aggregate metrics per landing page route from payment_orders notes
    const metricsRes = await db.execute(sql.raw(`
      SELECT 
        LOWER(COALESCE(notes->>'route', notes->>'campaign')) AS route,
        count(*) AS total_orders,
        count(*) FILTER (WHERE status = 'paid') AS paid_orders,
        count(*) FILTER (WHERE status != 'paid') AS failed_orders,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_paise ELSE 0 END), 0) / 100 AS captured_revenue
      FROM payment_orders
      WHERE notes IS NOT NULL
      GROUP BY LOWER(COALESCE(notes->>'route', notes->>'campaign'))
    `));

    const metricsMap = new Map<string, any>();
    for (const row of metricsRes.rows as any[]) {
      if (row.route) {
        metricsMap.set(row.route, row);
      }
    }

    const result = pages.map(p => {
      const slug = p.routeSlug?.toLowerCase() || '';
      const m = metricsMap.get(slug) || {
        total_orders: 0,
        paid_orders: 0,
        failed_orders: 0,
        captured_revenue: 0,
      };
      const total = Number(m.total_orders);
      const paid = Number(m.paid_orders);
      const conversionRate = total > 0 ? Number(((paid / total) * 100).toFixed(2)) : 0;

      return {
        ...p,
        totalOrders: total,
        paidOrders: paid,
        failedOrders: Number(m.failed_orders),
        capturedRevenue: Number(m.captured_revenue),
        conversionRatePct: conversionRate,
      };
    });

    return reply.status(200).send({ data: result });
  });

  /**
   * POST /api/v1/attribution/landing-pages
   * Register a new landing page dynamically
   */
  app.post('/api/v1/attribution/landing-pages', { preHandler: [requireAuth] }, async (request, reply) => {
    const body = request.body as {
      routeSlug: string;
      fullUrl?: string;
      title?: string;
      categoryCode?: string;
    };

    if (!body.routeSlug || body.routeSlug.trim().length === 0) {
      return reply.status(400).send({ error: 'routeSlug is required' });
    }

    const routeSlug = body.routeSlug.toLowerCase().trim();
    const urlPath = `/${routeSlug}`;
    const fullUrl = body.fullUrl || `https://report.globalinch.com/${routeSlug}`;
    const title = body.title || `VastuWheel Landing Page (${routeSlug.toUpperCase()})`;
    const targetCatCode = body.categoryCode || 'vastuwheel';

    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.code, targetCatCode))
      .limit(1);

    if (!cat) {
      return reply.status(404).send({ error: `Category ${targetCatCode} not found` });
    }

    const [existing] = await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.routeSlug, routeSlug))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(landingPages)
        .set({
          fullUrl,
          urlPath,
          title,
          updatedAt: new Date(),
        })
        .where(eq(landingPages.id, existing.id))
        .returning();
      return reply.status(200).send({ data: updated, message: 'Landing page updated' });
    }

    const [created] = await db
      .insert(landingPages)
      .values({
        categoryId: cat.id,
        routeSlug,
        urlPath,
        fullUrl,
        title,
        status: 'ACTIVE',
      })
      .returning();

    return reply.status(201).send({ data: created, message: 'Landing page registered' });
  });

  /**
   * GET /api/v1/attribution/report-languages
   * Returns dynamic breakdown of languages found in verified Notes
   */
  app.get('/api/v1/attribution/report-languages', { preHandler: [requireAuth] }, async (request, reply) => {
    const query = request.query as {
      landingPage?: string;
      startDate?: string;
      endDate?: string;
      companyCode?: string;
    };

    const conditions: string[] = ["notes->>'report_language' IS NOT NULL"];

    if (query.landingPage && query.landingPage !== 'ALL') {
      const slug = query.landingPage.toLowerCase().trim();
      conditions.push(`(LOWER(COALESCE(notes->>'route', notes->>'campaign')) = '${slug}')`);
    }

    if (query.startDate) {
      conditions.push(`created_at >= '${query.startDate}'`);
    }
    if (query.endDate) {
      const endStr = query.endDate.length === 10 ? `${query.endDate}T23:59:59.999Z` : query.endDate;
      conditions.push(`created_at <= '${endStr}'`);
    }

    const whereClause = conditions.join(' AND ');

    const res = await db.execute(sql.raw(`
      SELECT 
        notes->>'report_language' AS report_language,
        count(*) AS total_orders,
        count(*) FILTER (WHERE status = 'paid') AS paid_orders,
        count(*) FILTER (WHERE status != 'paid') AS failed_orders,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_paise ELSE 0 END), 0) / 100 AS captured_revenue,
        ROUND(COALESCE(COUNT(*) FILTER (WHERE status = 'paid')::numeric / NULLIF(COUNT(*), 0)::numeric * 100, 0), 2) AS conversion_rate_pct
      FROM payment_orders
      WHERE ${whereClause}
      GROUP BY notes->>'report_language'
      ORDER BY captured_revenue DESC
    `));

    return reply.status(200).send({ data: res.rows });
  });

  /**
   * GET /api/v1/attribution/fb4-summary
   * Provides deep breakdown specifically for FB4 landing page
   */
  app.get('/api/v1/attribution/fb4-summary', { preHandler: [requireAuth] }, async (request, reply) => {
    const res = await db.execute(sql.raw(`
      SELECT 
        notes->>'report_language' AS report_language,
        count(*) AS total_orders,
        count(*) FILTER (WHERE status = 'paid') AS paid_orders,
        count(*) FILTER (WHERE status != 'paid') AS failed_orders,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_paise ELSE 0 END), 0) / 100 AS captured_revenue,
        ROUND(COALESCE(COUNT(*) FILTER (WHERE status = 'paid')::numeric / NULLIF(COUNT(*), 0)::numeric * 100, 0), 2) AS conversion_rate_pct
      FROM payment_orders
      WHERE LOWER(COALESCE(notes->>'route', notes->>'campaign')) = 'fb4'
      GROUP BY notes->>'report_language'
      ORDER BY captured_revenue DESC
    `));

    const rows = res.rows as any[];
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalFailed = 0;
    let totalOrders = 0;

    let englishStats: any = null;
    let hindiStats: any = null;

    for (const r of rows) {
      const rev = Number(r.captured_revenue);
      const paid = Number(r.paid_orders);
      const failed = Number(r.failed_orders);
      const tot = Number(r.total_orders);

      totalRevenue += rev;
      totalPaid += paid;
      totalFailed += failed;
      totalOrders += tot;

      const lang = String(r.report_language || '').toLowerCase();
      if (lang.includes('english')) {
        englishStats = {
          label: r.report_language,
          totalReports: tot,
          paidCount: paid,
          failedCount: failed,
          capturedRevenue: rev,
          conversionRatePct: Number(r.conversion_rate_pct),
        };
      } else if (lang.includes('hindi')) {
        hindiStats = {
          label: r.report_language,
          totalReports: tot,
          paidCount: paid,
          failedCount: failed,
          capturedRevenue: rev,
          conversionRatePct: Number(r.conversion_rate_pct),
        };
      }
    }

    return reply.status(200).send({
      landingPage: {
        routeSlug: 'fb4',
        fullUrl: 'https://report.globalinch.com/fb4',
        title: 'VastuWheel Report FB4 Landing Page',
      },
      summary: {
        totalOrders,
        totalPaid,
        totalFailed,
        totalCapturedRevenue: totalRevenue,
        overallConversionRatePct: totalOrders > 0 ? Number(((totalPaid / totalOrders) * 100).toFixed(2)) : 0,
      },
      english: englishStats,
      hindi: hindiStats,
      allLanguages: rows,
    });
  });

  /**
   * GET /api/v1/attribution/filter-options
   * Cascading dynamic filter options
   */
  app.get('/api/v1/attribution/filter-options', { preHandler: [requireAuth] }, async (request, reply) => {
    const query = request.query as {
      companyCode?: string;
      categoryCode?: string;
      landingPage?: string;
    };

    // 1. Landing pages
    const lpRes = await db
      .select({
        routeSlug: landingPages.routeSlug,
        title: landingPages.title,
        fullUrl: landingPages.fullUrl,
      })
      .from(landingPages)
      .where(eq(landingPages.status, 'ACTIVE'));

    // 2. Report Languages (cascaded by landing page if selected)
    let langSql = `
      SELECT DISTINCT notes->>'report_language' AS language 
      FROM payment_orders 
      WHERE notes->>'report_language' IS NOT NULL
    `;
    if (query.landingPage && query.landingPage !== 'ALL') {
      const slug = query.landingPage.toLowerCase().trim();
      langSql += ` AND (LOWER(COALESCE(notes->>'route', notes->>'campaign')) = '${slug}')`;
    }
    langSql += ` ORDER BY language ASC`;
    const langRes = await db.execute(sql.raw(langSql));

    // 3. Meta Campaigns
    const campRes = await db.execute(sql.raw(`
      SELECT DISTINCT utm_campaign AS campaign 
      FROM tracking_parameters 
      WHERE utm_campaign IS NOT NULL AND utm_campaign != ''
      ORDER BY campaign ASC
      LIMIT 100
    `));

    // 4. Meta Ad Sets (from utm_term)
    const adsetRes = await db.execute(sql.raw(`
      SELECT DISTINCT utm_term AS adset 
      FROM tracking_parameters 
      WHERE utm_term IS NOT NULL AND utm_term != ''
      ORDER BY adset ASC
      LIMIT 100
    `));

    // 5. Meta Video Creatives (from utm_content and video_creatives)
    const creativeRes = await db.execute(sql.raw(`
      SELECT DISTINCT utm_content AS creative 
      FROM tracking_parameters 
      WHERE utm_content IS NOT NULL AND utm_content != ''
      ORDER BY creative ASC
      LIMIT 100
    `));

    // 6. UTM Sources & Mediums
    const srcRes = await db.execute(sql.raw(`
      SELECT DISTINCT utm_source AS source FROM tracking_parameters WHERE utm_source IS NOT NULL ORDER BY source
    `));
    const medRes = await db.execute(sql.raw(`
      SELECT DISTINCT utm_medium AS medium FROM tracking_parameters WHERE utm_medium IS NOT NULL ORDER BY medium
    `));

    return reply.status(200).send({
      landingPages: lpRes.map(l => ({ slug: l.routeSlug, title: l.title, fullUrl: l.fullUrl })),
      reportLanguages: (langRes.rows as any[]).map(r => r.language),
      metaCampaigns: (campRes.rows as any[]).map(r => r.campaign),
      metaAdSets: (adsetRes.rows as any[]).map(r => r.adset),
      metaCreatives: (creativeRes.rows as any[]).map(r => r.creative),
      utmSources: (srcRes.rows as any[]).map(r => r.source),
      utmMediums: (medRes.rows as any[]).map(r => r.medium),
    });
  });
}
