import { describe, expect, it, vi } from "vitest";
import { earlyAccessTableByProject as frozenTables } from "../../../packages/contracts/src/early-access";
import { earlyAccessTableByProject as functionTables } from "../_shared/early-access-contract";
import {
  createRegisterEarlyAccessHandler,
  parseAllowedOrigins,
  type RegisterEarlyAccessDependencies,
} from "./handler";

const origin = "https://landing.example.com";
const baseRequest = (body: unknown, method = "POST") =>
  new Request("https://project.supabase.co/functions/v1/register-early-access", {
    method,
    headers: {
      origin,
      "x-forwarded-for": "spoofed, 203.0.113.9",
      "content-type": "application/json",
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });

function setup(overrides: Partial<RegisterEarlyAccessDependencies> = {}) {
  const consumeRateLimit = vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 }));
  const insertRegistration = vi.fn(async () => ({
    id: "123e4567-e89b-42d3-a456-426614174000",
    createdAt: "2026-07-24T00:00:00.000Z",
  }));
  const handler = createRegisterEarlyAccessHandler({
    allowedOrigins: new Set([origin]),
    ipHashSecret: "a-secret-that-is-at-least-32-characters",
    consumeRateLimit,
    insertRegistration,
    ...overrides,
  });
  return { handler, consumeRateLimit, insertRegistration };
}

