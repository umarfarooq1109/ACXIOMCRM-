import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "super-secret-random-key-change-in-production-32chars"
);

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets and internal next routing
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("acxiom_session")?.value;
  let sessionPayload: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      sessionPayload = payload;
    } catch {
      sessionPayload = null;
    }
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Unauthenticated user attempting to access protected route
  if (!sessionPayload && !isPublicRoute) {
    const loginUrl = new URL("/login", req.url);
    // Sanitize callback path to prevent open redirect vulnerabilities
    if (pathname.startsWith("/") && !pathname.startsWith("//")) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user attempting to visit login/register -> redirect to /dashboard
  if (sessionPayload && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Force password change if mustChangePassword is set
  if (
    sessionPayload?.mustChangePassword &&
    pathname !== "/change-password" &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  // Role-based route authorization gate
  if (sessionPayload) {
    const role = sessionPayload.role;

    if (pathname.startsWith("/users") && role !== "Admin") {
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    if (pathname.startsWith("/audit") && role !== "Admin" && role !== "Manager") {
      return NextResponse.rewrite(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
