/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Increase payload size limit for API routes
  serverRuntimeConfig: {
    bodySizeLimit: '100mb',
  },
};

export default nextConfig;
