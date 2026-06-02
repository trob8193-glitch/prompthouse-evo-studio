export type PHTruthState =
  | "planned"
  | "implemented"
  | "running"
  | "tested"
  | "verified"
  | "blocked"
  | "human_required";

export type PHMemoryScope =
  | "private_device"
  | "private_user_sync"
  | "workspace_shared"
  | "global_pattern_candidate"
  | "training_candidate"
  | "blocked";
