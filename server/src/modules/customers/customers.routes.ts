import { FastifyInstance } from 'fastify';
import { eq, desc, ilike, or, sql } from 'drizzle-orm';
import { db } from '../../database/client';
import { customers, companies, customerIdentifiers } from '../../database/schema/index';
import { requireAuth, requirePermission } from '../../middleware/auth.middleware';
import { NotFoundError } from '../../utils/errors';

export async function customersRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/customers
   */
  app.get('/api/v1/customers', { preHandler: [requireAuth, requirePermission('customers:view')] }, async (request, reply) => {
    const query = request.query as any;
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, parseInt(query.limit || '25', 10));
    const offset = (page - 1) * limit;

    let whereClause: any = undefined;
    if (query.search && query.search.trim().length > 0) {
      const s = `%${query.search.trim()}%`;
      whereClause = or(
        ilike(customers.fullName, s),
        ilike(customers.phone, s),
        ilike(customers.email, s),
        ilike(customers.city, s)
      );
    }

    const items = await db
      .select({
        id: customers.id,
        fullName: customers.fullName,
        email: customers.email,
        phone: customers.phone,
        city: customers.city,
        state: customers.state,
        totalOrders: customers.totalOrders,
        totalSpentPaise: customers.totalSpentPaise,
        firstSeenAt: customers.firstSeenAt,
        lastActiveAt: customers.lastActiveAt,
        companyName: companies.name,
      })
      .from(customers)
      .innerJoin(companies, eq(customers.companyId, companies.id))
      .where(whereClause)
      .orderBy(desc(customers.lastActiveAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(whereClause);

    const total = Number(totalRow?.count || 0);

    return reply.status(200).send({
      data: items.map((c) => ({
        ...c,
        totalSpent: c.totalSpentPaise / 100,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * GET /api/v1/customers/:id
   */
  app.get('/api/v1/customers/:id', { preHandler: [requireAuth, requirePermission('customers:view')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [cust] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!cust) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    const identifiers = await db
      .select()
      .from(customerIdentifiers)
      .where(eq(customerIdentifiers.customerId, id));

    return reply.status(200).send({
      data: {
        ...cust,
        totalSpent: cust.totalSpentPaise / 100,
        identifiers,
      },
    });
  });
}
