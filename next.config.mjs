/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Reduce bundle size by optimizing common libs
    optimizePackageImports: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "zustand",
    ],
  },
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          // Let CDNs compress if available
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
      {
        source: "/draco/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
