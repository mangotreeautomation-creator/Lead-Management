import { pgTable, uuid, varchar, text, timestamp, boolean, integer, bigint, jsonb, index } from 'drizzle-orm/pg-core';
import { companies, categories } from './organizations';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }).notNull(),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('India'),
  pincode: varchar('pincode', { length: 20 }),
  totalOrders: integer('total_orders').notNull().default(0),
  totalSpentPaise: bigint('total_spent_paise', { mode: 'number' }).notNull().default(0),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    phoneIdx: index('customers_phone_idx').on(table.phone),
    emailIdx: index('customers_email_idx').on(table.email),
    companyIdx: index('customers_company_idx').on(table.companyId),
  };
});

export const customerIdentifiers = pgTable('customer_identifiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  identifierType: varchar('identifier_type', { length: 50 }).notNull(), // PHONE, EMAIL, WHATSAPP, RAZORPAY_CUST_ID, FB_PSID
  identifierValue: varchar('identifier_value', { length: 255 }).notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    lookupIdx: index('cust_ident_type_val_idx').on(table.identifierType, table.identifierValue),
  };
});

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  leadCode: varchar('lead_code', { length: 50 }).notNull().unique(), // e.g. LD-1001
  status: varchar('status', { length: 50 }).notNull().default('NEW'), // NEW, CONTACTED, QUALIFIED, CONVERTED, LOST, WON
  score: integer('score').notNull().default(0),
  stage: varchar('stage', { length: 50 }).notNull().default('TOP_OF_FUNNEL'),
  source: varchar('source', { length: 100 }).notNull().default('META_ADS'), // META_ADS, WHATSAPP, DIRECT, ORGANIC, REFERRAL
  subSource: varchar('sub_source', { length: 100 }), // Form, Click-to-WhatsApp, LandingPage
  channel: varchar('channel', { length: 50 }).notNull().default('PAID_SOCIAL'),
  assignedToUserId: uuid('assigned_to_user_id'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    statusIdx: index('leads_status_idx').on(table.status),
    categoryIdx: index('leads_category_idx').on(table.categoryId),
    companyIdx: index('leads_company_idx').on(table.companyId),
    customerIdx: index('leads_customer_idx').on(table.customerId),
    createdAtIdx: index('leads_created_at_idx').on(table.createdAt),
  };
});

export const leadStatusHistory = pgTable('lead_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  oldStatus: varchar('old_status', { length: 50 }),
  newStatus: varchar('new_status', { length: 50 }).notNull(),
  changedByUserId: uuid('changed_by_user_id'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    leadIdx: index('lead_status_hist_lead_idx').on(table.leadId),
  };
});

export const leadTouchpoints = pgTable('lead_touchpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 50 }).notNull(), // META_AD, WHATSAPP_INBOUND, WHATSAPP_OUTBOUND, CALL, PAYMENT_LINK, EMAIL
  touchpointType: varchar('touchpoint_type', { length: 50 }).notNull(), // IMPRESSION, CLICK, FORM_SUBMIT, MESSAGE_RECEIVED, MESSAGE_SENT, PAYMENT_ATTEMPT
  direction: varchar('direction', { length: 20 }).default('INBOUND'), // INBOUND, OUTBOUND
  summary: text('summary'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    leadTouchIdx: index('lead_touchpoints_lead_idx').on(table.leadId),
    typeIdx: index('lead_touchpoints_type_idx').on(table.touchpointType),
  };
});

export const trackingParameters = pgTable('tracking_parameters', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  utmSource: varchar('utm_source', { length: 150 }),
  utmMedium: varchar('utm_medium', { length: 150 }),
  utmCampaign: varchar('utm_campaign', { length: 250 }),
  utmContent: varchar('utm_content', { length: 250 }),
  utmTerm: varchar('utm_term', { length: 250 }),
  fbclid: varchar('fbclid', { length: 255 }),
  gclid: varchar('gclid', { length: 255 }),
  metaAdId: varchar('meta_ad_id', { length: 100 }),
  metaAdsetId: varchar('meta_adset_id', { length: 100 }),
  metaCampaignId: varchar('meta_campaign_id', { length: 100 }),
  landingPageUrl: varchar('landing_page_url', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    leadTrackingIdx: index('tracking_params_lead_idx').on(table.leadId),
    metaAdIdx: index('tracking_params_meta_ad_idx').on(table.metaAdId),
  };
});

export const activityEvents = pgTable('activity_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(), // PAGE_VIEW, CHAT_OPENED, REPORT_REQUESTED, CHECKOUT_INITIATED, PAYMENT_SUCCESS
  eventName: varchar('event_name', { length: 200 }).notNull(),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    leadActivityIdx: index('activity_events_lead_idx').on(table.leadId),
    customerActivityIdx: index('activity_events_customer_idx').on(table.customerId),
  };
});
