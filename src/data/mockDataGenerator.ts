import {
  BusinessUnitCode,
  RazorpayAccountCode,
  CompanyCode,
  UserAccount,
  Customer,
  LandingPage,
  MarketingCampaign,
  MarketingAdSet,
  MarketingAd,
  TrackingTouchpoint,
  Lead,
  Order,
  PaymentAttempt,
  CapturedPayment,
  Refund,
  AiElementCall,
  WatiMessage,
  WhatsAppAiConversation,
  ConversionAttribution,
  AuditLog,
  VideoCreative
} from './types';

// ==============================================================================
// PSEUDO-RANDOM DETERMINISTIC GENERATOR (LCG)
// Ensures identical seed produces 100% reproducible data across reloads
// ==============================================================================
let seed = 123456789;
function pseudoRandom() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randInt(min: number, max: number): number {
  return Math.floor(pseudoRandom() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

// ==============================================================================
// SEED CONSTANTS & REAL MASTER DATA MAPPINGS
// ==============================================================================

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'usr_001_super_admin',
    name: 'Alfaz Mansuri (Super Admin)',
    fullName: 'Alfaz Mansuri',
    email: 'admin@globalinch.com',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['VASTU', 'ASTROLOGY', 'PALMISTRY', 'ASTROSHI', 'WEBINAR', 'CONSULTANCY'],
    isActive: true,
    lastLogin: '2026-10-30 11:45 AM',
    createdDate: '2026-01-01'
  },
  {
    id: 'usr_002_business_head',
    name: 'Vikram Malhotra',
    fullName: 'Vikram Malhotra',
    email: 'business.head@globalinch.com',
    role: 'BUSINESS_HEAD',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['VASTU', 'ASTROLOGY', 'PALMISTRY', 'ASTROSHI', 'WEBINAR', 'CONSULTANCY'],
    isActive: true,
    lastLogin: '2026-10-30 09:12 AM',
    createdDate: '2026-01-15'
  },
  {
    id: 'usr_003_ops_manager',
    name: 'Sneha Patel',
    fullName: 'Sneha Patel',
    email: 'ops.manager@globalinch.com',
    role: 'OPERATIONS_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['VASTU', 'PALMISTRY'],
    isActive: true,
    lastLogin: '2026-10-30 10:30 AM',
    createdDate: '2026-02-01'
  },
  {
    id: 'usr_004_marketing_lead',
    name: 'Arjun Verma',
    fullName: 'Arjun Verma',
    email: 'marketing.lead@globalinch.com',
    role: 'MARKETING_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['VASTU', 'ASTROLOGY', 'PALMISTRY', 'ASTROSHI', 'WEBINAR', 'CONSULTANCY'],
    isActive: true,
    lastLogin: '2026-10-30 08:20 AM',
    createdDate: '2026-02-10'
  },
  {
    id: 'usr_005_ai_ops',
    name: 'Pooja Iyer (AI Telephony Lead)',
    fullName: 'Pooja Iyer',
    email: 'ai.ops@globalinch.com',
    role: 'AI_OPERATIONS',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['PALMISTRY', 'VASTU', 'WEBINAR'],
    isActive: true,
    lastLogin: '2026-10-30 11:15 AM',
    createdDate: '2026-02-20'
  },
  {
    id: 'usr_006_finance_recon',
    name: 'Rajesh Kulkarni',
    fullName: 'Rajesh Kulkarni',
    email: 'finance.recon@globalinch.com',
    role: 'FINANCE_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['VASTU', 'ASTROLOGY', 'PALMISTRY', 'ASTROSHI', 'WEBINAR', 'CONSULTANCY'],
    isActive: true,
    lastLogin: '2026-10-30 11:50 AM',
    createdDate: '2026-01-05'
  },
  {
    id: 'usr_007_calling_agent',
    name: 'Kavita Sharma (Calling Lead)',
    fullName: 'Kavita Sharma',
    email: 'sales.calling@globalinch.com',
    role: 'SALES_CALLING_TEAM',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    assignedVerticals: ['VASTU', 'ASTROLOGY', 'PALMISTRY', 'WEBINAR'],
    isActive: true,
    lastLogin: '2026-10-30 12:05 PM',
    createdDate: '2026-03-01'
  }
];

