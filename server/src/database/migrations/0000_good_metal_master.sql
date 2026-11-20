CREATE TABLE IF NOT EXISTS "business_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_units_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"icon" varchar(50),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"tax_id" varchar(50),
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "landing_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"url_path" varchar(500) NOT NULL,
	"title" varchar(250) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"base_price_paise" bigint DEFAULT 0 NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "source_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"category_id" uuid,
	"source_type" varchar(50) NOT NULL,
	"account_identifier" varchar(150) NOT NULL,
	"name" varchar(150) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"customer_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"event_name" varchar(200) NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_identifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"identifier_type" varchar(50) NOT NULL,
	"identifier_value" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50) NOT NULL,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'India',
	"pincode" varchar(20),
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent_paise" bigint DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lead_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"old_status" varchar(50),
	"new_status" varchar(50) NOT NULL,
	"changed_by_user_id" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lead_touchpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"channel" varchar(50) NOT NULL,
	"touchpoint_type" varchar(50) NOT NULL,
	"direction" varchar(20) DEFAULT 'INBOUND',
	"summary" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"lead_code" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'NEW' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"stage" varchar(50) DEFAULT 'TOP_OF_FUNNEL' NOT NULL,
	"source" varchar(100) DEFAULT 'META_ADS' NOT NULL,
	"sub_source" varchar(100),
	"channel" varchar(50) DEFAULT 'PAID_SOCIAL' NOT NULL,
	"assigned_to_user_id" uuid,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_lead_code_unique" UNIQUE("lead_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracking_parameters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"utm_source" varchar(150),
	"utm_medium" varchar(150),
	"utm_campaign" varchar(250),
	"utm_content" varchar(250),
	"utm_term" varchar(250),
	"fbclid" varchar(255),
	"gclid" varchar(255),
	"meta_ad_id" varchar(100),
	"meta_adset_id" varchar(100),
	"meta_campaign_id" varchar(100),
	"landing_page_url" varchar(500),
	"ip_address" varchar(100),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_ad_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_account_id" uuid,
	"company_id" uuid NOT NULL,
	"meta_act_id" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"account_status" integer DEFAULT 1 NOT NULL,
	"currency" varchar(10) DEFAULT 'INR',
	"timezone" varchar(100) DEFAULT 'Asia/Kolkata',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_ad_accounts_meta_act_id_unique" UNIQUE("meta_act_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_ad_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"meta_adset_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"daily_budget_paise" bigint,
	"bid_strategy" varchar(100),
	"targeting" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_ad_sets_meta_adset_id_unique" UNIQUE("meta_adset_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adset_id" uuid NOT NULL,
	"creative_id" uuid,
	"meta_ad_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"preview_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_ads_meta_ad_id_unique" UNIQUE("meta_ad_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_business_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"meta_bm_id" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"timezone" varchar(100) DEFAULT 'Asia/Kolkata',
	"currency" varchar(10) DEFAULT 'INR',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_business_accounts_meta_bm_id_unique" UNIQUE("meta_bm_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"meta_campaign_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"objective" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"daily_budget_paise" bigint,
	"lifetime_budget_paise" bigint,
	"start_time" timestamp with time zone,
	"stop_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_campaigns_meta_campaign_id_unique" UNIQUE("meta_campaign_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_insights_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"campaign_id" uuid,
	"adset_id" uuid,
	"ad_id" uuid,
	"date" varchar(10) NOT NULL,
	"spend_paise" bigint DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"inline_link_clicks" integer DEFAULT 0 NOT NULL,
	"ctr" numeric(8, 4) DEFAULT '0',
	"cpc_paise" integer DEFAULT 0,
	"cpm_paise" integer DEFAULT 0,
	"leads_count" integer DEFAULT 0 NOT NULL,
	"cost_per_lead_paise" integer DEFAULT 0,
	"purchases_count" integer DEFAULT 0 NOT NULL,
	"purchase_value_paise" bigint DEFAULT 0,
	"roas" numeric(8, 4) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_sync_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"error_code" varchar(100),
	"error_subcode" varchar(100),
	"message" text NOT NULL,
	"context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'RUNNING' NOT NULL,
	"records_fetched" integer DEFAULT 0 NOT NULL,
	"records_updated" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"error_details" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_creatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_creative_id" varchar(100) NOT NULL,
	"title" varchar(255),
	"thumbnail_url" text,
	"video_url" text,
	"duration_seconds" integer,
	"aspect_ratio" varchar(20) DEFAULT '9:16',
	"hook_type" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_creatives_meta_creative_id_unique" UNIQUE("meta_creative_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "captured_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_order_id" uuid NOT NULL,
	"gateway_account_id" uuid NOT NULL,
	"razorpay_payment_id" varchar(100) NOT NULL,
	"amount_paise" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" varchar(50) DEFAULT 'captured' NOT NULL,
	"method" varchar(50),
	"fee_paise" bigint DEFAULT 0 NOT NULL,
	"tax_paise" bigint DEFAULT 0 NOT NULL,
	"net_paise" bigint DEFAULT 0 NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rzp_created_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "captured_payments_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gateway_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"category_id" uuid,
	"provider" varchar(50) DEFAULT 'RAZORPAY' NOT NULL,
	"merchant_id" varchar(100),
	"key_id" varchar(100),
	"webhook_endpoint_path" varchar(255) NOT NULL,
	"name" varchar(150) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_order_id" uuid NOT NULL,
	"razorpay_payment_id" varchar(100) NOT NULL,
	"status" varchar(50) NOT NULL,
	"error_code" varchar(100),
	"error_description" text,
	"method" varchar(50),
	"card_id" varchar(100),
	"bank" varchar(100),
	"wallet" varchar(100),
	"vpa" varchar(150),
	"email" varchar(255),
	"contact" varchar(50),
	"fee_paise" bigint DEFAULT 0,
	"tax_paise" bigint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_attempts_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway_account_id" uuid NOT NULL,
	"customer_id" uuid,
	"lead_id" uuid,
	"razorpay_order_id" varchar(100) NOT NULL,
	"receipt" varchar(100),
	"amount_paise" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" varchar(50) DEFAULT 'created' NOT NULL,
	"notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_orders_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_reconciliation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway_account_id" uuid NOT NULL,
	"reconciliation_date" varchar(10) NOT NULL,
	"total_captured_paise" bigint DEFAULT 0 NOT NULL,
	"total_refunded_paise" bigint DEFAULT 0 NOT NULL,
	"total_fee_paise" bigint DEFAULT 0 NOT NULL,
	"total_tax_paise" bigint DEFAULT 0 NOT NULL,
	"net_settled_paise" bigint DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'MATCHED' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "raw_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway_account_id" uuid,
	"provider" varchar(50) DEFAULT 'RAZORPAY' NOT NULL,
	"event_id" varchar(150),
	"event_type" varchar(100) NOT NULL,
	"headers" jsonb,
	"raw_payload" text NOT NULL,
	"signature" varchar(255),
	"signature_valid" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'RECEIVED' NOT NULL,
	"processing_error" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"captured_payment_id" uuid NOT NULL,
	"razorpay_refund_id" varchar(100) NOT NULL,
	"amount_paise" bigint NOT NULL,
	"status" varchar(50) DEFAULT 'processed' NOT NULL,
	"reason" text,
	"speed" varchar(50) DEFAULT 'normal',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refunds_razorpay_refund_id_unique" UNIQUE("razorpay_refund_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_element_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"voice_id" varchar(100),
	"prompt_template" text,
	"status" varchar(50) DEFAULT 'NOT_CONNECTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_element_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"lead_id" uuid,
	"customer_id" uuid,
	"phone_number" varchar(50) NOT NULL,
	"duration_seconds" integer DEFAULT 0,
	"outcome" varchar(50),
	"status" varchar(50) DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" uuid NOT NULL,
	"speaker" varchar(50) NOT NULL,
	"text" text NOT NULL,
	"timestamp_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wati_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"api_endpoint" varchar(500),
	"status" varchar(50) DEFAULT 'NOT_CONNECTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wati_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wati_account_id" uuid NOT NULL,
	"recipient_phone" varchar(50) NOT NULL,
	"template_name" varchar(150),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_ai_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"phone_number_id" varchar(100) NOT NULL,
	"display_phone_number" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"provider" varchar(50) DEFAULT 'WHATSAPP_AI_PORTAL' NOT NULL,
	"webhook_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_ai_accounts_phone_number_id_unique" UNIQUE("phone_number_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"customer_id" uuid,
	"lead_id" uuid,
	"external_convo_id" varchar(150) NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"contact_name" varchar(150),
	"stage" varchar(50) DEFAULT 'GREETING',
	"intent" varchar(100),
	"sentiment" varchar(50) DEFAULT 'NEUTRAL',
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_ai_conversations_external_convo_id_unique" UNIQUE("external_convo_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_type" varchar(50) NOT NULL,
	"message_type" varchar(50) DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"media_url" text,
	"external_msg_id" varchar(150),
	"ai_model" varchar(100),
	"tokens_used" integer DEFAULT 0,
	"sentiment" varchar(50),
	"status" varchar(50) DEFAULT 'delivered' NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_ai_messages_external_msg_id_unique" UNIQUE("external_msg_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attribution_touchpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribution_id" uuid NOT NULL,
	"touchpoint_id" uuid,
	"channel" varchar(50) NOT NULL,
	"source" varchar(100),
	"campaign_id" varchar(100),
	"touchpoint_time" timestamp with time zone NOT NULL,
	"weight" numeric(5, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversion_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"captured_payment_id" uuid,
	"attribution_model" varchar(50) DEFAULT 'LINEAR' NOT NULL,
	"first_touch_weight" numeric(5, 4) DEFAULT '0',
	"last_touch_weight" numeric(5, 4) DEFAULT '0',
	"linear_weight" numeric(5, 4) DEFAULT '0',
	"time_decay_weight" numeric(5, 4) DEFAULT '0',
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"module" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_scopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid,
	"category_id" uuid,
	"access_level" varchar(50) DEFAULT 'READ_WRITE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_name" varchar(100) NOT NULL,
	"entity_id" varchar(100),
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar(100),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "background_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" varchar(100) NOT NULL,
	"payload" jsonb,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"next_run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"error_details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_units" ADD CONSTRAINT "business_units_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "source_accounts" ADD CONSTRAINT "source_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "source_accounts" ADD CONSTRAINT "source_accounts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_identifiers" ADD CONSTRAINT "customer_identifiers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lead_touchpoints" ADD CONSTRAINT "lead_touchpoints_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracking_parameters" ADD CONSTRAINT "tracking_parameters_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_business_account_id_meta_business_accounts_id_fk" FOREIGN KEY ("business_account_id") REFERENCES "public"."meta_business_accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ad_sets" ADD CONSTRAINT "meta_ad_sets_campaign_id_meta_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."meta_campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ads" ADD CONSTRAINT "meta_ads_adset_id_meta_ad_sets_id_fk" FOREIGN KEY ("adset_id") REFERENCES "public"."meta_ad_sets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ads" ADD CONSTRAINT "meta_ads_creative_id_video_creatives_id_fk" FOREIGN KEY ("creative_id") REFERENCES "public"."video_creatives"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_business_accounts" ADD CONSTRAINT "meta_business_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_campaigns" ADD CONSTRAINT "meta_campaigns_ad_account_id_meta_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."meta_ad_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insights_daily" ADD CONSTRAINT "meta_insights_daily_ad_account_id_meta_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."meta_ad_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insights_daily" ADD CONSTRAINT "meta_insights_daily_campaign_id_meta_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."meta_campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insights_daily" ADD CONSTRAINT "meta_insights_daily_adset_id_meta_ad_sets_id_fk" FOREIGN KEY ("adset_id") REFERENCES "public"."meta_ad_sets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insights_daily" ADD CONSTRAINT "meta_insights_daily_ad_id_meta_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."meta_ads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_sync_errors" ADD CONSTRAINT "meta_sync_errors_sync_run_id_meta_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."meta_sync_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_sync_runs" ADD CONSTRAINT "meta_sync_runs_ad_account_id_meta_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."meta_ad_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "captured_payments" ADD CONSTRAINT "captured_payments_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "captured_payments" ADD CONSTRAINT "captured_payments_gateway_account_id_gateway_accounts_id_fk" FOREIGN KEY ("gateway_account_id") REFERENCES "public"."gateway_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gateway_accounts" ADD CONSTRAINT "gateway_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gateway_accounts" ADD CONSTRAINT "gateway_accounts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_gateway_account_id_gateway_accounts_id_fk" FOREIGN KEY ("gateway_account_id") REFERENCES "public"."gateway_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_reconciliation" ADD CONSTRAINT "payment_reconciliation_gateway_account_id_gateway_accounts_id_fk" FOREIGN KEY ("gateway_account_id") REFERENCES "public"."gateway_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "raw_webhook_events" ADD CONSTRAINT "raw_webhook_events_gateway_account_id_gateway_accounts_id_fk" FOREIGN KEY ("gateway_account_id") REFERENCES "public"."gateway_accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refunds" ADD CONSTRAINT "refunds_captured_payment_id_captured_payments_id_fk" FOREIGN KEY ("captured_payment_id") REFERENCES "public"."captured_payments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_element_agents" ADD CONSTRAINT "ai_element_agents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_element_calls" ADD CONSTRAINT "ai_element_calls_agent_id_ai_element_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_element_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_element_calls" ADD CONSTRAINT "ai_element_calls_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_element_calls" ADD CONSTRAINT "ai_element_calls_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_transcripts" ADD CONSTRAINT "call_transcripts_call_id_ai_element_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."ai_element_calls"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wati_accounts" ADD CONSTRAINT "wati_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wati_messages" ADD CONSTRAINT "wati_messages_wati_account_id_wati_accounts_id_fk" FOREIGN KEY ("wati_account_id") REFERENCES "public"."wati_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_ai_accounts" ADD CONSTRAINT "whatsapp_ai_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_ai_conversations" ADD CONSTRAINT "whatsapp_ai_conversations_account_id_whatsapp_ai_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."whatsapp_ai_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_ai_conversations" ADD CONSTRAINT "whatsapp_ai_conversations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_ai_conversations" ADD CONSTRAINT "whatsapp_ai_conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_ai_messages" ADD CONSTRAINT "whatsapp_ai_messages_conversation_id_whatsapp_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."whatsapp_ai_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attribution_touchpoints" ADD CONSTRAINT "attribution_touchpoints_attribution_id_conversion_attributions_id_fk" FOREIGN KEY ("attribution_id") REFERENCES "public"."conversion_attributions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attribution_touchpoints" ADD CONSTRAINT "attribution_touchpoints_touchpoint_id_lead_touchpoints_id_fk" FOREIGN KEY ("touchpoint_id") REFERENCES "public"."lead_touchpoints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversion_attributions" ADD CONSTRAINT "conversion_attributions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversion_attributions" ADD CONSTRAINT "conversion_attributions_captured_payment_id_captured_payments_id_fk" FOREIGN KEY ("captured_payment_id") REFERENCES "public"."captured_payments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_user_id_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_events_lead_idx" ON "activity_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_events_customer_idx" ON "activity_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cust_ident_type_val_idx" ON "customer_identifiers" USING btree ("identifier_type","identifier_value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_company_idx" ON "customers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_status_hist_lead_idx" ON "lead_status_history" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_touchpoints_lead_idx" ON "lead_touchpoints" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_touchpoints_type_idx" ON "lead_touchpoints" USING btree ("touchpoint_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_category_idx" ON "leads" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_company_idx" ON "leads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_customer_idx" ON "leads" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tracking_params_lead_idx" ON "tracking_parameters" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tracking_params_meta_ad_idx" ON "tracking_parameters" USING btree ("meta_ad_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meta_adsets_adset_id_idx" ON "meta_ad_sets" USING btree ("meta_adset_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meta_adsets_camp_idx" ON "meta_ad_sets" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meta_ads_ad_id_idx" ON "meta_ads" USING btree ("meta_ad_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meta_ads_adset_idx" ON "meta_ads" USING btree ("adset_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meta_campaigns_camp_id_idx" ON "meta_campaigns" USING btree ("meta_campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meta_campaigns_ad_acc_idx" ON "meta_campaigns" USING btree ("ad_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insights_date_idx" ON "meta_insights_daily" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insights_ad_acc_date_idx" ON "meta_insights_daily" USING btree ("ad_account_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insights_ad_date_idx" ON "meta_insights_daily" USING btree ("ad_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "captured_payments_rzp_pay_idx" ON "captured_payments" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "captured_payments_captured_at_idx" ON "captured_payments" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "captured_payments_gateway_idx" ON "captured_payments" USING btree ("gateway_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_attempts_rzp_pay_idx" ON "payment_attempts" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_attempts_order_idx" ON "payment_attempts" USING btree ("payment_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_orders_rzp_order_idx" ON "payment_orders" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_orders_cust_idx" ON "payment_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_orders_lead_idx" ON "payment_orders" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "raw_webhook_events_id_idx" ON "raw_webhook_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "raw_webhook_events_type_status_idx" ON "raw_webhook_events" USING btree ("event_type","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wa_conv_phone_idx" ON "whatsapp_ai_conversations" USING btree ("contact_phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wa_conv_acc_idx" ON "whatsapp_ai_conversations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wa_conv_last_msg_idx" ON "whatsapp_ai_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wa_msg_convo_idx" ON "whatsapp_ai_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wa_msg_sent_at_idx" ON "whatsapp_ai_messages" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversion_attr_lead_idx" ON "conversion_attributions" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversion_attr_payment_idx" ON "conversion_attributions" USING btree ("captured_payment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_role_perm_idx" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_token_hash_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_accounts_email_idx" ON "user_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_role_assign_idx" ON "user_role_assignments" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_scopes_user_comp_cat_idx" ON "user_scopes" USING btree ("user_id","company_id","category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_action_entity_idx" ON "audit_logs" USING btree ("entity_name","action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bg_jobs_status_run_idx" ON "background_jobs" USING btree ("status","next_run_at");