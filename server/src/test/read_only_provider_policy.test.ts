import test from 'node:test';
import assert from 'node:assert';
import { razorpayService } from '../modules/razorpay/razorpay.service';
import { metaAdsService } from '../modules/meta-ads/meta-ads.service';

test('Read-Only Policy: RazorpayService strictly prohibits mutations', () => {
  const service = razorpayService as any;

  // Verify mutating functions do not exist on the service
  assert.strictEqual(service.createOrder, undefined, 'RazorpayService must not implement createOrder');
  assert.strictEqual(service.capturePayment, undefined, 'RazorpayService must not implement capturePayment');
  assert.strictEqual(service.createRefund, undefined, 'RazorpayService must not implement createRefund');
  assert.strictEqual(service.editPayment, undefined, 'RazorpayService must not implement editPayment');
  assert.strictEqual(service.createSubscription, undefined, 'RazorpayService must not implement createSubscription');

  // Verify only read-only or inbound handling methods exist
  assert.strictEqual(typeof service.importHistoricalPayments30Days, 'function');
  assert.strictEqual(typeof service.handleWebhook, 'function');
  assert.strictEqual(typeof service.listPayments, 'function');
  assert.strictEqual(typeof service.getPaymentsSummary, 'function');
  assert.strictEqual(typeof service.getConnectionStatus, 'function');
});

test('Read-Only Policy: MetaAdsService strictly prohibits mutations', () => {
  const service = metaAdsService as any;

  // Verify mutating functions do not exist on the service
  assert.strictEqual(service.createCampaign, undefined, 'MetaAdsService must not implement createCampaign');
  assert.strictEqual(service.updateCampaign, undefined, 'MetaAdsService must not implement updateCampaign');
  assert.strictEqual(service.deleteCampaign, undefined, 'MetaAdsService must not implement deleteCampaign');
  assert.strictEqual(service.pauseCampaign, undefined, 'MetaAdsService must not implement pauseCampaign');
  assert.strictEqual(service.setBudget, undefined, 'MetaAdsService must not implement setBudget');

  // Verify only read-only sync methods exist
  assert.strictEqual(typeof service.syncCampaigns, 'function');
  assert.strictEqual(typeof service.syncRealtimeIntraday, 'function');
  assert.strictEqual(typeof service.backfillHistoricalDaily30Days, 'function');
  assert.strictEqual(typeof service.getRealtimeInsights, 'function');
  assert.strictEqual(typeof service.getDailyInsights, 'function');
  assert.strictEqual(typeof service.getInsightsSummary, 'function');
});
