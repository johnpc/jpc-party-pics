import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I am on the home page", async ({ page }) => {
  await page.goto("/");
});

Given("an album named {string} already exists", async () => {
  // Album existence is mocked via API state; for e2e this is a precondition
});

When(
  "I type {string} in the album name input",
  async ({ page }, text: string) => {
    await page.getByPlaceholder("my-party").fill(text);
  },
);

When("I click the create button", async ({ page }) => {
  await page.getByRole("button", { name: /Create Party Album/ }).click();
});

Then("I should see the heading {string}", async ({ page }, heading: string) => {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
});

Then(
  "I should see an input field with placeholder {string}",
  async ({ page }, placeholder: string) => {
    await expect(page.getByPlaceholder(placeholder)).toBeVisible();
  },
);

Then("the create button should be disabled", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /Create Party Album/ }),
  ).toBeDisabled();
});

Then("the create button should be enabled", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /Create Party Album/ }),
  ).toBeEnabled();
});

Then("I should see a link to the demo album", async ({ page }) => {
  await expect(page.getByRole("link", { name: /demo album/ })).toBeVisible();
});

Then("I should be redirected to {string}", async ({ page }, path: string) => {
  await page.waitForURL(`**${path}`);
});
