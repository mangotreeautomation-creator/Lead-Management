import { env } from '../config/env';

async function inspectRazorpayLiveNotes() {
  const keyId = env.RAZORPAY_KEY_ID_VASTUWHEEL;
  const keySecret = env.RAZORPAY_KEY_SECRET_VASTUWHEEL;
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  const res = await fetch('https://api.razorpay.com/v1/payments?count=10', {
    headers: { Authorization: authHeader }
  });

  if (!res.ok) {
    console.error('Failed to fetch from Razorpay:', res.status, await res.text());
    return;
  }

  const data = await res.json() as any;
  console.log(`Fetched ${data.items?.length} payments from Razorpay:`);
  for (const item of (data.items || []).slice(0, 5)) {
    console.log('\n============================================================');
    console.log(`Payment ID: ${item.id} | Amount: ${item.amount / 100} ${item.currency} | Status: ${item.status}`);
    console.log(`Description: ${item.description}`);
    console.log(`Contact: ${item.contact} | Email: ${item.email}`);
    console.log('Notes object:', JSON.stringify(item.notes, null, 2));
  }
}

inspectRazorpayLiveNotes().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
