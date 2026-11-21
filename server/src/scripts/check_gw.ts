import { db } from '../database/client';
import { gatewayAccounts, categories, companies } from '../database/schema/index';

async function check() {
  const gws = await db.select().from(gatewayAccounts);
  console.log('Gateway Accounts:', gws);

  const cats = await db.select().from(categories);
  console.log('Categories:', cats);
  await new Promise(r => setTimeout(r, 200));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
