import { describe, it, expect } from "vitest";
import { closed, neighborKey, open } from "./lightbox";

describe("lightbox", () => {
  const keys = ["a", "b", "c"];

  it("constructs the two states", () => {
    expect(closed).toEqual({ kind: "closed" });
    expect(open("b")).toEqual({ kind: "open", key: "b" });
  });

  it("steps forward and backward with wrap-around", () => {
    expect(neighborKey(keys, "a", "forward")).toBe("b");
    expect(neighborKey(keys, "c", "forward")).toBe("a");
    expect(neighborKey(keys, "b", "back")).toBe("a");
    expect(neighborKey(keys, "a", "back")).toBe("c");
  });

  it("returns undefined when the key is no longer listed", () => {
    expect(neighborKey(keys, "zzz", "forward")).toBeUndefined();
    expect(neighborKey([], "a", "back")).toBeUndefined();
  });
});
