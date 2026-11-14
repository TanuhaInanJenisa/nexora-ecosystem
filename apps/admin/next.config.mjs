/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@nexora/types',
    '@nexora/ui',
    '@nexora/ui-tokens',
    '@nexora/validation',
    '@nexora/business-logic',
    '@nexora/shared',
    '@nexora/api',
  ],
};

export default nextConfig;

