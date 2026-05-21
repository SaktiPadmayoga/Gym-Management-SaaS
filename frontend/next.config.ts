import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",

    // Skip ESLint during production builds (run lint separately)
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Images optimization
    images: {
        unoptimized: true,
        domains: [
            "localhost",
            "gymfit.id",
            "*.gymfit.id",
        ],
    },

    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api",
    },
};

export default nextConfig;
