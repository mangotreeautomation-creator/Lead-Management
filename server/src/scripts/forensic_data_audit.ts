import { db } from '../database/client';
import { sql } from 'drizzle-orm';

async function forensicDataAudit() {
  console.log('--- AUDITING POSTGRESQL DATA INTEGRITY ---');

  // 1. Audit captured_payments
  const cpRes = await db.execute(sql.raw(`
    SELECT id, razorpay_payment_id, amount_paise, status, captured_at 
    FROM captured_payments 
    ORDER BY captured_at DESC
  `));
  console.log(`Total captured_payments in DB: ${cpRes.rows.length}`);
  const dummyCP = cpRes.rows.filter((r: any) => 
    r.razorpay_payment_id.includes('ravi') || 
    r.razorpay_payment_id.includes('1795168715339') ||
    r.razorpay_payment_id.includes('seed')
  );
  console.log(`Dummy captured_payments: ${dummyCP.length}`);
  console.table(dummyCP);

  // 2. Audit payment_orders
  const poRes = await db.execute(sql.raw(`
    SELECT id, razorpay_order_id, amount_paise, status, created_at 
    FROM payment_orders 
    ORDER BY created_at DESC
  `));
  console.log(`Total payment_orders in DB: ${poRes.rows.length}`);
  const dummyPO = poRes.rows.filter((r: any) => 
    (r.razorpay_order_id && (r.razorpay_order_id.includes('ravi') || r.razorpay_order_id.includes('1795168715339') || r.razorpay_order_id.includes('order_palmistry_') || r.razorpay_order_id.includes('order_webinar_') || r.razorpay_order_id.includes('order_consultancy_')))
  );
  console.log(`Dummy payment_orders: ${dummyPO.length}`);
  console.table(dummyPO);

  // 3. Audit leads
  const leadRes = await db.execute(sql.raw(`
    SELECT id, lead_code, status, source, created_at 
    FROM leads 
    ORDER BY created_at DESC
  `));
  console.log(`Total leads in DB: ${leadRes.rows.length}`);
  const dummyLeads = leadRes.rows.filter((r: any) => 
    !r.lead_code || r.lead_code.includes('RAVI') || r.lead_code.includes('DEMO')
  );
  console.log(`Dummy / un-coded leads: ${dummyLeads.length}`);
  if (dummyLeads.length > 0) {
    console.table(dummyLeads.slice(0, 10));
  }

  // 4. Audit customers
  const custRes = await db.execute(sql.raw(`
    SELECT id, full_name, email, phone, city, total_orders, total_spent_paise, created_at 
    FROM customers 
    ORDER BY created_at DESC
  `));
  console.log(`Total customers in DB: ${custRes.rows.length}`);
  const dummyCust = custRes.rows.filter((r: any) => 
    r.full_name?.includes('Ravi') || r.email?.includes('example.com')
  );
  console.log(`Dummy / seed customers: ${dummyCust.length}`);
  console.table(dummyCust);
}

forensicDataAudit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
