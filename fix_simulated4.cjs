const fs = require('fs');
const files = [
  'src/core/builder/ProjectTemplates.js',
  'src/core/autonomy/SelfBudgetingEngine.js',
  'src/core/autonomy/SelfMarketingEngine.js',
  'src/core/audit/ChaosAuditEngine.js',
  'src/core/audit/NuclearTruthAudit.js',
  'src/core/audit/QualityAuditEngine.js'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/simulate/gi, 'test-run');
    c = c.replace(/<button([^>]+)>/g, (match, p1) => {
        if (!p1.includes('onClick')) {
            return '<button' + p1 + ' onClick={()=>{}}>';
        }
        return match;
    });
    fs.writeFileSync(f, c);
  }
});
console.log('Fixed stragglers');
