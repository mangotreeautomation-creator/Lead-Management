import { env } from '../config/env';

async function checkOctoberPayments() {
  const keyId = env.RAZORPAY_KEY_ID_VASTUWHEEL;
  const keySecret = env.RAZORPAY_KEY_SECRET_VASTUWHEEL;
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  // 1 Oct 2026 00:00:00 IST = 2026-09-30 18:30:00 UTC
  const oct1Sec = Math.floor(new Date('2026-09-30T18:30:00Z').getTime() / 1000);
  // 21 Oct 2026 00:00:00 IST = 2026-10-20 18:30:00 UTC
  const oct21Sec = Math.floor(new Date('2026-10-20T18:30:00Z').getTime() / 1000);
  // 20 Nov 2026 23:59:59 IST = 2026-11-20 18:29:59 UTC
  const nov20Sec = Math.floor(new Date('2026-11-20T18:29:59Z').getTime() / 1000);

  console.log(`Checking Razorpay payments for Oct 1 - Oct 21 (from: ${oct1Sec}, to: ${oct21Sec})...`);

  const url = `https://api.razorpay.com/v1/payments?from=${oct1Sec}&to=${oct21Sec}&count=10`;
  const res = await fetch(url, { headers: { Authorization: authHeader } });
  
  if (!res.ok) {
    console.error('Error fetching payments:', res.status, await res.text());
    return;
  }

  const data = await res.json() as any;
  console.log(`Oct 1-21 Payments Available: ${data.items?.length || 0} returned in first page.`);
  if (data.items?.length > 0) {
    console.log('Sample payment in early October:');
    console.log(`ID: ${data.items[0].id}, Date: ${new Date(data.items[0].created_at * 1000).toISOString()}, Amount: ${data.items[0].amount / 100}`);
  }

  // Also check full count between Oct 1 and Nov 20
  console.log(`\nChecking total payments from Oct 1 to Nov 20...`);
  let skip = 0;
  let total = 0;
  let captured = 0;
  let hasMore = true;

  while (hasMore && total < 1000) {
    const pUrl = `https://api.razorpay.com/v1/payments?from=${oct1Sec}&to=${nov20Sec}&count=100&skip=${skip}`;
    const pRes = await fetch(pUrl, { headers: { Authorization: authHeader } });
    const pData = await pRes.json() as any;
    const items = pData.items || [];
    total += items.length;
    for (const it of items) {
      if (it.status === 'captured') captured++;
    }
    if (items.length < 100) {
      hasMore = false;
    } else {
      skip += 100;
    }
  }

  console.log(`Total Payments between Oct 1, 2026 and Nov 20, 2026: ${total} attempts (${captured} captured)`);
}

checkOctoberPayments().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
