CREATE TABLE IF NOT EXISTS "meta_insights_realtime" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"campaign_id" uuid,
	"meta_campaign_id" varchar(100) NOT NULL,
	"campaign_name" varchar(255) NOT NULL,
	"reporting_date" varchar(10) NOT NULL,
	"spend_paise" bigint DEFAULT 0 NOT NULL,
	"reach" integer DEFAULT 0,
	"impressions" integer DEFAULT 0 NOT NULL,
	"frequency" numeric(8, 4) DEFAULT '0',
	"cpm_paise" integer DEFAULT 0,
	"clicks" integer DEFAULT 0 NOT NULL,
	"outbound_clicks" integer DEFAULT 0,
	"ctr" numeric(8, 4) DEFAULT '0',
	"landing_page_views" integer DEFAULT 0,
	"add_to_cart" integer DEFAULT 0,
	"initiate_checkout" integer DEFAULT 0,
	"leads_count" integer DEFAULT 0 NOT NULL,
	"add_payment_info" integer DEFAULT 0,
	"purchases_count" integer DEFAULT 0 NOT NULL,
	"purchase_value_paise" bigint DEFAULT 0,
	"roas" numeric(8, 4) DEFAULT '0',
	"apv_paise" integer DEFAULT 0,
	"obc_to_lpv_pct" numeric(8, 4) DEFAULT '0',
	"lpv_to_atc_pct" numeric(8, 4) DEFAULT '0',
	"atc_to_ci_pct" numeric(8, 4) DEFAULT '0',
	"lpv_to_ci_pct" numeric(8, 4) DEFAULT '0',
	"ci_to_pur_pct" numeric(8, 4) DEFAULT '0',
	"lpv_to_pur_pct" numeric(8, 4) DEFAULT '0',
	"raw_insights" jsonb,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "meta_campaign_id" varchar(100);--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "campaign_name" varchar(255);--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "reach" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "frequency" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "outbound_clicks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "landing_page_views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "add_to_cart" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "initiate_checkout" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "add_payment_info" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "apv_paise" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "obc_to_lpv_pct" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "lpv_to_atc_pct" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "atc_to_ci_pct" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "lpv_to_ci_pct" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "ci_to_pur_pct" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "lpv_to_pur_pct" numeric(8, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "raw_insights" jsonb;--> statement-breakpoint
ALTER TABLE "meta_insights_daily" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insights_realtime" ADD CONSTRAINT "meta_insights_realtime_ad_account_id_meta_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."meta_ad_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insights_realtime" ADD CONSTRAINT "meta_insights_realtime_campaign_id_meta_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."meta_campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "insights_realtime_acc_camp_date_idx" ON "meta_insights_realtime" USING btree ("ad_account_id","meta_campaign_id","reporting_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insights_realtime_date_idx" ON "meta_insights_realtime" USING btree ("reporting_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "insights_daily_acc_camp_date_idx" ON "meta_insights_daily" USING btree ("ad_account_id","meta_campaign_id","date");