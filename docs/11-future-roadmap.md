# 11. Future Implementation Roadmap & Phased Milestones

## 1. Multi-Phase Implementation Plan

```mermaid
gantt
    title Enterprise Lead Management Platform Phased Delivery
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation (Current)
    System Architecture & Docs       :done, p1_doc, 2026-10-28, 1d
    PostgreSQL Setup & Learning      :active, p1_pg, 2026-10-29, 2d
    Backend Scaffolding & Fastify    :p1_scaff, after p1_pg, 2d
    Meta Ads Schema & Drizzle Setup  :p1_db, after p1_scaff, 2d
    Meta Ingestion Adapter & Tests   :p1_meta, after p1_db, 3d
    section Phase 2: Lead Ingestion
    Landing Page Webhooks (WP/Custom):p2_lp, after p1_meta, 3d
    Lead Deduplication & Activity Log:p2_lead, after p2_lp, 2d
    section Phase 3: Payments
    Razorpay Order & Webhook Engine  :p3_rzp, after p2_lead, 4d
    Payment Retries & Reconciliation :p3_recon, after p3_rzp, 3d
    section Phase 4: Async Queue
    Redis & BullMQ Setup             :p4_queue, after p3_recon, 3d
    Scheduled Ingestion Workers      :p4_cron, after p4_queue, 2d
    section Phase 5: AI Outreach
    AI Element Telephony & WhatsApp  :p5_ai, after p4_cron, 4d
    Attribution & Conversion Analytics:p5_attr, after p5_ai, 3d
    section Phase 6: Channel Expansion
    Google Ads, Bulk WA & Email Sync :p6_expand, after p5_attr, 5d
    section Phase 7: CRM Frontend
    Next.js Admin CRM & Filters      :p7_crm, after p6_expand, 7d
```

---

## 2. Detailed Phase Specifications

### Phase 1: Backend Foundation & Meta Ads Ingestion (Current Scope)
- **Objective**: Establish the bedrock architecture, install and configure local PostgreSQL, set up Fastify + TypeScript + Drizzle ORM, implement the initial Meta Ads data ingestion model, and verify with synthetic tests.
- **Deliverables**:
  - Full architectural documentation.
  - Working local PostgreSQL instance (`lead_management_dev`).
  - Executable Fastify server with health checks, Pino logger, and Zod configuration.
  - Drizzle ORM schema for `business_units`, `meta_campaigns`, `meta_ads`, `meta_insights_daily`, and sync audit tables.
  - Fully tested Meta API adapter and repository upsert logic.

---

### Phase 2: Landing Page Lead Ingestion & Attribution
- **Objective**: Capture prospective customer form submissions from WordPress and Custom Landing Pages into a unified Canonical Lead registry.
- **Deliverables**:
  - `POST /api/v1/leads/capture` endpoint accepting form inputs + UTM attribution.
  - WordPress webhook receiver plugin / script.
  - Canonical lead deduplication algorithm (matching E.164 phone numbers and normalized emails).
  - `lead_activity_events` audit trail recording page visits, form submissions, and status transitions.

---

### Phase 3: Payment Lifecycle & Razorpay Processing
- **Objective**: Implement robust, verified financial order and payment workflows supporting Scenarios A (success), B (retry), and C (abandonment).
- **Deliverables**:
  - Razorpay order creation and checkout session orchestration.
  - Webhook listener with HMAC-SHA256 cryptographic verification.
  - Payment attempt state machine (`CREATED` $\to$ `FAILED` or `CAPTURED`).
  - Order status transitions and automated reconciliation cron for uncaptured checkouts.

---

### Phase 4: Asynchronous Processing & Background Queues
- **Objective**: Offload heavy API syncs, webhook retries, and scheduled jobs from the HTTP request thread.
- **Deliverables**:
  - Redis connection and BullMQ queue infrastructure.
  - Nightly scheduled Meta Ads insight synchronization worker.
  - Retry queues with exponential backoff for failed webhook deliveries.

---

### Phase 5: AI Element Platform & Conversion Attribution
- **Objective**: Integrate with outbound AI voice calling and conversational WhatsApp platform with attribution evidence preservation.
- **Deliverables**:
  - Dispatcher service evaluating outreach eligibility rules (consent, DND, contact hours, frequency limits).
  - Inbound webhook receivers for call transcripts, connection status, and WhatsApp message read receipts.
  - Conversion attribution engine distinguishing assisted interactions vs rule-based attribution vs causal lift.

---

### Phase 6: Marketing Channel Expansion
- **Objective**: Ingest data from Google Ads, Bulk WhatsApp broadcasts, and Bulk Email marketing systems into the standardized attribution warehouse.
- **Deliverables**:
  - Google Ads API reporting adapter.
  - WhatsApp broadcast delivery & response ingestion.
  - Bulk email open/click tracking ingestion.

---

### Phase 7: CRM Admin Dashboard & Advanced Querying
- **Objective**: Deliver a web interface for marketing leadership, sales reps, and customer support.
- **Deliverables**:
  - Next.js (App Router) + React + Tailwind CSS + shadcn/ui.
  - TanStack Table with server-side pagination, sorting, and multi-filter queries.
  - Unified lead detail page with chronological activity timeline and payment history.
  - Role-Based Access Control (Admin, Sales Rep, Marketing Analyst).
