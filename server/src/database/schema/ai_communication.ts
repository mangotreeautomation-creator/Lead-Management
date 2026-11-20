import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { companies } from './organizations';
import { customers, leads } from './customers_leads';

// --- IN-HOUSE WHATSAPP AI PORTAL (ACTIVE INTEGRATION) ---
export const whatsappAiAccounts = pgTable('whatsapp_ai_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  phoneNumberId: varchar('phone_number_id', { length: 100 }).notNull().unique(),
  displayPhoneNumber: varchar('display_phone_number', { length: 50 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull().default('WHATSAPP_AI_PORTAL'), // IN_HOUSE_PORTAL
  webhookUrl: varchar('webhook_url', { length: 500 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const whatsappAiConversations = pgTable('whatsapp_ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').notNull().references(() => whatsappAiAccounts.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  externalConvoId: varchar('external_convo_id', { length: 150 }).notNull().unique(), // wa_conv_xxx
  contactPhone: varchar('contact_phone', { length: 50 }).notNull(),
  contactName: varchar('contact_name', { length: 150 }),
  stage: varchar('stage', { length: 50 }).default('GREETING'), // GREETING, DISCOVERY, PROPOSAL, CLOSED_WON, CLOSED_LOST
  intent: varchar('intent', { length: 100 }), // VASTUWHEEL_REPORT, WEBINAR_REGISTRATION, CONSULTANCY_BOOKING
  sentiment: varchar('sentiment', { length: 50 }).default('NEUTRAL'), // POSITIVE, NEUTRAL, NEGATIVE
  unreadCount: integer('unread_count').notNull().default(0),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    contactPhoneIdx: index('wa_conv_phone_idx').on(table.contactPhone),
    accountIdx: index('wa_conv_acc_idx').on(table.accountId),
    lastMsgIdx: index('wa_conv_last_msg_idx').on(table.lastMessageAt),
  };
});

export const whatsappAiMessages = pgTable('whatsapp_ai_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => whatsappAiConversations.id, { onDelete: 'cascade' }),
  senderType: varchar('sender_type', { length: 50 }).notNull(), // CUSTOMER, AI_AGENT, HUMAN_AGENT, SYSTEM
  messageType: varchar('message_type', { length: 50 }).notNull().default('text'), // text, image, document, button_reply, template
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  externalMsgId: varchar('external_msg_id', { length: 150 }).unique(),
  aiModel: varchar('ai_model', { length: 100 }), // gpt-4o, claude-3-5-sonnet, gemini-1.5-pro
  tokensUsed: integer('tokens_used').default(0),
  sentiment: varchar('sentiment', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('delivered'), // sent, delivered, read, failed
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    convoMsgIdx: index('wa_msg_convo_idx').on(table.conversationId),
    sentAtIdx: index('wa_msg_sent_at_idx').on(table.sentAt),
  };
});

// --- WATI INTEGRATION (FUTURE-READY / NOT CONNECTED) ---
export const watiAccounts = pgTable('wati_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('NOT_CONNECTED'), // NOT_CONNECTED, ACTIVE, INACTIVE
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const watiMessages = pgTable('wati_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  watiAccountId: uuid('wati_account_id').notNull().references(() => watiAccounts.id, { onDelete: 'cascade' }),
  recipientPhone: varchar('recipient_phone', { length: 50 }).notNull(),
  templateName: varchar('template_name', { length: 150 }),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- AI ELEMENT VOICE CALLS INTEGRATION (FUTURE-READY / NOT CONNECTED) ---
export const aiElementAgents = pgTable('ai_element_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  voiceId: varchar('voice_id', { length: 100 }),
  promptTemplate: text('prompt_template'),
  status: varchar('status', { length: 50 }).notNull().default('NOT_CONNECTED'), // NOT_CONNECTED, ACTIVE
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiElementCalls = pgTable('ai_element_calls', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: uuid('agent_id').notNull().references(() => aiElementAgents.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  durationSeconds: integer('duration_seconds').default(0),
  outcome: varchar('outcome', { length: 50 }), // INTERESTED, CALLBACK, NOT_INTERESTED, BUSY
  status: varchar('status', { length: 50 }).notNull().default('COMPLETED'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const callTranscripts = pgTable('call_transcripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  callId: uuid('call_id').notNull().references(() => aiElementCalls.id, { onDelete: 'cascade' }),
  speaker: varchar('speaker', { length: 50 }).notNull(), // AGENT, CUSTOMER
  text: text('text').notNull(),
  timestampMs: integer('timestamp_ms').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
