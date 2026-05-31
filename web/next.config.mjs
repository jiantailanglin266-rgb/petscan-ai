/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "place.dog" },
      { protocol: "https", hostname: "cataas.com" },
    ],
  },
};
export default nextConfig;
