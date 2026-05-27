from uuid import uuid4

from .db import connect, now
from .models import Artifact


def create_artifact(
    *,
    workspace_id: str,
    project_id: str,
    artifact_type: str,
    title: str,
    body: str,
) -> Artifact:
    artifact = Artifact(
        id=f"artifact-{uuid4()}",
        workspaceId=workspace_id,
        projectId=project_id,
        type=artifact_type,
        title=title,
        body=body,
    )

    with connect() as conn:
        conn.execute(
            '''
            INSERT INTO artifacts
            (id, workspace_id, project_id, type, title, body, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                artifact.id,
                workspace_id,
                project_id,
                artifact_type,
                title,
                body,
                now(),
            ),
        )

    return artifact


def list_artifacts() -> list[dict]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM artifacts ORDER BY created_at DESC").fetchall()
    return [dict(row) for row in rows]
