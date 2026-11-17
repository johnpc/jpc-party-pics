import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import path from "path";
import { fileURLToPath } from "url";
import { galleryImg } from "./selectors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Given, When, Then } = createBdd();

async function openFirstPhoto(page: Page) {
  const img = page.locator(galleryImg).first();
  await img.waitFor({ state: "visible", timeout: 15000 });
  await img.click();
}

Given("I navigate to an album with no photos", async ({ page }) => {
  await page.goto("/empty-test-album");
});

Given("I navigate to an album with photos", async ({ page }) => {
  await page.goto("/Demo");
});

Given("the photo modal is open", async ({ page }) => {
  await page.goto("/Demo");
  await openFirstPhoto(page);
});

Given("I have uploaded a photo to the test album", async ({ page }) => {
  await page.goto("/e2e-test");
  const fileInput = page.locator('input[type="file"]');
  const fixturePath = path.resolve(__dirname, "../fixtures/test-photo.jpg");
  await fileInput.setInputFiles(fixturePath);
  await page.locator(galleryImg).first().waitFor({
    state: "visible",
    timeout: 15000,
  });
});

// Stays on the page when already there so the just-uploaded photo is the one
// opened.
Given("the photo modal is open on a test album", async ({ page }) => {
  if (!new URL(page.url()).pathname.startsWith("/e2e-test")) {
    await page.goto("/e2e-test");
  }
  await openFirstPhoto(page);
});

When("I click on a photo", async ({ page }) => {
  await openFirstPhoto(page);
});

When("I confirm and delete the photo", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete/ }).click();
});

When("I dismiss and click delete", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: /Delete/ }).click();
});

Then("I should see photos in a grid layout", async ({ page }) => {
  await expect(page.locator(galleryImg).first()).toBeVisible({
    timeout: 15000,
  });
});

// Compares the rendered order with the backend's own date order (fake only;
// the real backend's list is not reachable from the test).
Then("photos should be sorted newest first", async ({ page }) => {
  const shown = await page
    .locator(galleryImg)
    .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
  const expected = await page.evaluate(async () => {
    const fake = window.__partypicsFake;
    if (!fake) return null;
    const images = await fake.listImages("Demo");
    return images
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((i) => i.key);
  });
  expect(shown.length).toBeGreaterThan(1);
  if (expected) expect(shown).toEqual(expected.slice(0, shown.length));
});

Then("the photo should be removed from the album", async ({ page }) => {
  await expect(page.locator(".MuiModal-root")).not.toBeVisible();
  await expect(page.locator(galleryImg)).toHaveCount(0);
});

Then("the photo should still be in the album", async ({ page }) => {
  await expect(page.locator(galleryImg).first()).toBeVisible();
});
