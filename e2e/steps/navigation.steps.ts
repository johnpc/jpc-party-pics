import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Then, When } = createBdd();

When("I click the header", async ({ page }) => {
  await page.locator("[class*='card']").first().click();
});

Then(
  "I should see the album page for {string}",
  async ({ page }, name: string) => {
    await expect(
      page.getByText(`Photos shared to album "${name}"`),
    ).toBeVisible();
  },
);

Then("I should see the camera page", async ({ page }) => {
  await expect(page.locator("video")).toBeVisible();
});

Then("I should see the kiosk view", async ({ page }) => {
  await expect(page.locator("img, video").first()).toBeVisible();
});
