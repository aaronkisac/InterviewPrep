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

test.describe("/mock config page", () => {
  test("loads with the correct heading", async ({ page }) => {
    await page.goto("/mock");
    await expect(
      page.getByRole("heading", { name: "Mock interview" }),
    ).toBeVisible();
  });

  test("all 13 topics are rendered as checkboxes", async ({ page }) => {
    await page.goto("/mock");
    for (const label of TOPIC_LABELS) {
      await expect(
        page.locator(`label:has-text("${label}")`).first(),
        `topic "${label}" checkbox not found`,
      ).toBeVisible();
    }
  });

  test("no topics show 'no questions yet' after seed", async ({ page }) => {
    await page.goto("/mock");
    const noDataLabels = page.locator("text=no questions yet");
    await expect(noDataLabels).toHaveCount(0);
  });

  test("Select all / Deselect all toggle works", async ({ page }) => {
    await page.goto("/mock");
    const toggleBtn = page.getByRole("button", { name: /select all|deselect all/i });
    await expect(toggleBtn).toBeVisible();

    // If all are selected, first click deselects all
    const initialLabel = await toggleBtn.textContent();

    await toggleBtn.click();

    if (initialLabel?.toLowerCase().includes("deselect")) {
      // All checkboxes should now be unchecked
      const checkedBoxes = page.locator(
        'fieldset input[type="checkbox"]:checked:not(:disabled)',
      );
      await expect(checkedBoxes).toHaveCount(0);
      // Button should now say "Select all"
      await expect(toggleBtn).toHaveText("Select all");
    } else {
      // All available checkboxes should now be checked
      const uncheckedEnabled = page.locator(
        'fieldset input[type="checkbox"]:not(:checked):not(:disabled)',
      );
      await expect(uncheckedEnabled).toHaveCount(0);
      await expect(toggleBtn).toHaveText("Deselect all");
    }
  });

  test("Start button is disabled with no topics selected", async ({ page }) => {
    await page.goto("/mock");
    // Deselect all topics first
    const toggleBtn = page.getByRole("button", { name: /select all|deselect all/i });
    const label = await toggleBtn.textContent();
    if (label?.toLowerCase().includes("deselect")) {
      await toggleBtn.click(); // deselect all
    }
    const startBtn = page.getByRole("button", { name: "Start mock interview" });
    await expect(startBtn).toBeDisabled();
  });

  test("session length toggle changes selection", async ({ page }) => {
    await page.goto("/mock");
    // Click "20" session length
    await page.getByRole("radio", { name: "20" }).click({ force: true });
    // The radio input for 20 should be checked
    const radio20 = page.locator('input[type="radio"][value="20"]');
    await expect(radio20).toBeChecked();
  });

  test("Start mock interview navigates to session page", async ({ page }) => {
    await page.goto("/mock");

    const toggleBtn = page.getByRole("button", { name: /select all|deselect all/i });
    await expect(toggleBtn).toBeVisible();

    // Ensure all available topics are selected
    if ((await toggleBtn.textContent())?.toLowerCase().includes("select all")) {
      await toggleBtn.click();
    }
    await page.getByRole("radio", { name: "5" }).click({ force: true });

    const startBtn = page.getByRole("button", { name: "Start mock interview" });

    // Skip if mock_options haven't been seeded — no questions available yet
    if (!(await startBtn.isEnabled())) {
      test.skip();
      return;
    }

    await startBtn.click();
    await expect(page).toHaveURL(/\/mock\/session/);
  });
});
