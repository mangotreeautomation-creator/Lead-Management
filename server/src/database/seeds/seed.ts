import { eq } from 'drizzle-orm';
import { db, pool } from '../client';
import {
  companies,
  businessUnits,
  categories,
  products,
  landingPages,
  gatewayAccounts,
  roles,
  permissions,
  rolePermissions,
  userAccounts,
  userRoleAssignments,
  userScopes,
  customers,
  customerIdentifiers,
  leads,
  leadTouchpoints,
  paymentOrders,
  paymentAttempts,
  capturedPayments,
  metaAdAccounts,
  metaCampaigns,
  metaAdSets,
  metaAds,
  whatsappAiAccounts,
  whatsappAiConversations,
  whatsappAiMessages,
} from '../schema/index';
import { hashPassword } from '../../utils/crypto';

export async function runSeeder() {
  console.log('[Seeder] Starting LeadPulse Enterprise database seeding...');

  // 1. Companies
  console.log('[Seeder] Seeding companies...');
  const [globalInch] = await db
    .insert(companies)
    .values({
      code: 'GLOBALINCH',
      name: 'GlobalInch Technologies Pvt Ltd',
      currency: 'INR',
      status: 'ACTIVE',
    })
    .onConflictDoNothing()
    .returning();

  const [mangoTree] = await db
    .insert(companies)
    .values({
      code: 'MANGO_TREE',
      name: 'Mango Tree Technology Pvt Ltd',
      currency: 'INR',
      status: 'ACTIVE',
    })
    .onConflictDoNothing()
    .returning();

  const [vastuShikhar] = await db
    .insert(companies)
    .values({
      code: 'VASTU_SHIKHAR',
      name: 'Vastu Shikhar Foundation',
      currency: 'INR',
      status: 'ACTIVE',
    })
    .onConflictDoNothing()
    .returning();

  const compGlobalInch = globalInch || (await db.query?.companies?.findFirst?.({ where: (c: any, { eq }: any) => eq(c.code, 'GLOBALINCH') })) || (await db.select().from(companies))[0];
  const compMangoTree = mangoTree || (await db.select().from(companies))[1] || compGlobalInch;
  const compVastuShikhar = vastuShikhar || (await db.select().from(companies))[2] || compGlobalInch;

  // 2. Categories
  console.log('[Seeder] Seeding categories...');
  const [catPalmistry] = await db
    .insert(categories)
    .values({
      companyId: compGlobalInch.id,
      code: 'palmistry',
      name: 'Palmistry & Astrological Analysis',
      icon: 'Hand',
      description: 'Comprehensive palmistry analysis, birth chart synthesis, and remedial guidance.',
    })
    .onConflictDoNothing()
    .returning();

  const [catWebinar] = await db
    .insert(categories)
    .values({
      companyId: compMangoTree.id,
      code: 'vastu-webinar',
      name: 'Vastu Mastery Live Webinar',
      icon: 'Video',
      description: '2-day intensive live workshop on residential and commercial Vastu principles.',
    })
    .onConflictDoNothing()
    .returning();

  const [catConsultancy] = await db
    .insert(categories)
    .values({
      companyId: compVastuShikhar.id,
      code: 'consultancy',
      name: 'Vastu Professional Consultancy',
      icon: 'Compass',
      description: 'On-site or blueprint-based personalized architectural and energetic consultation.',
    })
    .onConflictDoNothing()
    .returning();

  const [catVastuWheel] = await db
    .insert(categories)
    .values({
      companyId: compGlobalInch.id,
      code: 'vastuwheel',
      name: 'VastuWheel Automated Reports',
      icon: 'PieChart',
      description: 'Instant algorithmic 16-zone directional analysis and diagnostic reports.',
    })
    .onConflictDoNothing()
    .returning();

  const cPalm = catPalmistry || (await db.select().from(categories))[0];
  const cWeb = catWebinar || (await db.select().from(categories))[1];
  const cCons = catConsultancy || (await db.select().from(categories))[2];
  const cWheel = catVastuWheel || (await db.select().from(categories))[3];

  // 3. Products
  console.log('[Seeder] Seeding products...');
  await db
    .insert(products)
    .values([
      {
        categoryId: cPalm.id,
        code: 'PROD_PALMISTRY_999',
        name: 'Palmistry Personal Reading & Remedy Report',
        basePricePaise: 99900, // ₹999
      },
      {
        categoryId: cWeb.id,
        code: 'PROD_VASTU_WEBINAR_499',
        name: 'Vastu Mastery 2-Day Live Masterclass',
        basePricePaise: 49900, // ₹499
      },
      {
        categoryId: cCons.id,
        code: 'PROD_CONSULTANCY_5000',
        name: 'Residential Blueprint Vastu Consultation',
        basePricePaise: 500000, // ₹5,000
      },
      {
        categoryId: cWheel.id,
        code: 'PROD_VASTUWHEEL_REPORT_1499',
        name: 'Comprehensive 16-Zone VastuWheel Report',
        basePricePaise: 149900, // ₹1,499
      },
    ])
    .onConflictDoNothing();

  // 4. Gateway Accounts (3 Razorpay Accounts)
  console.log('[Seeder] Seeding Razorpay gateway accounts...');
  const [gwVastuWheel] = await db
    .insert(gatewayAccounts)
    .values({
      companyId: compGlobalInch.id,
      categoryId: cWheel.id,
      provider: 'RAZORPAY',
      merchantId: 'acc_globalinch_vastuwheel',
      keyId: 'rzp_live_placeholder_vastuwheel',
      webhookEndpointPath: '/api/v1/webhooks/razorpay/vastuwheel-report',
      name: 'GlobalInch (VastuWheel & Palmistry) Razorpay',
    })
    .onConflictDoNothing()
    .returning();

  const [gwWebinar] = await db
    .insert(gatewayAccounts)
    .values({
      companyId: compMangoTree.id,
      categoryId: cWeb.id,
      provider: 'RAZORPAY',
      merchantId: 'acc_mangotree_webinar',
      keyId: 'rzp_live_placeholder_webinar',
      webhookEndpointPath: '/api/v1/webhooks/razorpay/vastu-webinar',
      name: 'Mango Tree Technology (Vastu Webinar) Razorpay',
    })
    .onConflictDoNothing()
    .returning();

  const [gwConsultancy] = await db
    .insert(gatewayAccounts)
    .values({
      companyId: compVastuShikhar.id,
      categoryId: cCons.id,
      provider: 'RAZORPAY',
      merchantId: 'acc_vastushikhar_consultancy',
      keyId: 'rzp_live_placeholder_consultancy',
      webhookEndpointPath: '/api/v1/webhooks/razorpay/consultancy',
      name: 'Vastu Shikhar (Consultancy) Razorpay',
    })
    .onConflictDoNothing()
    .returning();

  const gWheel = gwVastuWheel || (await db.select().from(gatewayAccounts))[0];
  const gWeb = gwWebinar || (await db.select().from(gatewayAccounts))[1];
  const gCons = gwConsultancy || (await db.select().from(gatewayAccounts))[2];

  // 5. RBAC Roles & Permissions
  console.log('[Seeder] Seeding RBAC roles and permissions...');
  const allRoles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Universal platform and system control' },
    { code: 'ADMIN', name: 'Company Administrator', description: 'Administrative control over assigned company' },
    { code: 'MANAGER', name: 'Sales & Ops Manager', description: 'Lead pipeline, team oversight and reporting' },
    { code: 'AGENT', name: 'Sales Representative', description: 'Direct customer and lead engagement' },
    { code: 'AUDITOR', name: 'Financial Auditor', description: 'Read-only financial and webhook reconciliation' },
    { code: 'READ_ONLY', name: 'Read Only Viewer', description: 'Restricted dashboard viewer' },
  ];

  for (const r of allRoles) {
    await db.insert(roles).values(r).onConflictDoNothing();
  }

  const [superAdminRole] = await db.select().from(roles).where(eq(roles.code, 'SUPER_ADMIN'));

  // 6. User Accounts
  console.log('[Seeder] Seeding administrative users...');
  const defaultPassHash = await hashPassword('Admin@2026!');
  const [adminUser] = await db
    .insert(userAccounts)
    .values({
      email: 'admin@leadpulse.io',
      passwordHash: defaultPassHash,
      fullName: 'Chief Technology Officer',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const admin = adminUser || (await db.select().from(userAccounts))[0];

  if (superAdminRole && admin) {
    await db
      .insert(userRoleAssignments)
      .values({
        userId: admin.id,
        roleId: superAdminRole.id,
      })
      .onConflictDoNothing();

    // Universal Scope
    await db
      .insert(userScopes)
      .values({
        userId: admin.id,
        companyId: null,
        categoryId: null,
        accessLevel: 'FULL',
      })
      .onConflictDoNothing();
  }

  // 7. Meta Ad Account & Campaigns
  console.log('[Seeder] Seeding Meta Marketing Ad Account & Campaigns...');
  const [adAcc] = await db
    .insert(metaAdAccounts)
    .values({
      companyId: compGlobalInch.id,
      metaActId: 'act_845822215217013',
      name: 'Vastu Wheel Lead Gen Ad Account',
      accountStatus: 1,
    })
    .onConflictDoNothing()
    .returning();

  const targetAdAcc = adAcc || (await db.select().from(metaAdAccounts))[0];

  if (targetAdAcc) {
    await db
      .insert(metaCampaigns)
      .values([
        {
          adAccountId: targetAdAcc.id,
          metaCampaignId: 'meta_camp_8458_01',
          name: 'VastuWheel 16-Zone Diagnostic - Lookalike 1%',
          objective: 'OUTCOME_LEADS',
          status: 'ACTIVE',
          dailyBudgetPaise: 350000,
        },
        {
          adAccountId: targetAdAcc.id,
          metaCampaignId: 'meta_camp_8458_02',
          name: 'Palmistry WhatsApp Lead Funnel - Video Hook',
          objective: 'OUTCOME_LEADS',
          status: 'ACTIVE',
          dailyBudgetPaise: 250000,
        },
        {
          adAccountId: targetAdAcc.id,
          metaCampaignId: 'meta_camp_8458_03',
          name: 'Vastu Masterclass Weekend Retargeting',
          objective: 'OUTCOME_SALES',
          status: 'ACTIVE',
          dailyBudgetPaise: 180000,
        },
      ])
      .onConflictDoNothing();
  }

  // 8. In-House WhatsApp AI Account
  console.log('[Seeder] Seeding In-House WhatsApp AI Portal...');
  const [waAcc] = await db
    .insert(whatsappAiAccounts)
    .values({
      companyId: compGlobalInch.id,
      phoneNumberId: 'wa_phone_default_01',
      displayPhoneNumber: '+91 98765 43210',
      name: 'LeadPulse In-House AI Portal',
      provider: 'WHATSAPP_AI_PORTAL',
      webhookUrl: 'http://localhost:4000/api/v1/webhooks/whatsapp-ai/messages',
    })
    .onConflictDoNothing()
    .returning();

  const targetWaAcc = waAcc || (await db.select().from(whatsappAiAccounts))[0];

  // 9. Landmark Ravi Kumar Case
  console.log('[Seeder] Seeding landmark Ravi Kumar ₹999 Palmistry case...');
  const [raviCustomer] = await db
    .insert(customers)
    .values({
      companyId: compGlobalInch.id,
      fullName: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      phone: '+91 98765 43210',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      totalOrders: 1,
      totalSpentPaise: 99900,
    })
    .onConflictDoNothing()
    .returning();

  const ravi = raviCustomer || (await db.select().from(customers))[0];

  if (ravi) {
    await db
      .insert(customerIdentifiers)
      .values({
        customerId: ravi.id,
        identifierType: 'PHONE',
        identifierValue: '+91 98765 43210',
        isPrimary: true,
      })
      .onConflictDoNothing();

    const [raviLead] = await db
      .insert(leads)
      .values({
        customerId: ravi.id,
        companyId: compGlobalInch.id,
        categoryId: cPalm.id,
        leadCode: 'LD-RAVI-001',
        status: 'CONVERTED',
        score: 95,
        stage: 'CLOSED_WON',
        source: 'META_ADS',
        channel: 'PAID_SOCIAL',
        notes: 'Landmark Palmistry consultation. Converted via WhatsApp AI follow-up.',
      })
      .onConflictDoNothing()
      .returning();

    const leadRavi = raviLead || (await db.select().from(leads))[0];

    if (leadRavi && gWheel) {
      const [raviOrder] = await db
        .insert(paymentOrders)
        .values({
          gatewayAccountId: gWheel.id,
          customerId: ravi.id,
          leadId: leadRavi.id,
          razorpayOrderId: 'order_ravi_palmistry_001',
          receipt: 'rcpt_ravi_001',
          amountPaise: 99900, // ₹999.00
          currency: 'INR',
          status: 'paid',
        })
        .onConflictDoNothing()
        .returning();

      const orderRavi = raviOrder || (await db.select().from(paymentOrders))[0];

      if (orderRavi) {
        await db
          .insert(paymentAttempts)
          .values({
            paymentOrderId: orderRavi.id,
            razorpayPaymentId: 'pay_ravi_palmistry_999',
            status: 'captured',
            method: 'upi',
            vpa: 'ravikumar@okhdfcbank',
            email: 'ravi.kumar@example.com',
            contact: '+91 98765 43210',
            feePaise: 2358, // ₹23.58
            taxPaise: 424, // ₹4.24
          })
          .onConflictDoNothing();

        await db
          .insert(capturedPayments)
          .values({
            paymentOrderId: orderRavi.id,
            gatewayAccountId: gWheel.id,
            razorpayPaymentId: 'pay_ravi_palmistry_999',
            amountPaise: 99900, // ₹999.00
            currency: 'INR',
            status: 'captured',
            method: 'upi',
            feePaise: 2358,
            taxPaise: 424,
            netPaise: 97118, // ₹971.18
            capturedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Touchpoints
      await db.insert(leadTouchpoints).values([
        {
          leadId: leadRavi.id,
          channel: 'META_AD',
          touchpointType: 'CLICK',
          direction: 'INBOUND',
          summary: 'Clicked on Meta Ad "Palmistry WhatsApp Lead Funnel"',
        },
        {
          leadId: leadRavi.id,
          channel: 'WHATSAPP',
          touchpointType: 'MESSAGE_RECEIVED',
          direction: 'INBOUND',
          summary: 'Inbound WhatsApp: "Hello, I want to know about my career line and financial stability"',
        },
        {
          leadId: leadRavi.id,
          channel: 'WHATSAPP',
          touchpointType: 'MESSAGE_SENT',
          direction: 'OUTBOUND',
          summary: 'AI Assistant sent diagnostic questionnaire and Palmistry booking link',
        },
        {
          leadId: leadRavi.id,
          channel: 'PAYMENT_GATEWAY',
          touchpointType: 'PAYMENT_SUCCESS',
          direction: 'INBOUND',
          summary: 'Captured payment of ₹999.00 via Razorpay (UPI: ravikumar@okhdfcbank)',
        },
      ]);
    }

    // WhatsApp conversation for Ravi
    if (targetWaAcc) {
      const [raviConvo] = await db
        .insert(whatsappAiConversations)
        .values({
          accountId: targetWaAcc.id,
          customerId: ravi.id,
          leadId: leadRavi?.id || null,
          externalConvoId: 'wa_conv_ravi_001',
          contactPhone: '+91 98765 43210',
          contactName: 'Ravi Kumar',
          stage: 'CLOSED_WON',
          intent: 'PALMISTRY_CONSULTATION',
          sentiment: 'POSITIVE',
          unreadCount: 0,
        })
        .onConflictDoNothing()
        .returning();

      const convRavi = raviConvo || (await db.select().from(whatsappAiConversations))[0];

      if (convRavi) {
        await db.insert(whatsappAiMessages).values([
          {
            conversationId: convRavi.id,
            senderType: 'CUSTOMER',
            messageType: 'text',
            content: 'Hello, I saw your ad on Instagram. I want to get my palm analyzed.',
            sentAt: new Date(Date.now() - 3600000 * 2),
          },
          {
            conversationId: convRavi.id,
            senderType: 'AI_AGENT',
            messageType: 'text',
            content:
              'Namaste Ravi Ji! Welcome to Vastu Shikhar & GlobalInch Palmistry. To get started with your detailed career and health reading, please share your dominant hand photo and date of birth.',
            aiModel: 'gpt-4o',
            tokensUsed: 65,
            sentiment: 'POSITIVE',
            sentAt: new Date(Date.now() - 3600000 * 2 + 15000),
          },
          {
            conversationId: convRavi.id,
            senderType: 'CUSTOMER',
            messageType: 'text',
            content: 'Just completed the payment of ₹999. When can I expect the full report?',
            sentAt: new Date(Date.now() - 3600000),
          },
          {
            conversationId: convRavi.id,
            senderType: 'AI_AGENT',
            messageType: 'text',
            content:
              'Thank you Ravi Ji! We have received your payment of ₹999 (ID: pay_ravi_palmistry_999). Your customized report is being generated and will be sent to your WhatsApp and email within 24 hours.',
            aiModel: 'gpt-4o',
            tokensUsed: 80,
            sentiment: 'POSITIVE',
            sentAt: new Date(Date.now() - 3600000 + 10000),
          },
        ]);
      }
    }
  }

  // 10. Seed 40 realistic leads across all 4 categories
  console.log('[Seeder] Seeding representative production leads across all categories...');
  const firstNames = ['Amit', 'Pooja', 'Suresh', 'Deepak', 'Neha', 'Vikas', 'Sunita', 'Rajesh', 'Ananya', 'Manish'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Mehta', 'Gupta', 'Singh', 'Reddy', 'Nair', 'Joshi', 'Chopra'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Chennai'];
  const catList = [
    { cat: cPalm, comp: compGlobalInch, prefix: 'PALM', price: 99900, gw: gWheel },
    { cat: cWeb, comp: compMangoTree, prefix: 'WEB', price: 49900, gw: gWeb },
    { cat: cCons, comp: compVastuShikhar, prefix: 'CONS', price: 500000, gw: gCons },
    { cat: cWheel, comp: compGlobalInch, prefix: 'VWHL', price: 149900, gw: gWheel },
  ];

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'];

  for (let i = 0; i < 40; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i + 3) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const phone = `+91 98${(10000000 + i * 1793).toString().slice(0, 8)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const city = cities[i % cities.length];
    const config = catList[i % catList.length];
    const status = statuses[i % statuses.length];
    const isConverted = status === 'CONVERTED';

    const [cust] = await db
      .insert(customers)
      .values({
        companyId: config.comp.id,
        fullName,
        email,
        phone,
        city,
        state: 'India',
        totalOrders: isConverted ? 1 : 0,
        totalSpentPaise: isConverted ? config.price : 0,
      })
      .returning();

    if (cust) {
      await db.insert(customerIdentifiers).values({
        customerId: cust.id,
        identifierType: 'PHONE',
        identifierValue: phone,
        isPrimary: true,
      });

      const [lead] = await db
        .insert(leads)
        .values({
          customerId: cust.id,
          companyId: config.comp.id,
          categoryId: config.cat.id,
          leadCode: `LD-${config.prefix}-${1000 + i}`,
          status,
          score: 60 + (i % 35),
          stage: isConverted ? 'CLOSED_WON' : 'DISCOVERY',
          source: i % 2 === 0 ? 'META_ADS' : 'WHATSAPP',
          channel: 'PAID_SOCIAL',
        })
        .returning();

      if (lead && isConverted && config.gw) {
        const [order] = await db
          .insert(paymentOrders)
          .values({
            gatewayAccountId: config.gw.id,
            customerId: cust.id,
            leadId: lead.id,
            razorpayOrderId: `order_${config.prefix.toLowerCase()}_${1000 + i}`,
            amountPaise: config.price,
            currency: 'INR',
            status: 'paid',
          })
          .returning();

        if (order) {
          const feePaise = Math.round(config.price * 0.02);
          const taxPaise = Math.round(feePaise * 0.18);
          const netPaise = config.price - feePaise - taxPaise;

          await db.insert(capturedPayments).values({
            paymentOrderId: order.id,
            gatewayAccountId: config.gw.id,
            razorpayPaymentId: `pay_${config.prefix.toLowerCase()}_${1000 + i}`,
            amountPaise: config.price,
            currency: 'INR',
            status: 'captured',
            method: i % 2 === 0 ? 'upi' : 'card',
            feePaise,
            taxPaise,
            netPaise,
            capturedAt: new Date(Date.now() - i * 86400000),
          });
        }
      }
    }
  }

  console.log('[Seeder] Database seeding completed successfully! 🎉');
}

// Allow direct CLI execution: npx tsx src/database/seeds/seed.ts
if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  runSeeder()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seeder Error]', err);
      await pool.end();
      process.exit(1);
    });
}
