const fs = require('fs');
const path = 'src/core/interop/UniversalBridge.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import for useWitnessStore
content = 'import { useWitnessStore } from "../../features/witnessStore.js";\n' + content;

// 2. Inject logging into the dispatch method
const loggingLogic = `
    // WITNESS TELEMETRY: Trace the path of reality
    useWitnessStore.getState().logTrace({
      id: \`trace_\${Date.now()}\`,
      source: toolId,
      path: command,
      params,
      timestamp: Date.now(),
      status: 'PENDING'
    });
`;

content = content.replace('const adaptor = this.adaptors[toolId];', loggingLogic + '\n    const adaptor = this.adaptors[toolId];');

// 3. Update status to SUCCESS in the result
const resultLogging = `
      const result = await adaptor.execute(command, params);
      useWitnessStore.getState().logTrace({
        id: \`trace_\${Date.now()}\`,
        source: toolId,
        path: command,
        status: result.success !== false ? 'SUCCESS' : 'ERROR',
        timestamp: Date.now()
      });
      return result;
`;

content = content.replace('return await adaptor.execute(command, params);', resultLogging);

fs.writeFileSync(path, content);
console.log('Successfully injected Witness Telemetry into UniversalBridge.');
