import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SRC_DIR = path.join(rootDir, 'src');
const GENERATED_APIS_DIR = path.join(rootDir, 'generated_apis');
const PROMPTBRIDGE_SERVER = path.join(rootDir, 'promptbridge-server.js');
const OUTBOX_DIR = path.join(rootDir, '.ai', 'outbox');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getAllFiles(dir, ext = '.jsx', fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, ext, fileList);
    } else if (fullPath.endsWith(ext)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// 1. Extract backend routes
const backendRoutes = new Set();
const backendFiles = [PROMPTBRIDGE_SERVER, path.join(rootDir, 'agent-integration.js'), ...getAllFiles(GENERATED_APIS_DIR, '.js'), ...getAllFiles(path.join(rootDir, 'server', 'routes'), '.js')];

backendFiles.forEach((file) => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  // Match app.get('/api/...', or router.post('/...',
  const routeRegex = /(?:app|router)\.(get|post|put|delete|patch)\(['"`](.+?)['"`]/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    let route = match[2];
    // Remove express route params like :id for simpler matching
    route = route.replace(/:[a-zA-Z0-9_]+/g, '*');
    backendRoutes.add(route);
  }
});

// Hardcode some known dynamic or generic prefixes
const validPrefixes = ['/api/metrics', '/api/proof', '/api/logs', '/status', '/api/intelligence/execute', '/api/files/write', '/src/prompthouse_50_master_build_prompts.json'];
validPrefixes.forEach(p => backendRoutes.add(p));

// 2. Extract UI fetch calls and buttons
const uiFiles = getAllFiles(SRC_DIR, '.jsx');
const uiMatrix = [];
let deadLinksCount = 0;

uiFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(rootDir, file);
  
  // Extract fetch routes
  const fetchRegex = /fetch\(\s*[`'"](?:[^`'"]*?BRIDGE[^`'"]*?)?(\/[^`'"]+)[`'"]/g;
  const fetchMatches = [...content.matchAll(fetchRegex)];
  
  // Extract Buttons
  const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/g;
  const buttons = [...content.matchAll(buttonRegex)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);

  if (fetchMatches.length > 0 || buttons.length > 0) {
    const endpoints = fetchMatches.map(m => {
      let endpoint = m[1];
      // Basic normalization of dynamic template string segments
      endpoint = endpoint.replace(/\$\{[^}]+\}/g, '*');
      
      let isAlive = false;
      for (const knownRoute of backendRoutes) {
        // Very basic matching for exact or prefix
        if (knownRoute === endpoint || (knownRoute.includes('*') && endpoint.startsWith(knownRoute.split('*')[0]))) {
          isAlive = true;
          break;
        }
        if (endpoint.startsWith(knownRoute)) {
          isAlive = true;
          break;
        }
      }
      
      if (!isAlive) deadLinksCount++;
      return { path: endpoint, isAlive };
    });
    
    uiMatrix.push({
      component: relativePath,
      buttons: [...new Set(buttons)],
      endpoints
    });
  }
});

// 3. Generate Report
ensureDir(OUTBOX_DIR);

const jsonReport = {
  scannedAt: new Date().toISOString(),
  totalComponentsScanned: uiFiles.length,
  totalBackendRoutesFound: backendRoutes.size,
  deadLinksDetected: deadLinksCount,
  matrix: uiMatrix
};

fs.writeFileSync(path.join(OUTBOX_DIR, 'ui-route-matrix.json'), JSON.stringify(jsonReport, null, 2), 'utf8');

let mdReport = `# Full UI Button-to-Route Matrix\n\n`;
mdReport += `**Generated**: ${jsonReport.scannedAt}\n`;
mdReport += `**Components Scanned**: ${jsonReport.totalComponentsScanned}\n`;
mdReport += `**Known Backend Routes**: ${jsonReport.totalBackendRoutesFound}\n`;
mdReport += `**Potential Dead Links Detected**: ${jsonReport.deadLinksDetected}\n\n`;

mdReport += `## Matrix\n\n`;

uiMatrix.forEach((entry) => {
  mdReport += `### ${entry.component}\n`;
  if (entry.buttons.length > 0) {
    mdReport += `**Interactive Controls**: \n- ${entry.buttons.join('\n- ')}\n\n`;
  } else {
    mdReport += `**Interactive Controls**: (No static buttons found)\n\n`;
  }
  
  if (entry.endpoints.length > 0) {
    mdReport += `**API Calls Triggered**:\n`;
    entry.endpoints.forEach((ep) => {
      const statusIcon = ep.isAlive ? '✅ ALIVE' : '❌ DEAD LINK / UNREGISTERED';
      mdReport += `- \`${ep.path}\` -> ${statusIcon}\n`;
    });
  } else {
    mdReport += `**API Calls Triggered**: (No direct fetch calls detected)\n`;
  }
  mdReport += `\n---\n\n`;
});

fs.writeFileSync(path.join(OUTBOX_DIR, 'ui-route-matrix.md'), mdReport, 'utf8');

console.log(JSON.stringify({
  success: true,
  deadLinks: deadLinksCount,
  matrixFile: path.join(OUTBOX_DIR, 'ui-route-matrix.json'),
  mdFile: path.join(OUTBOX_DIR, 'ui-route-matrix.md')
}, null, 2));

// If dead links are found, exit with error so the CI/CD pipeline fails
if (deadLinksCount > 0) {
  process.exitCode = 1;
}
