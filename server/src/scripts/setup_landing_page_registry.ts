import { db } from '../database/client';
import { sql, eq } from 'drizzle-orm';
import { categories, landingPages } from '../database/schema/organizations';

export async function setupLandingPageRegistry() {
  console.log('--- 1. ENSURING COLUMNS & INDEXES ON LANDING_PAGES & NOTES ---');

  // Add route_slug and full_url if not exist
  await db.execute(sql.raw(`
    ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS route_slug varchar(100);
    ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS full_url varchar(500);
    CREATE INDEX IF NOT EXISTS landing_pages_route_slug_idx ON landing_pages(route_slug);
  `));

  // Add performance indexes on notes and metadata
  await db.execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS payment_orders_notes_gin_idx ON payment_orders USING gin (notes);
    CREATE INDEX IF NOT EXISTS leads_metadata_gin_idx ON leads USING gin (metadata);
    CREATE INDEX IF NOT EXISTS payment_orders_lang_idx ON payment_orders ((notes->>'report_language'));
    CREATE INDEX IF NOT EXISTS payment_orders_route_idx ON payment_orders ((COALESCE(notes->>'route', notes->>'campaign')));
    CREATE INDEX IF NOT EXISTS payment_orders_cust_uid_idx ON payment_orders ((notes->>'unique_customer_id'));
    CREATE INDEX IF NOT EXISTS leads_lang_idx ON leads ((metadata->>'reportLanguage'));
    CREATE INDEX IF NOT EXISTS leads_route_idx ON leads ((metadata->>'route'));
  `));

  console.log('--- 2. SEEDING VERIFIED GLOBALINCH LANDING PAGES ---');
  const [cat] = await db.select().from(categories).where(eq(categories.code, 'vastuwheel')).limit(1);
  if (!cat) {
    console.error('Category vastuwheel not found!');
    return;
  }

  const registryEntries = [
    {
      routeSlug: 'fb4',
      urlPath: '/fb4',
      fullUrl: 'https://report.globalinch.com/fb4',
      title: 'VastuWheel Report FB4 Landing Page',
      status: 'ACTIVE',
    },
    {
      routeSlug: 'sales',
      urlPath: '/sales',
      fullUrl: 'https://report.globalinch.com/sales',
      title: 'VastuWheel Sales Direct Funnel',
      status: 'ACTIVE',
    },
    {
      routeSlug: 'fb1',
      urlPath: '/fb1',
      fullUrl: 'https://report.globalinch.com/fb1',
      title: 'VastuWheel FB1 Funnel',
      status: 'ACTIVE',
    },
    {
      routeSlug: 'main',
      urlPath: '/main',
      fullUrl: 'https://report.globalinch.com/main',
      title: 'VastuWheel Main Funnel',
      status: 'ACTIVE',
    },
  ];

  for (const entry of registryEntries) {
    const [existing] = await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.routeSlug, entry.routeSlug))
      .limit(1);

    if (existing) {
      await db
        .update(landingPages)
        .set({
          categoryId: cat.id,
          urlPath: entry.urlPath,
          fullUrl: entry.fullUrl,
          title: entry.title,
          status: entry.status,
          updatedAt: new Date(),
        })
        .where(eq(landingPages.id, existing.id));
      console.log(`Updated landing page: ${entry.routeSlug} -> ${entry.fullUrl}`);
    } else {
      await db.insert(landingPages).values({
        categoryId: cat.id,
        routeSlug: entry.routeSlug,
        urlPath: entry.urlPath,
        fullUrl: entry.fullUrl,
        title: entry.title,
        status: entry.status,
      });
      console.log(`Registered landing page: ${entry.routeSlug} -> ${entry.fullUrl}`);
    }
  }

  console.log('Landing page registry setup complete!');
}

setupLandingPageRegistry().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
