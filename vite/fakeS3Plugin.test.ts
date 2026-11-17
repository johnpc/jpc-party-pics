import { describe, it, expect, vi } from "vitest";
import { fakeS3Plugin, placeholderSvg } from "./fakeS3Plugin";

type Handler = (
  req: { url?: string },
  res: {
    setHeader: (k: string, v: string | number) => void;
    end: (body?: string | Buffer) => void;
    headers: Record<string, string | number>;
    body?: string | Buffer;
  },
  next: () => void,
) => void;

function install(): Handler {
  let handler: Handler | undefined;
  const plugin = fakeS3Plugin() as {
    configureServer: (s: {
      middlewares: { use: (h: Handler) => void };
    }) => void;
  };
  plugin.configureServer({ middlewares: { use: (h) => (handler = h) } });
  if (!handler) throw new Error("middleware not registered");
  return handler;
}

function response() {
  const res = {
    headers: {} as Record<string, string | number>,
    body: undefined as string | Buffer | undefined,
    setHeader(k: string, v: string | number) {
      this.headers[k] = v;
    },
    end(body?: string | Buffer) {
      this.body = body;
    },
  };
  return res;
}

describe("fakeS3Plugin", () => {
  it("passes unrelated requests through", () => {
    const next = vi.fn();
    install()({ url: "/index.html" }, response(), next);
    expect(next).toHaveBeenCalled();
  });

  it("renders a placeholder SVG for keys without a fixture", () => {
    const res = response();
    install()(
      { url: "/fake-s3/public/Demo/seed/demo-07.jpg?x=1" },
      res,
      vi.fn(),
    );
    expect(res.headers["Content-Type"]).toBe("image/svg+xml");
    expect(res.body).toContain("<svg");
    expect(res.body).toContain(">demo-07<");
  });

  it("serves a real fixture by basename", () => {
    const res = response();
    install()(
      { url: "/fake-s3/public/wedding/seed/test-photo.jpg" },
      res,
      vi.fn(),
    );
    expect(res.headers["Content-Type"]).toBe("image/jpeg");
    expect(Number(res.headers["Content-Length"])).toBeGreaterThan(0);
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect((res.body as Buffer).byteLength).toBe(res.headers["Content-Length"]);
  });

  it("escapes markup in labels and is deterministic", () => {
    const svg = placeholderSvg("public/a/<b>&.jpg");
    expect(svg).not.toContain("<b>");
    expect(svg).toContain("&#60;b&#62;&#38;");
    expect(placeholderSvg("public/a/x.jpg")).toBe(
      placeholderSvg("public/a/x.jpg"),
    );
  });
});
