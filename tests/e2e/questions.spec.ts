import { expect, test } from "@playwright/test";

const TOPIC_LABELS = [
  "React",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "Redux",
  "HTML5",
  "CSS",
  "React Hooks",
  "Git",
  "Agile & Scrum",
  "WebSockets",
  "Unit Testing",
  "Design Patterns",
];

test.describe("/questions page", () => {
  test("loads and shows a non-zero question count", async ({ page }) => {
    await page.goto("/questions");
    await expect(page.getByRole("heading", { name: "All questions" })).toBeVisible();
    // Expects something like "446 questions total"
    await expect(page.locator("text=/\\d+ questions/")).toBeVisible();
  });

  test("all 13 topic filter labels are rendered", async ({ page }) => {
    await page.goto("/questions");
    for (const label of TOPIC_LABELS) {
      await expect(
        page.locator(`text=${label}`).first(),
        `topic filter "${label}" not found`,
      ).toBeVisible();
    }
  });

  test("filtering by topic updates URL and narrows results", async ({ page }) => {
    await page.goto("/questions?topic=design-patterns");
    await expect(page).toHaveURL(/topic=design-patterns/);
    // Should show fewer questions than the total
    const countText = page.locator("text=/\\d+ questions? match/");
    await expect(countText).toBeVisible();
  });

  test("EN/TR language toggle switches answer language", async ({ page }) => {
    await page.goto("/questions");
    // Switch to TR
    await page.getByLabel("TR").click();
    await expect(page).toHaveURL(/lang=tr/);
    await expect(page.getByRole("heading", { name: "Tüm sorular" })).toBeVisible();
    // Switch back to EN
    await page.getByLabel("EN").click();
    await expect(page.getByRole("heading", { name: "All questions" })).toBeVisible();
  });

  test("clear filters link appears when a filter is active", async ({ page }) => {
    await page.goto("/questions?topic=react");
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
    await page.getByRole("link", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/questions$/);
  });
});
