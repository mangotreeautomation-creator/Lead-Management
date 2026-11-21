import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../database/client';
import { backgroundJobs } from '../database/schema/index';
import { metaAdsService } from '../modules/meta-ads/meta-ads.service';
import { env } from '../config/env';

export class BackgroundScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  private lastRunTime: number = 0;

  /**
   * Determine whether current time in Asia/Kolkata is active hours (8am - 11pm)
   */
  private isActiveHoursIST(): boolean {
    const kolkataTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hour = kolkataTime.getHours();
    return hour >= 8 && hour < 23;
  }

  /**
   * Get sync interval in milliseconds
   * 15 minutes in active hours, 60 minutes overnight
   */
  private getRequiredIntervalMs(): number {
    return this.isActiveHoursIST() ? 15 * 60 * 1000 : 60 * 60 * 1000;
  }

  /**
   * Execute scheduled background jobs
   */
  async runScheduledTasks(): Promise<void> {
    if (this.isProcessing) {
      console.log('[Scheduler] Task execution already in progress, skipping tick.');
      return;
    }

    const now = Date.now();
    const intervalMs = this.getRequiredIntervalMs();

    if (now - this.lastRunTime < intervalMs) {
      // Not yet time for next periodic run
      return;
    }

    this.isProcessing = true;
    this.lastRunTime = now;

    // Distributed lock attempt
    const [job] = await db
      .insert(backgroundJobs)
      .values({
        jobType: 'META_REALTIME_SYNC',
        status: 'PROCESSING',
        lockedAt: new Date(),
        attempts: 1,
      })
      .returning();

    try {
      console.log(`[Scheduler] Starting scheduled Meta Realtime sync (Active Hours: ${this.isActiveHoursIST()})...`);
      const result = await metaAdsService.syncRealtimeIntraday();
      console.log(`[Scheduler] Meta Realtime sync succeeded: ${result.fetched} fetched, ${result.updated} updated.`);

      if (job) {
        await db
          .update(backgroundJobs)
          .set({
            status: 'COMPLETED',
            completedAt: new Date(),
            payload: result as any,
          })
          .where(eq(backgroundJobs.id, job.id));
      }
    } catch (err: any) {
      console.error('[Scheduler] Error during scheduled Meta sync:', err.message);
      if (job) {
        await db
          .update(backgroundJobs)
          .set({
            status: 'FAILED',
            errorDetails: err.message,
            completedAt: new Date(),
          })
          .where(eq(backgroundJobs.id, job.id));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start scheduler loop (checks every 60 seconds)
   */
  start(): void {
    if (this.timer) return;
    console.log('[Scheduler] Background job scheduler initialized.');
    this.timer = setInterval(() => {
      this.runScheduledTasks().catch((err) => console.error('[Scheduler Uncaught]', err));
    }, 60000);
  }

  /**
   * Stop scheduler loop
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const backgroundScheduler = new BackgroundScheduler();
