import type { SubmitEarlyAccessRegistration } from "@landing/contracts/early-access";

/** Safe composition fallback until the provider adapter is injected by the app entrypoint. */
export const unavailableEarlyAccessRegistration: SubmitEarlyAccessRegistration = () =>
  Promise.reject({ name: "EarlyAccessSubmissionError", code: "server" } as const);
