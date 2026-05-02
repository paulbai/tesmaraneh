import type { NextConfig } from "next";

/** Security headers applied to every route. Tightened to the minimum that
 *  the actual storefront needs:
 *
 *  - HSTS forces HTTPS forever (Vercel terminates TLS for us).
 *  - X-Content-Type-Options blocks MIME sniffing.
 *  - X-Frame-Options denies framing — there's no legitimate iframe of this
 *    site (the Flot popup we open ourselves runs in a child iframe; the
 *    parent is never iframed).
 *  - Referrer-Policy keeps query strings out of outbound referrers.
 *  - Permissions-Policy disables sensors/camera/etc by default.
 *
 *  Notably absent: a strict CSP. With Tailwind's runtime style injection,
 *  framer-motion's inline styles, and Next's own inline scripts it would
 *  need `unsafe-inline` for both script and style — which buys little. If
 *  we want a real CSP later we'll add a nonce-based one through middleware.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
