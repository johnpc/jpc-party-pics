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

Then("I should see the upload hero area", async ({ page }) => {
  await expect(page.getByText("Add your photos & videos")).toBeVisible();
  await expect(page.getByText("Choose Files")).toBeVisible();
});

Then("I should see a button {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("button", { name: text })).toBeVisible();
});

Then("the button should briefly show a checkmark", async ({ page }) => {
  await expect(page.getByText("✅")).toBeVisible();
});
