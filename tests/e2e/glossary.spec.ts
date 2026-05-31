import { expect, test } from "@playwright/test";

// Section labels as they appear in the DOM (CSS uppercase doesn't affect text content).
// "General" is omitted — seed-terms.json has no general-topic terms, so that section never renders.
const EXPECTED_SECTIONS = [
  "Agile & Scrum",
  "CSS",
  "Design Patterns",
  "Git",
  "HTML5",
  "JavaScript",
  "Next.js",
  "React",
  "React Hooks",
  "Redux",
  "TypeScript",
  "Unit Testing",
  "WebSockets",
];

test.describe("/glossary page", () => {
  test("loads with the correct heading", async ({ page }) => {
    await page.goto("/glossary");
    await expect(
      page.getByRole("heading", {
        name: "Frontend terms auto-linked in answers as you read.",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("shows total term count in the subtitle", async ({ page }) => {
    await page.goto("/glossary");
    // e.g. "105 terms"
    await expect(page.getByText(/^\d+ terms?$/)).toBeVisible();
  });

  test("all 14 topic sections are present", async ({ page }) => {
    await page.goto("/glossary");
    // h2 elements have CSS text-transform:uppercase visually, but DOM text is original case.
    // Use locator('h2').filter instead of getByRole to avoid ARIA name normalisation issues.
    for (const section of EXPECTED_SECTIONS) {
      // Use exact regex to avoid "React" matching "React Hooks"
      await expect(
        page.locator("h2").filter({ hasText: new RegExp(`^${section}$`) }),
        `section "${section}" not found`,
      ).toBeVisible();
    }
  });

  test("at least 105 term links are rendered", async ({ page }) => {
    await page.goto("/glossary");
    // Terms are <li> elements inside each <section> — each wraps a link to /glossary/[slug]
    const termLinks = page.locator('section li a[href^="/glossary/"]');
    await termLinks.first().waitFor();
    const count = await termLinks.count();
    expect(count, `expected ≥ 105 term links, got ${count}`).toBeGreaterThanOrEqual(105);
  });
});
