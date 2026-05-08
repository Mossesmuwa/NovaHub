// pages/sitemap.xml.js
// Dynamic sitemap — covers all approved items + static pages.
// Access at: https://yoursite.vercel.app/sitemap.xml
// Add to robots.txt: Sitemap: https://yoursite.vercel.app/sitemap.xml

import { createClient } from "@supabase/supabase-js";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://novahub.app";

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/category", priority: "0.8", changefreq: "weekly" },
  { url: "/discover", priority: "0.8", changefreq: "weekly" },
  { url: "/trending", priority: "0.9", changefreq: "daily" },
  { url: "/search", priority: "0.7", changefreq: "weekly" },
  { url: "/weekly", priority: "0.8", changefreq: "weekly" },
  { url: "/blog", priority: "0.7", changefreq: "weekly" },
  { url: "/contact", priority: "0.5", changefreq: "monthly" },
  { url: "/privacy", priority: "0.3", changefreq: "monthly" },
  { url: "/terms", priority: "0.3", changefreq: "monthly" },
];

function generateSitemap(staticPages, items) {
  const staticUrls = staticPages
    .map(
      (p) => `
  <url>
    <loc>${SITE}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .join("");

  const itemUrls = items
    .map(
      (item) => `
  <url>
    <loc>${SITE}/item/${encodeURIComponent(item.slug)}</loc>
    <lastmod>${new Date(item.updated_at || item.created_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${itemUrls}
</urlset>`;
}

export default function Sitemap() {
  // Rendered server-side via getServerSideProps
  return null;
}

export async function getServerSideProps({ res }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  // Fetch all approved item slugs — paginated for large datasets
  let items = [];
  let offset = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("items")
      .select("slug, created_at, updated_at")
      .eq("approved", true)
      .not("slug", "is", null)
      .range(offset, offset + PAGE - 1);

    if (error || !data || data.length === 0) break;
    items = [...items, ...data];
    if (data.length < PAGE) break;
    offset += PAGE;
  }

  const sitemap = generateSitemap(STATIC_PAGES, items);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
}
