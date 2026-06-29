/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Private, friends-only: never let search engines index it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
