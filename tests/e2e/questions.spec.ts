import { expect, test } from "@playwright/test";

test.describe("/questions page", () => {
  test("loads and shows a non-zero question count", async ({ page }) => {
    await page.goto("/questions");
    await expect(page.getByRole("heading", { name: "All questions" })).toBeVisible();
    await expect(page.getByText(/\d+ questions? total/)).toBeVisible();
  });

  test("topic select contains all 13 topic options", async ({ page }) => {
    await page.goto("/questions");
    const topicSelect = page.locator("#topic-filter");
    await expect(topicSelect).toBeVisible();

    // Map label → value to avoid "React" matching "React Hooks" via text
    const TOPIC_VALUES: Record<string, string> = {
      "React": "react",
      "TypeScript": "typescript",
      "Next.js": "nextjs",
      "JavaScript": "javascript",
      "Redux": "redux",
      "HTML5": "html5",
      "CSS": "css",
      "React Hooks": "react-hooks",
      "Git": "git",
      "Agile & Scrum": "agile-scrum",
      "WebSockets": "websockets",
      "Unit Testing": "unit-testing",
      "Design Patterns": "design-patterns",
    };
    for (const [label, value] of Object.entries(TOPIC_VALUES)) {
      await expect(
        topicSelect.locator(`option[value="${value}"]`),
        `topic option "${label}" (value="${value}") not found in select`,
      ).toBeAttached();
    }
  });

  test("filtering by topic updates URL and shows match count", async ({ page }) => {
    await page.goto("/questions");
    await page.locator("#topic-filter").selectOption("design-patterns");
    await expect(page).toHaveURL(/topic=design-patterns/);
    await expect(page.getByText(/\d+ questions? match/)).toBeVisible();
  });

  test("EN/TR language toggle switches answer language", async ({ page }) => {
    await page.goto("/questions");
    const langToggle = page.getByRole("button", { name: "Toggle language" });
    await expect(langToggle).toHaveText("EN");

    await langToggle.click();
    await expect(
      page.getByRole("heading", { name: "Tüm sorular" }),
    ).toBeVisible();
    await expect(langToggle).toHaveText("TR");

    await langToggle.click();
    await expect(
      page.getByRole("heading", { name: "All questions" }),
    ).toBeVisible();
  });

  test("clear filters link appears when a filter is active", async ({ page }) => {
    await page.goto("/questions?topic=react");
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
    await page.getByRole("link", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/questions(\?lang=en)?$/);
  });
});
