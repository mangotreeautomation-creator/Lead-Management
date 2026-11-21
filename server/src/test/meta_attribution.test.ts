import { test, describe, after } from 'node:test';
import assert from 'node:assert';
import { db, pool } from '../database/client';
import { videoCreatives, metaCampaigns, trackingParameters, leads } from '../database/schema/index';
import { eq, sql } from 'drizzle-orm';

describe('Meta Ads & Razorpay Cross-Platform Attribution', () => {
  after(async () => {
    await pool.end();
  });

  test('video_creatives table contains genuine Meta video creatives', async () => {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(videoCreatives);
    assert.ok(Number(row.count) >= 75, `Expected at least 75 creatives, got ${row.count}`);
  });

  test('meta_campaigns table contains genuine Meta campaigns', async () => {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(metaCampaigns);
    assert.ok(Number(row.count) >= 90, `Expected at least 90 campaigns, got ${row.count}`);
  });

  test('tracking_parameters links leads with UTM campaigns and creatives', async () => {
    const [row] = await db
      .select({
        linkedLeads: sql<number>`count(distinct ${leads.id})`,
      })
      .from(trackingParameters)
      .innerJoin(leads, eq(leads.id, trackingParameters.leadId));

    assert.ok(Number(row.linkedLeads) >= 900, `Expected at least 900 linked leads, got ${row.linkedLeads}`);
  });
});
