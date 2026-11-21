import { z } from 'zod';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

// Load .env from current working directory
dotenv.config();

// Helper to generate an ephemeral runtime secret if none is provided in development
const generateDevSecret = (name: string) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`CRITICAL SECURITY FAILURE: Environment variable ${name} must be explicitly defined in production.`);
  }
  return crypto.randomBytes(32).toString('hex');
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('127.0.0.1'),
  LOG_LEVEL: z.string().default('info'),

  // PostgreSQL Connection
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_TEST_URL: z.string().optional(),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),

  // Security & Sessions
  COOKIE_SECRET: z.string().min(16).default(() => generateDevSecret('COOKIE_SECRET')),
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
  RAZORPAY_KEY_ID_VASTUWHEEL: z.string().default(''),
  RAZORPAY_KEY_SECRET_VASTUWHEEL: z.string().default(''),
  RAZORPAY_WEBHOOK_SECRET_VASTUWHEEL: z.string().min(8).default(() => generateDevSecret('RAZORPAY_WEBHOOK_SECRET_VASTUWHEEL')),

  // 2. Mango Tree Technology (Vastu Webinar)
  RAZORPAY_ACCOUNT_ID_WEBINAR: z.string().default('acc_mangotree_webinar'),
  RAZORPAY_KEY_ID_WEBINAR: z.string().default(''),
  RAZORPAY_KEY_SECRET_WEBINAR: z.string().default(''),
  RAZORPAY_WEBHOOK_SECRET_WEBINAR: z.string().min(8).default(() => generateDevSecret('RAZORPAY_WEBHOOK_SECRET_WEBINAR')),

  // 3. Vastu Shikhar (Consultancy)
  RAZORPAY_ACCOUNT_ID_CONSULTANCY: z.string().default('acc_vastushikhar_consultancy'),
  RAZORPAY_KEY_ID_CONSULTANCY: z.string().default(''),
  RAZORPAY_KEY_SECRET_CONSULTANCY: z.string().default(''),
  RAZORPAY_WEBHOOK_SECRET_CONSULTANCY: z.string().min(8).default(() => generateDevSecret('RAZORPAY_WEBHOOK_SECRET_CONSULTANCY')),

  // In-House WhatsApp AI Portal
  WHATSAPP_AI_PORTAL_WEBHOOK_SECRET: z.string().min(8).default(() => generateDevSecret('WHATSAPP_AI_PORTAL_WEBHOOK_SECRET')),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
