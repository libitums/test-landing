import type {
  EarlyAccessInvalidResponse,
  EarlyAccessProjectId,
  EarlyAccessRegistrationResponse,
  EarlyAccessSubmission,
  EarlyAccessSubmissionError,
  EarlyAccessValidationIssue,
  SubmitEarlyAccessRegistration,
} from "@landing/contracts/early-access";

export interface EarlyAccessAdapterConfiguration {
  projectId: EarlyAccessProjectId;
  supabaseUrl: string;
  publishableKey: string;
  fetch?: typeof globalThis.fetch;
}

const emailPattern =
  /^[^\s@\u0000-\u001f\u007f]+@[^\s@\u0000-\u001f\u007f]+\.[^\s@\u0000-\u001f\u007f]+$/u;

type SubmissionErrorDetails =
  | { code: "validation"; issues: readonly EarlyAccessValidationIssue[] }
  | { code: "rate_limited"; retryAfterSeconds: number }
  | { code: "network" }
  | { code: "server" };

function submissionError(value: SubmissionErrorDetails): EarlyAccessSubmissionError {
  return { name: "EarlyAccessSubmissionError", ...value } as EarlyAccessSubmissionError;
}

function validationIssues(
  submission: EarlyAccessSubmission,
): readonly EarlyAccessValidationIssue[] {
  const issues: EarlyAccessValidationIssue[] = [];
  const email = typeof submission.email === "string" ? submission.email.trim() : "";
  if (!email) issues.push({ field: "email", code: "required" });
  else if (email.length > 254 || !emailPattern.test(email))
    issues.push({ field: "email", code: "invalid" });
  if (submission.marketingConsent !== true)
    issues.push({ field: "marketingConsent", code: "invalid" });
  return issues;
}

function isIssue(value: unknown): value is EarlyAccessValidationIssue {
  if (!value || typeof value !== "object") return false;
  const issue = value as Record<string, unknown>;
  return (
    ["email", "marketingConsent", "body"].includes(String(issue.field)) &&
    ["required", "invalid", "unknown_field"].includes(String(issue.code))
  );
}

function validResponse(value: unknown): value is EarlyAccessRegistrationResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Record<string, unknown>;
  if (response.status === "unknown_project" || response.status === "server_error") return true;
  if (response.status === "invalid")
    return Array.isArray(response.issues) && response.issues.every(isIssue);
  if (response.status === "rate_limited")
    return (
      Number.isInteger(response.retryAfterSeconds) &&
      Number(response.retryAfterSeconds) >= 1 &&
      Number(response.retryAfterSeconds) <= 60
    );
  if (
    response.status !== "success" ||
    !response.registration ||
    typeof response.registration !== "object"
  )
    return false;
  const receipt = response.registration as Record<string, unknown>;
  return (
    typeof receipt.id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(receipt.id) &&
    typeof receipt.createdAt === "string" &&
    !Number.isNaN(Date.parse(receipt.createdAt))
  );
}

export function createEarlyAccessSubmissionAdapter(
  configuration: EarlyAccessAdapterConfiguration,
): SubmitEarlyAccessRegistration {
  return async (submission) => {
    const issues = validationIssues(submission);
    if (issues.length > 0) throw submissionError({ code: "validation", issues });
    if (!configuration.supabaseUrl || !configuration.publishableKey)
      throw submissionError({ code: "server" });

    let endpoint: URL;
    try {
      endpoint = new URL("/functions/v1/register-early-access", configuration.supabaseUrl);
    } catch {
      throw submissionError({ code: "server" });
    }

    let response: Response;
    try {
      response = await (configuration.fetch ?? globalThis.fetch)(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: configuration.publishableKey,
          Authorization: `Bearer ${configuration.publishableKey}`,
        },
        body: JSON.stringify({
          projectId: configuration.projectId,
          email: submission.email.trim(),
          marketingConsent: true,
        }),
      });
    } catch {
      throw submissionError({ code: "network" });
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw submissionError({ code: "server" });
    }
    if (!validResponse(body)) throw submissionError({ code: "server" });
    if (response.status === 201 && body.status === "success") return;
    if (response.status === 400 && body.status === "invalid") {
      throw submissionError({
        code: "validation",
        issues: (body as EarlyAccessInvalidResponse).issues,
      });
    }
    if (response.status === 429 && body.status === "rate_limited") {
      throw submissionError({ code: "rate_limited", retryAfterSeconds: body.retryAfterSeconds });
    }
    throw submissionError({ code: "server" });
  };
}
