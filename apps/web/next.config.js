// apps/web/next.config.js
// NovaHub Web App — Next.js configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── Image domains ──────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
      { protocol: "https", hostname: "media.rawg.io", pathname: "/media/**" },
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/books/content/**",
      },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "ph-files.imgix.net", pathname: "/**" },
      {
        protocol: "https",
        hostname: "product-hunt-photos.imgix.net",
        pathname: "/**",
      },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/**" },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
  },

  // ─── Security headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /api/security/csp-report;",
          },
        ],
      },
      {
        source: "/api/ingest/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  // ─── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [{ source: "/browse", destination: "/category", permanent: true }];
  },
};

module.exports = nextConfig;
