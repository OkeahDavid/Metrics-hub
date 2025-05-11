/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Clean all output directories before build
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/darwin-x64',
        'node_modules/@esbuild/darwin-arm64',
        // Add other platform-specific excludes to reduce build size
      ],
    },
  },
};

module.exports = nextConfig;