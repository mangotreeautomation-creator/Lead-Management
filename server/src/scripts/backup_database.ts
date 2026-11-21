import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `lead_management_dev_pre_cleanup_${timestamp}.sql`);
  const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe';

  console.log(`Starting PostgreSQL backup...`);
  console.log(`Target: ${backupFilePath}`);

  const env = {
    ...process.env,
    PGPASSWORD: process.env.DB_PASSWORD || 'dev_secret_lead_pass_2026',
  };

  const cmd = `"${pgDumpPath}" -h localhost -p 5432 -U lead_app_user -d lead_management_dev --no-owner --no-privileges -F p -f "${backupFilePath}"`;

  try {
    execSync(cmd, { env, stdio: 'inherit' });
    const stats = fs.statSync(backupFilePath);
    console.log(`✔ Database backup successful!`);
    console.log(`  File: ${backupFilePath}`);
    console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);
  } catch (err: any) {
    console.error(`❌ Backup failed:`, err.message);
    process.exit(1);
  }
}

performBackup().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
