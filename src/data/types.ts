// ==============================================================================
// ENTERPRISE DOMAIN TYPES - ALIGNED WITH 30-TABLE POSTGRESQL SCHEMA
// ==============================================================================

export type BusinessUnitCode = 
  | 'ALL'
  | 'VASTU'
  | 'VASTU_REPORT' 
  | 'VASTU_REPORTS' 
  | 'ASTROLOGY'
  | 'PALMISTRY' 
  | 'ASTROSHI'
  | 'WEBINAR' 
  | 'ASTRO_WEBINAR'
  | 'VASTU_WEBINAR' 
  | 'CONSULTANCY';

export type RazorpayAccountCode = 
  | 'ALL'
  | 'RZP_MANGO_TREE'
  | 'MANGO_TREE'
  | 'RZP_GLOBALINCH' 
  | 'GLOBAL_INCH' 
  | 'RZP_VASTU_SHIKHAR' 
  | 'VASTU_SHIKHAR'
  | 'RZP_WEBINAR' 
  | 'ACC_2_WEBINAR';

export type CompanyCode = 'ALL' | 'VASTU_SHIKHAR' | 'GLOBALINCH' | 'MANGO_TREE';

export type AppStage = 'LOGIN' | 'COMPANY_SELECT' | 'CATEGORY_SELECT' | 'PORTAL';
export type SelectedLens = 'CATEGORY' | 'RAZORPAY';

export type DateRangeOption = 
  | 'TODAY' 
  | 'YESTERDAY' 
  | 'LAST_7_DAYS' 
  | 'LAST_30_DAYS' 
  | 'LAST_90_DAYS'
  | 'THIS_MONTH' 
  | 'LAST_MONTH'
  | 'YEAR_TO_DATE'
  | 'FINANCIAL_YEAR'
  | 'ALL_TIME'
  | 'CUSTOM';

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label?: string;
}

export type DynamicTelemetryPreset = 
  | 'ALL' 
  | 'FAILED_PAYMENTS_QUEUE'
  | 'ADS_VS_RAZORPAY_ROAS'
  | 'CONVERTED_CUSTOMERS'
  | 'AI_VOICE_RECOVERY'
  | 'CUSTOM_FILTER';

export interface DynamicFilterParams {
  preset: DynamicTelemetryPreset;
  company: CompanyCode;
  category: 'ALL' | BusinessUnitCode;
  paymentStatus: 'ALL' | 'CAPTURED' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentStatuses?: string[];
  failureReasons?: string[];
  leadStatus: 'ALL' | LeadStatus;
  landingPageSlug: 'ALL' | string;
  landingPageSlugs?: string[];
  videoCreativeId: 'ALL' | string;
  videoCreativeIds?: string[];
  telephonyStatus: 'ALL' | 'CONNECTED' | 'NO_ANSWER' | 'FAILED';
  telephonyStatuses?: string[];
  dateRange: DateRangeOption;
  customDateRange?: CustomDateRange | null;
  searchQuery: string;
  visibleColumns: {
    customerName: boolean;
    customerPhone: boolean;
    city: boolean;
    landingPage: boolean;
    videoCreative: boolean;
    orderAmount: boolean;
    paymentStatus: boolean;
    failureReason: boolean;
    aiCallStatus: boolean;
    actions: boolean;
  };
}

export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'CHECKOUT_OPENED' 
  | 'FAILED_PAYMENT' 
  | 'PAYMENT_COMPLETED' 
  | 'LOST' 
  | 'UNRESPONSIVE'
  | 'PAYMENT_PENDING'
  | 'CALL_SCHEDULED'
  | 'CONVERTED';

export type OrderStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export type AttemptStatus = 'INITIATED' | 'FAILED' | 'CAPTURED';

export type CallStatus = 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'FAILED';

export type WatiStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type ConversationStatus = 'ACTIVE' | 'RESOLVED' | 'ESCALATED_TO_HUMAN';

export type DemoRole = 
  | 'SUPER_ADMIN' 
  | 'BUSINESS_HEAD' 
  | 'OPERATIONS_MANAGER' 
  | 'MARKETING_MANAGER' 
  | 'AI_OPERATIONS' 
  | 'FINANCE_MANAGER' 
  | 'VIEWER'
  | 'EXECUTIVE_LEADERSHIP'
  | 'PERFORMANCE_MARKETER'
  | 'SALES_CALLING_TEAM'
  | 'CUSTOMER_SUPPORT'
  | 'FINANCE_RECONCILIATION'
  | 'TECHNICAL_ADMIN';

