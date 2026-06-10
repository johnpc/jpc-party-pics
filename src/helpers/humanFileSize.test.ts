import { describe, it, expect } from "vitest";
import { humanFileSize } from "./humanFileSize";

describe("humanFileSize", () => {
  it("returns bytes for small values", () => {
    expect(humanFileSize(500)).toBe("500 B");
  });

  it("returns KiB for values over 1024 bytes", () => {
    expect(humanFileSize(1024)).toBe("1.0 KiB");
  });

  it("returns MiB for values over 1 MiB", () => {
    expect(humanFileSize(1048576)).toBe("1.0 MiB");
  });

  it("returns GiB for values over 1 GiB", () => {
    expect(humanFileSize(1073741824)).toBe("1.0 GiB");
  });

  it("handles SI units when si=true", () => {
    expect(humanFileSize(1000, true)).toBe("1.0 kB");
    expect(humanFileSize(1000000, true)).toBe("1.0 MB");
  });

  it("handles custom decimal places", () => {
    expect(humanFileSize(1536, false, 2)).toBe("1.50 KiB");
  });

  it("handles zero bytes", () => {
    expect(humanFileSize(0)).toBe("0 B");
  });

  it("handles negative values", () => {
    expect(humanFileSize(-1024)).toBe("-1.0 KiB");
  });
});