// ==============================================================================
// 14 VIDEO AD CREATIVES (WITH ACTUAL SCRIPT / HOOK DESCRIPTIONS & PERFORMANCE)
// ==============================================================================
export const VIDEO_CREATIVES: VideoCreative[] = [
  // VASTU CREATIVES
  {
    id: 'vid_vastu_01',
    code: 'VID-VST-01',
    name: '45s Hook: North-East Kitchen Dosha Fix',
    vertical: 'VASTU',
    subCategory: 'Vastu Wheel Residential',
    videoDuration: '0:45',
    hookHeadline: 'Kharche ruk nahi rahe? North-East me ye galti to nahi?',
    thumbnailGradient: 'from-amber-600 to-orange-700',
    spend: 145000,
    impressions: 580000,
    clicks: 14200,
    leadsCount: 220,
    capturedRevenue: 329780,
    roas: 2.27
  },
  {
    id: 'vid_vastu_02',
    code: 'VID-VST-02',
    name: '60s Testimonial: Main Door Entrance Energy',
    vertical: 'VASTU',
    subCategory: 'Vastu Commercial Industrial',
    videoDuration: '1:00',
    hookHeadline: 'Main door pe sirf 1 change aur business 2x hua',
    thumbnailGradient: 'from-blue-600 to-indigo-800',
    spend: 112000,
    impressions: 420000,
    clicks: 9800,
    leadsCount: 165,
    capturedRevenue: 247335,
    roas: 2.21
  },
  {
    id: 'vid_vastu_03',
    code: 'VID-VST-03',
    name: '30s Urgent: Master Bedroom Vastu Secrets',
    vertical: 'VASTU',
    subCategory: 'Express Vastu Audit',
    videoDuration: '0:30',
    hookHeadline: 'South-West bedroom me ye cheez turant hatao',
    thumbnailGradient: 'from-emerald-600 to-teal-800',
    spend: 85000,
    impressions: 340000,
    clicks: 8100,
    leadsCount: 135,
    capturedRevenue: 202365,
    roas: 2.38
  },
  {
    id: 'vid_vastu_04',
    code: 'VID-VST-04',
    name: '75s Case Study: Factory Turnaround Vastu',
    vertical: 'VASTU',
    subCategory: 'Factory Vastu Architecture',
    videoDuration: '1:15',
    hookHeadline: '3 saal se band factory 6 mahine me profitable bani',
    thumbnailGradient: 'from-slate-700 to-slate-900',
    spend: 92000,
    impressions: 290000,
    clicks: 6400,
    leadsCount: 100,
    capturedRevenue: 299800,
    roas: 3.26
  },

  // WEBINAR CREATIVES (ASTRO & VASTU WEBINARS)
  {
    id: 'vid_webinar_astro_01',
    code: 'VID-WEB-AST-01',
    name: '50s Live Cohort: Vedic Astro 2026 Predictions',
    vertical: 'WEBINAR',
    subCategory: 'Astro Webinar Leads',
    videoDuration: '0:50',
    hookHeadline: '2026 Shani Transit: Aapki rashi pe kya asar hoga?',
    thumbnailGradient: 'from-purple-600 to-indigo-900',
    spend: 130000,
    impressions: 610000,
    clicks: 16500,
    leadsCount: 260,
    capturedRevenue: 129740,
    roas: 1.00
  },
  {
    id: 'vid_webinar_vastu_01',
    code: 'VID-WEB-VST-01',
    name: '65s Masterclass: Live 3-Day Vastu Science Cohort',
    vertical: 'WEBINAR',
    subCategory: 'Vastu Webinar Leads',
    videoDuration: '1:05',
    hookHeadline: 'Bina tod-fod Vastu remedies seekhein 3 din me',
    thumbnailGradient: 'from-cyan-600 to-blue-800',
    spend: 140000,
    impressions: 650000,
    clicks: 17800,
    leadsCount: 260,
    capturedRevenue: 129740,
    roas: 0.93
  },

  // PALMISTRY CREATIVES
  {
    id: 'vid_palm_01',
    code: 'VID-PLM-01',
    name: '35s Viral: Palm Life Line Wealth Myth Debunked',
    vertical: 'PALMISTRY',
    subCategory: 'Palmistry Comprehensive',
    videoDuration: '0:35',
    hookHeadline: 'Haath ki ye rekha batati hai kab aayega achanak dhan',
    thumbnailGradient: 'from-amber-500 to-rose-700',
    spend: 185000,
    impressions: 890000,
    clicks: 24500,
    leadsCount: 320,
    capturedRevenue: 319680,
    roas: 1.73
  },
  {
    id: 'vid_palm_02',
    code: 'VID-PLM-02',
    name: '55s Deep Dive: Hand Fate Line Career Breakthrough',
    vertical: 'PALMISTRY',
    subCategory: 'Instant Palm Reading',
    videoDuration: '0:55',
    hookHeadline: 'Fate line me break hai? Ghhabraye nahi ye dekhein',
    thumbnailGradient: 'from-rose-600 to-pink-900',
    spend: 125000,
    impressions: 510000,
    clicks: 13200,
    leadsCount: 200,
    capturedRevenue: 199800,
    roas: 1.60
  },

  // ASTROLOGY CREATIVES
  {
    id: 'vid_astro_01',
    code: 'VID-AST-01',
    name: '40s Quick Hook: Kundali Shani Sade Sati Remedies',
    vertical: 'ASTROLOGY',
    subCategory: 'Janam Kundali Blueprint',
    videoDuration: '0:40',
    hookHeadline: 'Sade Sati chal rahi hai? Ye 3 remedies karein',
    thumbnailGradient: 'from-violet-700 to-purple-900',
    spend: 110000,
    impressions: 480000,
    clicks: 11900,
    leadsCount: 270,
    capturedRevenue: 269730,
    roas: 2.45
  },
  {
    id: 'vid_astro_02',
    code: 'VID-AST-02',
    name: '60s Expert: Planetary Dasha Career Breakthrough',
    vertical: 'ASTROLOGY',
    subCategory: 'Career Wealth Transit',
    videoDuration: '1:00',
    hookHeadline: 'Dasha change hone pe career me aayega bada uchaal',
    thumbnailGradient: 'from-indigo-600 to-blue-900',
    spend: 95000,
    impressions: 390000,
    clicks: 9400,
    leadsCount: 250,
    capturedRevenue: 249750,
    roas: 2.63
  },

  // ASTROSHI CREATIVES
  {
    id: 'vid_astroshi_01',
    code: 'VID-ASH-01',
    name: '45s Sacred: Vedic Energy & Geometry Activation',
    vertical: 'ASTROSHI',
    subCategory: 'Astroshi Spiritual Guidance',
    videoDuration: '0:45',
    hookHeadline: 'Ghar me positive energy ka flow kaise badhayein',
    thumbnailGradient: 'from-emerald-700 to-teal-900',
    spend: 105000,
    impressions: 430000,
    clicks: 10500,
    leadsCount: 270,
    capturedRevenue: 269730,
    roas: 2.57
  },
  {
    id: 'vid_astroshi_02',
    code: 'VID-ASH-02',
    name: '50s Gemstone: Certified Astrological Yantras',
    vertical: 'ASTROSHI',
    subCategory: 'Sacred Gemstones',
    videoDuration: '0:50',
    hookHeadline: 'Galat gemstone pehenna ho sakta hai nuksaanday',
    thumbnailGradient: 'from-teal-600 to-cyan-900',
    spend: 98000,
    impressions: 410000,
    clicks: 9800,
    leadsCount: 250,
    capturedRevenue: 249750,
    roas: 2.55
  },

  // CONSULTANCY CREATIVES
  {
    id: 'vid_consult_01',
    code: 'VID-CNS-01',
    name: '90s Architecture: Bespoke Vastu Shikhar Site Audit',
    vertical: 'CONSULTANCY',
    subCategory: 'Bespoke Vastu Shikhar',
    videoDuration: '1:30',
    hookHeadline: 'Bespoke Vastu Shikhar Architecture Audit on-site',
    thumbnailGradient: 'from-amber-700 to-yellow-900',
    spend: 210000,
    impressions: 380000,
    clicks: 6500,
    leadsCount: 280,
    capturedRevenue: 5880000,
    roas: 28.00
  },
  {
    id: 'vid_consult_02',
    code: 'VID-CNS-02',
    name: '60s High Net Worth: VIP Commercial Property Audit',
    vertical: 'CONSULTANCY',
    subCategory: 'VIP Personal Consultation',
    videoDuration: '1:00',
    hookHeadline: 'Commercial project launch se pehle Vastu audit zaroori',
    thumbnailGradient: 'from-yellow-600 to-amber-900',
    spend: 180000,
    impressions: 320000,
    clicks: 5200,
    leadsCount: 240,
    capturedRevenue: 5040000,
    roas: 28.00
  }
];

