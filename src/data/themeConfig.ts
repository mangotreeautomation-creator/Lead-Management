export interface ColorThemeOption {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  badge: string;
  bg: string;
  card: string;
  border: string;
  accent: string;
  accentHover: string;
  isLight?: boolean;
}

export interface TypographyFontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: string;
  description: string;
  previewText: string;
  weightSupport: string;
}

export const PRODUCTION_THEMES: ColorThemeOption[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Midnight',
    subtitle: 'Classic deep-space onyx with electric blue highlights',
    category: 'Core Dark',
    badge: 'Default',
    bg: '#0c0e14',
    card: '#141620',
    border: '#27272a',
    accent: '#3b82f6',
    accentHover: '#2563eb'
  },
  {
    id: 'emerald',
    name: 'Vastu Fortune Emerald',
    subtitle: 'Prosperity forest obsidian with vibrant emerald green glows',
    category: 'Vedic Vastu',
    badge: 'Vastu Choice',
    bg: '#05110a',
    card: '#0c2014',
    border: '#1a422a',
    accent: '#10b981',
    accentHover: '#059669'
  },
  {
    id: 'cosmic',
    name: 'Vedic Cosmic Indigo',
    subtitle: 'Celestial starry night with mystical royal indigo energy',
    category: 'Astrology',
    badge: 'Vedic Choice',
    bg: '#070b18',
    card: '#0f1730',
    border: '#1c2850',
    accent: '#6366f1',
    accentHover: '#4f46e5'
  },
  {
    id: 'amber',
    name: 'Surya Solar Gold',
    subtitle: 'Deep warm charcoal with radiant solar gold energy',
    category: 'Vedic Surya',
    badge: 'Solar Power',
    bg: '#100d07',
    card: '#1d180d',
    border: '#322716',
    accent: '#f59e0b',
    accentHover: '#d97706'
  },
  {
    id: 'crimson',
    name: 'Mars Manglik Ruby',
    subtitle: 'Deep velvet wine dark with high-impact ruby crimson',
    category: 'Mars Power',
    badge: 'Dynamic Fire',
    bg: '#12070b',
    card: '#200d14',
    border: '#381624',
    accent: '#f43f5e',
    accentHover: '#e11d48'
  },
  {
    id: 'amethyst',
    name: 'Rahu Mystic Violet',
    subtitle: 'Hypnotic midnight violet with luminescent lilac highlights',
    category: 'Mystic Rahu',
    badge: 'Esoteric',
    bg: '#0d0818',
    card: '#18102b',
    border: '#2c1b48',
    accent: '#a855f7',
    accentHover: '#9333ea'
  },
  {
    id: 'nordic',
    name: 'Nordic Frost Slate',
    subtitle: 'Arctic oceanic deep navy slate with crisp cyan ice accents',
    category: 'Enterprise Tech',
    badge: 'Cold Slate',
    bg: '#080e18',
    card: '#101b2d',
    border: '#1c2e4b',
    accent: '#0ea5e9',
    accentHover: '#0284c7'
  },
  {
    id: 'stripe',
    name: 'Stripe Onyx Minimal',
    subtitle: 'Pitch-black ultra-minimalist developer fintech aesthetic',
    category: 'Silicon Valley',
    badge: 'High Contrast',
    bg: '#030304',
    card: '#0c0d10',
    border: '#1c1e24',
    accent: '#6366f1',
    accentHover: '#4f46e5'
  },
  {
    id: 'vantablack',
    name: 'Vantablack OLED White',
    subtitle: 'Absolute zero pitch-black (#000000) with ultra-crisp pure white luminescence',
    category: 'True OLED Black',
    badge: 'Deepest Black',
    bg: '#000000',
    card: '#08080a',
    border: '#202024',
    accent: '#ffffff',
    accentHover: '#f4f4f5'
  },
  {
    id: 'polar',
    name: 'Shopify Polar Light',
    subtitle: 'Pristine daylight enterprise with Shopify merchant green',
    category: 'Daylight',
    badge: 'Pure Light',
    bg: '#f4f5f7',
    card: '#ffffff',
    border: '#e1e3e5',
    accent: '#008060',
    accentHover: '#006e52',
    isLight: true
  },
  {
    id: 'titanium',
    name: 'Linear Titanium Tech',
    subtitle: 'Sleek matte gunmetal graphite with precision coral glow',
    category: 'Linear App',
    badge: 'Minimalist',
    bg: '#0c0e12',
    card: '#151820',
    border: '#242834',
    accent: '#fb7185',
    accentHover: '#f43f5e'
  }
];

