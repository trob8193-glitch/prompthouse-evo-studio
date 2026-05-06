# PromptHouse Evo MCP Server Design

Tools:
- create_mission
- list_promptbase
- generate_fire_orders
- generate_blueprint
- add_proof_artifact
- simulate_bot_customers
- export_handoff

Resources:
- promptbase://records
- missions://saved
- blueprints://latest
- proofdeck://artifacts

Safety:
- read-only by default
- write actions require owner approval
- secrets never returned
- deployment claim blocked without proof artifact
