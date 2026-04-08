// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;

    // -----------------------------------------------
    // 1. EXTRACT HOSTNAME FOR MULTI-TENANT REWRITE
    // -----------------------------------------------
    let hostname = request.headers.get("host") || "";
    hostname = hostname.split(":")[0]; // Hapus port jika di localhost (misal :3000)
    
    // Ganti "saas.com" dengan domain utama aplikasi Anda di production
    const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost"; 
    
    const isSubdomain = hostname !== mainDomain && hostname.endsWith(mainDomain);
    const tenantSlug = isSubdomain ? hostname.replace(`.${mainDomain}`, "") : null;

    // -----------------------------------------------
    // 2. AUTHENTICATION LOGIC (Fungsional Lama)
    // -----------------------------------------------
    const staffToken = request.cookies.get("staff_token")?.value;
    const memberToken = request.cookies.get("member_token")?.value;

    // Admin routes
    if (pathname.startsWith("/admin")) {
        if (pathname !== "/auth/login") {
            const token = request.cookies.get("admin_token")?.value;
            if (!token) return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    // Owner routes
    if (pathname.startsWith("/owner")) {
        if (!staffToken) return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
    }

    // Staff/Branch dashboard routes & Members
    const staffPaths = ["/dashboard", "/staff", "/products", "/membership-plan", "/class-plan", "/pt-sessions-plan", "/facility", "/settings", "/members"];
    if (staffPaths.some((p) => pathname.startsWith(p))) {
        if (!staffToken) return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
    }

    // Member dashboard routes
    if (pathname.startsWith("/member/dashboard") || pathname.startsWith("/member/profile")) {
        if (!memberToken) return NextResponse.redirect(new URL("/member/login", request.url));
    }

    // -----------------------------------------------
    // 3. MULTI-TENANT REWRITE LOGIC
    // -----------------------------------------------
    // Daftar path internal aplikasi yang TIDAK BOLEH di-rewrite ke /[tenantSlug]
    const isAppRoute = [
        "/admin", "/owner", "/dashboard", "/staff", "/members", "/products",
        "/membership-plan", "/class-plan", "/pt-sessions-plan", "/facility",
        "/settings", "/tenant-auth", "/member", "/auth"
    ].some(p => pathname.startsWith(p));

    // Jika ini adalah subdomain dan user mengakses halaman publik (seperti "/", "/about")
    if (isSubdomain && !isAppRoute) {
        // Rewrite URL transparan ke app/(tenant)/(public)/[tenantSlug]/...
        return NextResponse.rewrite(new URL(`/${tenantSlug}${pathname}`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match semua request path KECUALI untuk:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Ini wajib agar root "/" bisa ditangkap oleh middleware untuk di-rewrite
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};