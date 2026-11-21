/**
 * LeadPulse Enterprise: Normalized Razorpay Notes & UTM Extractor
 * Extracts, cleans, and structures business intelligence from Razorpay Notes & Payloads.
 */

export interface ParsedRazorpayNotes {
  fullName: string;
  email: string | null;
  phone: string;
  uniqueCustomerId: string | null;
  paymentType: string;
  product: string;
  propertyType: string | null;
  reportLanguage: string | null;
  entranceDirection: string | null;
  route: string;
  landingPageUrl: string;
  utmSource: string;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;      // Meta Ad Set ID / Identifier
  utmContent: string | null;   // Meta Video Creative / Ad Name
  rawNotes: Record<string, any>;
}

export function parseRazorpayNotes(payment: any): ParsedRazorpayNotes {
  const rawNotes: Record<string, any> = payment.notes || {};

  // 1. Email Resolution
  const email = (rawNotes.email_id ? String(rawNotes.email_id).toLowerCase().trim() : null) ||
                (payment.email ? String(payment.email).toLowerCase().trim() : null);

  // 2. Full Name Resolution
  const fullName = rawNotes.full_name?.trim() ||
                   rawNotes.name?.trim() ||
                   (email ? email.split('@')[0] : 'VastuWheel Customer');

  // 3. Phone Resolution (Normalized to E.164 with +91)
  const rawPhone = String(rawNotes.phone_number || payment.contact || '');
  let cleanDigits = rawPhone.replace(/\D/g, '');
  let cleanPhone = rawPhone;
  if (cleanDigits.length === 10) {
    cleanPhone = `+91${cleanDigits}`;
  } else if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    cleanPhone = `+${cleanDigits}`;
  } else if (cleanDigits.length > 0 && !rawPhone.startsWith('+')) {
    cleanPhone = `+${cleanDigits}`;
  }

  // 4. UTM Details Extraction (Supports both nested JSON object and stringified JSON)
  let utmObj: Record<string, any> = {};
  if (rawNotes.utm_details) {
    if (typeof rawNotes.utm_details === 'string') {
      try {
        utmObj = JSON.parse(rawNotes.utm_details);
      } catch {
        utmObj = {};
      }
    } else if (typeof rawNotes.utm_details === 'object' && rawNotes.utm_details !== null) {
      utmObj = rawNotes.utm_details;
    }
  }

  const utmSource = utmObj.utm_source || rawNotes.utm_source || 'FB';
  const utmMedium = utmObj.utm_medium || rawNotes.utm_medium || null;
  const utmCampaign = utmObj.utm_campaign || rawNotes.utm_campaign || null;
  const utmTerm = utmObj.utm_term || rawNotes.utm_term || null;
  const utmContent = utmObj.utm_content || rawNotes.utm_content || null;

  // 5. Landing Page Route & Normalized Slug Mapping
  // Business Rule: "fb4" is landing page route identifier. "sales" is route identifier.
  const rawRoute = rawNotes.route || rawNotes.campaign || 'fb4';
  const route = String(rawRoute).toLowerCase().trim();
  const landingPageUrl = `https://report.globalinch.com/${route}`;

  // 6. Report Language (e.g. "Vastu Wheels English FB4", "Vastu Wheels Hindi FB4")
  const reportLanguage = rawNotes.report_language ? String(rawNotes.report_language).trim() : null;

  // 7. Identity & Product Metadata
  const uniqueCustomerId = rawNotes.unique_customer_id ? String(rawNotes.unique_customer_id).trim() : null;
  const paymentType = rawNotes.payment_type ? String(rawNotes.payment_type).trim() : 'vastu_report';
  const product = rawNotes.product ? String(rawNotes.product).trim() : 'report';
  const propertyType = rawNotes.property_type ? String(rawNotes.property_type).trim() : null;
  const entranceDirection = rawNotes.entrance_direction ? String(rawNotes.entrance_direction).trim() : null;

  return {
    fullName,
    email,
    phone: cleanPhone || payment.contact,
    uniqueCustomerId,
    paymentType,
    product,
    propertyType,
    reportLanguage,
    entranceDirection,
    route,
    landingPageUrl,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    rawNotes,
  };
}
