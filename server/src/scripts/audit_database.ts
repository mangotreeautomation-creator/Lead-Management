import { db } from '../database/client';
import { sql } from 'drizzle-orm';

async function auditDatabase() {
  console.log('================================================================================');
  console.log('🔍 LEADPULSE ENTERPRISE — DATABASE FORENSIC AUDIT');
  console.log('================================================================================');

  const tables = [
    'companies',
    'categories',
    'business_units',
    'gateway_accounts',
    'customers',
    'customer_identifiers',
    'leads',
    'lead_touchpoints',
    'lead_status_history',
    'payment_orders',
    'payment_attempts',
    'captured_payments',
    'refunds',
    'raw_webhook_events',
    'meta_ad_accounts',
    'meta_campaigns',
    'meta_ad_sets',
    'meta_ads',
    'meta_insights_realtime',
    'meta_insights_daily',
    'video_creatives',
    'landing_pages',
    'tracking_parameters',
    'user_accounts',
    'roles',
    'permissions',
    'sessions',
    'audit_logs',
    'background_jobs',
  ];

  for (const t of tables) {
    try {
      const res = await db.execute(sql.raw(`SELECT count(*) as cnt FROM "${t}"`));
      console.log(`Table [${t.padEnd(25)}]: ${res.rows[0].cnt} rows`);
    } catch (err: any) {
      console.log(`Table [${t.padEnd(25)}]: ERROR (${err.message})`);
    }
  }

  // Companies & Categories audit
  console.log('\n--- COMPANIES IN DATABASE ---');
  const comps = await db.execute(sql.raw(`SELECT * FROM companies`));
  console.table(comps.rows);

  console.log('\n--- CATEGORIES IN DATABASE ---');
  const cats = await db.execute(sql.raw(`
    SELECT c.id, c.code, c.name, comp.code as company_code 
    FROM categories c 
    LEFT JOIN companies comp ON c.company_id = comp.id
  `));
  console.table(cats.rows);

  // Investigation of pay_U2NM...
  console.log('\n--- INVESTIGATING pay_U2NM... ---');
  const payU2 = await db.execute(sql.raw(`
    SELECT cp.id, cp.razorpay_payment_id, cp.amount_paise, cp.currency, cp.status, cp.method, cp.captured_at,
           po.razorpay_order_id, po.lead_id, po.customer_id
    FROM captured_payments cp
    LEFT JOIN payment_orders po ON cp.payment_order_id = po.id
    WHERE cp.razorpay_payment_id ILIKE '%U2NM%'
  `));
  console.table(payU2.rows);

  if (payU2.rows.length > 0) {
    const row = payU2.rows[0];
    if (row.customer_id) {
      const cust = await db.execute(sql.raw(`SELECT * FROM customers WHERE id = '${row.customer_id}'`));
      console.log('Customer for pay_U2NM:');
      console.table(cust.rows);
      const idents = await db.execute(sql.raw(`SELECT * FROM customer_identifiers WHERE customer_id = '${row.customer_id}'`));
      console.table(idents.rows);
    }
    if (row.lead_id) {
      const lead = await db.execute(sql.raw(`SELECT * FROM leads WHERE id = '${row.lead_id}'`));
      console.log('Lead for pay_U2NM:');
      console.table(lead.rows);
    }
  }

  // Check date ranges of captured payments
  console.log('\n--- DATE RANGE OF CAPTURED PAYMENTS ---');
  const payRange = await db.execute(sql.raw(`
    SELECT min(captured_at) as earliest_payment, max(captured_at) as latest_payment, count(*) as count
    FROM captured_payments
  `));
  console.table(payRange.rows);

  // Check raw_webhook_events
  const rawEvents = await db.execute(sql.raw(`
    SELECT id, event_type, status, signature_valid, received_at FROM raw_webhook_events LIMIT 10
  `));
  console.log('\n--- RECENT RAW WEBHOOK EVENTS ---');
  console.table(rawEvents.rows);

  // Check for seeded / dummy payments
  console.log('\n--- POTENTIAL DUMMY / SEED PAYMENTS ---');
  const dummyPayments = await db.execute(sql.raw(`
    SELECT id, razorpay_payment_id, amount_paise, status, captured_at
    FROM captured_payments
    WHERE razorpay_payment_id LIKE '%seed%' 
       OR razorpay_payment_id LIKE '%ravi%' 
       OR razorpay_payment_id LIKE '%vastushikhar%'
       OR razorpay_payment_id LIKE '%mangotree%'
       OR razorpay_payment_id LIKE '%globalinch_1%'
  `));
  console.table(dummyPayments.rows);
}

auditDatabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
