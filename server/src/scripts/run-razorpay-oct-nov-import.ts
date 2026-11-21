import { db } from '../database/client';
import {
  gatewayAccounts,
  paymentOrders,
  paymentAttempts,
  capturedPayments,
  refunds,
  customers,
  customerIdentifiers,
  leads,
  trackingParameters,
  videoCreatives,
  companies,
  categories,
} from '../database/schema/index';
import { eq, and, sql } from 'drizzle-orm';
import { env } from '../config/env';
import crypto from 'crypto';

function cleanUtmString(val: any): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
  return s;
}

export function parseRazorpayNotes(p: any) {
  const rawNotes = p.notes || {};
  const email = (rawNotes.email_id ? String(rawNotes.email_id).toLowerCase().trim() : null) || (p.email ? String(p.email).toLowerCase().trim() : null);
  const fullName = rawNotes.full_name?.trim() || rawNotes.name?.trim() || (email ? email.split('@')[0] : 'VastuWheel Customer');

  let rawPhone = rawNotes.phone_number || p.contact || '';
  let cleanPhone = String(rawPhone).replace(/\D/g, '');
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

  const utmSource = cleanUtmString(utmObj.utm_source || rawNotes.utm_source) || 'FB';
  const utmMedium = cleanUtmString(utmObj.utm_medium || rawNotes.utm_medium);
  const utmCampaign = cleanUtmString(utmObj.utm_campaign || rawNotes.utm_campaign) || (rawNotes.route ? `VW_${rawNotes.route}` : null);
  const utmTerm = cleanUtmString(utmObj.utm_term || rawNotes.utm_term);
  const utmContent = cleanUtmString(utmObj.utm_content || rawNotes.utm_content);

  return {
    fullName,
    email,
    phone: cleanPhone || (p.contact ? String(p.contact).trim() : '+910000000000'),
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

export async function runExpandedRazorpayImport() {
  console.log('================================================================================');
  console.log('🚀 STARTING EXPANDED RAZORPAY IMPORT: OCT 1, 2026 - NOV 20, 2026');
  console.log('================================================================================');

  const keyId = env.RAZORPAY_KEY_ID_VASTUWHEEL;
  const keySecret = env.RAZORPAY_KEY_SECRET_VASTUWHEEL;

  if (!keyId || !keySecret) {
    throw new Error('Missing RAZORPAY_KEY_ID_VASTUWHEEL or RAZORPAY_KEY_SECRET_VASTUWHEEL');
  }

  // 1. Resolve Company & Category
  const [company] = await db.select().from(companies).where(eq(companies.code, 'GLOBALINCH')).limit(1);
  if (!company) throw new Error('Company GLOBALINCH not found.');

  const [category] = await db.select().from(categories).where(eq(categories.code, 'vastuwheel')).limit(1);
  if (!category) throw new Error('Category vastuwheel not found.');

  // Update / ensure gateway account has categoryId
  let [gwAccount] = await db
    .select()
    .from(gatewayAccounts)
    .where(eq(gatewayAccounts.keyId, keyId))
    .limit(1);

  if (gwAccount) {
    if (!gwAccount.categoryId) {
      await db
        .update(gatewayAccounts)
        .set({ categoryId: category.id, updatedAt: new Date() })
        .where(eq(gatewayAccounts.id, gwAccount.id));
      gwAccount.categoryId = category.id;
    }
  } else {
    const [createdGw] = await db
      .insert(gatewayAccounts)
      .values({
        companyId: company.id,
        categoryId: category.id,
        provider: 'RAZORPAY',
        merchantId: 'acc_globalinch_vastuwheel',
        keyId,
        webhookEndpointPath: '/api/v1/webhooks/razorpay/vastuwheel-report',
        name: 'GlobalInch VastuWheel Razorpay',
        isActive: true,
      })
      .returning();
    gwAccount = createdGw;
  }

  console.log(`Using Gateway Account: ${gwAccount.id} | Category: ${gwAccount.categoryId}`);

  async function fetchWithRetry(url: string, options: any, maxRetries = 5): Promise<Response> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return res;
      } catch (err: any) {
        attempt++;
        console.warn(`  ⚠️ Fetch attempt ${attempt}/${maxRetries} failed: ${err.message}. Retrying in ${attempt * 2000}ms...`);
        if (attempt >= maxRetries) throw err;
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }
    throw new Error('Fetch failed after max retries');
  }

  // Time boundaries: Oct 1 2026 00:00:00 IST to Nov 20 2026 23:59:59 IST
  const fromSec = 1790793000;
  const toSec = 1795199399;

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
  const count = 100;
  let skip = 0;
  let hasMore = true;

  let totalApiFetched = 0;
  let totalApiCaptured = 0;
  let totalApiCapturedPaise = 0;
  let totalApiFailed = 0;
  let totalTrackingCreated = 0;
  const uniqueCreativesMap = new Map<string, string>();

  console.log(`📡 Fetching from Razorpay API between timestamps ${fromSec} and ${toSec}...`);

  while (hasMore) {
    const url = `https://api.razorpay.com/v1/payments?from=${fromSec}&to=${toSec}&count=${count}&skip=${skip}`;
    const res = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay API responded with ${res.status}: ${errText}`);
    }

    const body = (await res.json()) as any;
    const items = body.items || [];
    totalApiFetched += items.length;

    console.log(`  Fetched page: skip=${skip}, count=${items.length} (total so far: ${totalApiFetched})`);

    for (const p of items) {
      const isCaptured = p.status === 'captured';
      if (isCaptured) {
        totalApiCaptured++;
        totalApiCapturedPaise += p.amount;
      } else {
        totalApiFailed++;
      }

      const parsed = parseRazorpayNotes(p);

      // Track creative if valid
      if (parsed.utmContent) {
        const cTitle = parsed.utmContent;
        const cId = `cr_${crypto.createHash('md5').update(cTitle).digest('hex').slice(0, 24)}`;
        uniqueCreativesMap.set(cTitle, cId);
      }

      // 1. Resolve or Create Customer
      let customerId: string | null = null;
      let existingCust: any = null;

      if (parsed.phone && parsed.phone !== '+910000000000') {
        const [cById] = await db
          .select({ customerId: customerIdentifiers.customerId })
          .from(customerIdentifiers)
          .where(eq(customerIdentifiers.identifierValue, parsed.phone))
          .limit(1);
        if (cById) {
          const [c] = await db.select().from(customers).where(eq(customers.id, cById.customerId)).limit(1);
          existingCust = c;
        }
      }

      if (!existingCust && parsed.email) {
        const [cById] = await db
          .select({ customerId: customerIdentifiers.customerId })
          .from(customerIdentifiers)
          .where(eq(customerIdentifiers.identifierValue, parsed.email))
          .limit(1);
        if (cById) {
          const [c] = await db.select().from(customers).where(eq(customers.id, cById.customerId)).limit(1);
          existingCust = c;
        }
      }

      if (existingCust) {
        customerId = existingCust.id;
        if (parsed.fullName && parsed.fullName !== 'VastuWheel Customer' && existingCust.fullName === 'VastuWheel Customer') {
          await db
            .update(customers)
            .set({ fullName: parsed.fullName, updatedAt: new Date() })
            .where(eq(customers.id, existingCust.id));
        }
      } else {
        const [newCust] = await db
          .insert(customers)
          .values({
            companyId: gwAccount.companyId,
            fullName: parsed.fullName,
            email: parsed.email,
            phone: parsed.phone,
            city: parsed.rawNotes?.city || 'India',
            state: 'India',
            country: 'India',
            totalOrders: isCaptured ? 1 : 0,
            totalSpentPaise: isCaptured ? p.amount : 0,
            createdAt: new Date(p.created_at * 1000),
          })
          .onConflictDoNothing()
          .returning();

        if (newCust) {
          customerId = newCust.id;
          if (parsed.phone && parsed.phone !== '+910000000000') {
            await db
              .insert(customerIdentifiers)
              .values({
                customerId: newCust.id,
                identifierType: 'PHONE',
                identifierValue: parsed.phone,
                isPrimary: true,
              })
              .onConflictDoNothing();
          }
          if (parsed.email) {
            await db
              .insert(customerIdentifiers)
              .values({
                customerId: newCust.id,
                identifierType: 'EMAIL',
                identifierValue: parsed.email,
                isPrimary: !parsed.phone,
              })
              .onConflictDoNothing();
          }
        }
      }

      // 2. Resolve or Create Lead
      let leadId: string | null = null;
      if (customerId && gwAccount.categoryId) {
        const leadCode = `LD-VWHL-${p.id.slice(-8).toUpperCase()}`;

        let [existingLead] = await db
          .select()
          .from(leads)
          .where(eq(leads.leadCode, leadCode))
          .limit(1);

        if (!existingLead) {
          const [newLead] = await db
            .insert(leads)
            .values({
              customerId,
              companyId: gwAccount.companyId,
              categoryId: gwAccount.categoryId,
              leadCode,
              status: isCaptured ? 'CONVERTED' : 'NEW',
              score: isCaptured ? 90 : 40,
              stage: isCaptured ? 'CLOSED_WON' : 'DISCOVERY',
              source: 'META_ADS',
              channel: 'PAID_SOCIAL',
              metadata: {
                uniqueCustomerId: parsed.uniqueCustomerId,
                product: parsed.product,
                paymentType: parsed.paymentType,
                propertyType: parsed.propertyType,
                reportLanguage: parsed.reportLanguage,
                entranceDirection: parsed.entranceDirection,
                utmSource: parsed.utmSource,
                utmMedium: parsed.utmMedium,
                utmCampaign: parsed.utmCampaign,
                utmContent: parsed.utmContent,
                utmTerm: parsed.utmTerm,
              },
              createdAt: new Date(p.created_at * 1000),
            })
            .onConflictDoNothing()
            .returning();
          existingLead = newLead;
        }

        if (existingLead) {
          leadId = existingLead.id;

          // Save tracking parameters if utm present
          if (parsed.utmSource || parsed.utmCampaign || parsed.utmContent) {
            const [existingTrack] = await db
              .select()
              .from(trackingParameters)
              .where(eq(trackingParameters.leadId, existingLead.id))
              .limit(1);

            if (!existingTrack) {
              await db
                .insert(trackingParameters)
                .values({
                  leadId: existingLead.id,
                  utmSource: parsed.utmSource,
                  utmMedium: parsed.utmMedium,
                  utmCampaign: parsed.utmCampaign,
                  utmContent: parsed.utmContent,
                  utmTerm: parsed.utmTerm,
                  createdAt: new Date(p.created_at * 1000),
                })
                .onConflictDoNothing();
              totalTrackingCreated++;
            }
          }
        }
      }

      // 3. Upsert Payment Order
      const rzpOrderId = p.order_id || `order_backfill_${p.id}`;
      let [order] = await db
        .select()
        .from(paymentOrders)
        .where(eq(paymentOrders.razorpayOrderId, rzpOrderId))
        .limit(1);

      if (!order) {
        const [newOrder] = await db
          .insert(paymentOrders)
          .values({
            gatewayAccountId: gwAccount.id,
            customerId,
            leadId,
            razorpayOrderId: rzpOrderId,
            amountPaise: p.amount,
            currency: p.currency || 'INR',
            status: isCaptured ? 'paid' : p.status,
            notes: p.notes,
            createdAt: new Date(p.created_at * 1000),
          })
          .onConflictDoNothing()
          .returning();
        order = newOrder;
      } else if (leadId && !order.leadId) {
        await db.update(paymentOrders).set({ leadId }).where(eq(paymentOrders.id, order.id));
      }

      if (order) {
        // 4. Upsert Payment Attempt
        await db
          .insert(paymentAttempts)
          .values({
            paymentOrderId: order.id,
            razorpayPaymentId: p.id,
            status: p.status,
            method: p.method,
            vpa: p.vpa,
            email: p.email,
            contact: p.contact,
            feePaise: p.fee || 0,
            taxPaise: p.tax || 0,
            errorCode: p.error_code,
            errorDescription: p.error_description,
            createdAt: new Date(p.created_at * 1000),
          })
          .onConflictDoNothing();

        // 5. Upsert Captured Payment
        if (isCaptured) {
          const fee = p.fee || 0;
          const tax = p.tax || 0;
          const net = p.amount - fee - tax;

          await db
            .insert(capturedPayments)
            .values({
              paymentOrderId: order.id,
              gatewayAccountId: gwAccount.id,
              razorpayPaymentId: p.id,
              amountPaise: p.amount,
              currency: p.currency || 'INR',
              status: 'captured',
              method: p.method,
              feePaise: fee,
              taxPaise: tax,
              netPaise: net,
              capturedAt: new Date(p.created_at * 1000),
              rzpCreatedAt: new Date(p.created_at * 1000),
            })
            .onConflictDoNothing();
        }
      }
    }

    if (items.length < count) {
      hasMore = false;
    } else {
      skip += count;
    }
  }

  // 6. Upsert Video Creatives discovered
  console.log(`\n🎬 Upserting ${uniqueCreativesMap.size} distinct Video Creatives discovered from utm_content...`);
  for (const [title, metaCreativeId] of Array.from(uniqueCreativesMap.entries())) {
    await db
      .insert(videoCreatives)
      .values({
        metaCreativeId,
        title,
        hookType: 'Problem-Agitate',
        aspectRatio: '9:16',
      })
      .onConflictDoNothing();
  }

  // 7. Fetch and Upsert Refunds for the full window
  console.log(`\n💳 Fetching Refunds for Oct 1 - Nov 20...`);
  const refUrl = `https://api.razorpay.com/v1/refunds?from=${fromSec}&to=${toSec}&count=100`;
  const refRes = await fetchWithRetry(refUrl, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
  });

  let totalApiRefunds = 0;
  let totalApiRefundPaise = 0;

  if (refRes.ok) {
    const refBody = (await refRes.json()) as any;
    const refItems = refBody.items || [];
    totalApiRefunds = refItems.length;

    for (const r of refItems) {
      totalApiRefundPaise += r.amount;

      let [capture] = await db
        .select()
        .from(capturedPayments)
        .where(eq(capturedPayments.razorpayPaymentId, r.payment_id))
        .limit(1);

      if (capture) {
        await db
          .insert(refunds)
          .values({
            capturedPaymentId: capture.id,
            razorpayRefundId: r.id,
            amountPaise: r.amount,
            status: r.status || 'processed',
            reason: r.notes?.reason || 'Customer request',
            createdAt: new Date(r.created_at * 1000),
          })
          .onConflictDoNothing();
      }
    }
  }

  // 8. Reconcile with Database
  const dbCapturesRes = await db.execute(sql.raw(`
    SELECT count(*) as count, coalesce(sum(amount_paise), 0) as total_paise
    FROM captured_payments
  `));
  const dbCustomersRes = await db.execute(sql.raw(`SELECT count(*) as count FROM customers`));
  const dbLeadsRes = await db.execute(sql.raw(`SELECT count(*) as count FROM leads`));
  const dbRefundsRes = await db.execute(sql.raw(`
    SELECT count(*) as count, coalesce(sum(amount_paise), 0) as total_paise
    FROM refunds
  `));
  const dbCreativesRes = await db.execute(sql.raw(`SELECT count(*) as count FROM video_creatives`));
  const dbTrackingRes = await db.execute(sql.raw(`SELECT count(*) as count FROM tracking_parameters`));

  const capRow = dbCapturesRes.rows[0] as any;
  const dbCaptures = parseInt(String(capRow?.count || 0), 10);
  const dbCapturedRupees = (parseInt(String(capRow?.total_paise || 0), 10) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  const apiCapturedRupees = (totalApiCapturedPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  console.log('\n================================================================================');
  console.log('📊 RECONCILIATION REPORT: OCT 1 - NOV 20, 2026');
  console.log('================================================================================');
  console.log(`Razorpay API Total Fetched:     ${totalApiFetched} payments`);
  console.log(`Razorpay API Captured Count:    ${totalApiCaptured}`);
  console.log(`Razorpay API Captured Volume:   ${apiCapturedRupees}`);
  console.log(`Razorpay API Failed Count:      ${totalApiFailed}`);
  console.log(`Razorpay API Refund Count:      ${totalApiRefunds}`);
  console.log('--------------------------------------------------------------------------------');
  console.log(`PostgreSQL Captured Payments:   ${dbCaptures} (Amount: ${dbCapturedRupees})`);
  console.log(`PostgreSQL Customers:           ${dbCustomersRes.rows[0].count}`);
  console.log(`PostgreSQL Leads:               ${dbLeadsRes.rows[0].count}`);
  console.log(`PostgreSQL Tracking Params:     ${dbTrackingRes.rows[0].count}`);
  console.log(`PostgreSQL Video Creatives:     ${dbCreativesRes.rows[0].count}`);
  console.log(`PostgreSQL Refunds:             ${dbRefundsRes.rows[0].count}`);
  console.log('================================================================================\n');

  await new Promise(r => setTimeout(r, 200));

  return {
    totalApiFetched,
    totalApiCaptured,
    totalApiCapturedPaise,
    dbCaptures,
    dbCapturedRupees,
  };
}

if (require.main === module) {
  runExpandedRazorpayImport().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
