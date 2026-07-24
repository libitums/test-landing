import { describe, expect, it, vi } from "vitest";
import { createEarlyAccessSubmissionAdapter } from "./index";

const receipt = {
  status: "success",
  registration: {
    id: "123e4567-e89b-42d3-a456-426614174000",
    createdAt: "2026-07-24T00:00:00.000Z",
  },
};
const configuration = {
  projectId: "ai-communication" as const,
  supabaseUrl: "https://project.supabase.co",
  publishableKey: "publishable",
};

describe("createEarlyAccessSubmissionAdapter", () => {
  it("trims email, fixes the project, and resolves only for a saved receipt", async () => {
    const request = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify(receipt), { status: 201 }),
    );
    await createEarlyAccessSubmissionAdapter({ ...configuration, fetch: request })({
      email: "  learner@example.com\u3000",
      marketingConsent: true,
    });
    const [, init] = request.mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({
      projectId: "ai-communication",
      email: "learner@example.com",
      marketingConsent: true,
    });
  });

  it("rejects invalid input before network IO", async () => {
    const request = vi.fn();
    await expect(
      createEarlyAccessSubmissionAdapter({ ...configuration, fetch: request })({
        email: "bad",
        marketingConsent: false,
      }),
    ).rejects.toMatchObject({ name: "EarlyAccessSubmissionError", code: "validation" });
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    [429, { status: "rate_limited", retryAfterSeconds: 20 }, "rate_limited"],
    [400, { status: "invalid", issues: [{ field: "email", code: "invalid" }] }, "validation"],
    [500, { status: "server_error" }, "server"],
    [404, { status: "unknown_project" }, "server"],
  ])("maps HTTP %s to %s", async (status, body, code) => {
    const fetch = vi.fn(async () => new Response(JSON.stringify(body), { status }));
    await expect(
      createEarlyAccessSubmissionAdapter({ ...configuration, fetch })({
        email: "a@example.com",
        marketingConsent: true,
      }),
    ).rejects.toMatchObject({ name: "EarlyAccessSubmissionError", code });
  });

  it("maps transport failures to network and malformed responses to server", async () => {
    const network = vi.fn(async () => {
      throw new TypeError("offline");
    });
    await expect(
      createEarlyAccessSubmissionAdapter({ ...configuration, fetch: network })({
        email: "a@example.com",
        marketingConsent: true,
      }),
    ).rejects.toMatchObject({ code: "network" });
    const malformed = vi.fn(async () => new Response("not-json", { status: 201 }));
    await expect(
      createEarlyAccessSubmissionAdapter({ ...configuration, fetch: malformed })({
        email: "a@example.com",
        marketingConsent: true,
      }),
    ).rejects.toMatchObject({ code: "server" });
  });

  it("does not call the API when environment configuration is absent", async () => {
    const fetch = vi.fn();
    await expect(
      createEarlyAccessSubmissionAdapter({ ...configuration, supabaseUrl: "", fetch })({
        email: "a@example.com",
        marketingConsent: true,
      }),
    ).rejects.toMatchObject({ code: "server" });
    expect(fetch).not.toHaveBeenCalled();
  });
});
