import Head from 'next/head';

export default function SEO({ title, description, ogTitle, ogDesc }) {
  const t = title || 'NovaHub — Discover Everything You Need';
  const d = description || 'AI-powered discovery for movies, books, AI tools, games, niche companies and more. Updated daily.';
  return (
    <Head>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta property="og:title" content={ogTitle || t} />
      <meta property="og:description" content={ogDesc || d} />
      <meta property="og:type" content="website" />
      <link rel="icon" href="/assets/novahub_favicon.svg" type="image/svg+xml" />
    </Head>
  );
}
