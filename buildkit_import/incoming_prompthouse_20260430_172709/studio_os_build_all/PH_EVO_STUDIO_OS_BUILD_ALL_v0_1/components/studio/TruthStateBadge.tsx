import type { TruthState } from "@/lib/studio/types";

export function TruthStateBadge({ state }: { state: TruthState }) {
  return <span className="badge">{state}</span>;
}
