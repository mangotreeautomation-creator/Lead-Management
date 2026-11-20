import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  metaAdAccounts,
  metaCampaigns,
  metaAdSets,
  metaAds,
  metaInsightsDaily,
  metaSyncRuns,
  metaSyncErrors,
  companies,
} from '../../database/schema/index';
import { env } from '../../config/env';

export class MetaAdsService {
  /**
   * Check connection status of Meta Marketing API
   */
  async getConnectionStatus() {
    const hasToken = !!env.META_SYSTEM_USER_ACCESS_TOKEN && env.META_SYSTEM_USER_ACCESS_TOKEN.length > 20;

    const [lastSync] = await db
      .select()
      .from(metaSyncRuns)
      .orderBy(desc(metaSyncRuns.startedAt))
      .limit(1);

    const [account] = await db
      .select()
      .from(metaAdAccounts)
      .where(eq(metaAdAccounts.metaActId, env.META_AD_ACCOUNT_ID))
      .limit(1);

    return {
      connected: hasToken,
      mode: hasToken ? 'LIVE_GRAPH_API' : 'MOCK_SANDBOX',
      adAccountId: env.META_AD_ACCOUNT_ID,
      apiVersion: env.META_GRAPH_API_VERSION,
      accountName: account?.name || 'Vastu Wheel Lead Gen Ad Account',
      lastSync: lastSync
        ? {
            id: lastSync.id,
            status: lastSync.status,
            recordsFetched: lastSync.recordsFetched,
            recordsUpdated: lastSync.recordsUpdated,
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
          }
        : null,
    };
  }

