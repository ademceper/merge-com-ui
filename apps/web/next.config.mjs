/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@merge/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
