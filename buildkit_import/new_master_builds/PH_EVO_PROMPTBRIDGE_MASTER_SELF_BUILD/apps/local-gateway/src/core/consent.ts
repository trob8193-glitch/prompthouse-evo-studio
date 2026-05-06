export type TrainingPolicy = {
  captureEnabled?: boolean;
  allowedForMemory?: boolean;
  allowedForFinetune?: boolean;
  allowedForPreferenceTraining?: boolean;
  requiresReview?: boolean;
  sourceRights?: string;
  dataClass?: string;
};

export function canEnterTraining(policy?: TrainingPolicy): boolean {
  if (!policy) return false;
  if (!policy.captureEnabled) return false;
  if (policy.sourceRights === "blocked" || policy.sourceRights === "unknown") return false;
  return Boolean(policy.allowedForFinetune || policy.allowedForPreferenceTraining);
}

export function reviewStatus(policy?: TrainingPolicy): "approved" | "review_required" | "blocked" {
  if (!canEnterTraining(policy)) return "blocked";
  return policy?.requiresReview === false ? "approved" : "review_required";
}
