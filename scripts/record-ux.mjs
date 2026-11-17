// Records the real user experience: Playwright drives the app at a desktop and
// a phone viewport, saving a video per flow, screenshots at every step and a
// timings.json of load/interaction latencies.
//
//   node scripts/record-ux.mjs --backend fake --out ux-evidence/fake
//   node scripts/record-ux.mjs --backend real --out ux-evidence/real   (read-only)
//
// `fake` exercises every flow (create, upload, camera, kiosk live update,
// offline). `real` only reads (gallery, lightbox, zoom, kiosk) so a run never
// mutates production.
import { chromium, devices } from "@playwright/test";
import { spawn } from "child_process";
import { mkdirSync, renameSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a, i, all) => (a.startsWith("--") ? [a.slice(2), all[i + 1]] : []))
    .filter((e) => e.length),
);
const backend = args.backend ?? "fake";
const out = path.resolve(args.out ?? `ux-evidence/${backend}`);
const port = Number(args.port ?? (backend === "fake" ? 5174 : 5175));
const base = args.base ?? `http://localhost:${port}`;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const fixture = path.join(repoRoot, "e2e/fixtures/test-photo.jpg");
mkdirSync(out, { recursive: true });

const iphone = devices["iPhone 13"];
const profiles = [
  { name: "desktop", viewport: { width: 1280, height: 800 }, hasTouch: false },
  {
    name: "mobile",
    viewport: iphone.viewport,
    userAgent: iphone.userAgent,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

const timings = [];
const now = () => performance.now();
const record = (profile, flow, metric, ms) => {
  timings.push({ profile, flow, metric, ms: Math.round(ms) });
  console.log(
    `  ${profile.padEnd(7)} ${flow.padEnd(18)} ${metric.padEnd(34)} ${String(Math.round(ms)).padStart(6)} ms`,
  );
};

let server;
if (!args.base) {
  const env = {
    ...process.env,
    ...(backend === "fake" ? { VITE_BACKEND: "fake" } : {}),
  };
  server = spawn("npx", ["vite", "--port", String(port), "--strictPort"], {
    cwd: repoRoot,
    env,
    stdio: "ignore",
  });
  const started = now();
  for (;;) {
    try {
      await fetch(base);
      break;
    } catch {
      if (now() - started > 30000) throw new Error("dev server did not start");
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

const browser = await chromium.launch({
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
  ],
});

async function flow(profile, name, run) {
  const videoDir = path.join(out, "video-tmp");
  const context = await browser.newContext({
    ...profile,
    name: undefined,
    permissions: ["camera", "microphone"],
    recordVideo: { dir: videoDir, size: profile.viewport },
  });
  const page = await context.newPage();
  const shots = { n: 0 };
  const shot = async (label) => {
    shots.n += 1;
    await page.screenshot({
      path: path.join(
        out,
        `${profile.name}-${name}-${String(shots.n).padStart(2, "0")}-${label}.png`,
      ),
      fullPage: false,
    });
  };
  const gallery = page.locator('img[alt^="public/"]');
  try {
    await run({ page, context, shot, gallery });
  } catch (error) {
    console.error(
      `  !! ${profile.name}/${name} failed: ${error.message.split("\n")[0]}`,
    );
    await shot("FAILED");
    timings.push({
      profile: profile.name,
      flow: name,
      metric: "FAILED",
      ms: -1,
    });
  }
  const video = page.video();
  await context.close();
  if (video)
    renameSync(
      await video.path(),
      path.join(out, `${profile.name}-${name}.webm`),
    );
}

async function timeTo(profile, flowName, metric, action) {
  const t = now();
  await action();
  record(profile.name, flowName, metric, now() - t);
}

async function openLightbox(page, gallery) {
  await gallery.first().click();
  await page.locator('.MuiModal-root img[alt^="public/"]').first().waitFor();
}

for (const profile of profiles) {
  console.log(`\n== ${profile.name} (${backend}) ==`);

  await flow(profile, "gallery", async ({ page, shot, gallery }) => {
    await timeTo(
      profile,
      "gallery",
      "goto /Demo → first photo visible",
      async () => {
        await page.goto(`${base}/Demo`);
        await gallery.first().waitFor({ state: "visible" });
      },
    );
    await shot("grid");
    await timeTo(profile, "gallery", "tap photo → lightbox image shown", () =>
      openLightbox(page, gallery),
    );
    await shot("lightbox");
    const modalImg = page.locator('.MuiModal-root img[alt^="public/"]').first();
    const before = await modalImg.getAttribute("alt");
    await timeTo(profile, "gallery", "forward arrow → next image", async () => {
      await page.locator("[data-testid='ArrowForwardIosIcon']").click();
      await page
        .locator(`.MuiModal-root img[alt^="public/"]:not([alt="${before}"])`)
        .first()
        .waitFor();
    });
    await shot("lightbox-next");
    if (profile.hasTouch) {
      const box = await modalImg.boundingBox();
      const x = box.x + box.width / 2,
        y = box.y + box.height / 2;
      await timeTo(
        profile,
        "gallery",
        "double-tap → zoomed (2.5x)",
        async () => {
          await page.touchscreen.tap(x, y);
          await page.waitForTimeout(80);
          await page.touchscreen.tap(x, y);
          await page
            .locator('.MuiModal-root img[alt^="public/"]')
            .first()
            .evaluate(
              (el) =>
                new Promise((r) => {
                  const check = () =>
                    getComputedStyle(el).transform.startsWith("matrix(2.5")
                      ? r()
                      : requestAnimationFrame(check);
                  check();
                }),
            );
        },
      );
      await page.waitForTimeout(250); // let the 200 ms transform transition settle before the screenshot
      await shot("zoomed");
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(80);
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(250);
      await shot("unzoomed");
    }
    await page.keyboard.press("Escape");
    await page.locator(".MuiModal-root").waitFor({ state: "hidden" });
    await shot("closed");
  });

  await flow(profile, "kiosk", async ({ page, shot, gallery }) => {
    await timeTo(
      profile,
      "kiosk",
      "goto /wedding/kiosk → first item",
      async () => {
        await page.goto(`${base}/wedding/kiosk`);
        await gallery.first().waitFor({ state: "visible" });
      },
    );
    await shot("grid");
    if (backend === "fake") {
      await timeTo(
        profile,
        "kiosk",
        "guest upload event → appears",
        async () => {
          await page.evaluate(() =>
            window.__partypicsFake.injectImage(
              "wedding",
              "public/wedding/guest/live-photo.jpg",
            ),
          );
          await page
            .locator('img[alt="public/wedding/guest/live-photo.jpg"]')
            .waitFor({ state: "visible" });
        },
      );
      await shot("after-live-update");
    }
  });

  if (backend !== "fake") continue;

  await flow(profile, "create-album", async ({ page, shot }) => {
    await page.goto(`${base}/`);
    await shot("home");
    const input = page.getByPlaceholder("my-party");
    await input.fill("Demo");
    await page
      .getByRole("button", { name: /Create Party Album/ })
      .waitFor({ state: "attached" });
    await shot("duplicate-name-disabled");
    const name = `my-party-${Date.now().toString(36)}`;
    await input.fill(name);
    await timeTo(
      profile,
      "create-album",
      "create → album page ready",
      async () => {
        await page.getByRole("button", { name: /Create Party Album/ }).click();
        await page.waitForURL(`**/${name}`);
        await page.getByText("No photos yet").waitFor();
      },
    );
    await shot("new-album");
  });

  await flow(profile, "upload", async ({ page, shot, gallery }) => {
    await page.goto(`${base}/e2e-test`);
    await page.getByText("No photos yet").waitFor();
    await shot("empty");
    await timeTo(profile, "upload", "choose file → photo in grid", async () => {
      await page.locator('input[type="file"]').setInputFiles(fixture);
      await gallery.first().waitFor({ state: "visible" });
    });
    await shot("uploaded");
    await page.getByRole("button", { name: "🔗 Share" }).click();
    await page.locator("svg").first().waitFor();
    await shot("share-panel");
  });

  await flow(profile, "camera", async ({ page, shot }) => {
    await timeTo(
      profile,
      "camera",
      "goto camera → capture enabled",
      async () => {
        await page.goto(`${base}/e2e-test/camera`);
        await page
          .getByRole("button", { name: /Capture/ })
          .and(page.locator(":enabled"))
          .waitFor();
      },
    );
    await shot("ready");
    await page.getByRole("button", { name: "Video" }).click();
    await page.getByRole("button", { name: /Start Recording/ }).click();
    const stop = page.getByRole("button", { name: /Stop/ });
    await timeTo(profile, "camera", "record → 50 KB captured", async () => {
      for (;;) {
        if (Number(await stop.getAttribute("data-recorded-bytes")) > 50_000)
          break;
        await page.waitForTimeout(100);
      }
    });
    await shot("recording");
    await timeTo(profile, "camera", "stop → Success!", async () => {
      await stop.click();
      await page.getByText("Success!").waitFor();
    });
    await shot("success");
  });

  await flow(profile, "offline", async ({ page, context, shot }) => {
    await page.goto(`${base}/wedding`);
    await page.locator('img[alt^="public/"]').first().waitFor();
    await context.setOffline(true);
    await page.getByText(/offline/).waitFor();
    await shot("banner");
    await context.setOffline(false);
  });
}

await browser.close();
server?.kill();
writeFileSync(path.join(out, "timings.json"), JSON.stringify(timings, null, 2));
console.log(`\nEvidence written to ${out}`);
