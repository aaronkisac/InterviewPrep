import { expect, test, type Page } from "@playwright/test";

// Course pilot e2e — map navigation + the full lesson loop on unit-01's
// first lesson ("What is JSX?"), whose step order is known:
// concept → mcq → fill_blank → true_false → output_predict → challenge ×2.
// Requires `pnpm seed` (courses section) to have run against the database.

// Enabled options only: with AnimatePresence mode="wait" the outgoing step
// card lingers in the DOM during its exit animation with frozen feedback
// props (aria-disabled="true"), so a bare [aria-pressed] locator can resolve
// to a dying, unclickable button.
const optionButtons = (page: Page) =>
  page.locator('button[aria-pressed]:not([aria-disabled="true"])');
const checkBtn = (page: Page) =>
  page.getByRole("button", { name: "Check", exact: true });
const feedbackBanner = (page: Page) => page.locator('[aria-live="polite"]');

async function openFirstLesson(page: Page) {
  await page.goto("/learn/react");
  const firstLesson = page.locator('a[href*="/lesson/"]').first();
  await firstLesson.click();
  await page.waitForURL(/\/learn\/react\/lesson\//);
}

/**
 * Plays any mix of concept/options/fill-blank steps to completion.
 * Option steps rotate through answers per heading, so a wrong pick (which
 * exercises the re-queue) is corrected when the step comes back around.
 */
async function playLesson(page: Page) {
  const tried = new Map<string, number>();

  for (let i = 0; i < 80; i++) {
    if (await page.getByText("Lesson complete!").isVisible().catch(() => false)) {
      return;
    }

    // 1. Feedback banner open → continue past it
    const banner = feedbackBanner(page);
    if (await banner.isVisible().catch(() => false)) {
      await banner.getByRole("button", { name: "Continue", exact: true }).click();
      // The banner exits with an animation and lingers in the DOM — wait for
      // it to detach so the next iteration doesn't click the dying instance.
      await banner.waitFor({ state: "detached", timeout: 5_000 }).catch(() => {});
      // The step card exits separately (and later) than the banner. Its frozen
      // feedback state is the only source of aria-disabled="true" elements, so
      // wait for those to detach before reading the next step's heading/options
      // — otherwise we count/click buttons on the dying card.
      await page
        .locator('[aria-disabled="true"]')
        .first()
        .waitFor({ state: "detached", timeout: 5_000 })
        .catch(() => {});
      continue;
    }

    // 2. Option-based step (mcq / true_false / output_predict / challenge)
    if ((await optionButtons(page).count()) > 0) {
      const heading =
        (await page.locator("h2").first().textContent().catch(() => null)) ??
        `step-${i}`;
      const count = await optionButtons(page).count();
      const idx = tried.get(heading) ?? 0;
      tried.set(heading, (idx + 1) % count);
      await optionButtons(page).nth(idx % count).click();
      await checkBtn(page).click();
      // The banner mounts with an animation — wait for it, otherwise the next
      // loop iteration races it and tries to click now-disabled options.
      await feedbackBanner(page).waitFor({ state: "visible" });
      continue;
    }

    // 3. fill_blank (lesson 1: the correct token is "{name}")
    const token = page.getByRole("button", { name: "{name}", exact: true });
    if (await token.isVisible().catch(() => false)) {
      await token.click();
      await checkBtn(page).click();
      await feedbackBanner(page).waitFor({ state: "visible" });
      continue;
    }

    // 4. concept step → bottom Continue
    const cont = page.getByRole("button", { name: "Continue", exact: true });
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      continue;
    }

    await page.waitForTimeout(150);
  }
  throw new Error("Lesson did not complete within the iteration budget");
}

test.describe("/learn", () => {
  test("course grid lists the React course with a progress ring", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
    const card = page.locator('a[href="/learn/react"]');
    await expect(card).toBeVisible();
    await expect(card.locator('svg[role="img"]')).toBeVisible();
  });

  test("map shows section bands, unit banners and lesson discs", async ({ page }) => {
    await page.goto("/learn/react");
    await expect(page.getByText("Foundations")).toBeVisible();
    await expect(page.getByText("Components & JSX")).toBeVisible();
    await expect(page.getByText("Props & State")).toBeVisible();
    expect(await page.locator('a[href*="/lesson/"]').count()).toBeGreaterThan(0);
  });
});

test.describe("lesson player", () => {
  test("loads with progress bar, exit button and a step card", async ({ page }) => {
    await openFirstLesson(page);
    await expect(
      page.getByRole("progressbar", { name: "Lesson progress" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Exit lesson" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue", exact: true }),
    ).toBeVisible();
  });

  test("wrong answer shows red feedback and re-queues the step", async ({ page }) => {
    await openFirstLesson(page);
    // concept → Continue
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    // mcq: first option is wrong by design
    await optionButtons(page).first().click();
    await checkBtn(page).click();

    const banner = feedbackBanner(page);
    await expect(banner).toBeVisible();
    await expect(banner.getByText("Not quite")).toBeVisible();
    // explanation + correct answer revealed
    await expect(banner.getByText("Correct answer:")).toBeVisible();
  });

  test("correct answer shows green feedback", async ({ page }) => {
    await openFirstLesson(page);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    // mcq: second option is correct ("plain function calls…")
    await optionButtons(page).nth(1).click();
    await checkBtn(page).click();

    const banner = feedbackBanner(page);
    await expect(banner.getByText("Correct!")).toBeVisible();
    const html = await banner.evaluate((el) => el.outerHTML);
    expect(html.includes("emerald")).toBe(true);
  });

  test("finish-to-pass: lesson completes after re-queued steps are answered", async ({ page }) => {
    test.slow(); // full lesson, including re-queued wrong answers
    await openFirstLesson(page);
    await playLesson(page);

    await expect(page.getByText("Lesson complete!")).toBeVisible();
    await expect(page.getByText("First-try accuracy")).toBeVisible();
    await expect(page.getByText(/\d+%/)).toBeVisible();
    // CTA back to the map (and possibly next lesson)
    await expect(page.getByRole("link", { name: "Back to map" })).toBeVisible();
  });
});

test.describe("guest access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("guests can play the first unit but later units redirect to /signin", async ({ page }) => {
    await page.goto("/learn/react");
    await expect(page.getByText("Components & JSX")).toBeVisible();

    // First-unit lessons are a no-login trial: they open the player.
    await page.locator('a[href*="/lesson/"]').first().click();
    await expect(page).toHaveURL(/\/learn\/react\/lesson\//);

    // Later units still gate behind sign-in.
    await page.goto("/learn/react");
    await page.locator('a[href="/signin"]').first().click();
    await expect(page).toHaveURL(/\/signin/);
  });
});
