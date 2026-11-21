import { pgTable, uuid, varchar, text, timestamp, boolean, bigint, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  taxId: varchar('tax_id', { length: 50 }),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // ACTIVE, SUSPENDED
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const businessUnits = pgTable('business_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  basePricePaise: bigint('base_price_paise', { mode: 'number' }).notNull().default(0),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const landingPages = pgTable('landing_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  urlPath: varchar('url_path', { length: 500 }).notNull(),
  routeSlug: varchar('route_slug', { length: 100 }),
  fullUrl: varchar('full_url', { length: 500 }),
  title: varchar('title', { length: 250 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    routeSlugIdx: index('landing_pages_route_slug_idx').on(table.routeSlug),
    categoryIdx: index('landing_pages_category_idx').on(table.categoryId),
  };
});

export const sourceAccounts = pgTable('source_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // META_ADS, RAZORPAY, WHATSAPP, GOOGLE_ADS
  accountIdentifier: varchar('account_identifier', { length: 150 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
