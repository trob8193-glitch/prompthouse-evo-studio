import type { ConnectorContract } from "@/lib/studio/types";

export function ConnectorCard({ connector }: { connector: ConnectorContract }) {
  return (
    <div className="card">
      <div className="kicker">{connector.connectorType}</div>
      <h3>{connector.displayName}</h3>
      <p>Risk: <strong>{connector.riskLevel}</strong></p>
      <p>Approval: <strong>{connector.approvalPolicy}</strong></p>
      <div className="row">
        {connector.capabilities.map((cap) => <span className="badge" key={cap}>{cap}</span>)}
      </div>
    </div>
  );
}
