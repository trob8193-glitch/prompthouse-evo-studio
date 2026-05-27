from uuid import uuid4

from .db import connect, dumps, now
from .models import ProofCard, TruthState


def create_proof_card(
    *,
    workspace_id: str,
    project_id: str,
    claim: str,
    truth_state: TruthState,
    evidence: list[str],
    owner: str = "PromptLink",
    failure_condition: str = "",
    rollback_plan: str = "",
) -> ProofCard:
    card = ProofCard(
        id=f"proof-{uuid4()}",
        workspaceId=workspace_id,
        projectId=project_id,
        claim=claim,
        truthState=truth_state,
        evidence=evidence,
        owner=owner,
        failureCondition=failure_condition,
        rollbackPlan=rollback_plan,
    )

    with connect() as conn:
        conn.execute(
            '''
            INSERT INTO proof_cards
            (id, workspace_id, project_id, claim, truth_state, evidence_json, owner, failure_condition, rollback_plan, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                card.id,
                workspace_id,
                project_id,
                claim,
                truth_state.value,
                dumps(evidence),
                owner,
                failure_condition,
                rollback_plan,
                now(),
            ),
        )

    return card


def list_proof_cards() -> list[dict]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM proof_cards ORDER BY created_at DESC").fetchall()
    return [dict(row) for row in rows]
