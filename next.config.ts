import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STANDALONE === "true" ? { output: "standalone" } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Supabase Storage (avatars & uploaded content)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      // Google profile pictures (OAuth login avatars)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // GitHub avatars
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Generic HTTPS images (CDN-hosted content files)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Allow local SVG and unoptimized images in dev
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
