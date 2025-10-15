import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  
  // Allow iframe embedding from vaoluoi_fe and other trusted sources
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          // Remove X-Frame-Options to allow iframe embedding
          // Use Content-Security-Policy frame-ancestors instead (more flexible)
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://*.vaoluoitv.com https://luck8event.com https://www.luck8event.com", // Allow embedding from vaoluoi_fe
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // In production, specify exact origin: 'http://localhost:8080'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
