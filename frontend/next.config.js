/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      // Add production domains as needed in production environment
      // Example for production:
      // {
      //   protocol: 'https',
      //   hostname: 'api.yourdomain.com',
      //   pathname: '/uploads/**',
      // },
    ],
  },
}

module.exports = nextConfig
