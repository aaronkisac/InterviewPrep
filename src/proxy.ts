import { NextResponse, type NextRequest } from "next/server";

// Lazy import so module evaluation does not pull in NextAuth (and therefore
// the env vars) until a protected route is actually hit.
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only /admin/* and /profile/* are gated. Anything else passes straight through.
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/profile")) {
    return NextResponse.next();
  }

  const { auth } = await import("@/lib/auth");
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
}

// Next.js 16: middleware → proxy. Match only the protected route trees.
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
