import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

// Uploads below this size are discarded by the app (see cameraUpload.ts), so
// the harness waits for the recorder to have produced at least this much.
const MIN_VIDEO_BYTES = 50_000;

Given("I navigate to {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Given(
  "I am on the camera page for {string}",
  async ({ page }, albumName: string) => {
    await page.goto(`/${albumName}/camera`);
  },
);

Given("the camera is active", async ({ page }) => {
  await expect(page.locator("video")).toBeVisible();
});

Given("I switch to video mode", async ({ page }) => {
  await page.getByRole("button", { name: "Video" }).click();
});

When("I click the back button", async ({ page }) => {
  await page.getByRole("button", { name: /Back/ }).click();
});

When("I click the capture button", async ({ page }) => {
  await page.getByRole("button", { name: /Capture/ }).click();
});

When("I click the record button", async ({ page }) => {
  await page.getByRole("button", { name: /Record/ }).click();
});

When("I click the stop button", async ({ page }) => {
  const stop = page.getByRole("button", { name: /Stop/ });
  // Real condition, not a sleep: the app exposes the bytes recorded so far.
  await expect
    .poll(async () => Number(await stop.getAttribute("data-recorded-bytes")), {
      timeout: 20000,
    })
    .toBeGreaterThan(MIN_VIDEO_BYTES);
  await stop.click();
});

Then("the camera should start", async ({ page }) => {
  await expect(page.locator("video")).toBeVisible();
});

Then("I should see a video preview", async ({ page }) => {
  await expect(page.locator("video")).toBeVisible();
});

Then("I should be in photo mode", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Capture/ })).toBeVisible();
});

Then("I should see a record button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Record/ })).toBeVisible();
});

Then("I should see a capture button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Capture/ })).toBeVisible();
});

Then("I should see {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then("the capture button should be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Capture/ })).toBeVisible();
});

Then("the button should show {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("button", { name: text })).toBeVisible();
});

Then("the recording size should be shown", async ({ page }) => {
  await expect(page.getByText(/Recording\.\.\. \d+ KB captured/)).toBeVisible();
});

Then("the video should upload", async ({ page }) => {
  await expect(page.getByText("Success!")).toBeVisible({ timeout: 15000 });
});
