import type { NextConfig } from "next";

/**
 * Security headers applied to every route.
 * Note: a strict Content-Security-Policy is deliberately omitted for now —
 * the theme bootstrap script in `layout.tsx` is inline and would need a
 * nonce-based setup (middleware-generated nonce) to pass. Tracked in
 * DEVELOPMENT_PLAN.md (P0.3 follow-up).
 */
const securityHeaders = [
  // Prevent the site from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let browsers MIME-sniff responses away from declared content-type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send origin only when crossing origins; full URL same-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features the app never uses
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Force HTTPS for two years, incl. subdomains (production is HTTPS-only).
  // Harmless on plain-HTTP localhost — browsers ignore HSTS sent over HTTP.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
] as const;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
