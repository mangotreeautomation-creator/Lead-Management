import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from current directory or parent directory
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('127.0.0.1'),
  LOG_LEVEL: z.string().default('info'),

  // PostgreSQL Connection
  DATABASE_URL: z.string().default('postgresql://lead_app_user:dev_secret_lead_pass_2026@localhost:5432/lead_management_dev?sslmode=disable'),
  DATABASE_TEST_URL: z.string().default('postgresql://lead_app_user:dev_secret_lead_pass_2026@localhost:5432/lead_management_test?sslmode=disable'),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),

  // Security & Sessions
  COOKIE_SECRET: z.string().default('leadpulse_cookie_super_secret_signing_key_2026_xyz'),
  SESSION_TTL_HOURS: z.coerce.number().default(72),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Meta Marketing API (v21.0)
  META_GRAPH_API_VERSION: z.string().default('v21.0'),
  META_AD_ACCOUNT_ID: z.string().default('act_845822215217013'),
  META_SYSTEM_USER_ACCESS_TOKEN: z.string().default(''),
  META_APP_SECRET: z.string().default(''),

  // Razorpay Accounts (3 sources)
  // 1. GlobalInch (VastuWheel Reports & Palmistry)
  RAZORPAY_ACCOUNT_ID_VASTUWHEEL: z.string().default('acc_globalinch_vastuwheel'),
  RAZORPAY_KEY_ID_VASTUWHEEL: z.string().default('rzp_live_placeholder_vastuwheel'),
  RAZORPAY_KEY_SECRET_VASTUWHEEL: z.string().default('placeholder_secret_vastuwheel'),
  RAZORPAY_WEBHOOK_SECRET_VASTUWHEEL: z.string().default('whsec_vastuwheel_globalinch_2026'),

  // 2. Mango Tree Technology (Vastu Webinar)
  RAZORPAY_ACCOUNT_ID_WEBINAR: z.string().default('acc_mangotree_webinar'),
  RAZORPAY_KEY_ID_WEBINAR: z.string().default('rzp_live_placeholder_webinar'),
  RAZORPAY_KEY_SECRET_WEBINAR: z.string().default('placeholder_secret_webinar'),
  RAZORPAY_WEBHOOK_SECRET_WEBINAR: z.string().default('whsec_webinar_mangotree_2026'),

  // 3. Vastu Shikhar (Consultancy)
  RAZORPAY_ACCOUNT_ID_CONSULTANCY: z.string().default('acc_vastushikhar_consultancy'),
  RAZORPAY_KEY_ID_CONSULTANCY: z.string().default('rzp_live_placeholder_consultancy'),
  RAZORPAY_KEY_SECRET_CONSULTANCY: z.string().default('placeholder_secret_consultancy'),
  RAZORPAY_WEBHOOK_SECRET_CONSULTANCY: z.string().default('whsec_consultancy_vastushikhar_2026'),

  // In-House WhatsApp AI Portal
  WHATSAPP_AI_PORTAL_WEBHOOK_SECRET: z.string().default('whsec_whatsapp_ai_leadpulse_2026'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