// ==============================================================================
// 16 REAL LANDING PAGES ACROSS ALL CATEGORIES
// ==============================================================================
export const LANDING_PAGES: LandingPage[] = [
  // VASTU (4 PAGES AS REQUESTED)
  {
    id: 'lp_vastu_01',
    code: 'vastu-residential-report',
    name: 'Vastu Wheel Residential Audit (LP 1)',
    businessUnit: 'VASTU',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://vastu.mangotreetechnology.com/residential',
    visitors: 38900,
    leadsCount: 150,
    isActive: true
  },
  {
    id: 'lp_vastu_02',
    code: 'vastu-commercial-office',
    name: 'Vastu Commercial Office Audit (LP 2)',
    businessUnit: 'VASTU',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'WORDPRESS',
    url: 'https://vastu.mangotreetechnology.com/commercial',
    visitors: 24800,
    leadsCount: 130,
    isActive: true
  },
  {
    id: 'lp_vastu_03',
    code: 'vastu-quick-audit',
    name: 'Express Vastu Remedial Audit (LP 3)',
    businessUnit: 'VASTU',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://vastu.mangotreetechnology.com/quick-audit',
    visitors: 19500,
    leadsCount: 120,
    isActive: true
  },
  {
    id: 'lp_vastu_04',
    code: 'vastu-industrial-factory',
    name: 'Factory & Industrial Architecture (LP 4)',
    businessUnit: 'VASTU',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_REACT',
    url: 'https://vastu.mangotreetechnology.com/industrial',
    visitors: 14200,
    leadsCount: 120,
    isActive: true
  },

  // WEBINARS (2 PAGES - ASTRO WEBINAR & VASTU WEBINAR)
  {
    id: 'lp_webinar_astro_01',
    code: 'webinar-astro-masterclass',
    name: 'Astro Masterclass 3-Day Live Cohort',
    businessUnit: 'WEBINAR',
    primaryRazorpayAccount: 'RZP_WEBINAR',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://webinar.mangotreetechnology.com/astro-live',
    visitors: 52000,
    leadsCount: 260,
    isActive: true
  },
  {
    id: 'lp_webinar_vastu_01',
    code: 'webinar-vastu-cohort-3day',
    name: 'Vastu Science Live 3-Day Cohort',
    businessUnit: 'WEBINAR',
    primaryRazorpayAccount: 'RZP_WEBINAR',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://webinar.mangotreetechnology.com/vastu-live',
    visitors: 54000,
    leadsCount: 260,
    isActive: true
  },

  // PALMISTRY (2 PAGES)
  {
    id: 'lp_palm_01',
    code: 'palmistry-report-v1',
    name: 'Palmistry Comprehensive Report LP 1',
    businessUnit: 'PALMISTRY',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://palmistry.mangotreetechnology.com/report-v1',
    visitors: 48500,
    leadsCount: 300,
    isActive: true
  },
  {
    id: 'lp_palm_02',
    code: 'palmistry-express-scan',
    name: 'Instant Palm Line Hand Reading LP 2',
    businessUnit: 'PALMISTRY',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'WORDPRESS',
    url: 'https://palmistry.mangotreetechnology.com/express',
    visitors: 28000,
    leadsCount: 220,
    isActive: true
  },

  // ASTROLOGY (2 PAGES)
  {
    id: 'lp_astro_01',
    code: 'astro-kundali-horoscope',
    name: 'Janam Kundali & Birth Chart Blueprint',
    businessUnit: 'ASTROLOGY',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://astro.mangotreetechnology.com/kundali',
    visitors: 44000,
    leadsCount: 270,
    isActive: true
  },
  {
    id: 'lp_astro_02',
    code: 'astro-career-dasha',
    name: 'Career & Wealth Planetary Transit Report',
    businessUnit: 'ASTROLOGY',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://astro.mangotreetechnology.com/career',
    visitors: 36000,
    leadsCount: 250,
    isActive: true
  },

  // ASTROSHI (2 PAGES)
  {
    id: 'lp_astroshi_01',
    code: 'astroshi-sacred-guidance',
    name: 'Astroshi Spiritual Life Guidance',
    businessUnit: 'ASTROSHI',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://astroshi.mangotreetechnology.com/guidance',
    visitors: 39000,
    leadsCount: 270,
    isActive: true
  },
  {
    id: 'lp_astroshi_02',
    code: 'astroshi-sacred-gemstones',
    name: 'Energized Astroshi Yantras & Gemstones',
    businessUnit: 'ASTROSHI',
    primaryRazorpayAccount: 'RZP_GLOBALINCH',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://astroshi.mangotreetechnology.com/gemstones',
    visitors: 32000,
    leadsCount: 250,
    isActive: true
  },

  // CONSULTANCY (2 PAGES)
  {
    id: 'lp_consult_01',
    code: 'consultancy-vastu-shikhar',
    name: 'Bespoke Vastu Shikhar Site Architecture',
    businessUnit: 'CONSULTANCY',
    primaryRazorpayAccount: 'RZP_VASTU_SHIKHAR',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://consultancy.vastushikhar.com/audit',
    visitors: 22000,
    leadsCount: 280,
    isActive: true
  },
  {
    id: 'lp_consult_02',
    code: 'consultancy-vip-personal',
    name: 'VIP High-Net-Worth Personal Consultation',
    businessUnit: 'CONSULTANCY',
    primaryRazorpayAccount: 'RZP_VASTU_SHIKHAR',
    pageType: 'CUSTOM_NEXTJS',
    url: 'https://consultancy.vastushikhar.com/vip',
    visitors: 18000,
    leadsCount: 240,
    isActive: true
  }
];

// Names dataset for realistic dummy records
const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Reyansh', 'Arjun', 'Kabir', 'Rudra', 'Ananya', 'Diya',
  'Riddhi', 'Aadhya', 'Saanvi', 'Myra', 'Kavya', 'Pooja', 'Rohan', 'Neha', 'Gaurav', 'Manish',
  'Sunil', 'Deepak', 'Alok', 'Amit', 'Priya', 'Swati', 'Meera', 'Ritu', 'Karan', 'Siddharth',
  'Vivek', 'Harsh', 'Mohit', 'Varun', 'Ankit', 'Kunal', 'Divya', 'Shreya', 'Tanvi', 'Preeti',
  'Vandana', 'Rajeev', 'Naveen', 'Ashish', 'Santosh', 'Dinesh', 'Suresh', 'Mukesh', 'Mahesh', 'Ramesh'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Mehta', 'Shah', 'Patel', 'Joshi', 'Kulkarni',
  'Deshmukh', 'Singhania', 'Chopra', 'Kapoor', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Pillai', 'Rao',
  'Agarwal', 'Bansal', 'Mittal', 'Goel', 'Jain', 'Saxena', 'Srivastava', 'Pandey', 'Mishra', 'Dubey',
  'Tiwari', 'Chauhan', 'Rathore', 'Yadav', 'Rawat', 'Thakur', 'Negi', 'Bisht', 'Chatterjee', 'Mukherjee'
];

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Vadodara', state: 'Gujarat' }
];

