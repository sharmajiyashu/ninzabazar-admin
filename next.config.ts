import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // Allow all domains - only do this if you trust the image sources
      },
    ],
  },
};

export default nextConfig;
// More specific and secure configuration

//apply this for production use
// images: {
//   remotePatterns: [
//     {
//       protocol: 'https',
//       hostname: 'example.com',
//     },
//     {
//       protocol: 'https',
//       hostname: 'your-storage-bucket.com',
//     },
//   ],
// },