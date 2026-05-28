import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication (any logged-in user)
const AUTH_PREFIXES = [
  "/mock",
  "/glossary",
  "/dashboard",
  "/admin",
  "/questions/new",
];

// Lazy import so module evaluation does not pull in NextAuth (and therefore
// the env vars) until a protected route is actually hit.
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /questions/[id] — any sub-path under /questions/ except /questions/new
  const isQuestionDetail =
    /^\/questions\/[^/]+/.test(pathname) &&
    !pathname.startsWith("/questions/new");

  const needsAuth =
    AUTH_PREFIXES.some((p) => pathname.startsWith(p)) || isQuestionDetail;

  if (!needsAuth) return NextResponse.next();

  const { auth } = await import("@/lib/auth");
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin-only gate
  if (pathname.startsWith("/admin") && role !== "admin" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mock/:path*",
    "/glossary/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",

    "/questions/new",
    "/questions/:id",
  ],
};
