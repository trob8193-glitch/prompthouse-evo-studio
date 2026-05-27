const fs = require('fs');
const path = 'src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Clean up duplicated imports and replace SovereignWitnessSuite
content = content.replace(/import SovereignWitnessSuite from '.\/features\/SovereignWitnessSuite.jsx';/, "import { WitnessConsole } from './features/WitnessConsole.jsx';");

// 2. Update the JSX to use WitnessConsole
content = content.replace(/\{singularityActive && <SovereignWitnessSuite \/>\}/, "{singularityActive && <WitnessConsole />}");

fs.writeFileSync(path, content);
console.log('Successfully integrated WitnessConsole into App.jsx.');
