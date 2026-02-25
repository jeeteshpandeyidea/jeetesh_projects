import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
    
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Proxy API requests to backend in dev to avoid CORS and timeouts
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return [
      { source: '/api-proxy/:path*', destination: `${apiTarget}/:path*` },
    ];
  },

  // Custom redirects for route aliases
  async redirects() {
    return [
      // Redirect /signin to /auth/signin (if you want to keep both working)
      {
        source: '/signin',
        destination: '/auth/signin',
        permanent: false, // Use false for temporary redirects (307)
      },
      // Add more redirects as needed
      // {
      //   source: '/login',
      //   destination: '/auth/signin',
      //   permanent: false,
      // },
    ];
  },
  
};

export default nextConfig;
