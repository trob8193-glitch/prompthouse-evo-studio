import { Card } from "@/components/studio/Card";
import { ConnectorCard } from "@/components/studio/ConnectorCard";
import { ModuleRoute } from "@/components/studio/ModuleRoute";
import { SurfacePanel } from "@/components/studio/SurfacePanel";
import { TruthStateBadge } from "@/components/studio/TruthStateBadge";
import { SAMPLE_CONNECTORS, SAMPLE_MISSION } from "@/lib/studio/constants";
import {
  compileAppSpec,
  compilePromptSpec,
  createDeploymentGate,
  createQAReport,
  createReviewPacket,
  createVibeSpec
} from "@/lib/studio/pipeline";

export default function HomePage() {
  const vibe = createVibeSpec(SAMPLE_MISSION, SAMPLE_MISSION.userIntent);
  const prompt = compilePromptSpec(SAMPLE_MISSION, vibe);
  const app = compileAppSpec(SAMPLE_MISSION, vibe, prompt);
  const qa = createQAReport(SAMPLE_MISSION);
  const review = createReviewPacket(SAMPLE_MISSION);
  const gate = createDeploymentGate(SAMPLE_MISSION, []);

  return (
    <main className="shell">
      <div className="grid" style={{ marginBottom: 18 }}>
        <div>
          <div className="kicker">PromptHouse Evo Studio OS</div>
          <h1>Autonomous Prompt-to-App Engineering Studio</h1>
          <p>
            Web-first, mobile-ready studio for vibe coders and AI coders. It turns messy intent into specs,
            code tasks, connector handshakes, QA reports, review packets, and proof gates.
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        <Card title="Mission Control" kicker="Active Mission">
          <p>{SAMPLE_MISSION.userIntent}</p>
          <ModuleRoute route={SAMPLE_MISSION.route} />
          <div className="row" style={{ marginTop: 12 }}>
            {SAMPLE_MISSION.truthStates.map((state) => <TruthStateBadge key={state} state={state} />)}
          </div>
        </Card>

        <Card title="Vibe Fast Lane" kicker="Rough Idea → Spec">
          <p>{vibe.styleDNA.tone}</p>
          <div className="stat">{vibe.mustHaveFeatures.length}</div>
          <p className="small">Must-have features extracted from user intent.</p>
        </Card>

        <Card title="Review & Ship Gate" kicker="Proof Required">
          <p>Can ship: <strong>{gate.canShip ? "yes" : "no"}</strong></p>
          <p className="small">No proof artifacts yet, so ship status is blocked.</p>
        </Card>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <Card title="Prompt Forge" kicker="Compiled Prompt">
          <pre>{prompt.compiledPrompt}</pre>
        </Card>

        <Card title="App Forge" kicker="Generated AppSpec">
          <p>{app.productBrief}</p>
          <div className="row">
            {app.screens.slice(0, 6).map((screen) => <span className="badge" key={screen}>{screen}</span>)}
          </div>
        </Card>
      </div>

      <div className="grid grid-3" style={{ marginTop: 18 }}>
        <SurfacePanel
          name="AI Coder Console"
          purpose="Repo cartography, context packs, issue-to-PR, diff critic, and multi-agent work splitting."
          items={["RepoMap", "ContextPack", "AgentTask", "ReviewPacket"]}
        />
        <SurfacePanel
          name="Prompt Intelligence Lab"
          purpose="Prompt linting, prompt unit tests, eval runner, model router advisor, and context optimizer."
          items={["PromptSpec", "PromptEval", "Prompt-to-tool contract", "System prompt firewall"]}
        />
        <SurfacePanel
          name="QA Autopilot"
          purpose="Bug reproduction, browser QA, CI failure explanation, test gap finding, and repair plans."
          items={qa.testGaps}
        />
      </div>

      <div className="grid grid-3" style={{ marginTop: 18 }}>
        {SAMPLE_CONNECTORS.map((connector) => <ConnectorCard key={connector.connectorId} connector={connector} />)}
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <Card title="Review Packet" kicker="Human Handoff">
          <p>{review.summary}</p>
          <ul>
            {review.risks.map((risk) => <li className="small" key={risk}>{risk}</li>)}
          </ul>
        </Card>

        <Card title="Boundary" kicker="No Fake Autonomy">
          <p>
            External writes, deploys, deletes, payments, emails, and database changes require credentials,
            scopes, approval, audit logs, and rollback paths.
          </p>
        </Card>
      </div>
    </main>
  );
}
