import { describe, expect, it } from "vitest";
import { createViteConfig } from "./index";

describe("shared browser build contract", () => {
  it("pins Safari/iOS Safari 15 and Chrome Android 109 compatibility", () => {
    const config = createViteConfig();

    expect(config).toMatchObject({
      build: {
        target: ["safari15", "chrome109"],
      },
    });
  });
});
