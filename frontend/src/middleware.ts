import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // -----------------------------------------------
    // 1. EXTRACT HOSTNAME
    // -----------------------------------------------
    // Traefik automatically overwrites x-forwarded-host.
    // So we use x-tenant-host from Cloudflare Worker if available.
    let hostname = request.headers.get("x-tenant-host") || request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    hostname = hostname.split(":")[0];

    const defaultDomain = process.env.NODE_ENV === "development" ? "localhost" : "gymfit.id";
    const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || defaultDomain;

    const isSubdomain = hostname !== mainDomain && hostname.endsWith(mainDomain);

    const tenantSlug = isSubdomain ? hostname.replace(`.${mainDomain}`, "") : null;

    // -----------------------------------------------
    // 2. ROUTE CATEGORIES
    // -----------------------------------------------
    const centralPaths = ["/admin", "/auth", "/register-tenant", "/pricing"];

    const isCentralRoute = centralPaths.some((p) => pathname.startsWith(p));

    const tenantAppPaths = [
        "/owner",
        "/dashboard",
        "/staff",
        "/members",
        "/products",
        "/membership-plans",
        "/class-plans",
        "/pt-sessions-plan",
        "/facilities",
        "/settings",
        "/tenant-auth",
        "/member",
        "/check-ins",
        "/memberships",
        "/class-schedules",
        "/pt-sessions",
        "/facility-bookings",
        "/pos",
        "/report",
        "/roles",
    ];

    const isTenantAppRoute = tenantAppPaths.some((p) => pathname.startsWith(p));

    // -----------------------------------------------
    // 3. COOKIES
    // -----------------------------------------------
    const staffCookie = request.cookies.get("staff_token")?.value;

    const ownerCookie = request.cookies.get("owner_token")?.value;

    const memberCookie = request.cookies.get("member_token")?.value;

    const adminCookie = request.cookies.get("admin_token")?.value;

    // -----------------------------------------------
    // 4. SUBDOMAIN LOGIC
    // -----------------------------------------------
    if (isSubdomain && tenantSlug) {
        // -------------------------------------------
        // BLOCK CENTRAL ROUTES
        // -------------------------------------------
        if (isCentralRoute) {
            // Rewrite ke path yg tidak ada agar memicu 404
            const url = request.nextUrl.clone();
            url.pathname = "/404";
            return NextResponse.rewrite(url);
        }

        // -------------------------------------------
        // TENANT AUTH LOGIC
        // -------------------------------------------
        if (isTenantAppRoute) {
            // =========================
            // MEMBER AREA
            // =========================
            if (pathname === "/member" || pathname.startsWith("/member/")) {
                const memberPublicPaths = ["/member/login", "/member/register", "/member/registration-success", "/member/forgot-password", "/member/forgot-password/reset", "/tenant-auth/member/callback"];

                const isMemberPublic = memberPublicPaths.some((p) => pathname.startsWith(p));

                // ✅ biarkan auth provider client-side yang handle redirect jika token masih valid
                // ini untuk mencegah infinite loop jika cookie masih ada tapi token sudah expired
                // if (memberCookie && isMemberPublic) {
                //     return NextResponse.redirect(new URL("/member/dashboard", request.url));
                // }

                // ❌ belum login -> protected route
                if (!memberCookie && !isMemberPublic) {
                    return NextResponse.redirect(new URL("/member/login", request.url));
                }

                return NextResponse.next();
            }

            // =========================
            // STAFF PUBLIC ROUTES
            // =========================
            const staffPublicPaths = ["/tenant-auth/login", "/tenant-auth/callback", "/tenant-auth/select-branch", "/tenant-auth/forgot-password", "/tenant-auth/reset-password"];

            const isStaffPublic = staffPublicPaths.some((p) => pathname.startsWith(p));

            // ❌ belum login -> redirect login
            // Owner route (/owner/*) butuh owner_token
            // Staff route lainnya butuh staff_token
            const requiredCookie = pathname.startsWith("/owner") ? ownerCookie : staffCookie;

            if (!requiredCookie && !isStaffPublic) {
                return NextResponse.redirect(new URL("/tenant-auth/login", request.url));
            }
        }

        // -------------------------------------------
        // REWRITE ROOT SUBDOMAIN KE LANDING TENANT
        // -------------------------------------------
        // trial-gym.localhost/
        // -> /trial-gym
        //
        // Tenant app routes tetap memakai path asli:
        // trial-gym.localhost/member/register
        // -> /member/register
        // -------------------------------------------
        if (pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = `/${tenantSlug}`;

            return NextResponse.rewrite(url);
        }

        return NextResponse.next();
    }

    // -----------------------------------------------
    // 5. MAIN DOMAIN LOGIC
    // -----------------------------------------------

    // BLOCK TENANT ROUTES
    if (isTenantAppRoute) {
        // Rewrite ke path yg tidak ada agar memicu 404 secara natural
        const url = request.nextUrl.clone();
        url.pathname = "/404";
        return NextResponse.rewrite(url);
    }

    // =========================
    // ADMIN
    // =========================
    if (pathname.startsWith("/admin")) {
        const adminPublicPaths = ["/auth/login"];

        const isAdminPublic = adminPublicPaths.some((p) => pathname.startsWith(p));

        // ✅ biarkan auth provider client-side yang handle redirect jika token masih valid
        // ini untuk mencegah infinite loop jika cookie masih ada tapi token sudah expired
        // if (adminCookie && pathname.startsWith("/auth/login")) {
        //     return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        // }

        // PUBLIC
        if (isAdminPublic) {
            return NextResponse.next();
        }

        // PROTECTED
        if (!adminCookie) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    return NextResponse.next();
}

// -----------------------------------------------
// MATCHER
// -----------------------------------------------
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
