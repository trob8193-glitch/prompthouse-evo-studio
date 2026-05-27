const fs = require('fs');
const path = 'src/core/interop/UniversalBridge.js';
let content = fs.readFileSync(path, 'utf8');

const truthEdge = `
      const result = await adaptor.execute(command, params);
      
      // EDGE: Truth Violation Pulse
      if (result.truth_state === 'ERROR' || result.success === false) {
        useWitnessStore.getState().updateTruth(command, { 
          score: 0, 
          violations: [result.error || 'UNVERIFIED_TRUTH_STATE'] 
        });
      }

      useWitnessStore.getState().logTrace({
        id: \`trace_\${Date.now()}\`,
        source: toolId,
        path: command,
        status: result.success !== false ? 'SUCCESS' : 'ERROR',
        timestamp: Date.now()
      });
      return result;
`;

// Replace the previous result logging with truth-edged logging
content = content.replace(/const result = await adaptor\.execute\(command, params\);[\s\S]*?return result;/, truthEdge);

fs.writeFileSync(path, content);
console.log('Successfully edged Truth Verification to the UniversalBridge.');
