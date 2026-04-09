import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/campus/:campusSlug/article/:articleSlug",
        destination: "/:campusSlug/article/:articleSlug",
        permanent: true,
      },
      {
        source: "/campus/:campusSlug/clubs/:clubId",
        destination: "/:campusSlug/clubs/:clubId",
        permanent: true,
      },
      {
        source: "/campus/:campusSlug/clubs",
        destination: "/:campusSlug/clubs",
        permanent: true,
      },
      {
        source: "/campus/:campusSlug",
        destination: "/:campusSlug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
