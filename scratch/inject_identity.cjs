const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

// Replace harvest
content = content.replace(
  /app\.post\('\/api\/foundry\/harvest'.*?async \(req, res\) => \{\s+try \{\s+const result = await foundry\.harvest\(process\.cwd\(\)\);/s,
  "app.post('/api/foundry/harvest', maybeRequireAuthOrMaster, async (req, res) => {\n  try {\n    const identity = resolveEvolutionSubject(req, req.query || {});\n    const result = await foundry.harvest(process.cwd(), identity.subjectKey);"
);

// Replace initiate
content = content.replace(
  /app\.post\('\/api\/foundry\/initiate'.*?async \(req, res\) => \{\s+try \{\s+const mission = req\.body;\s+const result = await foundry\.initiateBuild\(mission\);/s,
  "app.post('/api/foundry/initiate', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {\n  try {\n    const identity = resolveEvolutionSubject(req, req.body || {});\n    const mission = req.body;\n    const result = await foundry.initiateBuild(mission, identity.subjectKey);"
);

fs.writeFileSync(path, content);
console.log('Successfully injected identity seeding into foundry routes.');
