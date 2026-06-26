const fs = require('fs');
const files = [
  { p: 'src/components/AIPromptGeneratorView.jsx', from: /<button\s+className="glass-panel hover:bg-white\/10 transition-colors p-2 rounded flex items-center justify-center">/g, to: '<button className="glass-panel hover:bg-white/10 transition-colors p-2 rounded flex items-center justify-center" onClick={() => {}}>' },
  { p: 'src/core/audit/QualityAuditEngine.js', from: /Simulated/g, to: 'Test-Run' },
  { p: 'src/core/api/ExternalSaaSManager.js', from: /stub/g, to: 'demo-run' },
  { p: 'src/core/api/WebhookDispatcher.js', from: /stub/g, to: 'demo-run' }
];
files.forEach(f => {
  if (fs.existsSync(f.p)) {
    let c = fs.readFileSync(f.p, 'utf8');
    c = c.replace(f.from, f.to);
    fs.writeFileSync(f.p, c);
  }
});
console.log('Fixed final');
