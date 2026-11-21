import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  metaAdAccounts,
  metaCampaigns,
  metaAdSets,
  metaAds,
  metaInsightsDaily,
  metaInsightsRealtime,
  metaSyncRuns,
  metaSyncErrors,
  companies,
} from '../../database/schema/index';
import { env } from '../../config/env';
import {
  extractAllMetaMetrics,
  RawMetaInsightRecord,
  ExtractedMetaMetrics,
} from './meta-metrics.extractor';

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

    const [realtimeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(metaInsightsRealtime);

    const [dailyCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(metaInsightsDaily);

    return {
      connected: hasToken,
      mode: hasToken ? 'LIVE_GRAPH_API' : 'MOCK_SANDBOX',
      adAccountId: env.META_AD_ACCOUNT_ID,
      apiVersion: env.META_GRAPH_API_VERSION,
      accountName: account?.name || 'Vastu Wheel Lead Gen Ad Account',
      recordsStored: {
        realtimeInsightsToday: Number(realtimeCount?.count || 0),
        dailyHistoricalInsights: Number(dailyCount?.count || 0),
      },
      lastSync: lastSync
        ? {
            id: lastSync.id,
            status: lastSync.status,
            syncType: lastSync.syncType,
            recordsFetched: lastSync.recordsFetched,
            recordsUpdated: lastSync.recordsUpdated,
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
          }
        : null,
    };
  }

  /**
   * Helper to ensure the target Ad Account exists in DB
   */
  private async getOrCreateAdAccount() {
    let account = (
      await db
        .select()
        .from(metaAdAccounts)
        .where(eq(metaAdAccounts.metaActId, env.META_AD_ACCOUNT_ID))
        .limit(1)
    )[0];

    if (!account) {
      let [comp] = await db
        .select()
        .from(companies)
        .where(eq(companies.code, 'GLOBALINCH'))
        .limit(1);

      if (!comp) {
        [comp] = await db.select().from(companies).limit(1);
      }

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

    return account;
  }

  /**
   * Synchronize campaigns metadata (Read-Only)
   */
  async syncCampaigns(): Promise<{ success: boolean; mode: string; syncRunId: string; fetched: number; updated: number }> {
    const account = await this.getOrCreateAdAccount();

    const [syncRun] = await db
      .insert(metaSyncRuns)
      .values({
        adAccountId: account.id,
        syncType: 'CAMPAIGNS',
        status: 'RUNNING',
      })
      .returning();

    const isLive = !!env.META_SYSTEM_USER_ACCESS_TOKEN && env.META_SYSTEM_USER_ACCESS_TOKEN.length > 20;

    try {
      if (isLive) {
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

        return { success: true, mode: 'LIVE_GRAPH_API', syncRunId: syncRun.id, fetched: campaignsData.length, updated };
      } else {
        // Fallback placeholder sync when token pending
        const existingCampaigns = await db.select().from(metaCampaigns).where(eq(metaCampaigns.adAccountId, account.id));
        await db
          .update(metaSyncRuns)
          .set({
            status: 'SUCCESS',
            recordsFetched: existingCampaigns.length,
            recordsUpdated: existingCampaigns.length,
            completedAt: new Date(),
          })
          .where(eq(metaSyncRuns.id, syncRun.id));

        return { success: true, mode: 'AWAITING_CREDENTIALS', syncRunId: syncRun.id, fetched: existingCampaigns.length, updated: existingCampaigns.length };
      }
    } catch (err: any) {
      await db
        .update(metaSyncRuns)
        .set({ status: 'FAILED', errorDetails: err.message, completedAt: new Date() })
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
   * DATASET A: Intraday Realtime Insights Sync (Today's performance)
   * Corresponds to Google Apps Script A logic
   */
  async syncRealtimeIntraday(): Promise<{ success: boolean; mode: string; syncRunId: string; fetched: number; updated: number }> {
    const account = await this.getOrCreateAdAccount();

    const [syncRun] = await db
      .insert(metaSyncRuns)
      .values({
        adAccountId: account.id,
        syncType: 'INSIGHTS_REALTIME',
        status: 'RUNNING',
      })
      .returning();

    const isLive = !!env.META_SYSTEM_USER_ACCESS_TOKEN && env.META_SYSTEM_USER_ACCESS_TOKEN.length > 20;

    try {
      let records: RawMetaInsightRecord[] = [];

      if (isLive) {
        const fields = 'date_start,date_stop,campaign_id,campaign_name,spend,reach,impressions,frequency,cpm,clicks,outbound_clicks,actions,action_values';
        const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${env.META_AD_ACCOUNT_ID}/insights?level=campaign&date_preset=today&fields=${fields}&access_token=${env.META_SYSTEM_USER_ACCESS_TOKEN}`;
        
        const response = await fetch(url);
        const data = (await response.json()) as any;

        if (data.error) {
          throw new Error(`Meta API error: ${data.error.message} (Code: ${data.error.code})`);
        }

        records = data.data || [];
      } else {
        // Return clean zero sync without fabricating data
        records = [];
      }

      let updated = 0;
      for (const raw of records) {
        const metrics: ExtractedMetaMetrics = extractAllMetaMetrics(raw);

        // Link with metaCampaigns record if exists
        const [matchedCamp] = await db
          .select({ id: metaCampaigns.id })
          .from(metaCampaigns)
          .where(eq(metaCampaigns.metaCampaignId, metrics.campaignId))
          .limit(1);

        await db
          .insert(metaInsightsRealtime)
          .values({
            adAccountId: account.id,
            campaignId: matchedCamp?.id || null,
            metaCampaignId: metrics.campaignId,
            campaignName: metrics.campaignName,
            reportingDate: metrics.reportingDate,
            spendPaise: metrics.spendPaise,
            reach: metrics.reach,
            impressions: metrics.impressions,
            frequency: metrics.frequency.toString(),
            cpmPaise: metrics.cpmPaise,
            clicks: metrics.clicks,
            outboundClicks: metrics.outboundClicks,
            ctr: metrics.ctr.toString(),
            landingPageViews: metrics.landingPageViews,
            addToCart: metrics.addToCart,
            initiateCheckout: metrics.initiateCheckout,
            leadsCount: metrics.leadsCount,
            addPaymentInfo: metrics.addPaymentInfo,
            purchasesCount: metrics.purchasesCount,
            purchaseValuePaise: metrics.purchaseValuePaise,
            roas: metrics.roas.toString(),
            apvPaise: metrics.apvPaise,
            obcToLpvPct: metrics.obcToLpvPct.toString(),
            lpvToAtcPct: metrics.lpvToAtcPct.toString(),
            atcToCiPct: metrics.atcToCiPct.toString(),
            lpvToCiPct: metrics.lpvToCiPct.toString(),
            ciToPurPct: metrics.ciToPurPct.toString(),
            lpvToPurPct: metrics.lpvToPurPct.toString(),
            rawInsights: raw as any,
            lastSyncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [metaInsightsRealtime.adAccountId, metaInsightsRealtime.metaCampaignId, metaInsightsRealtime.reportingDate],
            set: {
              campaignName: metrics.campaignName,
              spendPaise: metrics.spendPaise,
              reach: metrics.reach,
              impressions: metrics.impressions,
              frequency: metrics.frequency.toString(),
              cpmPaise: metrics.cpmPaise,
              clicks: metrics.clicks,
              outboundClicks: metrics.outboundClicks,
              ctr: metrics.ctr.toString(),
              landingPageViews: metrics.landingPageViews,
              addToCart: metrics.addToCart,
              initiateCheckout: metrics.initiateCheckout,
              leadsCount: metrics.leadsCount,
              addPaymentInfo: metrics.addPaymentInfo,
              purchasesCount: metrics.purchasesCount,
              purchaseValuePaise: metrics.purchaseValuePaise,
              roas: metrics.roas.toString(),
              apvPaise: metrics.apvPaise,
              obcToLpvPct: metrics.obcToLpvPct.toString(),
              lpvToAtcPct: metrics.lpvToAtcPct.toString(),
              atcToCiPct: metrics.atcToCiPct.toString(),
              lpvToCiPct: metrics.lpvToCiPct.toString(),
              ciToPurPct: metrics.ciToPurPct.toString(),
              lpvToPurPct: metrics.lpvToPurPct.toString(),
              rawInsights: raw as any,
              lastSyncedAt: new Date(),
            },
          });
        updated++;
      }

      await db
        .update(metaSyncRuns)
        .set({
          status: 'SUCCESS',
          recordsFetched: records.length,
          recordsUpdated: updated,
          completedAt: new Date(),
        })
        .where(eq(metaSyncRuns.id, syncRun.id));

      return {
        success: true,
        mode: isLive ? 'LIVE_GRAPH_API' : 'AWAITING_CREDENTIALS',
        syncRunId: syncRun.id,
        fetched: records.length,
        updated,
      };
    } catch (err: any) {
      await db
        .update(metaSyncRuns)
        .set({ status: 'FAILED', errorDetails: err.message, completedAt: new Date() })
        .where(eq(metaSyncRuns.id, syncRun.id));

      await db.insert(metaSyncErrors).values({
        syncRunId: syncRun.id,
        errorCode: 'SYNC_REALTIME_ERROR',
        message: err.message,
      });

      throw err;
    }
  }

  /**
   * DATASET B: Historical Daily Insights Backfill (LAST 30 DAYS ONLY)
   * Corresponds to Google Apps Script B logic
   */
  async backfillHistoricalDaily30Days(): Promise<{ success: boolean; mode: string; syncRunId: string; fetched: number; updated: number; dateRange: { since: string; until: string } }> {
    const account = await this.getOrCreateAdAccount();

    const [syncRun] = await db
      .insert(metaSyncRuns)
      .values({
        adAccountId: account.id,
        syncType: 'INSIGHTS_HISTORICAL_30D',
        status: 'RUNNING',
      })
      .returning();

    // Strict 30-day boundary calculation
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const since = thirtyDaysAgo.toISOString().split('T')[0];
    const until = now.toISOString().split('T')[0];

    const isLive = !!env.META_SYSTEM_USER_ACCESS_TOKEN && env.META_SYSTEM_USER_ACCESS_TOKEN.length > 20;

    try {
      let records: RawMetaInsightRecord[] = [];

      if (isLive) {
        const fields = 'date_start,date_stop,campaign_id,campaign_name,spend,reach,impressions,frequency,cpm,clicks,outbound_clicks,actions,action_values';
        const timeRange = JSON.stringify({ since, until });
        const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${env.META_AD_ACCOUNT_ID}/insights?level=campaign&time_range=${encodeURIComponent(timeRange)}&time_increment=1&limit=500&fields=${fields}&access_token=${env.META_SYSTEM_USER_ACCESS_TOKEN}`;

        const response = await fetch(url);
        const data = (await response.json()) as any;

        if (data.error) {
          throw new Error(`Meta API error: ${data.error.message} (Code: ${data.error.code})`);
        }

        records = data.data || [];
      } else {
        // Zero synthetic backfill
        records = [];
      }

      let updated = 0;
      for (const raw of records) {
        const metrics: ExtractedMetaMetrics = extractAllMetaMetrics(raw);

        const [matchedCamp] = await db
          .select({ id: metaCampaigns.id })
          .from(metaCampaigns)
          .where(eq(metaCampaigns.metaCampaignId, metrics.campaignId))
          .limit(1);

        await db
          .insert(metaInsightsDaily)
          .values({
            adAccountId: account.id,
            campaignId: matchedCamp?.id || null,
            metaCampaignId: metrics.campaignId,
            campaignName: metrics.campaignName,
            date: metrics.reportingDate,
            spendPaise: metrics.spendPaise,
            reach: metrics.reach,
            impressions: metrics.impressions,
            frequency: metrics.frequency.toString(),
            cpmPaise: metrics.cpmPaise,
            clicks: metrics.clicks,
            outboundClicks: metrics.outboundClicks,
            ctr: metrics.ctr.toString(),
            landingPageViews: metrics.landingPageViews,
            addToCart: metrics.addToCart,
            initiateCheckout: metrics.initiateCheckout,
            leadsCount: metrics.leadsCount,
            addPaymentInfo: metrics.addPaymentInfo,
            purchasesCount: metrics.purchasesCount,
            purchaseValuePaise: metrics.purchaseValuePaise,
            roas: metrics.roas.toString(),
            apvPaise: metrics.apvPaise,
            obcToLpvPct: metrics.obcToLpvPct.toString(),
            lpvToAtcPct: metrics.lpvToAtcPct.toString(),
            atcToCiPct: metrics.atcToCiPct.toString(),
            lpvToCiPct: metrics.lpvToCiPct.toString(),
            ciToPurPct: metrics.ciToPurPct.toString(),
            lpvToPurPct: metrics.lpvToPurPct.toString(),
            rawInsights: raw as any,
          })
          .onConflictDoUpdate({
            target: [metaInsightsDaily.adAccountId, metaInsightsDaily.metaCampaignId, metaInsightsDaily.date],
            set: {
              campaignName: metrics.campaignName,
              spendPaise: metrics.spendPaise,
              reach: metrics.reach,
              impressions: metrics.impressions,
              frequency: metrics.frequency.toString(),
              cpmPaise: metrics.cpmPaise,
              clicks: metrics.clicks,
              outboundClicks: metrics.outboundClicks,
              ctr: metrics.ctr.toString(),
              landingPageViews: metrics.landingPageViews,
              addToCart: metrics.addToCart,
              initiateCheckout: metrics.initiateCheckout,
              leadsCount: metrics.leadsCount,
              addPaymentInfo: metrics.addPaymentInfo,
              purchasesCount: metrics.purchasesCount,
              purchaseValuePaise: metrics.purchaseValuePaise,
              roas: metrics.roas.toString(),
              apvPaise: metrics.apvPaise,
              obcToLpvPct: metrics.obcToLpvPct.toString(),
              lpvToAtcPct: metrics.lpvToAtcPct.toString(),
              atcToCiPct: metrics.atcToCiPct.toString(),
              lpvToCiPct: metrics.lpvToCiPct.toString(),
              ciToPurPct: metrics.ciToPurPct.toString(),
              lpvToPurPct: metrics.lpvToPurPct.toString(),
              rawInsights: raw as any,
              updatedAt: new Date(),
            },
          });
        updated++;
      }

      await db
        .update(metaSyncRuns)
        .set({
          status: 'SUCCESS',
          recordsFetched: records.length,
          recordsUpdated: updated,
          completedAt: new Date(),
        })
        .where(eq(metaSyncRuns.id, syncRun.id));

      return {
        success: true,
        mode: isLive ? 'LIVE_GRAPH_API' : 'AWAITING_CREDENTIALS',
        syncRunId: syncRun.id,
        fetched: records.length,
        updated,
        dateRange: { since, until },
      };
    } catch (err: any) {
      await db
        .update(metaSyncRuns)
        .set({ status: 'FAILED', errorDetails: err.message, completedAt: new Date() })
        .where(eq(metaSyncRuns.id, syncRun.id));

      await db.insert(metaSyncErrors).values({
        syncRunId: syncRun.id,
        errorCode: 'SYNC_HISTORICAL_ERROR',
        message: err.message,
      });

      throw err;
    }
  }

  /**
   * Get Realtime Intraday Performance
   */
  async getRealtimeInsights() {
    return db
      .select()
      .from(metaInsightsRealtime)
      .orderBy(desc(metaInsightsRealtime.spendPaise));
  }

  /**
   * Get Daily Historical Performance (default 30 days)
   */
  async getDailyInsights(days: number = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return db
      .select()
      .from(metaInsightsDaily)
      .where(gte(metaInsightsDaily.date, cutoffDate))
      .orderBy(desc(metaInsightsDaily.date));
  }

  /**
   * Get Aggregated Marketing Summary
   */
  async getInsightsSummary() {
    const [dailyAgg] = await db
      .select({
        totalSpendPaise: sql<number>`coalesce(sum(${metaInsightsDaily.spendPaise}), 0)`,
        totalImpressions: sql<number>`coalesce(sum(${metaInsightsDaily.impressions}), 0)`,
        totalClicks: sql<number>`coalesce(sum(${metaInsightsDaily.clicks}), 0)`,
        totalOutboundClicks: sql<number>`coalesce(sum(${metaInsightsDaily.outboundClicks}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${metaInsightsDaily.leadsCount}), 0)`,
        totalPurchases: sql<number>`coalesce(sum(${metaInsightsDaily.purchasesCount}), 0)`,
        totalPurchaseValuePaise: sql<number>`coalesce(sum(${metaInsightsDaily.purchaseValuePaise}), 0)`,
      })
      .from(metaInsightsDaily);

    const [realtimeAgg] = await db
      .select({
        todaySpendPaise: sql<number>`coalesce(sum(${metaInsightsRealtime.spendPaise}), 0)`,
        todayLeads: sql<number>`coalesce(sum(${metaInsightsRealtime.leadsCount}), 0)`,
        todayPurchases: sql<number>`coalesce(sum(${metaInsightsRealtime.purchasesCount}), 0)`,
        todayPurchaseValuePaise: sql<number>`coalesce(sum(${metaInsightsRealtime.purchaseValuePaise}), 0)`,
      })
      .from(metaInsightsRealtime);

    const spendRupees = Number(dailyAgg?.totalSpendPaise || 0) / 100;
    const purchaseValRupees = Number(dailyAgg?.totalPurchaseValuePaise || 0) / 100;
    const leads = Number(dailyAgg?.totalLeads || 0);
    const purchases = Number(dailyAgg?.totalPurchases || 0);

    return {
      historical30Days: {
        totalSpend: spendRupees,
        totalImpressions: Number(dailyAgg?.totalImpressions || 0),
        totalClicks: Number(dailyAgg?.totalClicks || 0),
        totalOutboundClicks: Number(dailyAgg?.totalOutboundClicks || 0),
        totalLeads: leads,
        totalPurchases: purchases,
        totalPurchaseValue: purchaseValRupees,
        costPerLead: leads > 0 ? parseFloat((spendRupees / leads).toFixed(2)) : 0,
        costPerPurchase: purchases > 0 ? parseFloat((spendRupees / purchases).toFixed(2)) : 0,
        roas: spendRupees > 0 ? parseFloat((purchaseValRupees / spendRupees).toFixed(2)) : 0,
      },
      intradayToday: {
        spend: Number(realtimeAgg?.todaySpendPaise || 0) / 100,
        leads: Number(realtimeAgg?.todayLeads || 0),
        purchases: Number(realtimeAgg?.todayPurchases || 0),
        purchaseValue: Number(realtimeAgg?.todayPurchaseValuePaise || 0) / 100,
      },
    };
  }

  /**
   * List campaigns
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
