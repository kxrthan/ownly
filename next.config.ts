import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins is suggested by Next.js for network access
  allowedDevOrigins: ['192.168.1.8'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ottrftocgiirsbnkfixc.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
