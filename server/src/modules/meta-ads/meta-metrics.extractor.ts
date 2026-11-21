/**
 * Meta Marketing API Metric Extractor
 * Re-implements and hardens the 27-metric extraction logic from Google Apps Scripts A & B.
 * Applies documented precedence rules to prevent double-counting across overlapping action types.
 */

export interface RawMetaInsightRecord {
  date_start?: string;
  date_stop?: string;
  campaign_id?: string;
  campaign_name?: string;
  created_time?: string;
  spend?: string | number;
  reach?: string | number;
  impressions?: string | number;
  frequency?: string | number;
  cpm?: string | number;
  clicks?: string | number;
  outbound_clicks?: Array<{ action_type?: string; value?: string | number }>;
  actions?: Array<{ action_type: string; value: string | number }>;
  action_values?: Array<{ action_type: string; value: string | number }>;
}

export interface ExtractedMetaMetrics {
  reportingDate: string;
  campaignId: string;
  campaignName: string;
  spendPaise: number;
  spendRupees: number;
  reach: number;
  impressions: number;
  frequency: number;
  cpmPaise: number;
  cpmRupees: number;
  clicks: number;
  outboundClicks: number;
  ctr: number;
  landingPageViews: number;
  addToCart: number;
  initiateCheckout: number;
  leadsCount: number;
  addPaymentInfo: number;
  purchasesCount: number;
  purchaseValuePaise: number;
  purchaseValueRupees: number;
  roas: number;
  apvPaise: number;
  apvRupees: number;
  // Funnel conversion percentages (0 to 100)
  obcToLpvPct: number;
  lpvToAtcPct: number;
  atcToCiPct: number;
  lpvToCiPct: number;
  ciToPurPct: number;
  lpvToPurPct: number;
}

/**
 * Extracts a single metric by key from the Meta `actions` array.
 */
export function getActionValue(
  actions: Array<{ action_type: string; value: string | number }> | undefined,
  actionType: string
): number {
  if (!Array.isArray(actions)) return 0;
  const match = actions.find((a) => a.action_type === actionType);
  if (!match || match.value === undefined || match.value === null) return 0;
  const num = typeof match.value === 'number' ? match.value : parseFloat(match.value);
  return isNaN(num) ? 0 : num;
}

/**
 * Extracts purchases with strict precedence to avoid double-counting overlapping action types:
 * 1. Standard pixel 'purchase'
 * 2. 'omni_purchase'
 * 3. 'offsite_conversion.fb_pixel_purchase'
 */
export function extractPurchases(
  actions: Array<{ action_type: string; value: string | number }> | undefined
): number {
  if (!Array.isArray(actions)) return 0;

  const standardPurchase = getActionValue(actions, 'purchase');
  if (standardPurchase > 0) return Math.round(standardPurchase);

  const omniPurchase = getActionValue(actions, 'omni_purchase');
  if (omniPurchase > 0) return Math.round(omniPurchase);

  const offsitePurchase = getActionValue(actions, 'offsite_conversion.fb_pixel_purchase');
  if (offsitePurchase > 0) return Math.round(offsitePurchase);

  return 0;
}

/**
 * Extracts purchase value with strict precedence:
 * 1. 'purchase'
 * 2. 'omni_purchase'
 * 3. 'offsite_conversion.fb_pixel_purchase'
 */
export function extractPurchaseValueRupees(
  actionValues: Array<{ action_type: string; value: string | number }> | undefined
): number {
  if (!Array.isArray(actionValues)) return 0;

  const standardVal = getActionValue(actionValues, 'purchase');
  if (standardVal > 0) return standardVal;

  const omniVal = getActionValue(actionValues, 'omni_purchase');
  if (omniVal > 0) return omniVal;

  const offsiteVal = getActionValue(actionValues, 'offsite_conversion.fb_pixel_purchase');
  if (offsiteVal > 0) return offsiteVal;

  return 0;
}

/**
 * Extracts outbound clicks (OBC) from outbound_clicks array or fallback actions.
 */
export function extractOutboundClicks(record: RawMetaInsightRecord): number {
  // 1. Direct outbound_clicks array
  if (Array.isArray(record.outbound_clicks) && record.outbound_clicks.length > 0) {
    const val = record.outbound_clicks[0].value;
    const num = typeof val === 'number' ? val : parseFloat(val || '0');
    if (!isNaN(num) && num > 0) return Math.round(num);
  }

  // 2. Fallback to actions array
  const actionObc = getActionValue(record.actions, 'outbound_click');
  if (actionObc > 0) return Math.round(actionObc);

  const linkClick = getActionValue(record.actions, 'link_click');
  if (linkClick > 0) return Math.round(linkClick);

  return 0;
}