export interface UserAccount {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: DemoRole;
  avatar?: string;
  assignedVerticals?: BusinessUnitCode[];
  isActive: boolean;
  lastLogin?: string;
  lastLoginAt?: string;
  createdDate?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  primaryPhone?: string;
  phone?: string;
  primaryEmail?: string;
  email?: string;
  fullName: string;
  city?: string;
  state?: string;
  pincode?: string;
  lifecycleStage?: 'PROSPECT' | 'LEAD' | 'CUSTOMER' | 'REPEAT_BUYER';
  isDndOptOut?: boolean;
  firstSeenAt?: string;
  lastActiveAt?: string;
  createdAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface LandingPage {
  id: string;
  code: string;
  name: string;
  businessUnit: BusinessUnitCode;
  primaryRazorpayAccount: RazorpayAccountCode;
  pageType: 'CUSTOM_NEXTJS' | 'WORDPRESS' | 'CUSTOM_REACT';
  url: string;
  visitors: number;
  leadsCount: number;
  isActive: boolean;
}

export interface MarketingCampaign {
  id: string;
  platform?: 'META_ADS' | 'GOOGLE_ADS';
  campaignId?: string;
  metaCampaignId?: string;
  campaignName: string;
  businessUnit?: BusinessUnitCode;
  date?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dailyBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  leads?: number;
  purchases?: number;
  purchaseValue?: number;
}

export interface MarketingAdSet {
  id: string;
  campaignId: string;
  adSetId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
}

export interface MarketingAd {
  id: string;
  adSetId: string;
  adId: string;
  name: string;
  creativeId: string;
  status: 'ACTIVE' | 'PAUSED';
}

export interface TrackingTouchpoint {
  id: string;
  leadId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  gclid?: string;
  marketingAdId?: string;
  timestamp: string;
}

export interface VideoCreative {
  id: string;
  code: string;
  name: string;
  vertical: BusinessUnitCode;
  subCategory?: string;
  videoDuration: string;
  hookHeadline: string;
  thumbnailGradient: string;
  spend: number;
  impressions: number;
  clicks: number;
  leadsCount: number;
  capturedRevenue: number;
  roas: number;
}

export interface Lead {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  businessUnit: BusinessUnitCode;
  company?: CompanyCode;
  subCategory?: string;
  productName?: string;
  landingPageId?: string;
  landingPageCode?: string;
  landingPageSlug?: string;
  adCreativeId?: string;
  adCreativeName?: string;
  leadStatus?: LeadStatus;
  status?: LeadStatus | string;
  enquirySource?: string;
  createdAt: string;
  updatedAt?: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  marketingAdId?: string;
  campaignName?: string;
  adSetName?: string;
  adName?: string;
  totalAttempts?: number;
  failedAttempts?: number;
  capturedRevenue?: number;
  aiCallStatus?: CallStatus;
  watiStatus?: WatiStatus;
  whatsappAiStatus?: ConversationStatus;
}

export interface Order {
  id: string;
  orderNumber?: string;
  gatewayOrderId?: string;
  razorpayOrderId?: string;
  customerId: string;
  customerName?: string;
  leadId: string;
  businessUnit: BusinessUnitCode;
  company?: CompanyCode;
  razorpayAccount?: RazorpayAccountCode;
  accountCode?: RazorpayAccountCode | string;
  productName?: string;
  amount: number;
  amountPaid?: number;
  amountDue?: number;
  currency?: string;
  orderStatus?: OrderStatus;
  status?: OrderStatus | string;
  createdAt: string;
}

export interface PaymentAttempt {
  id: string;
  orderId: string;
  orderNumber?: string;
  gatewayPaymentId?: string;
  razorpayPaymentId?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  businessUnit?: BusinessUnitCode;
  razorpayAccount?: RazorpayAccountCode;
  amount: number;
  currency?: string;
  attemptNumber?: number;
  attemptStatus?: AttemptStatus;
  status?: AttemptStatus | string;
  paymentMethod: string;
  vpa?: string;
  errorCode?: string;
  errorMessage?: string;
  errorDescription?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface CapturedPayment {
  id: string;
  orderId: string;
  orderNumber?: string;
  paymentAttemptId?: string;
  gatewayPaymentId?: string;
  razorpayPaymentId?: string;
  gatewayOrderId?: string;
  razorpayOrderId?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  businessUnit?: BusinessUnitCode;
  razorpayAccount?: RazorpayAccountCode;
  accountCode?: RazorpayAccountCode | string;
  amount?: number;
  capturedAmount?: number;
  currency?: string;
  fee: number;
  tax: number;
  paymentMethod?: string;
  capturedAt: string;
}

export interface Refund {
  id: string;
  paymentId?: string;
  capturedPaymentId?: string;
  gatewayPaymentId?: string;
  gatewayRefundId?: string;
  razorpayRefundId?: string;
  orderNumber?: string;
  customerName?: string;
  businessUnit?: BusinessUnitCode;
  razorpayAccount?: RazorpayAccountCode;
  amount?: number;
  refundAmount?: number;
  currency?: string;
  refundStatus?: 'PROCESSED' | 'FAILED';
  status?: string;
  reason: string;
  processedAt?: string;
  createdAt?: string;
}

export interface AiElementCall {
  id: string;
  providerCallId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  leadId?: string;
  businessUnit?: BusinessUnitCode;
  landingPageCode?: string;
  agentName: string;
  callStatus?: CallStatus;
  status?: CallStatus | string;
  callStartAt?: string;
  callEndAt?: string;
  durationSeconds: number;
  customerIntent?: string;
  sentiment?: string;
  summary?: string;
  transcript?: string;
  recordingUrl?: string;
  createdAt?: string;
}

export interface WatiMessage {
  id: string;
  providerMessageId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  phone?: string;
  leadId?: string;
  businessUnit?: BusinessUnitCode;
  accountCode?: string;
  watiAccountName?: string;
  templateName: string;
  direction?: 'OUTBOUND' | 'INBOUND';
  messageBody?: string;
  deliveryStatus?: WatiStatus;
  status?: WatiStatus | string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorCode?: string;
}

export interface WhatsAppAiConversation {
  id: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  leadId: string;
  businessUnit: BusinessUnitCode;
  botName: string;
  conversationStatus: ConversationStatus;
  turnCount: number;
  paymentLinkShared: boolean;
  paymentLinkUrl?: string;
  startedAt: string;
  endedAt?: string;
  lastMessageText: string;
  messages: Array<{
    sender: 'USER' | 'BOT' | 'AGENT';
    text: string;
    timestamp: string;
    intent?: string;
  }>;
}

export interface ConversionAttribution {
  id: string;
  capturedPaymentId?: string;
  leadId: string;
  customerId?: string;
  attributionTier?: 'FIRST_TOUCH' | 'LAST_TOUCH' | 'AI_ASSISTED' | 'WATI_ASSISTED' | 'ORGANIC_DIRECT';
  attributionModel?: string;
  attributedRevenue?: number;
  aiCallId?: string;
  watiMessageId?: string;
  marketingAdId?: string;
  confidence?: number;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'ORDER' | 'LEAD' | 'PAYMENT' | 'CUSTOMER' | 'USER' | string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'REFUND' | 'LOGIN' | string;
  actorName?: string;
  actorRole?: string;
  performedBy?: string;
  details: any;
  ipAddress?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface MockDatabase {
  users: UserAccount[];
  customers: Customer[];
  landingPages: LandingPage[];
  campaigns: MarketingCampaign[];
  metaDailyInsights: MarketingCampaign[];
  adSets: MarketingAdSet[];
  ads: MarketingAd[];
  touchpoints: TrackingTouchpoint[];
  leads: Lead[];
  orders: Order[];
  paymentAttempts: PaymentAttempt[];
  capturedPayments: CapturedPayment[];
  refunds: Refund[];
  aiCalls: AiElementCall[];
  watiMessages: WatiMessage[];
  whatsappAiConversations: WhatsAppAiConversation[];
  attributions: ConversionAttribution[];
  auditLogs: AuditLog[];
  videoCreatives: VideoCreative[];
}
