# Prompt Auth Spec

Actors: user_owner, studio_operator, bot_customer, external_connector, guest_reviewer.
Actions: readPrompt, forgeBlueprint, createFireOrder, runBotCustomerSimulation, exportBlueprint, connectExternalTool, deployApp, deleteArtifact.

High-risk actions require:
- owner approval receipt
- scope declaration
- environment check
- rollback path
- audit log
