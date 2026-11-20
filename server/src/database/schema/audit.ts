import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { userAccounts } from './users_rbac';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => userAccounts.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(), // CREATE, UPDATE, DELETE, EXPORT, LOGIN, WEBHOOK_RECEIVED
  entityName: varchar('entity_name', { length: 100 }).notNull(), // leads, customers, payments, settings
  entityId: varchar('entity_id', { length: 100 }),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    actionEntityIdx: index('audit_logs_action_entity_idx').on(table.entityName, table.action),
    userAuditIdx: index('audit_logs_user_idx').on(table.userId),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  };
});

export const backgroundJobs = pgTable('background_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobType: varchar('job_type', { length: 100 }).notNull(), // META_SYNC, WEBHOOK_RETRY, REPORT_GENERATE, DATA_CLEANUP
  payload: jsonb('payload'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // PENDING, PROCESSING, COMPLETED, FAILED
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull().defaultNow(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => {
  return {
    statusRunIdx: index('bg_jobs_status_run_idx').on(table.status, table.nextRunAt),
  };
});
