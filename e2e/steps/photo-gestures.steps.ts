import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

const modalImg = ".MuiModal-root img[src*='s3']";

async function swipe(page: import("@playwright/test").Page, dir: "L" | "R") {
  await page.locator(modalImg).first().waitFor();
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
    { sel: modalImg, dir },
  );
}

When("I swipe left on the photo", async ({ page }) => swipe(page, "L"));
When("I swipe right on the photo", async ({ page }) => swipe(page, "R"));

When("I double tap the photo", async ({ page }) => {
  // Real touchscreen double tap (two quick taps) — not a mouse dblclick — so
  // this exercises the synthesized-dblclick ghost-click path mobile hits.
  const img = page.locator(modalImg).first();
  // Wait for the bitmap to actually decode; until then the element has zero
  // rendered height and the tap would land on the surrounding flex, not the img.
  await expect
    .poll(async () => (await img.boundingBox())?.height ?? 0)
    .toBeGreaterThan(0);
  const box = await img.boundingBox();
  if (!box) throw new Error("Modal image not visible");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(80);
  await page.touchscreen.tap(x, y);
});

Then("the photo should appear zoomed in", async ({ page }) => {
  await expect(page.locator(modalImg).first()).toHaveCSS(
    "transform",
    /matrix\(2\.5/,
  );
});

Then("the photo should not be zoomed", async ({ page }) => {
  await expect(page.locator(modalImg).first()).toHaveCSS(
    "transform",
    /matrix\(1,/,
  );
});
