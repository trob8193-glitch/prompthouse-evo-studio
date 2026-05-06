import { describe, expect, it } from "vitest";
import { SAMPLE_CONNECTORS, SAMPLE_MISSION } from "./constants";
import {
  compileAppSpec,
  compilePromptSpec,
  createApprovalRequest,
  createDeploymentGate,
  createVibeSpec,
  requiresApproval
} from "./pipeline";

describe("PromptHouse Studio pipeline", () => {
  it("turns a rough idea into a VibeSpec, PromptSpec, and AppSpec", () => {
    const vibe = createVibeSpec(SAMPLE_MISSION, "Build a vibe coding studio that ships mobile apps");
    const prompt = compilePromptSpec(SAMPLE_MISSION, vibe);
    const app = compileAppSpec(SAMPLE_MISSION, vibe, prompt);

    expect(vibe.mustHaveFeatures.length).toBeGreaterThan(3);
    expect(prompt.constraints).toContain("Do not fake deployment.");
    expect(app.screens).toContain("Bridge Hub");
    expect(app.codeTasks.length).toBeGreaterThan(0);
  });

  it("requires approval for connector writes", () => {
    const github = SAMPLE_CONNECTORS.find((c) => c.connectorId === "github")!;
    expect(requiresApproval(github, "write")).toBe(true);

    const approval = createApprovalRequest(github, "open_pr");
    expect(approval.status).toBe("pending");
    expect(approval.rollbackPlan).toBe("branch_revert");
  });

  it("blocks shipping when no proof artifact exists", () => {
    const gate = createDeploymentGate(SAMPLE_MISSION, []);
    expect(gate.canShip).toBe(false);
  });

  it("allows ship gate only when proof artifacts exist", () => {
    const gate = createDeploymentGate(SAMPLE_MISSION, ["test_report_001"]);
    expect(gate.canShip).toBe(true);
  });
});
