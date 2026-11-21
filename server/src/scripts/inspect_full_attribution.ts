import { db } from '../database/client';
import { sql } from 'drizzle-orm';
import { landingPages } from '../database/schema/organizations';

async function main() {
  console.log('=== 1. LANDING PAGES TABLE ===');
  const lps = await db.select().from(landingPages);
  console.table(lps);

  console.log('\n=== 2. DISTINCT REPORT LANGUAGES IN DB ===');
  const langFromOrders = await db.execute(sql.raw(`
    SELECT DISTINCT notes->>'report_language' AS report_language, count(*) as count 
    FROM payment_orders 
    WHERE notes->>'report_language' IS NOT NULL 
    GROUP BY notes->>'report_language'
  `));
  console.table(langFromOrders.rows);

  console.log('\n=== 3. DISTINCT ROUTES / CAMPAIGNS IN NOTES ===');
  const routesFromOrders = await db.execute(sql.raw(`
    SELECT DISTINCT COALESCE(notes->>'route', notes->>'campaign') AS route, count(*) as count 
    FROM payment_orders 
    WHERE notes IS NOT NULL 
    GROUP BY COALESCE(notes->>'route', notes->>'campaign')
  `));
  console.table(routesFromOrders.rows);

  console.log('\n=== 4. DISTINCT UTM CAMPAIGNS & TERMS ===');
  const utmCamp = await db.execute(sql.raw(`
    SELECT DISTINCT utm_campaign, count(*) as count 
    FROM tracking_parameters 
    WHERE utm_campaign IS NOT NULL 
    GROUP BY utm_campaign 
    ORDER BY count DESC 
    LIMIT 10
  `));
  console.table(utmCamp.rows);

  console.log('\n=== 5. DISTINCT PAYMENT TYPES & PRODUCTS ===');
  const prodFromOrders = await db.execute(sql.raw(`
    SELECT DISTINCT notes->>'product' AS product, notes->>'payment_type' AS payment_type, count(*) as count 
    FROM payment_orders 
    GROUP BY notes->>'product', notes->>'payment_type'
  `));
  console.table(prodFromOrders.rows);

  console.log('\n=== 6. FB4 LANGUAGE BREAKDOWN (CAPTURED REVENUE & COUNTS) ===');
  const fb4Breakdown = await db.execute(sql.raw(`
    SELECT 
      notes->>'report_language' AS report_language,
      count(*) as total_orders,
      count(*) filter (where po.status = 'paid') as paid_orders,
      sum(case when po.status = 'paid' then po.amount_paise else 0 end) / 100 as captured_rev,
      count(*) filter (where po.status != 'paid') as failed_or_pending,
      round(count(*) filter (where po.status = 'paid')::numeric / count(*)::numeric * 100, 2) as conversion_rate_pct
    FROM payment_orders po
    WHERE notes->>'route' = 'fb4' OR notes->>'campaign' = 'fb4'
    GROUP BY notes->>'report_language'
  `));
  console.table(fb4Breakdown.rows);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
