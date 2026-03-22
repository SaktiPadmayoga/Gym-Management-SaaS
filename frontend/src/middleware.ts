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

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};