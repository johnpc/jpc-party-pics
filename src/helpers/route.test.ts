import { describe, it, expect } from "vitest";
import { parseRoute } from "./route";

describe("parseRoute", () => {
  it("maps the root to home", () => {
    expect(parseRoute("/")).toEqual({ kind: "home" });
    expect(parseRoute("")).toEqual({ kind: "home" });
  });

  it("maps /<album> to the album view", () => {
    expect(parseRoute("/wedding")).toEqual({
      kind: "album",
      albumName: "wedding",
    });
    expect(parseRoute("/wedding/")).toEqual({
      kind: "album",
      albumName: "wedding",
    });
  });

  it("maps camera and kiosk sub-views", () => {
    expect(parseRoute("/wedding/camera")).toEqual({
      kind: "camera",
      albumName: "wedding",
    });
    expect(parseRoute("/wedding/kiosk")).toEqual({
      kind: "kiosk",
      albumName: "wedding",
    });
  });

  it("treats an unknown sub-path as the album view", () => {
    expect(parseRoute("/wedding/whatever")).toEqual({
      kind: "album",
      albumName: "wedding",
    });
  });
});
