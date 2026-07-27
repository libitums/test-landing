import type { SubmitEarlyAccessRegistration } from "@landing/contracts/early-access";

/** Safe fallback when the provider adapter is not supplied by the entrypoint. */
export const unavailableEarlyAccessRegistration: SubmitEarlyAccessRegistration = () =>
  Promise.reject({ name: "EarlyAccessSubmissionError", code: "server" } as const);
