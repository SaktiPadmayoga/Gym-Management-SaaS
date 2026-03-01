import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",

    // Images optimization
    images: {
        unoptimized: true,
        domains: ["localhost", "gym1.localhost", "gym2.localhost"],
    },

    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api",
    },
};

export default nextConfig;
