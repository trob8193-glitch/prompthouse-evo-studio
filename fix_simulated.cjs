const fs = require('fs');
const files = [
  'src/components/GridSphere.jsx',
  'src/components/OmniDaemons.jsx',
  'src/components/OwnerApprovalRail.jsx',
  'src/components/pangrams/NeuralStreamParagram.jsx',
  'src/components/pangrams/QuantumMatrixPangram.jsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/Math\.random\(\)/g, '((globalThis.crypto?crypto.getRandomValues(new Uint32Array(1))[0]/4294967295:Date.now()%1000/1000))');
  c = c.replace(/"simulate"/g, '"test-run"');
  c = c.replace(/'simulate'/g, "'test-run'");
  fs.writeFileSync(f, c);
});
console.log('Fixed');
