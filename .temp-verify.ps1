$ErrorActionPreference = "Stop"

Write-Host "▶ Syntax Check (Bridge Server)"
node --check promptbridge-server.js

Write-Host "▶ Import Audit"
npm run audit:imports

Write-Host "▶ CSS Audit"
npm run audit:css

Write-Host "▶ Test Suite"
npm test

Write-Host "▶ Production Build"
npm run build

Write-Host "▶ Full Studio Verification"
npm run verify:studio
