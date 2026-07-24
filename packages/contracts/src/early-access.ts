/** Frozen, provider-neutral contracts for the shared early-access boundary. */

export type EarlyAccessProjectId = "k-drama" | "ai-communication" | "k-culture";

export interface EarlyAccessSubmission {
  email: string;
  marketingConsent: boolean;
}

export interface EarlyAccessValidationIssue {
  field: "email" | "marketingConsent" | "body";
  code: "required" | "invalid" | "unknown_field";
}

export interface EarlyAccessValidationSubmissionError {
  readonly name: "EarlyAccessSubmissionError";
  readonly code: "validation";
  readonly issues: readonly EarlyAccessValidationIssue[];
}

export interface EarlyAccessRateLimitedSubmissionError {
  readonly name: "EarlyAccessSubmissionError";
  readonly code: "rate_limited";
  readonly retryAfterSeconds: number;
}

export interface EarlyAccessNetworkSubmissionError {
  readonly name: "EarlyAccessSubmissionError";
  readonly code: "network";
}

export interface EarlyAccessServerSubmissionError {
  readonly name: "EarlyAccessSubmissionError";
  readonly code: "server";
}

/** Stable provider-neutral rejection reason produced by the submission adapter. */
export type EarlyAccessSubmissionError =
  | EarlyAccessValidationSubmissionError
  | EarlyAccessRateLimitedSubmissionError
  | EarlyAccessNetworkSubmissionError
  | EarlyAccessServerSubmissionError;

/**
 * Existing EarlyAccessPage-compatible UI port. It resolves only after a saved
 * response and rejects with an `EarlyAccessSubmissionError` contract object.
 */
export type SubmitEarlyAccessRegistration = (submission: EarlyAccessSubmission) => Promise<void>;

/** Validated outbound request. Consent must be affirmative at the public write boundary. */
export interface EarlyAccessRegistrationRequest {
  projectId: EarlyAccessProjectId;
  email: string;
  marketingConsent: true;
}

export interface EarlyAccessRegistrationReceipt {
  id: string;
  createdAt: string;
}

export interface EarlyAccessSuccessResponse {
  status: "success";
  registration: EarlyAccessRegistrationReceipt;
}

export interface EarlyAccessInvalidResponse {
  status: "invalid";
  issues: readonly EarlyAccessValidationIssue[];
}

export interface EarlyAccessUnknownProjectResponse {
  status: "unknown_project";
}

export interface EarlyAccessRateLimitedResponse {
  status: "rate_limited";
  retryAfterSeconds: number;
}

export interface EarlyAccessServerErrorResponse {
  status: "server_error";
}

export type EarlyAccessRegistrationResponse =
  | EarlyAccessSuccessResponse
  | EarlyAccessInvalidResponse
  | EarlyAccessUnknownProjectResponse
  | EarlyAccessRateLimitedResponse
  | EarlyAccessServerErrorResponse;

export type EarlyAccessRegistrationErrorResponse = Exclude<
  EarlyAccessRegistrationResponse,
  EarlyAccessSuccessResponse
>;

export type EarlyAccessRegistrationHttpStatus = 201 | 400 | 404 | 429 | 500;

export const earlyAccessHttpStatus = {
  success: 201,
  invalid: 400,
  unknown_project: 404,
  rate_limited: 429,
  server_error: 500,
} as const satisfies Record<
  EarlyAccessRegistrationResponse["status"],
  EarlyAccessRegistrationHttpStatus
>;

export const earlyAccessTableByProject = {
  "k-drama": "k_drama_early_access",
  "ai-communication": "ai_communication_early_access",
  "k-culture": "k_culture_early_access",
} as const satisfies Record<EarlyAccessProjectId, string>;

export const earlyAccessRateLimit = {
  requests: 5,
  windowSeconds: 60,
} as const;

export type EarlyAccessFailureFormState = "validation-error" | "network-error" | "rate-limit";

export const earlyAccessFailureStateByCode = {
  validation: "validation-error",
  rate_limited: "rate-limit",
  network: "network-error",
  server: "network-error",
} as const satisfies Record<EarlyAccessSubmissionError["code"], EarlyAccessFailureFormState>;

export const earlyAccessTestIds = {
  page: "early-access-page",
  form: "early-access-form",
  email: "early-access-email",
  marketingConsent: "early-access-marketing-consent",
  status: "early-access-status",
  submit: "early-access-submit",
} as const;
