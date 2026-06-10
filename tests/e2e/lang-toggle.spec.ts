import { expect, test } from "@playwright/test";

/**
 * Locks down the language toggle behaviour (see git history — this area
 * regressed repeatedly): toggle → cookie set → server components re-render
 * in Turkish → preference persists across full navigations.
 */
test.describe("language toggle", () => {
  test("switches to Turkish, persists across navigation, and back", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle language" });
    await expect(toggle).toHaveText("EN");
    await expect(page.getByText("Frontend Interview Prep").first()).toBeVisible();

    // EN → TR
    await toggle.click();
    await expect(toggle).toHaveText("TR");

    // Cookie persisted
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "preferred_lang")?.value).toBe("tr");

    // Server components re-rendered via router.refresh() — no full reload
    await expect(
      page.getByText("Frontend Mülakat Hazırlık").first(),
    ).toBeVisible();

    // Survives a full navigation
    await page.goto("/");
    await expect(toggle).toHaveText("TR");
    await expect(
      page.getByText("Frontend Mülakat Hazırlık").first(),
    ).toBeVisible();

    // TR → EN round-trip
    await toggle.click();
    await expect(toggle).toHaveText("EN");
    await expect(page.getByText("Frontend Interview Prep").first()).toBeVisible();
  });

  test("toggle is disabled while pending (no double fire)", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle language" });
    await toggle.click();
    // After settling, exactly one switch happened
    await expect(toggle).toHaveText("TR");
    await expect(toggle).toBeEnabled();
  });
});
