// frontend/middleware.ts

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname, host } = request.nextUrl;
    const domain = host.split(":")[0]; // Remove port

    // Detect if master or tenant
    const isMaster = domain === "localhost" || domain === "admin.localhost";
    const isTenant = domain.includes("gym_") || (domain.includes(".") && domain.includes("localhost"));

    // Master routes protection
    if (pathname.startsWith("/admin") && !isMaster) {
        // If tenant trying to access admin, redirect to tenant dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Tenant routes protection
    if (pathname.startsWith("/dashboard") && isMaster) {
        // If master trying to access tenant dashboard, redirect to admin
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Public routes always accessible
    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/pricing")) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
