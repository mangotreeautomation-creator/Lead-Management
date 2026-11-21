import { env } from '../config/env';

function parseRazorpayNotes(p: any) {
  const rawNotes = p.notes || {};
  const email = (rawNotes.email_id ? rawNotes.email_id.toLowerCase().trim() : null) || (p.email ? p.email.toLowerCase().trim() : null);
  const fullName = rawNotes.full_name?.trim() || rawNotes.name?.trim() || (email ? email.split('@')[0] : 'VastuWheel Customer');
  
  let rawPhone = rawNotes.phone_number || p.contact || '';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = `+91${cleanPhone}`;
  else if (cleanPhone.length > 10 && !cleanPhone.startsWith('+')) cleanPhone = `+${cleanPhone}`;

  let utmObj: any = {};
  if (rawNotes.utm_details) {
    if (typeof rawNotes.utm_details === 'string') {
      try {
        utmObj = JSON.parse(rawNotes.utm_details);
      } catch {
        utmObj = {};
      }
    } else if (typeof rawNotes.utm_details === 'object') {
      utmObj = rawNotes.utm_details;
    }
  }

  const utmSource = utmObj.utm_source || rawNotes.utm_source || 'FB';
  const utmMedium = utmObj.utm_medium || rawNotes.utm_medium || null;
  const utmCampaign = utmObj.utm_campaign || rawNotes.utm_campaign || (rawNotes.route ? `VW_${rawNotes.route}` : null);
  const utmTerm = utmObj.utm_term || rawNotes.utm_term || null;
  const utmContent = utmObj.utm_content || rawNotes.utm_content || null;

  return {
    fullName,
    email,
    phone: cleanPhone || p.contact,
    uniqueCustomerId: rawNotes.unique_customer_id || null,
    paymentType: rawNotes.payment_type || 'vastu_report',
    product: rawNotes.product || 'report',
    propertyType: rawNotes.property_type || null,
    reportLanguage: rawNotes.report_language || null,
    entranceDirection: rawNotes.entrance_direction || null,
    route: rawNotes.route || rawNotes.campaign || null,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    rawNotes,
  };
}

async function testParser() {
  const keyId = env.RAZORPAY_KEY_ID_VASTUWHEEL;
  const keySecret = env.RAZORPAY_KEY_SECRET_VASTUWHEEL;
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  const res = await fetch('https://api.razorpay.com/v1/payments?count=5', {
    headers: { Authorization: authHeader }
  });
  const data = await res.json() as any;

  console.log('Testing Enhanced Notes Parser on 5 Live Payments:');
  for (const item of data.items || []) {
    const parsed = parseRazorpayNotes(item);
    console.log('\n------------------------------------------------------------');
    console.log(`Payment: ${item.id} | Amount: ₹${item.amount / 100} | Status: ${item.status}`);
    console.log(`Customer Full Name: "${parsed.fullName}" (Clean Phone: ${parsed.phone})`);
    console.log(`Unique Cust ID:     ${parsed.uniqueCustomerId}`);
    console.log(`Product / Type:     ${parsed.product} / ${parsed.paymentType}`);
    console.log(`Language / Prop:    ${parsed.reportLanguage} / ${parsed.propertyType}`);
    console.log(`UTM Campaign:       "${parsed.utmCampaign}"`);
    console.log(`UTM Creative Name:  "${parsed.utmContent}"`);
    console.log(`UTM Medium / Term:  ${parsed.utmMedium} / ${parsed.utmTerm}`);
  }
}

testParser().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
