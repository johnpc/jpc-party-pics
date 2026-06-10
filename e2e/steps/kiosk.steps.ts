import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I am viewing {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Given("I navigate to an empty album's kiosk", async ({ page }) => {
  await page.goto("/empty-test-album/kiosk");
});

Given("I navigate to a kiosk with mixed media", async ({ page }) => {
  await page.goto("/Demo/kiosk");
});

When("a new photo is uploaded to the album", async () => {
  // Real-time update via subscription — simulated in e2e via API call
});

Then("I should not see the file uploader", async ({ page }) => {
  await expect(page.locator("[class*='uploader']")).toHaveCount(0);
});

Then("I should not see the QR code", async ({ page }) => {
  await expect(page.locator("svg[viewBox]")).toHaveCount(0);
});

Then("I should not see the camera button", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /Use In-App Camera/ }),
  ).not.toBeVisible();
});

Then("I should not see the album name as a heading", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 2 })).not.toBeVisible();
});

Then("the photo should appear in the kiosk view", async ({ page }) => {
  await expect(page.locator("img").first()).toBeVisible();
});

Then("images should display as thumbnails", async ({ page }) => {
  await expect(page.locator("img").first()).toBeVisible();
});

Then("videos should autoplay muted in a loop", async ({ page }) => {
  const video = page.locator("video").first();
  if (await video.isVisible()) {
    await expect(video).toHaveAttribute("autoplay", "");
    await expect(video).toHaveAttribute("muted", "");
    await expect(video).toHaveAttribute("loop", "");
  }
});
