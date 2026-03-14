import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
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
    return [
      {
        source: '/api/token/refresh/',
        destination: `${process.env.BACKEND_API_URL}/api/token/refresh/`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_API_URL}/api/v1/:path*`,
      },
      {
        source: '/verify-email',
        destination: '/verify-otp',
      },
    ]
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
