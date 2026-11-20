import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://lead_app_user:dev_secret_lead_pass_2026@localhost:5432/lead_management_dev?sslmode=disable',
  },
  verbose: true,
  strict: true,
});
