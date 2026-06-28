import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: 'standalone',

    // Skip ESLint during production builds (run lint separately)
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Images optimization
    images: {
        unoptimized: true,
        remotePatterns: [
            // Local development
            {
                protocol: 'http',
                hostname: 'gymfit.id',
            },
            // App domain
            {
                protocol: 'https',
                hostname: 'gymfit.id',
            },
            // Tenant subdomains
            {
                protocol: 'https',
                hostname: '*.gymfit.id',
            },
            // Cloudflare R2 CDN — gambar produk
            {
                protocol: 'https',
                hostname: 'cdn.gymfit.id',
            },
            // R2 public URL (fallback jika custom domain belum diset)
            {
                protocol: 'https',
                hostname: '*.r2.dev',
            },
        ],
    },

    // ⚡ Optimasi RAM untuk Server Low-Spec (Mencegah OOM Crash)
    experimental: {
        webpackBuildWorker: false, // Nonaktifkan worker terpisah agar hemat RAM (single-thread build)
    },

    async headers() {
        return [
            {
                source: '/images/:all*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            },
            {
                source: '/_next/static/:all*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            }
        ];
    },

    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://gymfit.id/api",
    },
};

export default nextConfig;
