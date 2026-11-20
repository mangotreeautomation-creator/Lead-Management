import { pgTable, uuid, varchar, text, timestamp, boolean, integer, bigint, jsonb, index } from 'drizzle-orm/pg-core';
import { companies, categories } from './organizations';
import { customers, leads } from './customers_leads';

export const gatewayAccounts = pgTable('gateway_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  provider: varchar('provider', { length: 50 }).notNull().default('RAZORPAY'), // RAZORPAY, STRIPE, CASHFREE
  merchantId: varchar('merchant_id', { length: 100 }), // Razorpay Account ID (e.g. acc_xxx)
  keyId: varchar('key_id', { length: 100 }), // rzp_live_xxx or rzp_test_xxx
  webhookEndpointPath: varchar('webhook_endpoint_path', { length: 255 }).notNull(), // e.g. /api/v1/webhooks/razorpay/vastuwheel-report
  name: varchar('name', { length: 150 }).notNull(), // e.g. GlobalInch Razorpay
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const paymentOrders = pgTable('payment_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  gatewayAccountId: uuid('gateway_account_id').notNull().references(() => gatewayAccounts.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  razorpayOrderId: varchar('razorpay_order_id', { length: 100 }).notNull().unique(), // order_xxx
  receipt: varchar('receipt', { length: 100 }),
  amountPaise: bigint('amount_paise', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  status: varchar('status', { length: 50 }).notNull().default('created'), // created, attempted, paid
  notes: jsonb('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    rzpOrderIdx: index('payment_orders_rzp_order_idx').on(table.razorpayOrderId),
    custOrderIdx: index('payment_orders_cust_idx').on(table.customerId),
    leadOrderIdx: index('payment_orders_lead_idx').on(table.leadId),
  };
});

export const paymentAttempts = pgTable('payment_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentOrderId: uuid('payment_order_id').notNull().references(() => paymentOrders.id, { onDelete: 'cascade' }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }).notNull().unique(), // pay_xxx
  status: varchar('status', { length: 50 }).notNull(), // failed, captured, authorized
  errorCode: varchar('error_code', { length: 100 }),
  errorDescription: text('error_description'),
  method: varchar('method', { length: 50 }), // card, upi, netbanking, wallet
  cardId: varchar('card_id', { length: 100 }),
  bank: varchar('bank', { length: 100 }),
  wallet: varchar('wallet', { length: 100 }),
  vpa: varchar('vpa', { length: 150 }),
  email: varchar('email', { length: 255 }),
  contact: varchar('contact', { length: 50 }),
  feePaise: bigint('fee_paise', { mode: 'number' }).default(0),
  taxPaise: bigint('tax_paise', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    rzpPayIdx: index('payment_attempts_rzp_pay_idx').on(table.razorpayPaymentId),
    orderPayIdx: index('payment_attempts_order_idx').on(table.paymentOrderId),
  };
});

export const capturedPayments = pgTable('captured_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentOrderId: uuid('payment_order_id').notNull().references(() => paymentOrders.id, { onDelete: 'cascade' }),
  gatewayAccountId: uuid('gateway_account_id').notNull().references(() => gatewayAccounts.id, { onDelete: 'cascade' }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }).notNull().unique(), // pay_xxx
  amountPaise: bigint('amount_paise', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  status: varchar('status', { length: 50 }).notNull().default('captured'),
  method: varchar('method', { length: 50 }),
  feePaise: bigint('fee_paise', { mode: 'number' }).notNull().default(0),
  taxPaise: bigint('tax_paise', { mode: 'number' }).notNull().default(0),
  netPaise: bigint('net_paise', { mode: 'number' }).notNull().default(0),
  capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  rzpCreatedAt: timestamp('rzp_created_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    rzpCapturedPayIdx: index('captured_payments_rzp_pay_idx').on(table.razorpayPaymentId),
    capturedAtIdx: index('captured_payments_captured_at_idx').on(table.capturedAt),
    gatewayIdx: index('captured_payments_gateway_idx').on(table.gatewayAccountId),
  };
});

export const refunds = pgTable('refunds', {
  id: uuid('id').defaultRandom().primaryKey(),
  capturedPaymentId: uuid('captured_payment_id').notNull().references(() => capturedPayments.id, { onDelete: 'cascade' }),
  razorpayRefundId: varchar('razorpay_refund_id', { length: 100 }).notNull().unique(), // rfnd_xxx
  amountPaise: bigint('amount_paise', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('processed'),
  reason: text('reason'),
  speed: varchar('speed', { length: 50 }).default('normal'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const rawWebhookEvents = pgTable('raw_webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  gatewayAccountId: uuid('gateway_account_id').references(() => gatewayAccounts.id, { onDelete: 'set null' }),
  provider: varchar('provider', { length: 50 }).notNull().default('RAZORPAY'),
  eventId: varchar('event_id', { length: 150 }), // x-razorpay-event-id or payload id
  eventType: varchar('event_type', { length: 100 }).notNull(), // payment.captured, order.paid, payment.failed
  headers: jsonb('headers'),
  rawPayload: text('raw_payload').notNull(),
  signature: varchar('signature', { length: 255 }),
  signatureValid: boolean('signature_valid').notNull().default(false),
  status: varchar('status', { length: 50 }).notNull().default('RECEIVED'), // RECEIVED, PROCESSED, FAILED, IGNORED_DUPLICATE
  processingError: text('processing_error'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, (table) => {
  return {
    eventIdIdx: index('raw_webhook_events_id_idx').on(table.eventId),
    typeStatusIdx: index('raw_webhook_events_type_status_idx').on(table.eventType, table.status),
  };
});

export const paymentReconciliation = pgTable('payment_reconciliation', {
  id: uuid('id').defaultRandom().primaryKey(),
  gatewayAccountId: uuid('gateway_account_id').notNull().references(() => gatewayAccounts.id, { onDelete: 'cascade' }),
  reconciliationDate: varchar('reconciliation_date', { length: 10 }).notNull(), // YYYY-MM-DD
  totalCapturedPaise: bigint('total_captured_paise', { mode: 'number' }).notNull().default(0),
  totalRefundedPaise: bigint('total_refunded_paise', { mode: 'number' }).notNull().default(0),
  totalFeePaise: bigint('total_fee_paise', { mode: 'number' }).notNull().default(0),
  totalTaxPaise: bigint('total_tax_paise', { mode: 'number' }).notNull().default(0),
  netSettledPaise: bigint('net_settled_paise', { mode: 'number' }).notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('MATCHED'), // MATCHED, DISCREPANCY, PENDING
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