export const PRODUCTION_FONTS: TypographyFontOption[] = [
  {
    id: 'inter',
    name: 'Inter',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    category: 'Neo-Grotesque',
    description: 'Linear, Vercel & GitHub standard. Clean, neutral & highly legible',
    previewText: 'Unified Multi-Vertical Telemetry & Operations',
    weightSupport: '300, 400, 500, 600, 700, 800'
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    category: 'Geometric Modern',
    description: 'Shopify & premium SaaS signature font, friendly modern curves',
    previewText: 'Vastu Fortune Webinar & Masterclass Registry',
    weightSupport: '400, 500, 600, 700, 800'
  },
  {
    id: 'outfit',
    name: 'Outfit',
    fontFamily: "'Outfit', sans-serif",
    category: 'Luxury Brand',
    description: 'Geometric, sharp, high-end consumer technology & luxury vibe',
    previewText: 'Real-time AI Calling & Checkout Reconciliation',
    weightSupport: '400, 500, 600, 700, 800'
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    fontFamily: "'DM Sans', sans-serif",
    category: 'Humanist',
    description: 'Stripe & Ramp design standard, approachable geometric balance',
    previewText: 'Razorpay Financial Gateway & T+1 Settlements',
    weightSupport: '400, 500, 700'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    fontFamily: "'Poppins', sans-serif",
    category: 'Geometric Bold',
    description: 'Razorpay & Indian tech standard, confident, round & punchy',
    previewText: 'Gross Captured Volume: ₹3,80,746.00 Reconciled',
    weightSupport: '400, 500, 600, 700'
  },
  {
    id: 'sora',
    name: 'Sora',
    fontFamily: "'Sora', sans-serif",
    category: 'Futuristic Fintech',
    description: 'High-tech clarity with unique futuristic aperture and crispness',
    previewText: 'Pooja AI Voice Telephony • 135s Call Completed',
    weightSupport: '400, 500, 600, 700'
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    fontFamily: "'Space Grotesk', sans-serif",
    category: 'Cyberpunk Grotesk',
    description: 'Raw technical character, developer & high-tech matrix vibe',
    previewText: 'Meta Marketing API Graph • 3.82x Blended ROAS',
    weightSupport: '400, 500, 600, 700'
  },
  {
    id: 'cinzel',
    name: 'Cinzel Classical',
    fontFamily: "'Cinzel', serif",
    category: 'Vedic Royalty',
    description: 'Sacred classical geometry, imperial Vedic astrological majesty',
    previewText: 'VASTU SHIKHAR ASTROLOGY & KUNDALI DOSHA REMEDIES',
    weightSupport: '500, 600, 700, 800'
  },
  {
    id: 'manrope',
    name: 'Manrope',
    fontFamily: "'Manrope', sans-serif",
    category: 'Precision Modern',
    description: 'Semi-condensed, beautiful financial digits and dense data telemetry',
    previewText: '4,592,000 Reach • 98,400 Clicks • 2.14% CTR',
    weightSupport: '400, 500, 600, 700, 800'
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    fontFamily: "'JetBrains Mono', monospace",
    category: 'Terminal Code',
    description: 'High-density developer terminal, fixed-width precision telemetry',
    previewText: 'pay_N8s92kLp -> 200 OK captured_at: 2026-11-05',
    weightSupport: '400, 500, 600, 700'
  }
];
