const fs = require('fs');
const path = 'src/core/interop/UniversalBridge.js';
let content = fs.readFileSync(path, 'utf8');

const mutationLogic = `    if (cmd === 'initiate-self-mutation') {
      try {
        const res = await fetch(\`\${BRIDGE_URL}/api/foundry/initiate-self-mutation\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
        const data = await res.json();
        return data;
      } catch (e) {
        return { success: false, error: 'FAILED_TO_INITIATE_SELF_MUTATION' };
      }
    }
    return { success: false, error: 'UNKNOWN_COMMAND' };`;

// Replace the return in FoundryAdaptor
content = content.replace(/return \{ success: false, error: 'UNKNOWN_COMMAND' \};\s+\}/, mutationLogic + '\n  }');

fs.writeFileSync(path, content);
console.log('Successfully injected self-mutation into UniversalBridge.');
