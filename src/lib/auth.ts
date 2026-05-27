import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

import { requireEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

type Role = "user" | "admin" | "super_admin";

async function readRole(userId: string): Promise<Role> {
  // Read role from public.users on initial sign-in. Falls back to 'user'
  // if the row is missing (the sync trigger should have created it).
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const role = data?.role;
    if (role === "super_admin") return "super_admin";
    if (role === "admin") return "admin";
    return "user";
  } catch {
    return "user";
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin" | "super_admin";
    } & DefaultSession["user"];
    supabaseAccessToken?: string;
  }
}

// Lazy form — config is built per-request, so missing env vars do not crash
// module evaluation in proxy.ts / route handlers. The error only surfaces
// when an auth flow is actually triggered.
export const { handlers, signIn, signOut, auth } = NextAuth((): NextAuthConfig => ({
  adapter: SupabaseAdapter({
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    secret: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  }),
  providers: [
    // Both providers verify email addresses, so auto-linking same-email
    // accounts across them is safe.
    Google({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: requireEnv("GITHUB_ID"),
      clientSecret: requireEnv("GITHUB_SECRET"),
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in `user` is set — read role from public.users so admin
      // promotions made via the Supabase dashboard take effect on next login.
      if (user?.id) {
        token.sub = user.id;
        token.role = await readRole(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role =
          (token.role as Role | undefined) ?? "user";
      }
      return session;
    },
  },
}));
