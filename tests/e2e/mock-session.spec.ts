import { expect, test } from "@playwright/test";

const SESSION_URL = "/mock/session?topics=react&min=1&max=3&len=5";

const optionButtons = (page: import("@playwright/test").Page) =>
  page.locator('button[aria-pressed]');

// "Next" exact match avoids conflict with Next.js Dev Tools button
const nextBtn = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Next", exact: true });

async function answerAll(
  page: import("@playwright/test").Page,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    await page.waitForSelector('button[aria-pressed]');
    await optionButtons(page).first().click();
    if (i === count - 1) {
      await page.getByRole("button", { name: "Finish" }).click();
    } else {
      await nextBtn(page).click();
    }
  }
}

test.describe("/mock/session", () => {
  test("session loads with a question and progress bar", async ({ page }) => {
    await page.goto(SESSION_URL);
    await expect(page.getByText("Question 1 of 5")).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test("exactly 4 option buttons are rendered per question", async ({ page }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('button[aria-pressed]');
    await expect(optionButtons(page)).toHaveCount(4);
  });

  test("Next button is disabled before answering", async ({ page }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('button[aria-pressed]');
    await expect(nextBtn(page)).toBeDisabled();
  });

  test("selecting an option shows feedback and enables Next", async ({ page }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('button[aria-pressed]');
    await optionButtons(page).first().click();

    // strict: false because "Correct" can appear in multiple places after answer
    await expect(page.getByText(/Correct|Not quite/).first()).toBeVisible();
    await expect(nextBtn(page)).toBeEnabled();
  });

  test("feedback is coloured green or red after answering", async ({ page }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('button[aria-pressed]');
    await optionButtons(page).first().click();

    const feedback = page.locator('[aria-live="polite"]');
    await expect(feedback).toBeVisible();
    // Check the outer element's class includes a colour token
    const cls = await feedback.evaluate((el) => el.outerHTML);
    expect(
      cls.includes("emerald") || cls.includes("rose"),
      "feedback element must have a green or red colour class",
    ).toBe(true);
  });

  test("Next advances to question 2", async ({ page }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('button[aria-pressed]');
    await optionButtons(page).first().click();
    await nextBtn(page).click();
    await expect(page.getByText("Question 2 of 5")).toBeVisible();
  });

  test("completing all 5 questions shows the result screen", async ({ page }) => {
    await page.goto(SESSION_URL);
    await answerAll(page, 5);

    await expect(page.getByText("Session complete")).toBeVisible();
    await expect(page.getByText(/\d+ \/ 5/)).toBeVisible();
    await expect(
      page.getByText(/\d+%\s*—\s*(Perfect|Strong|Decent|Needs work)/),
    ).toBeVisible();
  });

  test("result screen shows all navigation buttons", async ({ page }) => {
    await page.goto(SESSION_URL);
    await answerAll(page, 5);

    await expect(
      page.getByRole("button", { name: "Restart with same settings" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "New session" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to question bank" }),
    ).toBeVisible();
  });

  test("empty state shows when session params are missing", async ({ page }) => {
    await page.goto("/mock/session");
    await expect(
      page.getByText("No questions matched this session"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to config" }),
    ).toBeVisible();
  });
});
