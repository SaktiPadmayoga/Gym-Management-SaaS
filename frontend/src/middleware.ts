// middleware.ts

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // -----------------------------------------------
    // Admin routes
    // -----------------------------------------------
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") return NextResponse.next();
        const token = request.cookies.get("admin_token")?.value;
        if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
        return NextResponse.next();
    }

    // -----------------------------------------------
    // Staff auth pages — bebas akses
    // -----------------------------------------------
    const staffAuthPaths = ["/tenant-auth/login", "/tenant-auth/callback", "/tenant-auth/select-branch"];
    if (staffAuthPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // -----------------------------------------------
    // Member auth pages — bebas akses
    // -----------------------------------------------
    const memberAuthPaths = ["/member/login", "/member/auth/callback"];
    if (memberAuthPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const staffToken = request.cookies.get("staff_token")?.value;
    const memberToken = request.cookies.get("member_token")?.value;

    // -----------------------------------------------
    // Owner routes
    // -----------------------------------------------
    if (pathname.startsWith("/owner")) {
        if (!staffToken) return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
        return NextResponse.next();
    }

    // -----------------------------------------------
    // Staff/Branch dashboard routes
    // -----------------------------------------------
    const staffPaths = ["/dashboard", "/staff", "/products", "/membership-plan", "/class-plan", "/pt-sessions-plan", "/facility", "/settings"];
    if (staffPaths.some((p) => pathname.startsWith(p))) {
        if (!staffToken) return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
        return NextResponse.next();
    }

    // -----------------------------------------------
    // Members list — staff only
    // -----------------------------------------------
    if (pathname.startsWith("/members")) {
        if (!staffToken) return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
        return NextResponse.next();
    }

    // -----------------------------------------------
    // Member dashboard routes
    // -----------------------------------------------
    if (pathname.startsWith("/member/dashboard") || pathname.startsWith("/member/profile")) {
        if (!memberToken) return NextResponse.redirect(new URL("/member/login", request.url));
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/owner/:path*",
        "/dashboard/:path*",
        "/staff/:path*",
        "/members/:path*",
        "/products/:path*",
        "/membership-plan/:path*",
        "/class-plan/:path*",
        "/pt-sessions-plan/:path*",
        "/facility/:path*",
        "/settings/:path*",
        "/tenant-auth/:path*",
        "/member/:path*",
    ],
};
