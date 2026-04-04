import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — app cannot be embedded in iframes
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing responses
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information leaked to other origins
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Enforce HTTPS (1 year, include subdomains)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Block features the app doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy — restrict what can load
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js header
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
