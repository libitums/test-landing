import {
  earlyAccessTableByProject,
  type EarlyAccessProjectId,
  type EarlyAccessValidationIssue,
} from "../_shared/early-access-contract.ts";

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RegistrationReceipt {
  id: string;
  createdAt: string;
}

export interface RegisterEarlyAccessDependencies {
  clientKeySecret: string | null;
  consumeRateLimit(clientKey: string): Promise<RateLimitDecision>;
  insertRegistration(projectId: EarlyAccessProjectId, email: string): Promise<RegistrationReceipt>;
}

function isReceipt(value: RegistrationReceipt): boolean {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id) &&
    !Number.isNaN(Date.parse(value.createdAt))
  );
}

const allowedKeys = new Set(["projectId", "email", "marketingConsent"]);
const emailPattern =
  /^[^\s@\u0000-\u001f\u007f]+@[^\s@\u0000-\u001f\u007f]+\.[^\s@\u0000-\u001f\u007f]+$/u;

function json(body: unknown, status: number, extra: HeadersInit = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    ...extra,
  });
  return new Response(JSON.stringify(body), { status, headers });
}

export function trustedClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  const finalHop = forwarded.split(",").pop()?.trim();
  return finalHop && finalHop.length <= 64 ? finalHop : null;
}

async function clientKey(ip: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateBody(value: unknown): {
  projectId?: EarlyAccessProjectId;
  email?: string;
  consent?: true;
  issues: EarlyAccessValidationIssue[];
  unknownProject: boolean;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { issues: [{ field: "body", code: "invalid" }], unknownProject: false };
  }
  const body = value as Record<string, unknown>;
  const issues: EarlyAccessValidationIssue[] = [];
  if (Object.keys(body).some((key) => !allowedKeys.has(key)))
    issues.push({ field: "body", code: "unknown_field" });
  const unknownProject =
    typeof body.projectId !== "string" || !(body.projectId in earlyAccessTableByProject);
  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  if (body.email === undefined) issues.push({ field: "email", code: "required" });
  else if (!email || email.length > 254 || !emailPattern.test(email))
    issues.push({ field: "email", code: "invalid" });
  if (body.marketingConsent === undefined)
    issues.push({ field: "marketingConsent", code: "required" });
  else if (body.marketingConsent !== true)
    issues.push({ field: "marketingConsent", code: "invalid" });
  return {
    projectId: unknownProject ? undefined : (body.projectId as EarlyAccessProjectId),
    email,
    consent: body.marketingConsent === true ? true : undefined,
    issues,
    unknownProject,
  };
}

export function createRegisterEarlyAccessHandler(dependencies: RegisterEarlyAccessDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, apikey, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    if (request.method !== "POST")
      return json({ status: "invalid", issues: [{ field: "body", code: "invalid" }] }, 400);

    const ip = trustedClientIp(request);
    if (!dependencies.clientKeySecret || !ip) return json({ status: "server_error" }, 500);

    try {
      const limit = await dependencies.consumeRateLimit(
        await clientKey(ip, dependencies.clientKeySecret),
      );
      if (limit.allowed !== true) {
        const retryAfterSeconds = Number(limit.retryAfterSeconds);
        if (!Number.isInteger(retryAfterSeconds) || retryAfterSeconds < 1 || retryAfterSeconds > 60)
          return json({ status: "server_error" }, 500);
        return json({ status: "rate_limited", retryAfterSeconds }, 429, {
          "Retry-After": String(retryAfterSeconds),
        });
      }

      let parsed: unknown;
      try {
        parsed = await request.json();
      } catch {
        return json({ status: "invalid", issues: [{ field: "body", code: "invalid" }] }, 400);
      }
      const validated = validateBody(parsed);
      if (validated.unknownProject) return json({ status: "unknown_project" }, 404);
      if (
        validated.issues.length > 0 ||
        !validated.projectId ||
        !validated.email ||
        !validated.consent
      ) {
        return json({ status: "invalid", issues: validated.issues }, 400);
      }
      const receipt = await dependencies.insertRegistration(validated.projectId, validated.email);
      if (!isReceipt(receipt)) return json({ status: "server_error" }, 500);
      return json({ status: "success", registration: receipt }, 201);
    } catch {
      return json({ status: "server_error" }, 500);
    }
  };
}
