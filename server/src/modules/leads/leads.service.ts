import { eq, desc, and, or, ilike, sql, gte, lte } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  leads,
  customers,
  categories,
  companies,
  leadStatusHistory,
  leadTouchpoints,
  trackingParameters,
  paymentOrders,
  capturedPayments,
  auditLogs,
} from '../../database/schema/index';
import { NotFoundError } from '../../utils/errors';

export interface LeadFilterOptions {
  page?: number;
  limit?: number;
  status?: string;
  categoryCode?: string;
  companyCode?: string;
  search?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
  creative?: string;
}

export class LeadsService {
  /**
   * List paginated leads with relations, tracking and date filtering
   */
  async listLeads(options: LeadFilterOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(1000, options.limit || 25);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (options.status && options.status !== 'ALL') {
      conditions.push(eq(leads.status, options.status));
    }

    let targetCatCode = options.categoryCode;
    if (targetCatCode && targetCatCode !== 'ALL') {
      if (targetCatCode.toUpperCase() === 'VASTU_REPORT') {
        targetCatCode = 'vastuwheel';
      }
      conditions.push(eq(categories.code, targetCatCode));
    }

    if (options.companyCode && options.companyCode !== 'ALL') {
      conditions.push(eq(companies.code, options.companyCode));
    }

    if (options.companyId) {
      conditions.push(eq(leads.companyId, options.companyId));
    }

    if (options.startDate) {
      conditions.push(gte(leads.createdAt, new Date(options.startDate)));
    }

    if (options.endDate) {
      const endStr = options.endDate.length === 10 ? `${options.endDate}T23:59:59.999Z` : options.endDate;
      conditions.push(lte(leads.createdAt, new Date(endStr)));
    }

    if (options.creative && options.creative !== 'ALL') {
      conditions.push(eq(trackingParameters.utmContent, options.creative));
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
        tracking: {
          utmSource: trackingParameters.utmSource,
          utmMedium: trackingParameters.utmMedium,
          utmCampaign: trackingParameters.utmCampaign,
          utmContent: trackingParameters.utmContent,
          utmTerm: trackingParameters.utmTerm,
        },
      })
      .from(leads)
      .innerJoin(customers, eq(leads.customerId, customers.id))
      .innerJoin(categories, eq(leads.categoryId, categories.id))
      .innerJoin(companies, eq(leads.companyId, companies.id))
      .leftJoin(trackingParameters, eq(leads.id, trackingParameters.leadId))
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
      .leftJoin(trackingParameters, eq(leads.id, trackingParameters.leadId))
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
   * Get single lead by ID with complete activity, payments and touchpoint timeline
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

    // Fetch payments associated with this lead or customer
    const payments = await db
      .select({
        id: capturedPayments.id,
        paymentId: capturedPayments.razorpayPaymentId,
        amountPaise: capturedPayments.amountPaise,
        amount: sql<number>`${capturedPayments.amountPaise} / 100`,
        status: capturedPayments.status,
        method: capturedPayments.method,
        capturedAt: capturedPayments.capturedAt,
        orderId: paymentOrders.razorpayOrderId,
      })
      .from(capturedPayments)
      .innerJoin(paymentOrders, eq(capturedPayments.paymentOrderId, paymentOrders.id))
      .where(or(eq(paymentOrders.leadId, id), eq(paymentOrders.customerId, lead.customer.id)))
      .orderBy(desc(capturedPayments.capturedAt));

    return {
      ...lead,
      touchpoints,
      statusHistory,
      tracking: tracking || null,
      payments,
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

    const [updated] = await db
      .update(leads)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    await db.insert(leadStatusHistory).values({
      leadId: id,
      oldStatus,
      newStatus,
      changedByUserId: userId || null,
      reason: reason || 'Manual status transition via CRM',
    });

    if (userId) {
      await db.insert(auditLogs).values({
        userId,
        entityName: 'leads',
        entityId: id,
        action: 'UPDATE_STATUS',
        oldValues: { oldStatus },
        newValues: { newStatus, reason },
      });
    }

    return updated;
  }
}

export const leadsService = new LeadsService();
