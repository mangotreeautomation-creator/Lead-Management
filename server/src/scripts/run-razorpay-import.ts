import { razorpayService } from '../modules/razorpay/razorpay.service';
import { pool } from '../database/client';

async function main() {
  console.log('============================================================');
  console.log('STARTING APPROVED 30-DAY RAZORPAY BULK IMPORT (READ-ONLY)');
  console.log('Account: GlobalInch Vastu Wheels (vastuwheel-report)');
  console.log('============================================================');

  try {
    const start = Date.now();
    const result = await razorpayService.importHistoricalPayments30Days('vastuwheel-report');
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`\n✔ Import Completed in ${elapsed}s!`);
    console.log('Import Result:');
    console.log(`  Mode: ${result.mode}`);
    console.log(`  Total Records Fetched from API: ${result.recordsFetched}`);
    console.log(`  Captured Payments Imported:    ${result.capturedCount}`);
    console.log(`  Failed Payment Attempts:        ${result.failedAttemptsCount}`);
    console.log(`  Refunds Reconciled:             ${result.refundsCount}`);
    console.log(`  Total Refund Amount:            ₹${result.refundsTotalRupees}`);
    console.log(`  Date Range: ${result.dateRange?.from} to ${result.dateRange?.to}`);

    console.log('\n--- FINANCIAL RECONCILIATION AUDIT ---');
    const summary = await razorpayService.getPaymentsSummary();
    console.log(`  Total Successful Orders:   ${summary.totalCount}`);
    console.log(`  Gross Captured Revenue:    ₹${summary.grossRupees.toLocaleString('en-IN')}`);
    console.log(`  Total Refunds Processed:   ${summary.refundCount}`);
    console.log(`  Total Refund Deductions:   ₹${summary.refundRupees.toLocaleString('en-IN')}`);
    console.log(`  Net Realized Revenue:      ₹${summary.netRealizedRupees.toLocaleString('en-IN')}`);
    console.log(`  Gateway Fees Paid:         ₹${summary.feeRupees.toLocaleString('en-IN')}`);
    console.log(`  Gateway Taxes Paid:        ₹${summary.taxRupees.toLocaleString('en-IN')}`);
    console.log('============================================================\n');
  } catch (err: any) {
    console.error('Fatal import error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
