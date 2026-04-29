import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.replit.dev', '*.riker.replit.dev', '*.picard.replit.dev', '*.kirk.replit.dev', '*.spock.replit.dev'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: "clipboard-write=*",
          },
        ],
      },
    ];
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL;
    const rules: import('next/dist/lib/load-custom-routes').Rewrite[] = [
      {
        source: '/verify-email',
        destination: '/verify-otp',
      },
    ];
    if (backendUrl) {
      rules.unshift(
        {
          source: '/api/token/refresh/',
          destination: `${backendUrl}/api/token/refresh/`,
        },
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/api/v1/:path*`,
        },
        {
          source: '/media/:path*',
          destination: `${backendUrl}/media/:path*`,
        },
        {
          source: '/static/:path*',
          destination: `${backendUrl}/static/:path*`,
        }
      );
    }
    return rules;
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wileadback.up.railway.app',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '172.16.0.231',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't3.storageapi.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't3.storage.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
