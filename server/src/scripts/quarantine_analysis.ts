import { db } from '../database/client';
import { sql } from 'drizzle-orm';

async function quarantineAnalysis() {
  console.log('================================================================================');
  console.log('🔍 FORENSIC QUARANTINE ANALYSIS: SYNTHETIC SEED RECORDS VS GENUINE RECORDS');
  console.log('================================================================================');

  // 1. Identify Dummy Captured Payments
  const dummyPaymentsRes = await db.execute(sql.raw(`
    SELECT cp.id, cp.razorpay_payment_id, cp.amount_paise, cp.status, cp.captured_at,
           po.id as order_id, po.razorpay_order_id, po.lead_id, po.customer_id
    FROM captured_payments cp
    LEFT JOIN payment_orders po ON cp.payment_order_id = po.id
    WHERE cp.razorpay_payment_id LIKE '%ravi%'
       OR cp.razorpay_payment_id LIKE '%1795168715339%'
       OR cp.razorpay_payment_id LIKE '%seed%'
  `));
  console.log(`\n1. Dummy Captured Payments: ${dummyPaymentsRes.rows.length} records`);
  console.table(dummyPaymentsRes.rows.map((r: any) => ({
    paymentId: r.razorpay_payment_id,
    orderId: r.razorpay_order_id,
    amountINR: Number(r.amount_paise) / 100,
    status: r.status,
    capturedAt: r.captured_at
  })));

  // 2. Identify Dummy Payment Orders
  const dummyOrdersRes = await db.execute(sql.raw(`
    SELECT id, razorpay_order_id, amount_paise, status, customer_id, lead_id
    FROM payment_orders
    WHERE razorpay_order_id LIKE '%ravi%'
       OR razorpay_order_id LIKE '%1795168715339%'
       OR razorpay_order_id LIKE '%palmistry%'
       OR razorpay_order_id LIKE '%webinar%'
       OR razorpay_order_id LIKE '%consultancy%'
  `));
  console.log(`\n2. Dummy Payment Orders: ${dummyOrdersRes.rows.length} records`);
  console.table(dummyOrdersRes.rows.map((r: any) => ({
    id: r.id,
    orderId: r.razorpay_order_id,
    amountINR: Number(r.amount_paise) / 100,
    status: r.status
  })));

  // 3. Identify Dummy Customers (seeded @example.com)
  const dummyCustRes = await db.execute(sql.raw(`
    SELECT id, full_name, email, phone, city, total_orders, total_spent_paise, created_at
    FROM customers
    WHERE email LIKE '%@example.com' OR phone = '+91 98765 43210'
  `));
  console.log(`\n3. Dummy Seeded Customers: ${dummyCustRes.rows.length} records`);

  // 4. Identify Customer Identifiers belonging to dummy customers
  const dummyCustIds = dummyCustRes.rows.map((r: any) => `'${r.id}'`).join(',');
  let dummyIdentsCount = 0;
  if (dummyCustRes.rows.length > 0) {
    const identsRes = await db.execute(sql.raw(`
      SELECT count(*) as cnt FROM customer_identifiers WHERE customer_id IN (${dummyCustIds})
    `));
    dummyIdentsCount = Number(identsRes.rows[0].cnt);
  }
  console.log(`4. Dependent Customer Identifiers: ${dummyIdentsCount} records`);

  // 5. Identify Dummy Leads
  let dummyLeadsCount = 0;
  if (dummyCustRes.rows.length > 0) {
    const leadsRes = await db.execute(sql.raw(`
      SELECT count(*) as cnt FROM leads WHERE customer_id IN (${dummyCustIds}) OR lead_code LIKE '%RAVI%'
    `));
    dummyLeadsCount = Number(leadsRes.rows[0].cnt);
  }
  console.log(`5. Dependent Dummy Leads: ${dummyLeadsCount} records`);

  // 6. Identify Dependent Touchpoints
  const touchpointsRes = await db.execute(sql.raw(`
    SELECT count(*) as cnt FROM lead_touchpoints WHERE summary LIKE '%Palmistry%' OR summary LIKE '%Webinar%'
  `));
  console.log(`6. Dependent Lead Touchpoints: ${touchpointsRes.rows[0].cnt} records`);

  // 7. Verify Genuine Records Preservation Check
  console.log('\n--- VERIFICATION OF GENUINE RECORDS (MUST REMAIN 100% UNTOUCHED) ---');
  const genuinePayRes = await db.execute(sql.raw(`
    SELECT count(*) as cnt, sum(amount_paise) as total_paise FROM captured_payments
    WHERE razorpay_payment_id NOT LIKE '%ravi%'
      AND razorpay_payment_id NOT LIKE '%1795168715339%'
      AND razorpay_payment_id NOT LIKE '%seed%'
  `));
  const genuineCustRes = await db.execute(sql.raw(`
    SELECT count(*) as cnt FROM customers WHERE email NOT LIKE '%@example.com' AND phone != '+91 98765 43210'
  `));
  const genuineRefundsRes = await db.execute(sql.raw(`SELECT count(*) as cnt, sum(amount_paise) as total_paise FROM refunds`));

  console.log(`Genuine Captured Payments to Preserve: ${genuinePayRes.rows[0].cnt} records (Total: ₹${Number(genuinePayRes.rows[0].total_paise) / 100})`);
  console.log(`Genuine Customers to Preserve:         ${genuineCustRes.rows[0].cnt} records`);
  console.log(`Genuine Refunds to Preserve:           ${genuineRefundsRes.rows[0].cnt} records (Total: ₹${Number(genuineRefundsRes.rows[0].total_paise) / 100})`);
  console.log('================================================================================');
}

quarantineAnalysis().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
