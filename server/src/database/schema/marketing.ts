import { pgTable, uuid, varchar, text, timestamp, boolean, integer, bigint, numeric, jsonb, index } from 'drizzle-orm/pg-core';
import { companies } from './organizations';

export const metaBusinessAccounts = pgTable('meta_business_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  metaBmId: varchar('meta_bm_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Kolkata'),
  currency: varchar('currency', { length: 10 }).default('INR'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const metaAdAccounts = pgTable('meta_ad_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessAccountId: uuid('business_account_id').references(() => metaBusinessAccounts.id, { onDelete: 'set null' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  metaActId: varchar('meta_act_id', { length: 100 }).notNull().unique(), // e.g. act_845822215217013
  name: varchar('name', { length: 200 }).notNull(),
  accountStatus: integer('account_status').notNull().default(1), // 1 = ACTIVE
  currency: varchar('currency', { length: 10 }).default('INR'),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Kolkata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const metaCampaigns = pgTable('meta_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  adAccountId: uuid('ad_account_id').notNull().references(() => metaAdAccounts.id, { onDelete: 'cascade' }),
  metaCampaignId: varchar('meta_campaign_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  objective: varchar('objective', { length: 100 }).notNull(), // OUTCOME_LEADS, OUTCOME_SALES
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, PAUSED, ARCHIVED
  dailyBudgetPaise: bigint('daily_budget_paise', { mode: 'number' }),
  lifetimeBudgetPaise: bigint('lifetime_budget_paise', { mode: 'number' }),
  startTime: timestamp('start_time', { withTimezone: true }),
  stopTime: timestamp('stop_time', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    metaCampIdx: index('meta_campaigns_camp_id_idx').on(table.metaCampaignId),
    adAccIdx: index('meta_campaigns_ad_acc_idx').on(table.adAccountId),
  };
});

export const metaAdSets = pgTable('meta_ad_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => metaCampaigns.id, { onDelete: 'cascade' }),
  metaAdsetId: varchar('meta_adset_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  dailyBudgetPaise: bigint('daily_budget_paise', { mode: 'number' }),
  bidStrategy: varchar('bid_strategy', { length: 100 }),
  targeting: jsonb('targeting'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    metaAdsetIdx: index('meta_adsets_adset_id_idx').on(table.metaAdsetId),
    campIdx: index('meta_adsets_camp_idx').on(table.campaignId),
  };
});

export const videoCreatives = pgTable('video_creatives', {
  id: uuid('id').defaultRandom().primaryKey(),
  metaCreativeId: varchar('meta_creative_id', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }),
  thumbnailUrl: text('thumbnail_url'),
  videoUrl: text('video_url'),
  durationSeconds: integer('duration_seconds'),
  aspectRatio: varchar('aspect_ratio', { length: 20 }).default('9:16'),
  hookType: varchar('hook_type', { length: 100 }), // Problem-Agitate, Question, Testimonial
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const metaAds = pgTable('meta_ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  adsetId: uuid('adset_id').notNull().references(() => metaAdSets.id, { onDelete: 'cascade' }),
  creativeId: uuid('creative_id').references(() => videoCreatives.id, { onDelete: 'set null' }),
  metaAdId: varchar('meta_ad_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  previewUrl: text('preview_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    metaAdIdx: index('meta_ads_ad_id_idx').on(table.metaAdId),
    adsetIdx: index('meta_ads_adset_idx').on(table.adsetId),
  };
});

export const metaInsightsDaily = pgTable('meta_insights_daily', {
  id: uuid('id').defaultRandom().primaryKey(),
  adAccountId: uuid('ad_account_id').notNull().references(() => metaAdAccounts.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => metaCampaigns.id, { onDelete: 'cascade' }),
  adsetId: uuid('adset_id').references(() => metaAdSets.id, { onDelete: 'cascade' }),
  adId: uuid('ad_id').references(() => metaAds.id, { onDelete: 'cascade' }),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  spendPaise: bigint('spend_paise', { mode: 'number' }).notNull().default(0),
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  inlineLinkClicks: integer('inline_link_clicks').notNull().default(0),
  ctr: numeric('ctr', { precision: 8, scale: 4 }).default('0'),
  cpcPaise: integer('cpc_paise').default(0),
  cpmPaise: integer('cpm_paise').default(0),
  leadsCount: integer('leads_count').notNull().default(0),
  costPerLeadPaise: integer('cost_per_lead_paise').default(0),
  purchasesCount: integer('purchases_count').notNull().default(0),
  purchaseValuePaise: bigint('purchase_value_paise', { mode: 'number' }).default(0),
  roas: numeric('roas', { precision: 8, scale: 4 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    insightDateIdx: index('insights_date_idx').on(table.date),
    adAccountDateIdx: index('insights_ad_acc_date_idx').on(table.adAccountId, table.date),
    adDateIdx: index('insights_ad_date_idx').on(table.adId, table.date),
  };
});

export const metaSyncRuns = pgTable('meta_sync_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adAccountId: uuid('ad_account_id').notNull().references(() => metaAdAccounts.id, { onDelete: 'cascade' }),
  syncType: varchar('sync_type', { length: 50 }).notNull(), // CAMPAIGNS, INSIGHTS_DAILY, FULL
  status: varchar('status', { length: 50 }).notNull().default('RUNNING'), // RUNNING, SUCCESS, FAILED
  recordsFetched: integer('records_fetched').notNull().default(0),
  recordsUpdated: integer('records_updated').notNull().default(0),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorDetails: text('error_details'),
});

export const metaSyncErrors = pgTable('meta_sync_errors', {
  id: uuid('id').defaultRandom().primaryKey(),
  syncRunId: uuid('sync_run_id').notNull().references(() => metaSyncRuns.id, { onDelete: 'cascade' }),
  errorCode: varchar('error_code', { length: 100 }),
  errorSubcode: varchar('error_subcode', { length: 100 }),
  message: text('message').notNull(),
  context: jsonb('context'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
