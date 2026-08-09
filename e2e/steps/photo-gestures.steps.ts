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
  await page.locator(modalImg).first().dblclick();
});

Then("the photo should appear zoomed in", async ({ page }) => {
  await expect(page.locator(modalImg).first()).toHaveCSS(
    "transform",
    /matrix\(2\.5/,
  );
});
