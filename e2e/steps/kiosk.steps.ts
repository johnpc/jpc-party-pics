import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

const LIVE_KEY = "public/wedding/guest/live-photo.jpg";

Given("I am viewing {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Given("I navigate to an empty album's kiosk", async ({ page }) => {
  await page.goto("/empty-test-album/kiosk");
});

Given("I navigate to a kiosk with mixed media", async ({ page }) => {
  await page.goto("/wedding/kiosk");
});

// Another guest's upload, delivered through the backend's create event — the
// same path an AppSync subscription takes. Only the fake backend can be driven
// from the test; against the real backend this step is a documented no-op.
When("a new photo is uploaded to the album", async ({ page }) => {
  await expect(page.locator('img[alt^="public/"]').first()).toBeVisible();
  await page.evaluate(
    (key) => window.__partypicsFake?.injectImage("wedding", key),
    LIVE_KEY,
  );
});

Then("I should not see the file uploader", async ({ page }) => {
  await expect(page.locator("[class*='uploader']")).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
});

Then("I should not see the QR code", async ({ page }) => {
  await expect(page.locator("svg[viewBox]")).toHaveCount(0);
});

Then("I should not see the camera button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Camera/ })).toHaveCount(0);
});

Then("I should not see the album name as a heading", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 2 })).not.toBeVisible();
});

Then("the photo should appear in the kiosk view", async ({ page }) => {
  const injected = await page.evaluate(() => Boolean(window.__partypicsFake));
  const target = injected
    ? page.locator(`img[alt="${LIVE_KEY}"]`)
    : page.locator('img[alt^="public/"]').first();
  await expect(target).toBeVisible();
});

Then("images should display as thumbnails", async ({ page }) => {
  await expect(page.locator('img[alt^="public/"]').first()).toBeVisible();
});

Then("videos should autoplay muted in a loop", async ({ page }) => {
  const video = page.locator("video").first();
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("loop", "");
  // React sets `muted` as a property, never as an attribute.
  await expect(video).toHaveJSProperty("muted", true);
});