describe("register-early-access handler", () => {
  it("keeps the deploy-local routing contract in sync with the frozen contract", () => {
    expect(functionTables).toEqual(frozenTables);
  });

  it.each(Object.keys(frozenTables) as Array<keyof typeof frozenTables>)(
    "routes %s and trims the stored email",
    async (projectId) => {
      const { handler, insertRegistration } = setup();
      const response = await handler(
        baseRequest({ projectId, email: "  a@example.com\u3000", marketingConsent: true }),
      );
      expect(response.status).toBe(201);
      expect(insertRegistration).toHaveBeenCalledWith(projectId, "a@example.com");
      expect(await response.json()).toMatchObject({ status: "success" });
    },
  );

  it("returns stable strict-validation issues without storing", async () => {
    const { handler, insertRegistration } = setup();
    const response = await handler(
      baseRequest({
        projectId: "ai-communication",
        email: "bad",
        marketingConsent: "true",
        extra: true,
      }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: "invalid",
      issues: [
        { field: "body", code: "unknown_field" },
        { field: "email", code: "invalid" },
        { field: "marketingConsent", code: "invalid" },
      ],
    });
    expect(insertRegistration).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing or unknown project after consuming budget", async () => {
    const { handler, consumeRateLimit, insertRegistration } = setup();
    const response = await handler(baseRequest({ email: "a@example.com", marketingConsent: true }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ status: "unknown_project" });
    expect(consumeRateLimit).toHaveBeenCalledOnce();
    expect(insertRegistration).not.toHaveBeenCalled();
  });

  it("returns 429 and matching Retry-After without validating or storing", async () => {
    const { handler, insertRegistration } = setup({
      consumeRateLimit: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 17 })),
    });
    const response = await handler(baseRequest({ anything: "is still rate limited" }));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("17");
    expect(await response.json()).toEqual({ status: "rate_limited", retryAfterSeconds: 17 });
    expect(insertRegistration).not.toHaveBeenCalled();
  });

  it("shares one atomic five-request budget across projects under concurrent attempts", async () => {
    let accepted = 0;
    const observedClientKeys = new Set<string>();
    const consumeRateLimit = vi.fn(async (clientKey: string) => {
      observedClientKeys.add(clientKey);
      const position = ++accepted;
      await Promise.resolve();
      return position <= 5
        ? { allowed: true, retryAfterSeconds: 0 }
        : { allowed: false, retryAfterSeconds: 60 };
    });
    const insertRegistration = vi.fn(async (_projectId, _email) => ({
      id: crypto.randomUUID(),
      createdAt: "2026-07-24T00:00:00.000Z",
    }));
    const { handler } = setup({ consumeRateLimit, insertRegistration });
    const projects = [
      "k-drama",
      "ai-communication",
      "k-culture",
      "k-drama",
      "ai-communication",
      "k-culture",
    ] as const;

    const responses = await Promise.all(
      projects.map((projectId, index) =>
        handler(
          baseRequest({
            projectId,
            email: `learner-${index}@example.com`,
            marketingConsent: true,
          }),
        ),
      ),
    );

    expect(responses.map(({ status }) => status).sort()).toEqual([201, 201, 201, 201, 201, 429]);
    expect(insertRegistration).toHaveBeenCalledTimes(5);
    expect(observedClientKeys.size).toBe(1);
  });

  it("returns a distinct receipt for every accepted repeated-email submission", async () => {
    let sequence = 0;
    const insertRegistration = vi.fn(async () => {
      sequence += 1;
      return {
        id: `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
        createdAt: `2026-07-24T00:00:0${sequence}.000Z`,
      };
    });
    const { handler } = setup({ insertRegistration });
    const request = () =>
      baseRequest({
        projectId: "ai-communication",
        email: "duplicate@example.com",
        marketingConsent: true,
      });

    const first = (await (await handler(request())).json()) as {
      registration: { id: string };
    };
    const second = (await (await handler(request())).json()) as {
      registration: { id: string };
    };

    expect(first.registration.id).not.toBe(second.registration.id);
    expect(insertRegistration).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed JSON after consuming budget and before storage", async () => {
    const { handler, consumeRateLimit, insertRegistration } = setup();
    const response = await handler(
      new Request("https://project.supabase.co/functions/v1/register-early-access", {
        method: "POST",
        headers: {
          origin,
          "x-forwarded-for": "203.0.113.9",
          "content-type": "application/json",
        },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: "invalid",
      issues: [{ field: "body", code: "invalid" }],
    });
    expect(consumeRateLimit).toHaveBeenCalledOnce();
    expect(insertRegistration).not.toHaveBeenCalled();
  });

  it("rejects unsupported methods without consuming budget", async () => {
    const { handler, consumeRateLimit, insertRegistration } = setup();
    const response = await handler(baseRequest(undefined, "GET"));
    expect(response.status).toBe(400);
    expect(consumeRateLimit).not.toHaveBeenCalled();
    expect(insertRegistration).not.toHaveBeenCalled();
  });

  it.each([
    ["missing IP", { ipHashSecret: "a-secret-that-is-at-least-32-characters" }],
    ["missing hash configuration", { ipHashSecret: null }],
  ] as const)("fails closed for %s", async (_label, overrides) => {
    const { handler, consumeRateLimit } = setup(overrides);
    const request = baseRequest({
      projectId: "ai-communication",
      email: "a@example.com",
      marketingConsent: true,
    });
    if (overrides.ipHashSecret !== null) request.headers.delete("x-forwarded-for");
    const response = await handler(request);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ status: "server_error" });
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });

  it.each(["limiter", "storage"])("fails closed when %s is unavailable", async (failure) => {
    const failureFn = vi.fn(async () => {
      throw new Error("sensitive internal detail");
    });
    const { handler } = setup(
      failure === "limiter" ? { consumeRateLimit: failureFn } : { insertRegistration: failureFn },
    );
    const response = await handler(
      baseRequest({
        projectId: "ai-communication",
        email: "a@example.com",
        marketingConsent: true,
      }),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ status: "server_error" });
  });

  it("fails closed for a malformed storage receipt", async () => {
    const { handler } = setup({
      insertRegistration: vi.fn(async () => ({ id: "not-a-uuid", createdAt: "not-a-date" })),
    });
    const response = await handler(
      baseRequest({
        projectId: "ai-communication",
        email: "a@example.com",
        marketingConsent: true,
      }),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ status: "server_error" });
  });

  it("handles preflight without consuming rate-limit budget", async () => {
    const { handler, consumeRateLimit } = setup();
    const response = await handler(baseRequest(undefined, "OPTIONS"));
    expect(response.status).toBe(204);
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });

  it("fails closed for missing/wildcard/invalid origin configuration", () => {
    expect(parseAllowedOrigins(undefined)).toBeNull();
    expect(parseAllowedOrigins("*")).toBeNull();
    expect(parseAllowedOrigins("https://example.com/path")).toBeNull();
    expect(parseAllowedOrigins(origin)).toEqual(new Set([origin]));
  });

  it.each([
    ["missing allowlist", null, origin],
    ["missing request origin", new Set([origin]), null],
    ["disallowed request origin", new Set([origin]), "https://evil.example.com"],
  ] as const)("rejects %s before rate limiting", async (_label, allowedOrigins, requestOrigin) => {
    const { handler, consumeRateLimit, insertRegistration } = setup({ allowedOrigins });
    const headers: Record<string, string> = {
      "x-forwarded-for": "203.0.113.9",
      "content-type": "application/json",
    };
    if (requestOrigin) headers.origin = requestOrigin;
    const response = await handler(
      new Request("https://project.supabase.co/functions/v1/register-early-access", {
        method: "POST",
        headers,
        body: JSON.stringify({
          projectId: "ai-communication",
          email: "a@example.com",
          marketingConsent: true,
        }),
      }),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(consumeRateLimit).not.toHaveBeenCalled();
    expect(insertRegistration).not.toHaveBeenCalled();
  });
});
