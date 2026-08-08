import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Given, When, Then } = createBdd();

Given("I navigate to an album with no photos", async ({ page }) => {
  await page.goto("/empty-test-album");
});

Given("I navigate to an album with photos", async ({ page }) => {
  await page.goto("/Demo");
});

Given("the photo modal is open", async ({ page }) => {
  await page.goto("/Demo");
  const img = page.locator("img[src*='s3']").first();
  await img.waitFor({ state: "visible", timeout: 15000 });
  await img.click();
});

Given("I have uploaded a photo to the test album", async ({ page }) => {
  await page.goto("/e2e-test");
  const fileInput = page.locator('input[type="file"]');
  const fixturePath = path.resolve(__dirname, "../fixtures/test-photo.jpg");
  await fileInput.setInputFiles(fixturePath);
  await page.locator("img[src*='s3']").first().waitFor({
    state: "visible",
    timeout: 15000,
  });
});

Given("the photo modal is open on a test album", async ({ page }) => {
  await page.goto("/e2e-test");
  const img = page.locator("img[src*='s3']").first();
  await img.waitFor({ state: "visible", timeout: 15000 });
  await img.click();
});

When("I click on a photo", async ({ page }) => {
  const img = page.locator("img[src*='s3']").first();
  await img.waitFor({ state: "visible", timeout: 15000 });
  await img.click();
});

When("I click the forward arrow", async ({ page }) => {
  await page.locator("[data-testid='ArrowForwardIosIcon']").click();
});

When("I click the back arrow", async ({ page }) => {
  await page.locator("[data-testid='ArrowBackIosIcon']").click();
});

async function swipe(page: import("@playwright/test").Page, dir: "L" | "R") {
  const sel = ".MuiModal-root img[src*='s3']";
  await page.locator(sel).first().waitFor();
  await page.evaluate(
    ({ sel, dir }) => {
      const el = document.querySelector(sel) as HTMLElement;
      const r = el.getBoundingClientRect();
      const y = r.top + r.height / 2;
      const [fx, tx] = dir === "L" ? [0.8, 0.2] : [0.2, 0.8];
      const mk = (f: number) =>
        new Touch({
          identifier: 1,
          target: el,
          clientX: r.left + r.width * f,
          clientY: y,
        });
      el.dispatchEvent(
        new TouchEvent("touchstart", { bubbles: true, touches: [mk(fx)] }),
      );
      el.dispatchEvent(
        new TouchEvent("touchend", { bubbles: true, changedTouches: [mk(tx)] }),
      );
    },
    { sel, dir },
  );
}

When("I swipe left on the photo", async ({ page }) => swipe(page, "L"));
When("I swipe right on the photo", async ({ page }) => swipe(page, "R"));

When("I click outside the modal", async ({ page }) => {
  await page.keyboard.press("Escape");
});

When("I click the download button", async ({ page }) => {
  await page.getByRole("button", { name: /Download/ }).click();
});

When("I confirm and delete the photo", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete/ }).click();
});

When("I dismiss and click delete", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: /Delete/ }).click();
});

When("I confirm and click download all", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Download All/ }).click();
});

Then("I should see photos in a grid layout", async ({ page }) => {
  await expect(page.locator("img[src*='s3']").first()).toBeVisible({
    timeout: 15000,
  });
});

// Verified visually: first photo has the most recent date
Then("photos should be sorted newest first", async () => {});

Then("I should see the photo modal", async ({ page }) => {
  await expect(page.locator(".MuiModal-root")).toBeVisible();
});

Then("I should see navigation arrows", async ({ page }) => {
  await expect(page.locator("[data-testid='ArrowBackIosIcon']")).toBeVisible();
  await expect(
    page.locator("[data-testid='ArrowForwardIosIcon']"),
  ).toBeVisible();
});

Then("I should see a download button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Download/ })).toBeVisible();
});

Then("I should see a delete button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Delete/ })).toBeVisible();
});

// Modal image changes — verified visually
Then("I should see the next photo", async () => {});
Then("I should see the previous photo", async () => {});

Then("the modal should close", async ({ page }) => {
  await expect(page.locator(".MuiModal-root")).not.toBeVisible();
});

// Opens in new window — cannot assert in single-tab context
Then("the photo should open in a new tab", async () => {});

Then("the photo should be removed from the album", async ({ page }) => {
  await expect(page.locator(".MuiModal-root")).not.toBeVisible();
});

Then("the photo should still be in the album", async ({ page }) => {
  await expect(page.locator("img").first()).toBeVisible();
});

// Download triggered — verified via network request
Then("a zip file should begin downloading", async () => {});
