/**
 * Test-only endpoint that mints a valid NextAuth v5 session cookie.
 * Only active when PLAYWRIGHT_TEST=true — never reachable in production.
 *
 * GET /api/test/set-session
 */
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function GET() {
  // Hard off-switch in production, plus the explicit test-mode flag. Either
  // condition alone is enough to 404; together they're belt-and-braces so a
  // stray PLAYWRIGHT_TEST=true can never mint a session in a prod build.
  if (
    process.env.NODE_ENV === "production" ||
    process.env.PLAYWRIGHT_TEST !== "true"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "test-secret";

  // NextAuth v5 uses the cookie name as the HKDF salt.
  // For HTTP (non-HTTPS) the cookie name is "authjs.session-token".
  const cookieName = "authjs.session-token";

  const token = await encode({
    token: {
      sub: "00000000-0000-0000-0000-000000000001",
      role: "user",
      name: "Test User",
      email: "playwright@example.com",
      picture: null,
    },
    secret,
    salt: cookieName,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // No `secure` flag — test server runs on plain HTTP
  });

  return response;
}
