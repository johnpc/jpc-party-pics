import { existsSync, readFileSync } from "fs";
import { basename, extname, resolve } from "path";
import type { Plugin } from "vite";

const PREFIX = "/fake-s3/";
const FIXTURES = resolve(process.cwd(), "e2e/fixtures");
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".zip": "application/zip",
};

// Serves the fake backend's media: /fake-s3/<key>. A basename present in
// e2e/fixtures/ streams as-is (real JPEG / WebM); every other key becomes a
// deterministic SVG "photo" labelled with its filename.
export function fakeS3Plugin(): Plugin {
  return {
    name: "partypics-fake-s3",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith(PREFIX)) return next();
        const key = decodeURIComponent(url.slice(PREFIX.length));
        const fixture = resolve(FIXTURES, basename(key));
        if (fixture.startsWith(FIXTURES) && existsSync(fixture)) {
          res.setHeader(
            "Content-Type",
            MIME[extname(fixture)] ?? "application/octet-stream",
          );
          const body = readFileSync(fixture);
          res.setHeader("Content-Length", body.byteLength);
          res.setHeader("Cache-Control", "no-store");
          res.end(body);
          return;
        }
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "no-store");
        res.end(placeholderSvg(key));
      });
    },
  };
}

export function placeholderSvg(key: string): string {
  const label = basename(key).replace(/\.[^.]+$/, "");
  const hue = [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},70%,55%)"/>` +
    `<stop offset="1" stop-color="hsl(${(hue + 60) % 360},70%,35%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="1200" height="900" fill="url(#g)"/>` +
    `<circle cx="900" cy="220" r="110" fill="rgba(255,255,255,0.25)"/>` +
    `<text x="600" y="480" font-family="sans-serif" font-size="96" font-weight="bold" ` +
    `fill="white" text-anchor="middle">${escapeXml(label)}</text>` +
    `</svg>`
  );
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
