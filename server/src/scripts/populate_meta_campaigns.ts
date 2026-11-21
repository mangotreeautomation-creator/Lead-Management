import { db } from '../database/client';
import { metaAdAccounts, metaCampaigns, trackingParameters, leads } from '../database/schema/index';
import { eq, sql, isNotNull } from 'drizzle-orm';
import crypto from 'crypto';

async function populateMetaCampaigns() {
  console.log('--- POPULATING META CAMPAIGNS FROM GENUINE TRACKING PARAMETERS ---');

  // 1. Get the Vastu Wheel ad account
  const [adAccount] = await db
    .select()
    .from(metaAdAccounts)
    .where(eq(metaAdAccounts.metaActId, 'act_845822215217013'))
    .limit(1);

  if (!adAccount) {
    throw new Error('Ad account act_845822215217013 not found in database');
  }

  // 2. Query distinct campaigns with their earliest lead date and lead count
  const campaignRows = await db
    .select({
      campaignName: trackingParameters.utmCampaign,
      earliestDate: sql<Date>`min(${leads.createdAt})`,
      totalLeads: sql<number>`count(${leads.id})`,
    })
    .from(trackingParameters)
    .innerJoin(leads, eq(leads.id, trackingParameters.leadId))
    .where(isNotNull(trackingParameters.utmCampaign))
    .groupBy(trackingParameters.utmCampaign);

  console.log(`Found ${campaignRows.length} distinct campaigns in tracking parameters.`);

  let inserted = 0;
  let updated = 0;

  for (const row of campaignRows) {
    if (!row.campaignName || row.campaignName.trim() === '') continue;

    const trimmedName = row.campaignName.trim();
    // Deterministic campaign ID based on SHA-256 of campaign name
    const hash = crypto.createHash('sha256').update(trimmedName).digest('hex').slice(0, 16);
    const metaCampId = `camp_${hash}`;

    // Objective inference based on name
    const objective = trimmedName.toLowerCase().includes('sales') || trimmedName.toLowerCase().includes('purchase')
      ? 'OUTCOME_SALES'
      : 'OUTCOME_LEADS';

    // Insert or update
    await db
      .insert(metaCampaigns)
      .values({
        adAccountId: adAccount.id,
        metaCampaignId: metaCampId,
        name: trimmedName,
        objective: objective,
        status: 'ACTIVE',
        startTime: row.earliestDate ? new Date(row.earliestDate) : new Date('2026-10-01T00:00:00Z'),
      })
      .onConflictDoUpdate({
        target: metaCampaigns.metaCampaignId,
        set: {
          name: trimmedName,
          objective: objective,
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

    inserted++;
  }

  const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(metaCampaigns);
  console.log(`Successfully populated meta_campaigns. Total campaigns in DB: ${totalCount.count}`);
}

populateMetaCampaigns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error populating meta campaigns:', err);
    process.exit(1);
  });
