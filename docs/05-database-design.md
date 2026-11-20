# 05. Database Design: Phase 1 Meta Marketing Schema

## 1. Schema Philosophy & Invariants

1. **Exact Financial Precision**: Ad spend is never stored as `FLOAT` or `REAL`. Floating-point numbers introduce binary rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). We use PostgreSQL `NUMERIC(14, 4)` to support fractional currency values down to hundredths of a cent or paisa.
2. **Deterministic Upserts**: External platforms like Meta can send data multiple times. Every table has a natural or business unique constraint enabling idempotent `ON CONFLICT DO UPDATE` queries.
3. **Auditability**: Every table includes `created_at` and `updated_at` timestamps stored in UTC (`TIMESTAMPTZ`).
4. **Resilient Vendor Identifiers**: Meta IDs (e.g. `act_123456789`, `campaign_id: 1202058493029102`) can exceed 64-bit integers or include string prefixes. We store all raw vendor identifiers as `VARCHAR(64)`.

---

## 2. Table-by-Table Architectural Specification

### Table 1: `business_units`
- **What it stores**: The top-level commercial divisions of the business (e.g. "Vastu Reports & Consultations" and "Webinars & Workshops").
- **Why it is required**: Anchors attribution, financial reporting, and employee access permissions.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `code`: `VARCHAR(32)` | Unique | Internal code (e.g. `VASTU`, `WEBINAR`)
  - `name`: `VARCHAR(128)` | Not Null | Display name (e.g. "Vastu Consultations & Audits")
  - `description`: `TEXT` | Nullable | Strategic scope and notes
  - `status`: `VARCHAR(20)` | Not Null | `ACTIVE`, `INACTIVE` (Default: `ACTIVE`)
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `UNIQUE (code)`
- **Query Pattern**: Loaded once at startup or cached for dropdowns and attribution tagging.

---

### Table 2: `meta_business_accounts`
- **What it stores**: Meta Business Manager accounts (BMs) owned or managed by the business.
- **Why it is required**: Enterprise marketing setups frequently maintain multiple BMs for risk management, backup pixel storage, and partner agency sharing.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `business_unit_id`: `UUID` | Foreign Key $\to$ `business_units.id` (`ON DELETE SET NULL`) | Optional primary mapping
  - `meta_bm_id`: `VARCHAR(64)` | Unique, Not Null | The official Meta Business Manager ID
  - `name`: `VARCHAR(128)` | Not Null | Business Manager name in Meta
  - `verification_status`: `VARCHAR(32)` | Nullable | e.g. `VERIFIED`, `UNVERIFIED`
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `UNIQUE (meta_bm_id)`, `INDEX (business_unit_id)`

---

### Table 3: `meta_ad_accounts`
- **What it stores**: Individual Meta Ad Accounts (e.g., `act_1029384756`).
- **Why it is required**: Real-world ad spend, campaigns, and pixel configurations live inside Ad Accounts.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `meta_bm_id`: `UUID` | Foreign Key $\to$ `meta_business_accounts.id` (`ON DELETE SET NULL`)
  - `business_unit_id`: `UUID` | Foreign Key $\to$ `business_units.id` (`ON DELETE SET NULL`)
  - `meta_account_id`: `VARCHAR(64)` | Unique, Not Null | The official Meta ID (`act_XXXXXXXXX`)
  - `name`: `VARCHAR(128)` | Not Null | Account name
  - `currency`: `VARCHAR(3)` | Not Null | Account billing currency (e.g. `INR`, `USD`)
  - `timezone_name`: `VARCHAR(64)` | Not Null | e.g. `Asia/Kolkata`
  - `account_status`: `INTEGER` | Not Null | Meta status code (`1` = Active, `2` = Disabled, etc.)
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `UNIQUE (meta_account_id)`, `INDEX (business_unit_id)`

---

### Table 4: `meta_campaigns`
- **What it stores**: High-level marketing campaigns (e.g. "Vastu Residential Lead Gen - Oct 2026").
- **Why it is required**: Tracks top-level advertising objectives, budgets, and status.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `ad_account_id`: `UUID` | Foreign Key $\to$ `meta_ad_accounts.id` (`ON DELETE CASCADE`)
  - `meta_campaign_id`: `VARCHAR(64)` | Unique, Not Null | Official Meta Campaign ID
  - `name`: `VARCHAR(255)` | Not Null | Campaign Name
  - `objective`: `VARCHAR(64)` | Nullable | `OUTCOME_LEADS`, `OUTCOME_SALES`, `CONVERSIONS`
  - `status`: `VARCHAR(32)` | Not Null | `ACTIVE`, `PAUSED`, `ARCHIVED`, `DELETED`
  - `daily_budget`: `NUMERIC(14, 4)` | Nullable | Configured daily budget
  - `lifetime_budget`: `NUMERIC(14, 4)` | Nullable | Configured lifetime budget
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `UNIQUE (meta_campaign_id)`, `INDEX (ad_account_id)`, `INDEX (status)`

---

### Table 5: `meta_ad_sets`
- **What it stores**: Targeting, audience, and placement groupings within a campaign.
- **Why it is required**: Helps determine which specific audience segment (e.g. "Architects 30-50 Delhi") converted best.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `campaign_id`: `UUID` | Foreign Key $\to$ `meta_campaigns.id` (`ON DELETE CASCADE`)
  - `meta_ad_set_id`: `VARCHAR(64)` | Unique, Not Null | Official Meta Ad Set ID
  - `name`: `VARCHAR(255)` | Not Null | Ad Set name
  - `status`: `VARCHAR(32)` | Not Null | `ACTIVE`, `PAUSED`, `ARCHIVED`
  - `daily_budget`: `NUMERIC(14, 4)` | Nullable
  - `optimization_goal`: `VARCHAR(64)` | Nullable | e.g. `LEAD_GENERATION`, `OFFSITE_CONVERSIONS`
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `UNIQUE (meta_ad_set_id)`, `INDEX (campaign_id)`

