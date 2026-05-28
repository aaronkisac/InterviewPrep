/**
 * Playwright global setup — runs once before all tests.
 *
 * Hits the test-only session endpoint to obtain a valid NextAuth v5 cookie,
 * then persists the browser storage state so all test contexts start
 * pre-authenticated and bypass the middleware auth gate.
 */
import { chromium, type FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    (config.projects[0]?.use as { baseURL?: string })?.baseURL ??
    "http://localhost:3000";

  const authDir = path.join(__dirname, ".auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Hit the test session endpoint — this sets the authjs.session-token cookie.
  const response = await page.goto(`${baseURL}/api/test/set-session`);
  if (!response?.ok()) {
    throw new Error(
      `Failed to set test session: ${response?.status()} ${response?.statusText()}`,
    );
  }

  const storageStatePath = path.join(authDir, "user.json");
  await context.storageState({ path: storageStatePath });

  await browser.close();
}