// ==============================================================================
// MASTER GENERATOR: 520+ REALISTIC RECORDS PER CATEGORY
// ==============================================================================
export function generateFullEnterpriseMockData(): {
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
} {
  const customers: Customer[] = [];
  const leads: Lead[] = [];
  const orders: Order[] = [];
  const paymentAttempts: PaymentAttempt[] = [];
  const capturedPayments: CapturedPayment[] = [];
  const refunds: Refund[] = [];
  const aiCalls: AiElementCall[] = [];
  const watiMessages: WatiMessage[] = [];
  const whatsappAiConversations: WhatsAppAiConversation[] = [];
  const touchpoints: TrackingTouchpoint[] = [];
  const attributions: ConversionAttribution[] = [];
  const auditLogs: AuditLog[] = [];

  // 1. EXACT RAVI KUMAR LANDMARK TEST CASE (PALMISTRY LP 1)
  const raviCustomer: Customer = {
    id: 'cust_ravi_001',
    primaryPhone: '+91 98765 43210',
    phone: '+91 98765 43210',
    primaryEmail: 'ravi.kumar@example.com',
    email: 'ravi.kumar@example.com',
    fullName: 'Ravi Kumar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    lifecycleStage: 'CUSTOMER',
    isDndOptOut: false,
    firstSeenAt: '2026-10-28 10:15 AM',
    lastActiveAt: '2026-10-28 10:45 AM',
    totalOrders: 1,
    totalSpent: 999.00
  };
  customers.push(raviCustomer);

  const raviLead: Lead = {
    id: 'lead_ravi_001',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    customerPhone: raviCustomer.primaryPhone,
    customerEmail: raviCustomer.primaryEmail,
    businessUnit: 'PALMISTRY',
    company: 'GLOBALINCH' as CompanyCode,
    subCategory: 'Palmistry Comprehensive',
    productName: 'Palmistry Comprehensive Report',
    landingPageId: 'lp_palm_01',
    landingPageCode: 'palmistry-report-v1',
    landingPageSlug: 'palmistry-report-v1',
    adCreativeId: 'vid_palm_01',
    adCreativeName: '35s Viral: Palm Life Line Wealth Myth Debunked',
    leadStatus: 'CONVERTED',
    status: 'CONVERTED',
    enquirySource: 'META_ADS',
    createdAt: '2026-10-28 10:15 AM',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'palmistry_top_funnel_oct26',
    utmContent: 'video_ad_hook_01',
    totalAttempts: 3,
    failedAttempts: 2,
    capturedRevenue: 999.00,
    aiCallStatus: 'CONNECTED',
    watiStatus: 'DELIVERED',
    whatsappAiStatus: 'RESOLVED'
  };
  leads.push(raviLead);

  touchpoints.push({
    id: 'tp_ravi_001',
    leadId: raviLead.id,
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'palmistry_top_funnel_oct26',
    utmContent: 'video_ad_hook_01',
    fbclid: 'fb.1.1698485700.IwAR123',
    timestamp: '2026-10-28 10:15 AM'
  });

  const raviOrder: Order = {
    id: 'ord_ravi_001',
    orderNumber: 'ORD-20261028-0001',
    gatewayOrderId: 'order_RZP_Ravi_01',
    razorpayOrderId: 'order_RZP_Ravi_01',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    company: 'GLOBALINCH' as CompanyCode,
    razorpayAccount: 'RZP_GLOBALINCH',
    accountCode: 'GLOBAL_INCH',
    productName: 'Palmistry Comprehensive Report',
    amount: 999.00,
    amountPaid: 999.00,
    amountDue: 0.00,
    currency: 'INR',
    orderStatus: 'PAID',
    status: 'PAID',
    createdAt: '2026-10-28 10:18 AM'
  };
  orders.push(raviOrder);

  // Attempt 1: FAILED (UPI Timeout)
  paymentAttempts.push({
    id: 'att_ravi_001',
    orderId: raviOrder.id,
    orderNumber: raviOrder.orderNumber,
    gatewayPaymentId: 'pay_Fail_Ravi_01',
    razorpayPaymentId: 'pay_Fail_Ravi_01',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    razorpayAccount: 'RZP_GLOBALINCH',
    amount: 999.00,
    currency: 'INR',
    attemptNumber: 1,
    attemptStatus: 'FAILED',
    status: 'FAILED',
    paymentMethod: 'upi',
    vpa: 'ravi.kumar@oksbi',
    errorCode: 'BAD_REQUEST_ERROR',
    errorMessage: 'Payment confirmation timed out on UPI app',
    errorDescription: 'Payment confirmation timed out on UPI app',
    timestamp: '2026-10-28 10:20 AM',
    createdAt: '2026-10-28 10:20 AM'
  });

  // Attempt 2: FAILED (Card Decline)
  paymentAttempts.push({
    id: 'att_ravi_002',
    orderId: raviOrder.id,
    orderNumber: raviOrder.orderNumber,
    gatewayPaymentId: 'pay_Fail_Ravi_02',
    razorpayPaymentId: 'pay_Fail_Ravi_02',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    razorpayAccount: 'RZP_GLOBALINCH',
    amount: 999.00,
    currency: 'INR',
    attemptNumber: 2,
    attemptStatus: 'FAILED',
    status: 'FAILED',
    paymentMethod: 'card',
    errorCode: 'INSUFFICIENT_FUNDS',
    errorMessage: 'Card issuer bank declined transaction due to insufficient limit',
    errorDescription: 'Card issuer bank declined transaction due to insufficient limit',
    timestamp: '2026-10-28 10:25 AM',
    createdAt: '2026-10-28 10:25 AM'
  });

  // AI Element Call: CONNECTED (Agent Pooja, 135s)
  const raviCall: AiElementCall = {
    id: 'call_ravi_001',
    providerCallId: 'ai_call_ele_998124',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    customerPhone: raviCustomer.primaryPhone,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    landingPageCode: 'palmistry-report-v1',
    agentName: 'Pooja (Recovery AI Agent)',
    callStatus: 'CONNECTED',
    status: 'CONNECTED',
    callStartAt: '2026-10-28 10:27 AM',
    callEndAt: '2026-10-28 10:29:15 AM',
    durationSeconds: 135,
    customerIntent: 'Interested in Palmistry Consultation, encountered UPI bank limit issue',
    summary: 'Customer answered immediately. Pooja assisted in resolving UPI issue by recommending GPay QR link. Customer agreed to complete payment right now.',
    sentiment: 'POSITIVE',
    transcript: 'Pooja: Namaste Ravi ji, main Palmistry Desk se Pooja baat kar rahi hu. Aapka comprehensive palm report check out karte waqt UPI timeout hua tha, kya aapko koi takleef aa rahi hai?\nRavi: Haan Pooja ji, SBI UPI app freeze ho gaya tha limit ki wajah se.\nPooja: Bilkul fikar mat kijiye Ravi ji, main aapko WhatsApp pe ek direct payment confirmation link bhej rahi hu jisse aap Google Pay ya kisi bhi doosre app se safely complete kar sakte hain. Aapka draft safe hai.\nRavi: Haan please bhej dijiye, main turant kar deta hu.\nPooja: Dhanyawad Ravi ji, link bhej diya hai.',
    recordingUrl: 'https://storage.googleapis.com/lead-audio-vault/recordings/ravi_kumar_135s.mp3',
    createdAt: '2026-10-28 10:27 AM'
  };
  aiCalls.push(raviCall);

  // WATI recovery link message
  watiMessages.push({
    id: 'wati_ravi_001',
    providerMessageId: 'wamid_HBgLMzk4NzY1NDMyMTAVAgASGBQzQU',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    customerPhone: raviCustomer.primaryPhone,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    accountCode: 'WATI_ACC_1',
    watiAccountName: 'Palmistry Official Support',
    templateName: 'palm_recovery_direct_upi_link',
    direction: 'OUTBOUND',
    messageBody: 'Namaste Ravi ji, Pooja ji se baat ke mutabiq aapka special report checkout link yahan hai: https://palmistry.mangotreetechnology.com/pay/ord_ravi_001. Turant click karein!',
    deliveryStatus: 'DELIVERED',
    status: 'DELIVERED',
    sentAt: '2026-10-28 10:30 AM',
    deliveredAt: '2026-10-28 10:30:12 AM',
    readAt: '2026-10-28 10:31 AM'
  });

  // Attempt 3: CAPTURED (₹999.00)
  const raviAttempt3: PaymentAttempt = {
    id: 'att_ravi_003',
    orderId: raviOrder.id,
    orderNumber: raviOrder.orderNumber,
    gatewayPaymentId: 'pay_Succ_Ravi_03',
    razorpayPaymentId: 'pay_Succ_Ravi_03',
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    razorpayAccount: 'RZP_GLOBALINCH',
    amount: 999.00,
    currency: 'INR',
    attemptNumber: 3,
    attemptStatus: 'CAPTURED',
    status: 'CAPTURED',
    paymentMethod: 'upi',
    vpa: 'ravi.kumar@okhdfcbank',
    timestamp: '2026-10-28 10:45 AM',
    createdAt: '2026-10-28 10:45 AM'
  };
  paymentAttempts.push(raviAttempt3);

  const raviCapture: CapturedPayment = {
    id: 'cap_ravi_001',
    orderId: raviOrder.id,
    orderNumber: raviOrder.orderNumber,
    paymentAttemptId: raviAttempt3.id,
    gatewayPaymentId: raviAttempt3.gatewayPaymentId,
    razorpayPaymentId: raviAttempt3.gatewayPaymentId,
    razorpayOrderId: raviOrder.razorpayOrderId,
    customerId: raviCustomer.id,
    customerName: raviCustomer.fullName,
    leadId: raviLead.id,
    businessUnit: 'PALMISTRY',
    razorpayAccount: 'RZP_GLOBALINCH',
    accountCode: 'GLOBAL_INCH',
    amount: 999.00,
    capturedAmount: 999.00,
    currency: 'INR',
    fee: 19.98,
    tax: 3.60,
    capturedAt: '2026-10-28 10:45 AM'
  };
  capturedPayments.push(raviCapture);

  attributions.push({
    id: 'attr_ravi_001',
    capturedPaymentId: raviCapture.id,
    leadId: raviLead.id,
    customerId: raviCustomer.id,
    attributionTier: 'AI_ASSISTED',
    attributedRevenue: 999.00,
    aiCallId: raviCall.id,
    watiMessageId: 'wati_ravi_001',
    confidence: 1.0,
    createdAt: '2026-10-28 10:45 AM'
  });

  auditLogs.push({
    id: 'aud_001',
    entityType: 'ORDER',
    entityId: raviOrder.id,
    action: 'STATUS_CHANGE',
    actorName: 'Razorpay Webhook (Automated)',
    actorRole: 'SYSTEM',
    performedBy: 'SYSTEM',
    details: 'Order ORD-20261028-0001 transitioned from PENDING to PAID on payment capture pay_Succ_Ravi_03',
    timestamp: '2026-10-28 10:45 AM',
    createdAt: '2026-10-28 10:45 AM'
  });

  // ==============================================================================
  // 2. GENERATE 520+ HIGH QUALITY RECORDS FOR EACH SPECIFIC CATEGORY!
  // TOTAL: 6 CATEGORIES × 520 RECORDS = 3,120+ REALISTIC LEADS!
  // ==============================================================================

  const CATEGORY_SPECS = [
    // COMPANY 1: VASTU SHIKHAR (3 CATEGORIES)
    {
      company: 'VASTU_SHIKHAR' as CompanyCode,
      category: 'ASTROLOGY' as BusinessUnitCode,
      subCategories: ['Janam Kundali Blueprint', 'Career Wealth Transit', 'Gemstone Remedy'],
      lps: ['lp_astro_01', 'lp_astro_02'],
      videoCreatives: ['vid_astro_01', 'vid_astro_02'],
      price: 999.00,
      productName: 'Vedic Janam Kundali & Dasha Analysis',
      rzpAccount: 'RZP_VASTU_SHIKHAR' as RazorpayAccountCode,
      rzpCode: 'VASTU_SHIKHAR',
      count: 520
    },
    {
      company: 'VASTU_SHIKHAR' as CompanyCode,
      category: 'VASTU' as BusinessUnitCode,
      subCategories: ['Residential Vastu Audit', 'Commercial Office Vastu', 'Factory Industrial Architecture'],
      lps: ['lp_vastu_01', 'lp_vastu_02'],
      videoCreatives: ['vid_vastu_01', 'vid_vastu_02'],
      price: 1499.00,
      productName: 'Vastu Shastra Architecture Audit',
      rzpAccount: 'RZP_VASTU_SHIKHAR' as RazorpayAccountCode,
      rzpCode: 'VASTU_SHIKHAR',
      count: 520
    },
    {
      company: 'VASTU_SHIKHAR' as CompanyCode,
      category: 'CONSULTANCY' as BusinessUnitCode,
      subCategories: ['Bespoke Vastu Shikhar', 'VIP Personal Consultation'],
      lps: ['lp_consult_01', 'lp_consult_02'],
      videoCreatives: ['vid_consult_01', 'vid_consult_02'],
      price: 21000.00,
      productName: 'Bespoke Vastu Shikhar Architecture Audit',
      rzpAccount: 'RZP_VASTU_SHIKHAR' as RazorpayAccountCode,
      rzpCode: 'VASTU_SHIKHAR',
      count: 520
    },

    // COMPANY 2: GLOBALINCH (2 CATEGORIES)
    {
      company: 'GLOBALINCH' as CompanyCode,
      category: 'VASTU_REPORT' as BusinessUnitCode,
      subCategories: ['Vastu Wheel Residential', 'Vastu Commercial Office', 'Express Vastu Audit'],
      lps: ['lp_vastu_03', 'lp_vastu_04'],
      videoCreatives: ['vid_vastu_03', 'vid_vastu_04'],
      price: 1499.00,
      productName: 'Vastu Wheel Residential & Commercial Audit',
      rzpAccount: 'RZP_GLOBALINCH' as RazorpayAccountCode,
      rzpCode: 'GLOBAL_INCH',
      count: 0 // Clean empty state: zero synthetic mock leads/orders. Populated only by real Meta Ads + Razorpay data.
    },
    {
      company: 'GLOBALINCH' as CompanyCode,
      category: 'PALMISTRY' as BusinessUnitCode,
      subCategories: ['Palmistry Comprehensive', 'Instant Palm Line Reading'],
      lps: ['lp_palm_01', 'lp_palm_02'],
      videoCreatives: ['vid_palm_01', 'vid_palm_02'],
      price: 999.00,
      productName: 'Comprehensive Palm Analysis Report',
      rzpAccount: 'RZP_GLOBALINCH' as RazorpayAccountCode,
      rzpCode: 'GLOBAL_INCH',
      count: 519 // 1 is Ravi Kumar
    },

    // COMPANY 3: MANGO TREE TECHNOLOGY (1 CATEGORY)
    {
      company: 'MANGO_TREE' as CompanyCode,
      category: 'ASTROSHI' as BusinessUnitCode,
      subCategories: ['Astroshi Spiritual Guidance', 'Sacred Energy Audit', 'Sacred Gemstones'],
      lps: ['lp_astroshi_01', 'lp_astroshi_02'],
      videoCreatives: ['vid_astroshi_01', 'vid_astroshi_02'],
      price: 999.00,
      productName: 'Astroshi Sacred Geometry & Guidance Audit',
      rzpAccount: 'RZP_MANGO_TREE' as RazorpayAccountCode,
      rzpCode: 'MANGO_TREE',
      count: 520
    }
  ];

  let recordSequence = 2;

  CATEGORY_SPECS.forEach(spec => {
    for (let c = 1; c <= spec.count; c++) {
      const idx = recordSequence++;
      const fName = pickRandom(FIRST_NAMES);
      const lName = pickRandom(LAST_NAMES);
      const fullName = `${fName} ${lName}`;
      const phoneDigits = randInt(7000000000, 9999999999);
      const cleanPhone = `+91 ${phoneDigits}`;
      const cleanEmail = `${fName.toLowerCase()}.${lName.toLowerCase()}${randInt(10, 999)}@gmail.com`;
      const location = pickRandom(CITIES);

      const dayOffset = randInt(0, 30);
      const hour = randInt(8, 22);
      const minute = randInt(10, 59);
      const dateStr = `2026-10-${String(30 - (dayOffset % 28)).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} IST`;

      const subCat = pickRandom(spec.subCategories);
      const lpId = pickRandom(spec.lps);
      const lp = LANDING_PAGES.find(p => p.id === lpId) || LANDING_PAGES[0];
      const videoId = pickRandom(spec.videoCreatives);
      const video = VIDEO_CREATIVES.find(v => v.id === videoId) || VIDEO_CREATIVES[0];

      // Customer Record
      const customerId = `cust_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
      const cust: Customer = {
        id: customerId,
        primaryPhone: cleanPhone,
        phone: cleanPhone,
        primaryEmail: cleanEmail,
        email: cleanEmail,
        fullName: fullName,
        city: location.city,
        state: location.state,
        pincode: `${randInt(110001, 800001)}`,
        lifecycleStage: 'PROSPECT',
        isDndOptOut: pseudoRandom() < 0.04,
        firstSeenAt: dateStr,
        lastActiveAt: dateStr,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: dateStr
      };

      // Lead Record
      const leadId = `lead_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
      const lead: Lead = {
        id: leadId,
        customerId: cust.id,
        customerName: cust.fullName,
        customerPhone: cust.primaryPhone,
        customerEmail: cust.primaryEmail,
        businessUnit: spec.category,
        company: spec.company,
        subCategory: subCat,
        productName: spec.productName,
        landingPageId: lp.id,
        landingPageCode: lp.code,
        landingPageSlug: lp.code,
        adCreativeId: video.id,
        adCreativeName: video.name,
        leadStatus: 'NEW',
        status: 'NEW',
        enquirySource: 'META_ADS',
        createdAt: dateStr,
        utmSource: 'meta_ads',
        utmMedium: 'cpc',
        utmCampaign: `${spec.category.toLowerCase()}_top_funnel_campaign`,
        utmContent: video.code,
        marketingAdId: `ad_${spec.category.toLowerCase()}_${(c % 10) + 1}`,
        totalAttempts: 0,
        failedAttempts: 0,
        capturedRevenue: 0
      };

      // Touchpoint
      touchpoints.push({
        id: `tp_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
        leadId: lead.id,
        utmSource: 'meta_ads',
        utmMedium: 'cpc',
        utmCampaign: lead.utmCampaign || '',
        utmContent: video.code,
        fbclid: `fb.1.${randInt(1000000, 9999999)}`,
        timestamp: dateStr
      });

      // Commercial Progression (~80% create an order)
      if (pseudoRandom() < 0.80) {
        const orderId = `ord_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
        const orderNum = `ORD-202610-${spec.category.slice(0, 3)}-${String(c).padStart(4, '0')}`;
        const order: Order = {
          id: orderId,
          orderNumber: orderNum,
          gatewayOrderId: `order_rzp_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
          razorpayOrderId: `order_rzp_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
          customerId: cust.id,
          customerName: cust.fullName,
          leadId: lead.id,
          businessUnit: spec.category,
          company: spec.company,
          razorpayAccount: spec.rzpAccount,
          accountCode: spec.rzpCode,
          productName: spec.productName,
          amount: spec.price,
          amountPaid: 0,
          amountDue: spec.price,
          currency: 'INR',
          orderStatus: 'PENDING',
          status: 'PENDING',
          createdAt: dateStr
        };

        const outcomeRoll = pseudoRandom();

        // 60% Captured, 25% Failed drop-off, 15% Pending checkout
        if (outcomeRoll < 0.60) {
          const attemptCount = pseudoRandom() < 0.7 ? 1 : 2;
          lead.totalAttempts = attemptCount;

          if (attemptCount === 2) {
            paymentAttempts.push({
              id: `att_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}_1`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              gatewayPaymentId: `pay_fail_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              razorpayPaymentId: `pay_fail_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              customerId: cust.id,
              customerName: cust.fullName,
              leadId: lead.id,
              businessUnit: spec.category,
              razorpayAccount: spec.rzpAccount,
              amount: spec.price,
              currency: 'INR',
              attemptNumber: 1,
              attemptStatus: 'FAILED',
              status: 'FAILED',
              paymentMethod: pickRandom(['upi', 'card']),
              errorCode: pickRandom(['PAYMENT_TIMED_OUT', 'INSUFFICIENT_FUNDS', 'BAD_REQUEST_ERROR']),
              errorMessage: 'Payment authorization timed out or was declined',
              errorDescription: 'Payment authorization timed out or was declined',
              timestamp: dateStr,
              createdAt: dateStr
            });
            lead.failedAttempts = (lead.failedAttempts || 0) + 1;
          }

          // Successful Capture
          const succAttemptId = `att_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}_succ`;
          const succGatewayId = `pay_succ_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
          paymentAttempts.push({
            id: succAttemptId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            gatewayPaymentId: succGatewayId,
            razorpayPaymentId: succGatewayId,
            customerId: cust.id,
            customerName: cust.fullName,
            leadId: lead.id,
            businessUnit: spec.category,
            razorpayAccount: spec.rzpAccount,
            amount: spec.price,
            currency: 'INR',
            attemptNumber: attemptCount,
            attemptStatus: 'CAPTURED',
            status: 'CAPTURED',
            paymentMethod: pickRandom(['upi', 'card', 'netbanking']),
            vpa: `${cust.fullName.toLowerCase().replace(/[^a-z]/g, '')}@upi`,
            timestamp: dateStr,
            createdAt: dateStr
          });

          const captureId = `cap_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
          const fee = Math.round(spec.price * 0.02 * 100) / 100;
          const tax = Math.round(fee * 0.18 * 100) / 100;
          capturedPayments.push({
            id: captureId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentAttemptId: succAttemptId,
            gatewayPaymentId: succGatewayId,
            razorpayPaymentId: succGatewayId,
            razorpayOrderId: order.razorpayOrderId,
            customerId: cust.id,
            customerName: cust.fullName,
            leadId: lead.id,
            businessUnit: spec.category,
            razorpayAccount: spec.rzpAccount,
            accountCode: spec.rzpCode,
            amount: spec.price,
            capturedAmount: spec.price,
            currency: 'INR',
            fee: fee,
            tax: tax,
            capturedAt: dateStr
          });

          order.amountPaid = spec.price;
          order.amountDue = 0;
          order.orderStatus = 'PAID';
          order.status = 'PAID';
          lead.leadStatus = 'CONVERTED';
          lead.status = 'CONVERTED';
          lead.capturedRevenue = spec.price;
          cust.lifecycleStage = 'CUSTOMER';
          cust.totalOrders = (cust.totalOrders || 0) + 1;
          cust.totalSpent = (cust.totalSpent || 0) + spec.price;

          // Attribution: 40% AI, 35% WATI, 25% Direct
          const attrRoll = pseudoRandom();
          if (attrRoll < 0.40) {
            const callId = `call_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
            aiCalls.push({
              id: callId,
              providerCallId: `call_sess_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              customerId: cust.id,
              customerName: cust.fullName,
              customerPhone: cust.primaryPhone,
              leadId: lead.id,
              businessUnit: spec.category,
              landingPageCode: lp.code,
              agentName: 'Pooja (Recovery AI Agent)',
              callStatus: 'CONNECTED',
              status: 'CONNECTED',
              callStartAt: dateStr,
              callEndAt: dateStr,
              durationSeconds: randInt(45, 160),
              customerIntent: 'Interested in completing order after quick query resolution',
              summary: 'Customer answered AI voice call, resolved format doubt and completed checkout.',
              sentiment: 'POSITIVE',
              transcript: 'Agent Pooja: Namaste ji, aapka report draft ready hai...\nCustomer: Haan main abhi link pe pay kar raha hu.',
              recordingUrl: 'https://storage.googleapis.com/lead-audio-vault/recordings/sample.mp3',
              createdAt: dateStr
            });
            lead.aiCallStatus = 'CONNECTED';

            attributions.push({
              id: `attr_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              capturedPaymentId: captureId,
              leadId: lead.id,
              customerId: cust.id,
              attributionTier: 'AI_ASSISTED',
              attributedRevenue: spec.price,
              aiCallId: callId,
              confidence: 0.95,
              createdAt: dateStr
            });
          } else if (attrRoll < 0.75) {
            const msgId = `wati_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`;
            watiMessages.push({
              id: msgId,
              providerMessageId: `wamid_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              customerId: cust.id,
              customerName: cust.fullName,
              customerPhone: cust.primaryPhone,
              leadId: lead.id,
              businessUnit: spec.category,
              accountCode: spec.rzpCode === 'VASTU_SHIKHAR' ? 'WATI_ACC_3' : 'WATI_ACC_1',
              watiAccountName: `${spec.category} Official WhatsApp`,
              templateName: 'order_checkout_nudge',
              direction: 'OUTBOUND',
              messageBody: `Hi ${cust.fullName}, click to confirm your ${spec.productName}: https://domain.com/pay/${order.id}`,
              deliveryStatus: 'READ',
              status: 'READ',
              sentAt: dateStr,
              deliveredAt: dateStr,
              readAt: dateStr
            });
            lead.watiStatus = 'READ';

            attributions.push({
              id: `attr_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              capturedPaymentId: captureId,
              leadId: lead.id,
              customerId: cust.id,
              attributionTier: 'WATI_ASSISTED',
              attributedRevenue: spec.price,
              watiMessageId: msgId,
              confidence: 0.85,
              createdAt: dateStr
            });
          } else {
            attributions.push({
              id: `attr_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              capturedPaymentId: captureId,
              leadId: lead.id,
              customerId: cust.id,
              attributionTier: 'LAST_TOUCH',
              attributedRevenue: spec.price,
              confidence: 1.0,
              createdAt: dateStr
            });
          }

          // Refunds (~3% realistic rate)
          if (pseudoRandom() < 0.03) {
            refunds.push({
              id: `rfnd_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              paymentId: captureId,
              capturedPaymentId: captureId,
              gatewayPaymentId: succGatewayId,
              razorpayRefundId: `rfnd_rzp_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              gatewayRefundId: `rfnd_rzp_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
              orderNumber: order.orderNumber,
              customerName: cust.fullName,
              businessUnit: spec.category,
              razorpayAccount: spec.rzpAccount,
              amount: spec.price,
              refundAmount: spec.price,
              currency: 'INR',
              status: 'PROCESSED',
              refundStatus: 'PROCESSED',
              reason: pickRandom(['Customer duplicate payment', 'Consultation time rescheduled', 'Refund requested within warranty']),
              processedAt: dateStr,
              createdAt: dateStr
            });
          }

        } else if (outcomeRoll < 0.85) {
          // Failed Drop-off path
          const failedCount = pseudoRandom() < 0.6 ? 1 : 2;
          lead.totalAttempts = failedCount;
          lead.failedAttempts = failedCount;
          lead.leadStatus = 'PAYMENT_PENDING';
          lead.status = 'PAYMENT_PENDING';

          for (let a = 1; a <= failedCount; a++) {
            paymentAttempts.push({
              id: `att_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}_${a}`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              gatewayPaymentId: `pay_fail_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}_${a}`,
              razorpayPaymentId: `pay_fail_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}_${a}`,
              customerId: cust.id,
              customerName: cust.fullName,
              leadId: lead.id,
              businessUnit: spec.category,
              razorpayAccount: spec.rzpAccount,
              amount: spec.price,
              currency: 'INR',
              attemptNumber: a,
              attemptStatus: 'FAILED',
              status: 'FAILED',
              paymentMethod: pickRandom(['upi', 'card', 'netbanking']),
              errorCode: pickRandom(['BANK_TECHNICAL_ERROR', 'PAYMENT_TIMED_OUT', 'INSUFFICIENT_FUNDS']),
              errorMessage: 'Payment authorization declined by bank or timed out',
              errorDescription: 'Payment authorization declined by bank or timed out',
              timestamp: dateStr,
              createdAt: dateStr
            });
          }

          // Automated AI recovery call
          const callConn = pseudoRandom() < 0.4;
          aiCalls.push({
            id: `call_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
            providerCallId: `call_sess_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
            customerId: cust.id,
            customerName: cust.fullName,
            customerPhone: cust.primaryPhone,
            leadId: lead.id,
            businessUnit: spec.category,
            landingPageCode: lp.code,
            agentName: 'Pooja (Recovery AI Agent)',
            callStatus: callConn ? 'CONNECTED' : 'NO_ANSWER',
            status: callConn ? 'CONNECTED' : 'NO_ANSWER',
            callStartAt: dateStr,
            callEndAt: dateStr,
            durationSeconds: callConn ? randInt(30, 85) : 0,
            customerIntent: callConn ? 'Customer faced UPI server error, requested call back' : undefined,
            summary: callConn ? 'Spoke to customer, payment link re-sent via WhatsApp.' : 'Customer did not pick up.',
            sentiment: callConn ? 'NEUTRAL' : 'NEGATIVE',
            transcript: callConn ? 'Pooja: Namaste ji...\nCustomer: Haan UPI nahi chala, baad me try karta hu.' : '',
            recordingUrl: 'https://storage.googleapis.com/lead-audio-vault/recordings/sample.mp3',
            createdAt: dateStr
          });
          lead.aiCallStatus = callConn ? 'CONNECTED' : 'NO_ANSWER';

          // WATI automated follow-up
          watiMessages.push({
            id: `wati_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
            providerMessageId: `wamid_${spec.category.toLowerCase()}_${String(c).padStart(4, '0')}`,
            customerId: cust.id,
            customerName: cust.fullName,
            customerPhone: cust.primaryPhone,
            leadId: lead.id,
            businessUnit: spec.category,
            accountCode: spec.rzpCode === 'VASTU_SHIKHAR' ? 'WATI_ACC_3' : 'WATI_ACC_1',
            watiAccountName: `${spec.category} Support WhatsApp`,
            templateName: 'payment_dropoff_nudge',
            direction: 'OUTBOUND',
            messageBody: `Hi ${cust.fullName}, we saw your checkout attempt did not complete. Reach out if you need assistance!`,
            deliveryStatus: pickRandom(['DELIVERED', 'READ', 'FAILED']),
            status: 'DELIVERED',
            sentAt: dateStr
          });

        } else {
          lead.leadStatus = 'CALL_SCHEDULED';
          lead.status = 'CALL_SCHEDULED';
        }

        orders.push(order);
      } else {
        // Direct inquiry / new lead
        lead.leadStatus = 'NEW';
        lead.status = 'NEW';
      }

      customers.push(cust);
      leads.push(lead);
    }
  });

  // Daily Meta Insights for Marketing
  const metaDailyInsights: MarketingCampaign[] = [
    {
      id: 'cmp_meta_01',
      campaignName: 'Vastu Wheel — Top Funnel Lead Gen (Video Ad #1)',
      metaCampaignId: '120208119827360181',
      businessUnit: 'VASTU',
      spend: 145000,
      impressions: 580000,
      clicks: 14200,
      leads: 220,
      purchases: 132,
      purchaseValue: 329780,
      date: '2026-10-29'
    },
    {
      id: 'cmp_meta_02',
      campaignName: 'Webinar — 3-Day Live Masterclass Campaign (Astro & Vastu)',
      metaCampaignId: '120208119828470182',
      businessUnit: 'WEBINAR',
      spend: 270000,
      impressions: 1260000,
      clicks: 34300,
      leads: 520,
      purchases: 312,
      purchaseValue: 259480,
      date: '2026-10-29'
    },
    {
      id: 'cmp_meta_03',
      campaignName: 'Palmistry — Life Line Viral Hook (Video Ad #1)',
      metaCampaignId: '120208119829580183',
      businessUnit: 'PALMISTRY',
      spend: 310000,
      impressions: 1400000,
      clicks: 37700,
      leads: 520,
      purchases: 320,
      purchaseValue: 519480,
      date: '2026-10-29'
    },
    {
      id: 'cmp_meta_04',
      campaignName: 'Astrology — Kundali Sade Sati Transit Campaign',
      metaCampaignId: '120208119830690184',
      businessUnit: 'ASTROLOGY',
      spend: 205000,
      impressions: 870000,
      clicks: 21300,
      leads: 520,
      purchases: 312,
      purchaseValue: 519480,
      date: '2026-10-29'
    },
    {
      id: 'cmp_meta_05',
      campaignName: 'Astroshi — Sacred Energy & Guidance Direct Ads',
      metaCampaignId: '120208119831700185',
      businessUnit: 'ASTROSHI',
      spend: 203000,
      impressions: 840000,
      clicks: 20300,
      leads: 520,
      purchases: 312,
      purchaseValue: 519480,
      date: '2026-10-29'
    },
    {
      id: 'cmp_meta_06',
      campaignName: 'Consultancy — Vastu Shikhar VIP Site Visits',
      metaCampaignId: '120208119832810186',
      businessUnit: 'CONSULTANCY',
      spend: 390000,
      impressions: 700000,
      clicks: 11700,
      leads: 520,
      purchases: 280,
      purchaseValue: 10920000,
      date: '2026-10-29'
    }
  ];

  // Guarantee zero occurrences of "Isha" across all dummy records
  customers.forEach(c => {
    if (c.fullName && /isha/i.test(c.fullName)) c.fullName = c.fullName.replace(/isha/gi, 'Riddhi');
    if (c.email && /isha/i.test(c.email)) c.email = c.email.replace(/isha/gi, 'riddhi');
    if (c.primaryEmail && /isha/i.test(c.primaryEmail)) c.primaryEmail = c.primaryEmail.replace(/isha/gi, 'riddhi');
  });
  leads.forEach(l => {
    if (l.customerName && /isha/i.test(l.customerName)) l.customerName = l.customerName.replace(/isha/gi, 'Riddhi');
    if (l.customerEmail && /isha/i.test(l.customerEmail)) l.customerEmail = l.customerEmail.replace(/isha/gi, 'riddhi');
  });

  return {
    users: DEMO_USERS,
    customers: [],
    landingPages: LANDING_PAGES,
    campaigns: [],
    metaDailyInsights: [],
    adSets: [],
    ads: [],
    touchpoints: [],
    leads: [],
    orders: [],
    paymentAttempts: [],
    capturedPayments: [],
    refunds: [],
    aiCalls: [],
    watiMessages: [],
    whatsappAiConversations: [],
    attributions: [],
    auditLogs: [],
    videoCreatives: []
  };
}
