import { env } from '../config/env';

async function verifyMeta() {
  console.log('\n--- 1. VERIFYING META MARKETING API ---');
  const token = env.META_SYSTEM_USER_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID;
  const version = env.META_GRAPH_API_VERSION;

  if (!token || token.length < 20) {
    return { ok: false, error: 'Meta access token is missing or too short.' };
  }

  // Redacted preview
  const maskedToken = `${token.slice(0, 8)}...${token.slice(-6)}`;
  console.log(`Checking Ad Account: ${adAccountId} with token [${maskedToken}]`);

  try {
    // 1. Fetch Account Details
    const accUrl = `https://graph.facebook.com/${version}/${adAccountId}?fields=id,name,account_status,currency,timezone_name,business_name&access_token=${token}`;
    const accRes = await fetch(accUrl);
    const accData = (await accRes.json()) as any;

    if (accData.error) {
      return {
        ok: false,
        error: `Meta API Error (${accData.error.code}): ${accData.error.message}`,
        details: accData.error,
      };
    }

    console.log(`✔ Meta Ad Account Connected!`);
    console.log(`  - Account ID: ${accData.id}`);
    console.log(`  - Name: ${accData.name}`);
    console.log(`  - Currency: ${accData.currency}`);
    console.log(`  - Timezone: ${accData.timezone_name}`);
    console.log(`  - Account Status: ${accData.account_status === 1 ? 'ACTIVE (1)' : accData.account_status}`);

    // 2. Fetch Sample Campaigns (Limit 5)
    const campUrl = `https://graph.facebook.com/${version}/${adAccountId}/campaigns?limit=5&fields=id,name,objective,status,created_time&access_token=${token}`;
    const campRes = await fetch(campUrl);
    const campData = (await campRes.json()) as any;

    const sampleCampaigns = (campData.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      objective: c.objective,
      status: c.status,
      created_time: c.created_time,
    }));

    console.log(`✔ Campaigns Sample Retrieved (${sampleCampaigns.length} items):`);
    sampleCampaigns.forEach((c: any, i: number) => {
      console.log(`    [${i + 1}] ID: ${c.id} | Name: "${c.name}" | Status: ${c.status} | Objective: ${c.objective}`);
    });

    return {
      ok: true,
      account: {
        id: accData.id,
        name: accData.name,
        currency: accData.currency,
        timezone: accData.timezone_name,
        status: accData.account_status,
      },
      campaignCountInSample: sampleCampaigns.length,
      sampleCampaigns,
    };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

async function verifyRazorpay() {
  console.log('\n--- 2. VERIFYING RAZORPAY READ-ONLY API ---');
  const keyId = env.RAZORPAY_KEY_ID_VASTUWHEEL;
  const keySecret = env.RAZORPAY_KEY_SECRET_VASTUWHEEL;

  if (!keyId || keyId.includes('placeholder') || !keySecret || keySecret.includes('placeholder')) {
    return { ok: false, error: 'Razorpay credentials missing or placeholder.' };
  }

  const maskedKey = `${keyId.slice(0, 8)}...${keyId.slice(-4)}`;
  console.log(`Checking Razorpay Key ID: [${maskedKey}]`);

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  try {
    // Read-only GET request for 5 payment records
    const res = await fetch('https://api.razorpay.com/v1/payments?count=5', {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { ok: false, error: `Razorpay HTTP ${res.status}: ${errBody}` };
    }

    const data = (await res.json()) as any;
    const items = data.items || [];

    console.log(`✔ Razorpay Authenticated Successfully!`);
    console.log(`  - Total Available Payments Count: ${data.count}`);
    console.log(`  - Sample Records Retrieved: ${items.length}`);

    const sample = items.map((p: any) => ({
      id: p.id,
      amountRupees: p.amount / 100,
      currency: p.currency,
      status: p.status,
      method: p.method,
      createdAt: new Date(p.created_at * 1000).toISOString(),
      notes: p.notes,
      description: p.description,
    }));

    sample.forEach((p: any, i: number) => {
      console.log(`    [${i + 1}] ID: ${p.id} | Amount: ₹${p.amountRupees} | Status: ${p.status} | Method: ${p.method} | Date: ${p.createdAt}`);
    });

    return {
      ok: true,
      totalCount: data.count,
      samplePayments: sample,
    };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('============================================================');
  console.log('LEADPULSE ENTERPRISE: READ-ONLY PROVIDER VERIFICATION');
  console.log('============================================================');

  const metaResult = await verifyMeta();
  const rzpResult = await verifyRazorpay();

  console.log('\n============================================================');
  console.log('VERIFICATION SUMMARY');
  console.log(`Meta Marketing API: ${metaResult.ok ? 'SUCCESS' : 'FAILED - ' + metaResult.error}`);
  console.log(`Razorpay API:       ${rzpResult.ok ? 'SUCCESS' : 'FAILED - ' + rzpResult.error}`);
  console.log('============================================================\n');

  if (!metaResult.ok || !rzpResult.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