---

### Table 6: `meta_ads`
- **What it stores**: The individual creative unit (copy, image, video, CTA, and target landing page URL).
- **Why it is required**: When a customer clicks an ad, their UTM parameters and Meta Click ID (`fbclid`) link directly to this specific ad.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `ad_set_id`: `UUID` | Foreign Key $\to$ `meta_ad_sets.id` (`ON DELETE CASCADE`)
  - `meta_ad_id`: `VARCHAR(64)` | Unique, Not Null | Official Meta Ad ID
  - `name`: `VARCHAR(255)` | Not Null | Creative name
  - `status`: `VARCHAR(32)` | Not Null | `ACTIVE`, `PAUSED`, `ARCHIVED`
  - `creative_id`: `VARCHAR(64)` | Nullable | Meta Creative Asset ID
  - `creative_url`: `TEXT` | Nullable | Target landing page destination URL
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `UNIQUE (meta_ad_id)`, `INDEX (ad_set_id)`

---

### Table 7: `meta_insights_daily`
- **What it stores**: The daily performance metrics for every single ad creative.
- **Reporting Grain**: **1 Row per `(ad_id, date)`**.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `ad_id`: `UUID` | Foreign Key $\to$ `meta_ads.id` (`ON DELETE CASCADE`)
  - `date`: `DATE` | Not Null | Metric date (YYYY-MM-DD in ad account timezone)
  - `spend`: `NUMERIC(14, 4)` | Not Null | Ad spend on this specific day
  - `currency`: `VARCHAR(3)` | Not Null | e.g. `INR`
  - `impressions`: `BIGINT` | Not Null | Number of views
  - `clicks`: `BIGINT` | Not Null | Number of link clicks
  - `inline_link_clicks`: `BIGINT` | Nullable | Direct destination link clicks
  - `leads_reported_by_meta`: `INTEGER` | Nullable | Meta pixel or instant-form reported leads
  - `conversions_reported_by_meta`: `INTEGER` | Nullable | Meta pixel reported purchase events
  - `cpc`: `NUMERIC(14, 4)` | Nullable | Cost per click
  - `cpm`: `NUMERIC(14, 4)` | Nullable | Cost per 1,000 impressions
  - `ctr`: `NUMERIC(8, 4)` | Nullable | Click-through rate (%)
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Unique Constraint**: `UNIQUE (ad_id, date)` (Guarantees zero duplicate daily records on re-sync).
- **Indexes**: `INDEX (date)`, `INDEX (ad_id, date)`

---

### Table 8: `meta_sync_runs`
- **What it stores**: An audit ledger of every synchronization execution (scheduled or manual).
- **Why it is required**: Full operational visibility into job durations, API rate limits encountered, records imported, and sync health.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `ad_account_id`: `UUID` | Foreign Key $\to$ `meta_ad_accounts.id` (`ON DELETE SET NULL`)
  - `sync_type`: `VARCHAR(32)` | Not Null | `CAMPAIGNS_ONLY`, `DAILY_INSIGHTS`, `FULL_ACCOUNT`
  - `date_range_start`: `DATE` | Nullable | Start date of insights fetched
  - `date_range_end`: `DATE` | Nullable | End date of insights fetched
  - `status`: `VARCHAR(32)` | Not Null | `STARTED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`
  - `records_processed`: `INTEGER` | Not Null | `DEFAULT 0`
  - `started_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
  - `completed_at`: `TIMESTAMPTZ` | Nullable
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `INDEX (ad_account_id, started_at)`

---

### Table 9: `meta_sync_errors`
- **What it stores**: Detailed failure records when an ingestion batch encounters invalid payloads or API errors.
- **Why it is required**: Debugging failed background jobs without losing error stack traces or raw payloads.
- **Columns**:
  - `id`: `UUID` | Primary Key | `DEFAULT gen_random_uuid()`
  - `sync_run_id`: `UUID` | Foreign Key $\to$ `meta_sync_runs.id` (`ON DELETE CASCADE`)
  - `error_code`: `VARCHAR(64)` | Nullable | e.g. `RATE_LIMIT_EXCEEDED`, `INVALID_OAUTH_TOKEN`
  - `error_message`: `TEXT` | Not Null | Human-readable error description
  - `error_stack`: `TEXT` | Nullable | Full Node.js stack trace
  - `raw_payload`: `JSONB` | Nullable | Raw JSON payload from Meta that triggered the error
  - `created_at`: `TIMESTAMPTZ` | Not Null | `DEFAULT NOW()`
- **Indexes**: `INDEX (sync_run_id)`

---

## 3. Migration Roadmap to Future Entities

The database is intentionally designed so Phase 2 and Phase 3 tables plug directly into this schema without needing to alter existing Phase 1 tables:

- **Phase 2 (Leads)**: Introduces `leads`, `landing_pages`, `lead_activity_events`, and `lead_attributions` (referencing `meta_ads.id` and `business_units.id`).
- **Phase 3 (Orders & Payments)**: Introduces `orders`, `payment_attempts`, and `gateway_webhook_events`.
- **Phase 5 (AI Outreach)**: Introduces `ai_outreach_dispatches`, `ai_call_logs`, `ai_whatsapp_logs`, and `conversion_attributions`.
