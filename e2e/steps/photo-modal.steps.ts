import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { galleryImg, modalImg } from "./selectors";

const { When, Then } = createBdd();

// A popup promise armed by a When step and awaited by the matching Then step,
// and the lightbox image noted before a navigation step.
const pendingPopups = new WeakMap<Page, Promise<Page>>();
const modalAltBefore = new WeakMap<Page, string>();

async function currentModalAlt(page: Page): Promise<string> {
  const img = page.locator(modalImg).first();
  await img.waitFor({ state: "visible" });
  return (await img.getAttribute("alt")) ?? "";
}

// The neighbor is computed from the gallery's own order (the list the modal
// steps through), wrapping at either end.
async function expectModalMovedTo(page: Page, direction: "forward" | "back") {
  const before = modalAltBefore.get(page) ?? "";
  const keys = await page
    .locator(galleryImg)
    .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
  const index = keys.indexOf(before);
  const step = direction === "forward" ? 1 : -1;
  const expected = keys[(index + step + keys.length) % keys.length];
  const img = page.locator(modalImg).first();
  await expect(img).not.toHaveAttribute("alt", before);
  if (index !== -1 && expected && index + step in keys) {
    await expect(img).toHaveAttribute("alt", expected);
  }
}

When("I click the forward arrow", async ({ page }) => {
  modalAltBefore.set(page, await currentModalAlt(page));
  await page.locator("[data-testid='ArrowForwardIosIcon']").click();
});

When("I click the back arrow", async ({ page }) => {
  modalAltBefore.set(page, await currentModalAlt(page));
  await page.locator("[data-testid='ArrowBackIosIcon']").click();
});

When("I click outside the modal", async ({ page }) => {
  await page.keyboard.press("Escape");
});

When("I click the download button", async ({ page }) => {
  pendingPopups.set(page, page.waitForEvent("popup"));
  await page.getByRole("button", { name: /Download/ }).click();
});

When("I confirm and click download all", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  pendingPopups.set(page, page.waitForEvent("popup"));
  await page.getByRole("button", { name: /Download All/ }).click();
});

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

Then("I should see the next photo", async ({ page }) => {
  await expectModalMovedTo(page, "forward");
});

Then("I should see the previous photo", async ({ page }) => {
  await expectModalMovedTo(page, "back");
});

Then("the modal should close", async ({ page }) => {
  await expect(page.locator(".MuiModal-root")).not.toBeVisible();
});

Then("the photo should open in a new tab", async ({ page }) => {
  const popup = await pendingPopups.get(page);
  expect(popup?.url()).toMatch(/s3/);
});

Then("a zip file should begin downloading", async ({ page }) => {
  const popup = await pendingPopups.get(page);
  expect(popup?.url()).toMatch(/\.zip/);
});
