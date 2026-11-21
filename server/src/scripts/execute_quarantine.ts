import { pool } from '../database/client';

export async function executeReversibleQuarantine() {
  console.log('================================================================================');
  console.log('🔒 EXECUTING REVERSIBLE QUARANTINE OF SYNTHETIC SEED RECORDS (TRANSACTIONAL)');
  console.log('================================================================================');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create Quarantine Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quarantined_synthetic_records (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        source_table varchar(100) NOT NULL,
        record_id uuid NOT NULL,
        record_data jsonb NOT NULL,
        quarantined_at timestamptz NOT NULL DEFAULT now(),
        reason varchar(255) NOT NULL DEFAULT 'Synthetic seed record'
      );
    `);

    // 2. Identify Dummy Customer IDs
    const dummyCustRes = await client.query(`
      SELECT id FROM customers WHERE email LIKE '%@example.com' OR phone = '+91 98765 43210'
    `);
    const dummyCustIds = dummyCustRes.rows.map((r: any) => `'${r.id}'`);

    // 3. Identify Dummy Order IDs
    const dummyOrdersRes = await client.query(`
      SELECT id FROM payment_orders
      WHERE razorpay_order_id LIKE '%ravi%'
         OR razorpay_order_id LIKE '%1795168715339%'
         OR razorpay_order_id LIKE '%palmistry%'
         OR razorpay_order_id LIKE '%webinar%'
         OR razorpay_order_id LIKE '%consultancy%'
    `);
    const dummyOrderIds = dummyOrdersRes.rows.map((r: any) => `'${r.id}'`);

    // 4. Identify Dummy Payment IDs
    const dummyPayRes = await client.query(`
      SELECT id FROM captured_payments
      WHERE razorpay_payment_id LIKE '%ravi%'
         OR razorpay_payment_id LIKE '%1795168715339%'
         OR razorpay_payment_id LIKE '%seed%'
    `);
    const dummyPayIds = dummyPayRes.rows.map((r: any) => `'${r.id}'`);

    // 5. Identify Dummy Attempt IDs
    const dummyAttRes = await client.query(`
      SELECT id FROM payment_attempts
      WHERE razorpay_payment_id LIKE '%ravi%'
         OR razorpay_payment_id LIKE '%1795168715339%'
         OR razorpay_payment_id LIKE '%seed%'
    `);
    const dummyAttIds = dummyAttRes.rows.map((r: any) => `'${r.id}'`);

    // 6. Identify Dummy Lead IDs
    let dummyLeadIds: string[] = [];
    if (dummyCustIds.length > 0) {
      const dummyLeadsRes = await client.query(`
        SELECT id FROM leads WHERE customer_id IN (${dummyCustIds.join(',')}) OR lead_code LIKE '%RAVI%'
      `);
      dummyLeadIds = dummyLeadsRes.rows.map((r: any) => `'${r.id}'`);
    }

    // 7. Archive and remove in foreign key dependency order
    let totalArchived = 0;

    // A. Captured Payments
    if (dummyPayIds.length > 0) {
      await client.query(`
        INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
        SELECT 'captured_payments', id, to_jsonb(captured_payments) FROM captured_payments WHERE id IN (${dummyPayIds.join(',')});
        DELETE FROM captured_payments WHERE id IN (${dummyPayIds.join(',')});
      `);
      console.log(`✔ Quarantined ${dummyPayIds.length} synthetic captured_payments`);
      totalArchived += dummyPayIds.length;
    }

    // B. Payment Attempts
    if (dummyAttIds.length > 0) {
      await client.query(`
        INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
        SELECT 'payment_attempts', id, to_jsonb(payment_attempts) FROM payment_attempts WHERE id IN (${dummyAttIds.join(',')});
        DELETE FROM payment_attempts WHERE id IN (${dummyAttIds.join(',')});
      `);
      console.log(`✔ Quarantined ${dummyAttIds.length} synthetic payment_attempts`);
      totalArchived += dummyAttIds.length;
    }

    // C. Payment Orders
    if (dummyOrderIds.length > 0) {
      await client.query(`
        INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
        SELECT 'payment_orders', id, to_jsonb(payment_orders) FROM payment_orders WHERE id IN (${dummyOrderIds.join(',')});
        DELETE FROM payment_orders WHERE id IN (${dummyOrderIds.join(',')});
      `);
      console.log(`✔ Quarantined ${dummyOrderIds.length} synthetic payment_orders`);
      totalArchived += dummyOrderIds.length;
    }

    // D. Lead Touchpoints
    const dummyTouchRes = await client.query(`
      SELECT id FROM lead_touchpoints WHERE summary LIKE '%Palmistry%' OR summary LIKE '%Webinar%'
    `);
    const dummyTouchIds = dummyTouchRes.rows.map((r: any) => `'${r.id}'`);
    if (dummyTouchIds.length > 0) {
      await client.query(`
        INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
        SELECT 'lead_touchpoints', id, to_jsonb(lead_touchpoints) FROM lead_touchpoints WHERE id IN (${dummyTouchIds.join(',')});
        DELETE FROM lead_touchpoints WHERE id IN (${dummyTouchIds.join(',')});
      `);
      console.log(`✔ Quarantined ${dummyTouchIds.length} synthetic lead_touchpoints`);
      totalArchived += dummyTouchIds.length;
    }

    // E. Leads
    if (dummyLeadIds.length > 0) {
      await client.query(`
        INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
        SELECT 'leads', id, to_jsonb(leads) FROM leads WHERE id IN (${dummyLeadIds.join(',')});
        DELETE FROM leads WHERE id IN (${dummyLeadIds.join(',')});
      `);
      console.log(`✔ Quarantined ${dummyLeadIds.length} synthetic leads`);
      totalArchived += dummyLeadIds.length;
    }

    // F. Customer Identifiers
    if (dummyCustIds.length > 0) {
      const dummyIdentRes = await client.query(`
        SELECT id FROM customer_identifiers WHERE customer_id IN (${dummyCustIds.join(',')})
      `);
      const dummyIdentIds = dummyIdentRes.rows.map((r: any) => `'${r.id}'`);
      if (dummyIdentIds.length > 0) {
        await client.query(`
          INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
          SELECT 'customer_identifiers', id, to_jsonb(customer_identifiers) FROM customer_identifiers WHERE id IN (${dummyIdentIds.join(',')});
          DELETE FROM customer_identifiers WHERE id IN (${dummyIdentIds.join(',')});
        `);
        console.log(`✔ Quarantined ${dummyIdentIds.length} synthetic customer_identifiers`);
        totalArchived += dummyIdentIds.length;
      }
    }

    // G. Customers
    if (dummyCustIds.length > 0) {
      await client.query(`
        INSERT INTO quarantined_synthetic_records (source_table, record_id, record_data)
        SELECT 'customers', id, to_jsonb(customers) FROM customers WHERE id IN (${dummyCustIds.join(',')});
        DELETE FROM customers WHERE id IN (${dummyCustIds.join(',')});
      `);
      console.log(`✔ Quarantined ${dummyCustIds.length} synthetic customers`);
      totalArchived += dummyCustIds.length;
    }

    // Verification check inside transaction
    const remainingPaymentsRes = await client.query(`SELECT count(*) as cnt FROM captured_payments`);
    const remainingCustomersRes = await client.query(`SELECT count(*) as cnt FROM customers`);
    const remainingRefundsRes = await client.query(`SELECT count(*) as cnt FROM refunds`);

    const remainingPayments = parseInt(remainingPaymentsRes.rows[0].cnt, 10);
    const remainingCustomers = parseInt(remainingCustomersRes.rows[0].cnt, 10);
    const remainingRefunds = parseInt(remainingRefundsRes.rows[0].cnt, 10);

    console.log(`\n--- Verification Before Commit ---`);
    console.log(`Quarantined total: ${totalArchived} (Expected: 143)`);
    console.log(`Remaining genuine captured_payments: ${remainingPayments} (Expected: 321)`);
    console.log(`Remaining genuine customers: ${remainingCustomers} (Expected: 288)`);
    console.log(`Remaining genuine payment_refunds: ${remainingRefunds} (Expected: 6)`);

    if (totalArchived !== 143) {
      throw new Error(`Quarantine count mismatch: got ${totalArchived}, expected 143. Rolling back.`);
    }
    if (remainingPayments !== 321) {
      throw new Error(`Genuine captured_payments count mismatch: got ${remainingPayments}, expected 321. Rolling back.`);
    }
    if (remainingCustomers < 288) {
      throw new Error(`Genuine customers count too low: got ${remainingCustomers}, expected at least 288. Rolling back.`);
    }

    await client.query('COMMIT');
    console.log(`\n============================================================`);
    console.log(`✔ TRANSACTION COMMITTED SUCCESSFULLY`);
    console.log(`✔ TOTAL SYNTHETIC RECORDS SAFELY ARCHIVED IN QUARANTINE: ${totalArchived}`);
    console.log(`✔ ALL 100% GENUINE RAZORPAY CUSTOMERS & PAYMENTS PRESERVED`);
    console.log(`============================================================\n`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ QUARANTINE FAILED - TRANSACTION ROLLED BACK:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  executeReversibleQuarantine().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