/**
 * Parses and maps a complete Meta insight record into the normalized 27 metrics.
 */
export function extractAllMetaMetrics(record: RawMetaInsightRecord): ExtractedMetaMetrics {
  const reportingDate = record.date_start || new Date().toISOString().split('T')[0];
  const campaignId = record.campaign_id || 'unknown';
  const campaignName = record.campaign_name || 'Unnamed Campaign';

  const spendRupees = typeof record.spend === 'number' ? record.spend : parseFloat(record.spend || '0') || 0;
  const reach = typeof record.reach === 'number' ? record.reach : parseInt(record.reach || '0', 10) || 0;
  const impressions = typeof record.impressions === 'number' ? record.impressions : parseInt(record.impressions || '0', 10) || 0;
  const frequency = typeof record.frequency === 'number' ? record.frequency : parseFloat(record.frequency || '0') || 0;
  const cpmRupees = typeof record.cpm === 'number' ? record.cpm : parseFloat(record.cpm || '0') || 0;
  const clicks = typeof record.clicks === 'number' ? record.clicks : parseInt(record.clicks || '0', 10) || 0;

  const outboundClicks = extractOutboundClicks(record);
  const landingPageViews = Math.round(getActionValue(record.actions, 'landing_page_view'));
  const addToCart = Math.round(getActionValue(record.actions, 'add_to_cart'));
  const initiateCheckout = Math.round(getActionValue(record.actions, 'initiate_checkout'));
  const leadsCount = Math.round(getActionValue(record.actions, 'lead'));
  const addPaymentInfo = Math.round(getActionValue(record.actions, 'add_payment_info'));

  const purchasesCount = extractPurchases(record.actions);
  const purchaseValueRupees = extractPurchaseValueRupees(record.action_values);

  // Monetary precision in Paise (Exact integer minor unit, no floating-point accumulation)
  const spendPaise = Math.round(spendRupees * 100);
  const cpmPaise = Math.round(cpmRupees * 100);
  const purchaseValuePaise = Math.round(purchaseValueRupees * 100);

  // Safe ratios with zero-division protection
  const roas = spendRupees > 0 ? parseFloat((purchaseValueRupees / spendRupees).toFixed(4)) : 0;
  const ctr = impressions > 0 ? parseFloat(((outboundClicks / impressions) * 100).toFixed(4)) : 0;
  const apvRupees = purchasesCount > 0 ? parseFloat((purchaseValueRupees / purchasesCount).toFixed(4)) : 0;
  const apvPaise = Math.round(apvRupees * 100);

  const obcToLpvPct = outboundClicks > 0 ? parseFloat(((landingPageViews / outboundClicks) * 100).toFixed(4)) : 0;
  const lpvToAtcPct = landingPageViews > 0 ? parseFloat(((addToCart / landingPageViews) * 100).toFixed(4)) : 0;
  const atcToCiPct = addToCart > 0 ? parseFloat(((initiateCheckout / addToCart) * 100).toFixed(4)) : 0;
  const lpvToCiPct = landingPageViews > 0 ? parseFloat(((initiateCheckout / landingPageViews) * 100).toFixed(4)) : 0;
  const ciToPurPct = initiateCheckout > 0 ? parseFloat(((purchasesCount / initiateCheckout) * 100).toFixed(4)) : 0;
  const lpvToPurPct = landingPageViews > 0 ? parseFloat(((purchasesCount / landingPageViews) * 100).toFixed(4)) : 0;

  return {
    reportingDate,
    campaignId,
    campaignName,
    spendPaise,
    spendRupees,
    reach,
    impressions,
    frequency,
    cpmPaise,
    cpmRupees,
    clicks,
    outboundClicks,
    ctr,
    landingPageViews,
    addToCart,
    initiateCheckout,
    leadsCount,
    addPaymentInfo,
    purchasesCount,
    purchaseValuePaise,
    purchaseValueRupees,
    roas,
    apvPaise,
    apvRupees,
    obcToLpvPct,
    lpvToAtcPct,
    atcToCiPct,
    lpvToCiPct,
    ciToPurPct,
    lpvToPurPct,
  };
}
