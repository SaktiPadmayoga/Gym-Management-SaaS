// middleware.ts — taruh di root project (sejajar dengan app/)

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip halaman login itu sendiri
    if (pathname === "/auth/login") {
        return NextResponse.next();
    }

    // Protect semua route /admin/*
    if (pathname.startsWith("/admin")) {
        // Middleware baca dari cookie — localStorage tidak accessible di server
        const token = request.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    // -----------------------------------------------
    // Auth pages — bebas akses
    // -----------------------------------------------
    const authPaths = ["/tenant-auth/login", "/tenant-auth/callback"];
    if (authPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const staffToken = request.cookies.get("staff_token")?.value;

    // -----------------------------------------------
    // Owner routes — /owner/*
    // Hanya staff dengan global_role = owner
    // -----------------------------------------------
    if (pathname.startsWith("/owner")) {
        if (!staffToken) {
            return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
        }
        // Role check dilakukan di client (TenantGuard) — middleware hanya cek token
        return NextResponse.next();
    }

    // -----------------------------------------------
    // Staff routes — /dashboard, /members, dll
    // -----------------------------------------------
    const protectedPaths = ["/dashboard", "/members", "/staff", "/products", "/membership-plan", "/class-plan", "/pt-sessions-plan", "/facility", "/settings"];

    if (protectedPaths.some((p) => pathname.startsWith(p))) {
        if (!staffToken) {
            return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/owner/:path*",
        "/dashboard/:path*",
        "/members/:path*",
        "/staff/:path*",
        "/products/:path*",
        "/membership-plan/:path*",
        "/class-plan/:path*",
        "/pt-sessions-plan/:path*",
        "/facility/:path*",
        "/settings/:path*",
        "/tenant-auth/:path*",
    ],
};
