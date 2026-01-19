import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const userRole = request.cookies.get("user_role")?.value;

    const { pathname } = request.nextUrl;

    // 1. Allow access to login if no token
    if (!token && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Redirect from login if already has token
    if (token && pathname === "/login") {
        if (userRole === "PLATFORM_ADMIN") {
            return NextResponse.redirect(new URL("/platform/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/workspace/dashboard", request.url));
    }

    // 3. Platform Admin Restricted Access
    if (pathname.startsWith("/platform") && userRole !== "PLATFORM_ADMIN") {
        return NextResponse.redirect(new URL("/workspace/dashboard", request.url));
    }

    // 4. Role based access (example)
    // More granular checks can be added here once we have more routes

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
