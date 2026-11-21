import { db } from '../database/client';
import { sql } from 'drizzle-orm';

async function verifyProductionReadiness() {
  console.log('================================================================================');
  console.log('🔍 FINAL END-TO-END VERIFICATION: LEADPULSE ENTERPRISE');
  console.log('================================================================================');

  // 1. Quarantined Records Verification
  const quarantineRes = await db.execute(sql.raw(`
    SELECT source_table, count(*) as cnt 
    FROM quarantined_synthetic_records 
    GROUP BY source_table 
    ORDER BY source_table
  `));
  const totalQuarantined = await db.execute(sql.raw(`SELECT count(*) as total FROM quarantined_synthetic_records`));

  console.log('\n1. QUARANTINED SYNTHETIC RECORDS:');
  for (const r of quarantineRes.rows as any[]) {
    console.log(`   - ${r.source_table}: ${r.cnt}`);
  }
  console.log(`   👉 Total Archived: ${(totalQuarantined.rows[0] as any).total} records (Expected: 143)`);

  // 2. Genuine PostgreSQL Business Records
  const cpRes = await db.execute(sql.raw(`
    SELECT count(*) as count, sum(amount_paise) as total_paise 
    FROM captured_payments
  `));
  const custRes = await db.execute(sql.raw(`SELECT count(*) as count FROM customers`));
  const leadRes = await db.execute(sql.raw(`SELECT count(*) as count FROM leads`));
  const trackRes = await db.execute(sql.raw(`SELECT count(*) as count FROM tracking_parameters`));
  const creativeRes = await db.execute(sql.raw(`SELECT count(*) as count FROM video_creatives`));
  const refRes = await db.execute(sql.raw(`
    SELECT count(*) as count, sum(amount_paise) as total_paise 
    FROM refunds
  `));

  const cpCount = (cpRes.rows[0] as any).count;
  const cpTotal = (Number((cpRes.rows[0] as any).total_paise) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  const refCount = (refRes.rows[0] as any).count;
  const refTotal = (Number((refRes.rows[0] as any).total_paise) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  console.log('\n2. ACTIVE GENUINE POSTGRESQL DATA:');
  console.log(`   - Captured Payments: ${cpCount} (Total Volume: ${cpTotal})`);
  console.log(`   - Customers:         ${(custRes.rows[0] as any).count}`);
  console.log(`   - Leads:             ${(leadRes.rows[0] as any).count}`);
  console.log(`   - Tracking Params:   ${(trackRes.rows[0] as any).count}`);
  console.log(`   - Video Creatives:   ${(creativeRes.rows[0] as any).count}`);
  console.log(`   - Refunds:           ${refCount} (Total Refunded: ${refTotal})`);

  // 3. Trace specific payment pay_U2NMUxoHMPF1w8 (₹1,499.00)
  const nhishaPayRes = await db.execute(sql.raw(`
    SELECT cp.razorpay_payment_id, cp.amount_paise, cp.status, cp.captured_at,
           c.full_name, c.phone, c.email, l.lead_code, l.status as lead_status,
           tp.utm_campaign, tp.utm_content
    FROM captured_payments cp
    JOIN payment_orders po ON cp.payment_order_id = po.id
    LEFT JOIN customers c ON po.customer_id = c.id
    LEFT JOIN leads l ON po.lead_id = l.id
    LEFT JOIN tracking_parameters tp ON l.id = tp.lead_id
    WHERE cp.razorpay_payment_id = 'pay_U2NMUxoHMPF1w8'
  `));

  console.log('\n3. FORENSIC TRACE OF pay_U2NMUxoHMPF1w8:');
  if (nhishaPayRes.rows.length > 0) {
    const p = nhishaPayRes.rows[0] as any;
    console.log(`   - Payment ID:    ${p.razorpay_payment_id}`);
    console.log(`   - Amount:        ₹${p.amount_paise / 100}.00 (Status: ${p.status})`);
    console.log(`   - Customer:      ${p.full_name} (${p.phone})`);
    console.log(`   - Lead Code:     ${p.lead_code} (${p.lead_status})`);
    console.log(`   - Campaign/UTM:  ${p.utm_campaign || 'N/A'}`);
    console.log(`   - Captured At:   ${p.captured_at}`);
  } else {
    console.log('   ⚠️ pay_U2NMUxoHMPF1w8 not found in captured_payments');
  }

  // 4. Trace another payment with rich creative attribution e.g. pay_U2Pe3rDdDhKqTL
  const rakhiPayRes = await db.execute(sql.raw(`
    SELECT cp.razorpay_payment_id, cp.amount_paise, cp.status,
           c.full_name, c.phone, l.lead_code,
           tp.utm_campaign, tp.utm_content, tp.utm_term
    FROM captured_payments cp
    JOIN payment_orders po ON cp.payment_order_id = po.id
    LEFT JOIN customers c ON po.customer_id = c.id
    LEFT JOIN leads l ON po.lead_id = l.id
    LEFT JOIN tracking_parameters tp ON l.id = tp.lead_id
    WHERE cp.razorpay_payment_id = 'pay_U2Pe3rDdDhKqTL'
  `));

  console.log('\n4. ATTRIBUTION TRACE OF pay_U2Pe3rDdDhKqTL:');
  if (rakhiPayRes.rows.length > 0) {
    const r = rakhiPayRes.rows[0] as any;
    console.log(`   - Payment ID:    ${r.razorpay_payment_id} (₹${r.amount_paise / 100})`);
    console.log(`   - Customer:      ${r.full_name} (${r.phone})`);
    console.log(`   - Creative Name: "${r.utm_content}"`);
    console.log(`   - Campaign Name: "${r.utm_campaign}"`);
  }

  // 5. Zero Dummy Customer / Payment Audit
  const dummyCheck = await db.execute(sql.raw(`
    SELECT 
      (SELECT count(*) FROM customers WHERE email LIKE '%@example.com' OR phone = '+91 98765 43210') as dummy_customers,
      (SELECT count(*) FROM captured_payments WHERE razorpay_payment_id LIKE '%ravi%' OR razorpay_payment_id LIKE '%seed%') as dummy_payments,
      (SELECT count(*) FROM payment_orders WHERE razorpay_order_id LIKE '%ravi%' OR razorpay_order_id LIKE '%palmistry%') as dummy_orders
  `));
  const d = dummyCheck.rows[0] as any;
  console.log('\n5. ACTIVE DATABASE DUMMY DATA PURITY CHECK:');
  console.log(`   - Active Dummy Customers: ${d.dummy_customers} (Expected: 0)`);
  console.log(`   - Active Dummy Payments:  ${d.dummy_payments} (Expected: 0)`);
  console.log(`   - Active Dummy Orders:    ${d.dummy_orders} (Expected: 0)`);

  console.log('\n================================================================================');
  console.log('✅ PRODUCTION READINESS VERIFICATION COMPLETE');
  console.log('================================================================================\n');

  await new Promise(r => setTimeout(r, 200));
}

verifyProductionReadiness().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
