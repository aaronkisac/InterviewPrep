import { expect, test } from "@playwright/test";

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
  "General",
];

test.describe("/glossary page", () => {
  test("loads with the correct heading", async ({ page }) => {
    await page.goto("/glossary");
    await expect(page.getByRole("heading", { name: "Terms reference" })).toBeVisible();
  });

  test("all 14 topic sections are present", async ({ page }) => {
    await page.goto("/glossary");
    for (const section of EXPECTED_SECTIONS) {
      await expect(
        page.getByRole("heading", { name: section }),
        `section "${section}" not found on glossary page`,
      ).toBeVisible();
    }
  });

  test("each section contains at least one term", async ({ page }) => {
    await page.goto("/glossary");
    // Terms are rendered as definition list items — at least 105 should exist
    const terms = page.locator("dt, [data-term]");
    await expect(terms.first()).toBeVisible();
    const count = await terms.count();
    expect(count, `expected ≥ 105 term entries, got ${count}`).toBeGreaterThanOrEqual(105);
  });
});
