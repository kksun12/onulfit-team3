/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;
