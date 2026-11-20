import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  leads,
  customers,
  categories,
  companies,
  leadStatusHistory,
  leadTouchpoints,
  trackingParameters,
  auditLogs,
} from '../../database/schema/index';
import { NotFoundError } from '../../utils/errors';

export interface LeadFilterOptions {
  page?: number;
  limit?: number;
  status?: string;
  categoryCode?: string;
  search?: string;
  companyId?: string;
}

export class LeadsService {
  /**
   * List paginated leads with relations
   */
  async listLeads(options: LeadFilterOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 25);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (options.status && options.status !== 'ALL') {
      conditions.push(eq(leads.status, options.status));
    }

    if (options.categoryCode && options.categoryCode !== 'ALL') {
      conditions.push(eq(categories.code, options.categoryCode));
    }

    if (options.companyId) {
      conditions.push(eq(leads.companyId, options.companyId));
    }

    if (options.search && options.search.trim().length > 0) {
      const s = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(leads.leadCode, s),
          ilike(customers.fullName, s),
          ilike(customers.phone, s),
          ilike(customers.email, s)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select({
        id: leads.id,
        leadCode: leads.leadCode,
        status: leads.status,
        score: leads.score,
        stage: leads.stage,
        source: leads.source,
        channel: leads.channel,
        notes: leads.notes,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        customer: {
          id: customers.id,
          fullName: customers.fullName,
          phone: customers.phone,
          email: customers.email,
          city: customers.city,
          state: customers.state,
        },
        category: {
          id: categories.id,
          code: categories.code,
          name: categories.name,
        },
        company: {
          id: companies.id,
          code: companies.code,
          name: companies.name,
        },
      })
      .from(leads)
      .innerJoin(customers, eq(leads.customerId, customers.id))
      .innerJoin(categories, eq(leads.categoryId, categories.id))
      .innerJoin(companies, eq(leads.companyId, companies.id))
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .innerJoin(customers, eq(leads.customerId, customers.id))
      .innerJoin(categories, eq(leads.categoryId, categories.id))
      .innerJoin(companies, eq(leads.companyId, companies.id))
      .where(whereClause);

    const total = Number(totalRow?.count || 0);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single lead by ID with complete activity and touchpoint timeline
   */
  async getLeadById(id: string) {
    const [lead] = await db
      .select({
        id: leads.id,
        leadCode: leads.leadCode,
        status: leads.status,
        score: leads.score,
        stage: leads.stage,
        source: leads.source,
        channel: leads.channel,
        notes: leads.notes,
        metadata: leads.metadata,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        customer: {
          id: customers.id,
          fullName: customers.fullName,
          phone: customers.phone,
          email: customers.email,
          city: customers.city,
          state: customers.state,
          totalSpentPaise: customers.totalSpentPaise,
        },
        category: {
          id: categories.id,
          code: categories.code,
          name: categories.name,
        },
        company: {
          id: companies.id,
          code: companies.code,
          name: companies.name,
        },
      })
      .from(leads)
      .innerJoin(customers, eq(leads.customerId, customers.id))
      .innerJoin(categories, eq(leads.categoryId, categories.id))
      .innerJoin(companies, eq(leads.companyId, companies.id))
      .where(eq(leads.id, id))
      .limit(1);

    if (!lead) {
      throw new NotFoundError(`Lead with ID ${id} not found`);
    }

    const touchpoints = await db
      .select()
      .from(leadTouchpoints)
      .where(eq(leadTouchpoints.leadId, id))
      .orderBy(desc(leadTouchpoints.createdAt));

    const statusHistory = await db
      .select()
      .from(leadStatusHistory)
      .where(eq(leadStatusHistory.leadId, id))
      .orderBy(desc(leadStatusHistory.createdAt));

    const [tracking] = await db
      .select()
      .from(trackingParameters)
      .where(eq(trackingParameters.leadId, id))
      .limit(1);

    return {
      ...lead,
      touchpoints,
      statusHistory,
      tracking: tracking || null,
    };
  }

  /**
   * Update lead status and record in history and audit log
   */
  async updateLeadStatus(id: string, newStatus: string, userId?: string, reason?: string) {
    const [existing] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    if (!existing) {
      throw new NotFoundError(`Lead with ID ${id} not found`);
    }

    const oldStatus = existing.status;

    await db
      .update(leads)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id));

    // Record in status history
    await db.insert(leadStatusHistory).values({
      leadId: id,
      oldStatus,
      newStatus,
      changedByUserId: userId || null,
      reason: reason || 'Updated via LeadPulse Platform',
    });

    // Record in audit log
    await db.insert(auditLogs).values({
      userId: userId || null,
      action: 'UPDATE_STATUS',
      entityName: 'leads',
      entityId: id,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus, reason },
    });

    return this.getLeadById(id);
  }
}

export const leadsService = new LeadsService();