  /**
   * Synchronize campaigns and insights from Meta Graph API v21.0 (or mock sync if token not provided)
   */
  async syncMetaAds(): Promise<{ success: boolean; mode: string; syncRunId: string; fetched: number; updated: number }> {
    // 1. Ensure target ad account exists in database
    let account = (
      await db
        .select()
        .from(metaAdAccounts)
        .where(eq(metaAdAccounts.metaActId, env.META_AD_ACCOUNT_ID))
        .limit(1)
    )[0];

    if (!account) {
      const [comp] = await db.select().from(companies).limit(1);
      if (!comp) {
        throw new Error('No company found to associate with Meta Ad Account');
      }
      const [newAcc] = await db
        .insert(metaAdAccounts)
        .values({
          companyId: comp.id,
          metaActId: env.META_AD_ACCOUNT_ID,
          name: 'Vastu Wheel Lead Gen Ad Account',
          accountStatus: 1,
        })
        .returning();
      account = newAcc;
    }

    // 2. Start sync run
    const [syncRun] = await db
      .insert(metaSyncRuns)
      .values({
        adAccountId: account.id,
        syncType: 'FULL',
        status: 'RUNNING',
      })
      .returning();

    const isLive = !!env.META_SYSTEM_USER_ACCESS_TOKEN && env.META_SYSTEM_USER_ACCESS_TOKEN.length > 20;

    try {
      if (isLive) {
        // --- REAL META GRAPH API v21.0 CALL ---
        const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${env.META_AD_ACCOUNT_ID}/campaigns?fields=id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time&access_token=${env.META_SYSTEM_USER_ACCESS_TOKEN}`;
        const response = await fetch(url);
        const data = (await response.json()) as any;

        if (data.error) {
          throw new Error(`Meta API error: ${data.error.message} (Code: ${data.error.code})`);
        }

        let updated = 0;
        const campaignsData = data.data || [];

        for (const c of campaignsData) {
          await db
            .insert(metaCampaigns)
            .values({
              adAccountId: account.id,
              metaCampaignId: c.id,
              name: c.name,
              objective: c.objective || 'OUTCOME_LEADS',
              status: c.status || 'ACTIVE',
              dailyBudgetPaise: c.daily_budget ? parseInt(c.daily_budget, 10) : null,
              lifetimeBudgetPaise: c.lifetime_budget ? parseInt(c.lifetime_budget, 10) : null,
              startTime: c.start_time ? new Date(c.start_time) : null,
              stopTime: c.stop_time ? new Date(c.stop_time) : null,
            })
            .onConflictDoUpdate({
              target: metaCampaigns.metaCampaignId,
              set: {
                name: c.name,
                status: c.status,
                dailyBudgetPaise: c.daily_budget ? parseInt(c.daily_budget, 10) : null,
                updatedAt: new Date(),
              },
            });
          updated++;
        }

        await db
          .update(metaSyncRuns)
          .set({
            status: 'SUCCESS',
            recordsFetched: campaignsData.length,
            recordsUpdated: updated,
            completedAt: new Date(),
          })
          .where(eq(metaSyncRuns.id, syncRun.id));

        return {
          success: true,
          mode: 'LIVE_GRAPH_API',
          syncRunId: syncRun.id,
          fetched: campaignsData.length,
          updated,
        };
      } else {
        // --- DETERMINISTIC MOCK SYNC (WHEN LIVE CREDENTIALS NOT PROVIDED) ---
        const mockCampaigns = [
          {
            id: 'meta_camp_101',
            name: 'VastuWheel Direct Report - Lead Gen Broad',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            dailyBudget: 250000, // ₹2,500/day
          },
          {
            id: 'meta_camp_102',
            name: 'Palmistry WhatsApp Click-to-Chat Funnel',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            dailyBudget: 150000, // ₹1,500/day
          },
          {
            id: 'meta_camp_103',
            name: 'Vastu Webinar Weekend Masterclass Video Views',
            objective: 'OUTCOME_SALES',
            status: 'ACTIVE',
            dailyBudget: 200000, // ₹2,000/day
          },
        ];

        let updated = 0;
        for (const c of mockCampaigns) {
          await db
            .insert(metaCampaigns)
            .values({
              adAccountId: account.id,
              metaCampaignId: c.id,
              name: c.name,
              objective: c.objective,
              status: c.status,
              dailyBudgetPaise: c.dailyBudget,
            })
            .onConflictDoUpdate({
              target: metaCampaigns.metaCampaignId,
              set: {
                name: c.name,
                status: c.status,
                dailyBudgetPaise: c.dailyBudget,
                updatedAt: new Date(),
              },
            });
          updated++;
        }

        await db
          .update(metaSyncRuns)
          .set({
            status: 'SUCCESS',
            recordsFetched: mockCampaigns.length,
            recordsUpdated: updated,
            completedAt: new Date(),
          })
          .where(eq(metaSyncRuns.id, syncRun.id));

        return {
          success: true,
          mode: 'MOCK_SANDBOX',
          syncRunId: syncRun.id,
          fetched: mockCampaigns.length,
          updated,
        };
      }
    } catch (err: any) {
      await db
        .update(metaSyncRuns)
        .set({
          status: 'FAILED',
          errorDetails: err.message,
          completedAt: new Date(),
        })
        .where(eq(metaSyncRuns.id, syncRun.id));

      await db.insert(metaSyncErrors).values({
        syncRunId: syncRun.id,
        errorCode: 'SYNC_ERROR',
        message: err.message,
      });

      throw err;
    }
  }

  /**
   * List campaigns with accumulated metrics
   */
  async listCampaigns() {
    return db
      .select({
        id: metaCampaigns.id,
        metaCampaignId: metaCampaigns.metaCampaignId,
        name: metaCampaigns.name,
        objective: metaCampaigns.objective,
        status: metaCampaigns.status,
        dailyBudgetPaise: metaCampaigns.dailyBudgetPaise,
        createdAt: metaCampaigns.createdAt,
      })
      .from(metaCampaigns)
      .orderBy(desc(metaCampaigns.createdAt));
  }
}

export const metaAdsService = new MetaAdsService();
