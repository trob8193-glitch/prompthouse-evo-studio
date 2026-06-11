node scripts/frontier_safety_gate.mjs --contract
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts/frontier_safety_gate.mjs --status
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts/evo_work_memory.mjs --contract
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts/evo_work_memory.mjs --status
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts/audit_intelligence_stack.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run evo:wire-intelligence
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run evo:intelligence:verify
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run evo:signals
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run evo:app-intelligence
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run verify:studio
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run maturity:check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "ALL COMMANDS SUCCEEDED!"
