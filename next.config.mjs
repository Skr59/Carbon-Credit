/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL || process.env.NETLIFY ? undefined : "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;