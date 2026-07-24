export const earlyAccessTableByProject = {
  "k-drama": "k_drama_early_access",
  "ai-communication": "ai_communication_early_access",
  "k-culture": "k_culture_early_access",
} as const;

export type EarlyAccessProjectId = keyof typeof earlyAccessTableByProject;

export interface EarlyAccessValidationIssue {
  field: "email" | "marketingConsent" | "body";
  code: "required" | "invalid" | "unknown_field";
}
