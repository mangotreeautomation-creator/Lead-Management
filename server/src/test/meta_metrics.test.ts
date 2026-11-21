import test from 'node:test';
import assert from 'node:assert';
import { extractAllMetaMetrics, extractPurchases, extractPurchaseValueRupees, extractOutboundClicks } from '../modules/meta-ads/meta-metrics.extractor';

test('Meta Extractor: Complete 27-metric extraction with standard values', () => {
  const rawRecord = {
    date_start: '2026-11-19',
    date_stop: '2026-11-19',
    campaign_id: '1202058493029102',
    campaign_name: 'VastuWheel Direct Report - Sales Campaign',
    spend: '3450.50',
    reach: '12500',
    impressions: '18400',
    frequency: '1.472',
    cpm: '187.527',
    clicks: '420',
    outbound_clicks: [{ action_type: 'outbound_click', value: '310' }],
    actions: [
      { action_type: 'landing_page_view', value: '280' },
      { action_type: 'add_to_cart', value: '85' },
      { action_type: 'initiate_checkout', value: '45' },
      { action_type: 'lead', value: '18' },
      { action_type: 'add_payment_info', value: '30' },
      { action_type: 'purchase', value: '15' },
    ],
    action_values: [
      { action_type: 'purchase', value: '22485.00' } // 15 x ₹1499
    ],
  };

  const metrics = extractAllMetaMetrics(rawRecord);

  assert.strictEqual(metrics.reportingDate, '2026-11-19');
  assert.strictEqual(metrics.campaignId, '1202058493029102');
  assert.strictEqual(metrics.spendRupees, 3450.5);
  assert.strictEqual(metrics.spendPaise, 345050);
  assert.strictEqual(metrics.impressions, 18400);
  assert.strictEqual(metrics.outboundClicks, 310);
  assert.strictEqual(metrics.landingPageViews, 280);
  assert.strictEqual(metrics.addToCart, 85);
  assert.strictEqual(metrics.initiateCheckout, 45);
  assert.strictEqual(metrics.leadsCount, 18);
  assert.strictEqual(metrics.addPaymentInfo, 30);
  assert.strictEqual(metrics.purchasesCount, 15);
  assert.strictEqual(metrics.purchaseValueRupees, 22485);
  assert.strictEqual(metrics.purchaseValuePaise, 2248500);

  // ROAS = 22485 / 3450.5 = 6.5164
  assert.strictEqual(metrics.roas, 6.5164);

  // CTR = (310 / 18400) * 100 = 1.6848%
  assert.strictEqual(metrics.ctr, 1.6848);

  // APV = 22485 / 15 = 1499
  assert.strictEqual(metrics.apvRupees, 1499);
  assert.strictEqual(metrics.apvPaise, 149900);

  // Funnel ratios
  // OBC -> LPV: (280 / 310) * 100 = 90.3226%
  assert.strictEqual(metrics.obcToLpvPct, 90.3226);
  // LPV -> ATC: (85 / 280) * 100 = 30.3571%
  assert.strictEqual(metrics.lpvToAtcPct, 30.3571);
  // ATC -> CI: (45 / 85) * 100 = 52.9412%
  assert.strictEqual(metrics.atcToCiPct, 52.9412);
  // CI -> Purchases: (15 / 45) * 100 = 33.3333%
  assert.strictEqual(metrics.ciToPurPct, 33.3333);
});

test('Meta Extractor: Precedence rules avoid purchase double counting', () => {
  // If Meta sends both 'purchase' and 'omni_purchase' or 'offsite_conversion', precedence must pick the primary
  const actionsWithMultiple = [
    { action_type: 'purchase', value: '10' },
    { action_type: 'omni_purchase', value: '10' },
    { action_type: 'offsite_conversion.fb_pixel_purchase', value: '10' },
  ];

  const purchases = extractPurchases(actionsWithMultiple);
  assert.strictEqual(purchases, 10, 'Must NOT sum to 30. Must strictly pick 10.');

  const actionValuesWithMultiple = [
    { action_type: 'purchase', value: '14990.00' },
    { action_type: 'omni_purchase', value: '14990.00' },
  ];

  const val = extractPurchaseValueRupees(actionValuesWithMultiple);
  assert.strictEqual(val, 14990.00, 'Must NOT sum to 29980. Must strictly pick 14990.');
});

test('Meta Extractor: Zero-division resilience on empty or zero spend', () => {
  const zeroRecord = {
    spend: '0',
    impressions: '0',
    clicks: '0',
    actions: [],
    action_values: [],
  };

  const metrics = extractAllMetaMetrics(zeroRecord);
  assert.strictEqual(metrics.roas, 0);
  assert.strictEqual(metrics.ctr, 0);
  assert.strictEqual(metrics.apvRupees, 0);
  assert.strictEqual(metrics.obcToLpvPct, 0);
  assert.strictEqual(metrics.ciToPurPct, 0);
});
