import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I navigate to album {string}", async ({ page }, albumName: string) => {
  await page.goto(`/${albumName}`);
});

When("I click {string}", async ({ page }, buttonText: string) => {
  await page.getByRole("button", { name: buttonText }).click();
});

Then("I should see a QR code", async ({ page }) => {
  await expect(page.locator("svg").first()).toBeVisible();
});

Then("I should see the file uploader", async ({ page }) => {
  await expect(
    page.locator("[class*='uploader'], [data-testid*='uploader']").first(),
  ).toBeVisible();
});

Then("the uploader should accept images and videos", async ({ page }) => {
  await expect(
    page.locator("[class*='uploader'], [data-testid*='uploader']").first(),
  ).toBeVisible();
});

Then("I should see a button {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("button", { name: text })).toBeVisible();
});

Then("the button should briefly show a checkmark", async ({ page }) => {
  await expect(page.getByText("✅")).toBeVisible();
});
