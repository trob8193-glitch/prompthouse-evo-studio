import fs from 'fs';
import path from 'path';

const FEATURES_DIR = path.join(process.cwd(), 'src', 'features');

function camelCaseToWords(s) {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has IDEPageLayout
  if (content.includes('IDEPageLayout')) {
    console.log(`Skipping (already wrapped): ${path.basename(filePath)}`);
    return;
  }

  // Find the return statement that returns a component
  // Basic heuristic: return ( \n <div ... > ... </div> \n );
  // Or return <motion.div ...
  const match = content.match(/return\s*\(\s*(<[a-zA-Z\.]+[^>]*>[\s\S]*?)(\s*\);\s*})$/);
  
  if (!match) {
    console.log(`Could not auto-wrap: ${path.basename(filePath)}`);
    return;
  }

  const componentNameMatch = content.match(/export (?:default )?(?:function|const) ([A-Za-z0-9_]+)/);
  let title = 'Dashboard';
  if (componentNameMatch) {
    title = camelCaseToWords(componentNameMatch[1].replace('Dashboard', '').replace('View', '')).trim() || 'Dashboard';
  }

  const wrappedContent = `
    <IDEPageLayout title="${title}">
      ${match[1]}
    </IDEPageLayout>
  `;

  let newContent = content.replace(match[0], `return (${wrappedContent}${match[2]}`);

  // Add the import statement
  const importStatement = `import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';\n`;
  // Add it after the last import
  const lastImportIndex = newContent.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = newContent.indexOf('\n', lastImportIndex);
    newContent = newContent.slice(0, endOfImport + 1) + importStatement + newContent.slice(endOfImport + 1);
  } else {
    newContent = importStatement + newContent;
  }

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Successfully wrapped: ${path.basename(filePath)}`);
}

const files = fs.readdirSync(FEATURES_DIR);
for (const file of files) {
  if (file.endsWith('.jsx') && !['SovereignIntelligenceDashboard.jsx'].includes(file)) {
    processFile(path.join(FEATURES_DIR, file));
  }
}
