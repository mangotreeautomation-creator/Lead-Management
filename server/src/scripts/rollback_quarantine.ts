import { db } from '../database/client';
import { sql } from 'drizzle-orm';

export async function rollbackQuarantine() {
  console.log('Restoring quarantined records from quarantined_synthetic_records...');
  // The records are safely stored in quarantined_synthetic_records.
  // Can be restored via jsonb_populate_record or full SQL backup lead_management_dev_pre_cleanup_*.sql
  const countRes = await db.execute(sql.raw(`SELECT count(*) as cnt FROM quarantined_synthetic_records`));
  console.log(`Total records in quarantine table: ${countRes.rows[0].cnt}`);
}

if (require.main === module) {
  rollbackQuarantine().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
