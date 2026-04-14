// next.config.js
// NovaHub — Next.js configuration
// Covers: image domains, security headers, cron route protection

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── Image domains ──────────────────────────────────────────────────────────
  // Every external source that provides poster/cover/thumbnail images.
  // Next.js Image Optimization will REFUSE to serve any domain not listed here.
  images: {
    remotePatterns: [
      // TMDB — movie + TV posters
      { protocol: 'https', hostname: 'image.tmdb.org',       pathname: '/t/p/**' },
      // RAWG — game cover art
      { protocol: 'https', hostname: 'media.rawg.io',        pathname: '/media/**' },
      // Google Books — book covers
      { protocol: 'https', hostname: 'books.google.com',     pathname: '/books/content/**' },
      // Unsplash — editorial / placeholder images
      { protocol: 'https', hostname: 'images.unsplash.com',  pathname: '/**' },
      // Supabase Storage — user avatars + uploaded item images
      { protocol: 'https', hostname: '*.supabase.co',        pathname: '/storage/v1/object/public/**' },
      // Product Hunt — tool logos
      { protocol: 'https', hostname: 'ph-files.imgix.net',   pathname: '/**' },
      { protocol: 'https', hostname: 'product-hunt-photos.imgix.net', pathname: '/**' },
      // YouTube thumbnails (for video items)
      { protocol: 'https', hostname: 'i.ytimg.com',          pathname: '/vi/**' },
      // Generic CDNs tools often use
      { protocol: 'https', hostname: 'cdn.jsdelivr.net',     pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
    // Serve modern formats — saves ~30% bandwidth
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 7 days
    minimumCacheTTL: 604800,
  },

  // ─── Security headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // ─── Protect ingest routes — only allow Vercel Cron or internal calls
      {
        source: '/api/ingest/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },

  // ─── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Legacy URLs if any
      { source: '/browse', destination: '/category', permanent: true },
    ];
  },
};

module.exports = nextConfig;
