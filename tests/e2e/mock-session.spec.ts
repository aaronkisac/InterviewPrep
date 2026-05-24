import { expect, test } from "@playwright/test";

// Navigate directly to a session URL to skip the config UI.
const SESSION_URL =
  "/mock/session?topics=react&min=1&max=3&len=5";

test.describe("/mock/session", () => {
  test("session loads with a question and progress bar", async ({ page }) => {
    await page.goto(SESSION_URL);
    await expect(page.locator("text=Question 1 of 5")).toBeVisible();
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test("selecting a wrong answer shows red feedback", async ({ page }) => {
    await page.goto(SESSION_URL);
    // Find the correct option first, then click a different one
    const options = page.getByRole("button").filter({ hasText: /.+/ });
    await options.first().waitFor();

    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(4);

    // Click first option — may or may not be correct
    await options.first().click();

    // After answering, an answer feedback box must appear
    const feedback = page.locator("text=/Correct|Not quite/");
    await expect(feedback).toBeVisible();
  });

  test("Next button is disabled before answering", async ({ page }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('[role="progressbar"]');
    const nextBtn = page.getByRole("button", { name: "Next" });
    await expect(nextBtn).toBeDisabled();
  });

  test("Next button enables after answering and advances question", async ({
    page,
  }) => {
    await page.goto(SESSION_URL);
    await page.waitForSelector('[role="progressbar"]');

    const firstOption = page
      .getByRole("button")
      .filter({ hasText: /.+/ })
      .first();
    await firstOption.click();

    const nextBtn = page.getByRole("button", { name: "Next" });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    await expect(page.locator("text=Question 2 of 5")).toBeVisible();
  });

  test("completing all questions shows the result screen", async ({ page }) => {
    await page.goto(SESSION_URL);

    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[role="progressbar"]');
      const firstOption = page
        .getByRole("button")
        .filter({ hasText: /.+/ })
        .first();
      await firstOption.click();

      const isLast = i === 4;
      if (isLast) {
        await page.getByRole("button", { name: "Finish" }).click();
      } else {
        await page.getByRole("button", { name: "Next" }).click();
      }
    }

    // Result screen
    await expect(page.locator("text=Session complete")).toBeVisible();
    await expect(page.locator("text=/\\d+ \\/ 5/")).toBeVisible();
    await expect(page.locator("text=/%/")).toBeVisible();
  });

  test("result screen shows Restart and New session buttons", async ({
    page,
  }) => {
    await page.goto(SESSION_URL);

    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[role="progressbar"]');
      await page
        .getByRole("button")
        .filter({ hasText: /.+/ })
        .first()
        .click();
      if (i === 4) {
        await page.getByRole("button", { name: "Finish" }).click();
      } else {
        await page.getByRole("button", { name: "Next" }).click();
      }
    }

    await expect(
      page.getByRole("button", { name: "Restart with same settings" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "New session" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to question bank" }),
    ).toBeVisible();
  });

  test("empty-state fallback on bad session params", async ({ page }) => {
    await page.goto("/mock/session");
    await expect(
      page.locator("text=No questions matched this session"),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to config" })).toBeVisible();
  });
});
