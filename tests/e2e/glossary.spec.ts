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

  test("all topics are present as tabs", async ({ page }) => {
    await page.goto("/glossary");
    for (const section of EXPECTED_SECTIONS) {
      // Exact name to avoid "React" matching "React Hooks"
      await expect(
        page.getByRole("button", { name: section, exact: true }).first(),
        `tab "${section}" not found`,
      ).toBeVisible();
    }
  });

  test("at least 105 terms exist and the All view is paginated with topic badges", async ({
    page,
  }) => {
    await page.goto("/glossary");

    // Total count from the "N terms" label (the list itself is paginated)
    const countText = await page.getByText(/^\d+ terms?$/).innerText();
    const total = Number(countText.match(/\d+/)?.[0] ?? 0);
    expect(total, `expected ≥ 105 terms, got ${total}`).toBeGreaterThanOrEqual(105);

    // Page shows at most one page of term links
    const termLinks = page.locator('li a[href^="/glossary/"]');
    await termLinks.first().waitFor();
    expect(await termLinks.count()).toBeLessThanOrEqual(50);

    // Pagination nav is present on the All view
    await expect(
      page.getByRole("navigation", { name: "Pagination" }),
    ).toBeVisible();

    // Next page shows a different first term
    const firstTerm = await termLinks.first().innerText();
    await page.getByRole("link", { name: "Next →" }).click();
    await expect(page).toHaveURL(/page=2/);
    await termLinks.first().waitFor();
    expect(await termLinks.first().innerText()).not.toBe(firstTerm);
  });

  test("selecting a topic tab resets pagination and filters terms", async ({
    page,
  }) => {
    await page.goto("/glossary?page=2");
    await page.getByRole("button", { name: "WebSockets", exact: true }).click();
    await expect(page).toHaveURL(/topic=websockets/i);
    await expect(page).not.toHaveURL(/page=/);
    await expect(
      page.locator('li a[href^="/glossary/"]').first(),
    ).toBeVisible();
  });
});
