import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";

// Load .env.local for local runs — CI injects secrets via environment.
if (!process.env.CI) {
  loadEnv({ path: path.resolve(__dirname, ".env.local"), override: false });
}

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    storageState: "./tests/e2e/.auth/user.json",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          SUPABASE_SERVICE_ROLE_KEY:
            process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
          // Required for the NextAuth→Supabase JWT bridge. The PLAYWRIGHT_TEST
          // session auto-authenticates a test user, so every page mints a token.
          SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET ?? "",
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "test-secret",
          AUTH_SECRET: process.env.AUTH_SECRET ?? "test-secret",
          NEXTAUTH_URL: "http://localhost:3000",
          // Dummy OAuth creds — only needed so requireEnv() doesn't throw during
          // session reads. The actual OAuth flow is never exercised in E2E tests.
          GOOGLE_CLIENT_ID:
            process.env.GOOGLE_CLIENT_ID ?? "dummy-google-client-id.apps.googleusercontent.com",
          GOOGLE_CLIENT_SECRET:
            process.env.GOOGLE_CLIENT_SECRET ?? "dummy-google-client-secret",
          GITHUB_ID: process.env.GITHUB_ID ?? "dummy-github-id",
          GITHUB_SECRET: process.env.GITHUB_SECRET ?? "dummy-github-secret",
          // Signals the test-only session endpoint to activate
          PLAYWRIGHT_TEST: "true",
        },
      },
});
