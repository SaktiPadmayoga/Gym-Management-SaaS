// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;

    // -----------------------------------------------
    // 1. EXTRACT HOSTNAME FOR MULTI-TENANT
    // -----------------------------------------------
    let hostname = request.headers.get("host") || "";
    hostname = hostname.split(":")[0]; 
    
    const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost"; 
    const isSubdomain = hostname !== mainDomain && hostname.endsWith(mainDomain);
    const tenantSlug = isSubdomain ? hostname.replace(`.${mainDomain}`, "") : null;

    // -----------------------------------------------
    // 2. DEFINE ROUTE CATEGORIES
    // -----------------------------------------------
    // A. Rute Central (HANYA boleh diakses di domain utama: localhost / fitnice.id)
    const centralPaths = ["/admin", "/auth", "/register-tenant", "/pricing"];
    const isCentralRoute = centralPaths.some((p) => pathname.startsWith(p));

    // B. Rute Aplikasi Tenant (HANYA boleh diakses di subdomain: namagym.localhost / namagym.fitnice.id)
    const tenantAppPaths = [
        "/owner", "/dashboard", "/staff", "/members", "/products",
        "/membership-plan", "/class-plan", "/pt-sessions-plan", "/facility",
        "/settings", "/tenant-auth", "/member", "/check-ins", "/memberships", "/class-schedules"
    ];
    const isTenantAppRoute = tenantAppPaths.some((p) => pathname.startsWith(p));

    // -----------------------------------------------
    // 3. MULTI-TENANT ISOLATION LOGIC
    // -----------------------------------------------
    if (isSubdomain) {
        if (isCentralRoute) {
            const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
            return NextResponse.redirect(new URL(pathname, `${protocol}://${mainDomain}`));
        }

        if (isTenantAppRoute) {
            // Logika token staff Anda...
            return NextResponse.next();
        }

        // PERUBAHAN DI SINI: Rewrite diarahkan ke folder /sites/
        return NextResponse.rewrite(new URL(`/${tenantSlug}${pathname}`, request.url));
        
    } else {
        // --- BLOK DOMAIN UTAMA (localhost / fitnice.id) ---
        
        // Mencegah akses aplikasi Tenant dari Domain Utama (lempar ke login / register)
        if (isTenantAppRoute) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        // --- Masukkan logika validasi Cookie/Token Anda di sini untuk central ---
        if (pathname.startsWith("/admin") && pathname !== "/auth/login") {
            const adminToken = request.cookies.get("admin_token")?.value;
            if (!adminToken) return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        // -----------------------------------------------------------------------
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};