import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://img.clerk.com https://*.clerk.com",
              "connect-src 'self' https://*.supabase.co https://api.groq.com https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com",
              "frame-src https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com",
              "font-src 'self' data:",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
