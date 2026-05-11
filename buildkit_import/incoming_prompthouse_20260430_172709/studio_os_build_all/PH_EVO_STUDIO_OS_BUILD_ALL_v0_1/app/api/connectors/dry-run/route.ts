import { NextResponse } from "next/server";
import { SAMPLE_CONNECTORS } from "@/lib/studio/constants";
import { createApprovalRequest, requiresApproval } from "@/lib/studio/pipeline";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const connectorId = body.connectorId ?? "github";
  const actionRisk = body.actionRisk ?? "write";
  const actionName = body.actionName ?? "open_pr";

  const connector = SAMPLE_CONNECTORS.find((item) => item.connectorId === connectorId) ?? SAMPLE_CONNECTORS[0];
  const approvalRequired = requiresApproval(connector, actionRisk);
  const approval = approvalRequired ? createApprovalRequest(connector, actionName) : null;

  return NextResponse.json({
    mode: "live_run",
    executed: false,
    connector,
    approvalRequired,
    approval,
    boundary: "No external action was executed. Real connectors require credentials, scopes, and approval."
  });
}
