import { pgTable, uuid, varchar, text, timestamp, numeric, index } from 'drizzle-orm/pg-core';
import { leads, leadTouchpoints } from './customers_leads';
import { capturedPayments } from './payments';

export const conversionAttributions = pgTable('conversion_attributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  capturedPaymentId: uuid('captured_payment_id').references(() => capturedPayments.id, { onDelete: 'cascade' }),
  attributionModel: varchar('attribution_model', { length: 50 }).notNull().default('LINEAR'), // FIRST_TOUCH, LAST_TOUCH, LINEAR, TIME_DECAY, POSITION_BASED
  firstTouchWeight: numeric('first_touch_weight', { precision: 5, scale: 4 }).default('0'),
  lastTouchWeight: numeric('last_touch_weight', { precision: 5, scale: 4 }).default('0'),
  linearWeight: numeric('linear_weight', { precision: 5, scale: 4 }).default('0'),
  timeDecayWeight: numeric('time_decay_weight', { precision: 5, scale: 4 }).default('0'),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    attrLeadIdx: index('conversion_attr_lead_idx').on(table.leadId),
    attrPaymentIdx: index('conversion_attr_payment_idx').on(table.capturedPaymentId),
  };
});

export const attributionTouchpoints = pgTable('attribution_touchpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  attributionId: uuid('attribution_id').notNull().references(() => conversionAttributions.id, { onDelete: 'cascade' }),
  touchpointId: uuid('touchpoint_id').references(() => leadTouchpoints.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 50 }).notNull(),
  source: varchar('source', { length: 100 }),
  campaignId: varchar('campaign_id', { length: 100 }),
  touchpointTime: timestamp('touchpoint_time', { withTimezone: true }).notNull(),
  weight: numeric('weight', { precision: 5, scale: 4 }).notNull(),
});
