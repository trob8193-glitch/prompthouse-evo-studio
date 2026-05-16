import fs from 'fs';
import path from 'path';
import { ProductionAudit } from '../src/core/engines/productionAudit.js';

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.mjs')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

async function runAudit() {
  console.log('🚀 [Enterprise Audit] Starting full project scan...');
  
  const roots = ['src', 'lib', 'scripts'];
  const allFiles = [];
  
  roots.forEach(root => {
    const fullPath = path.join(process.cwd(), root);
    if (fs.existsSync(fullPath)) {
      getAllFiles(fullPath, allFiles);
    }
  });
  
  console.log(`📊 Found ${allFiles.length} files to audit.`);
  
  let totalScore = 0;
  let totalPassed = 0;
  const failures = [];
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    const isScript = relativePath.startsWith('scripts') || file.endsWith('.mjs');
    
    let result = ProductionAudit.audit(content);
    
    // Relaxation for scripts
    if (isScript) {
      result.issues = result.issues.filter(issue => 
        !issue.includes('console') && 
        !issue.includes('No exports')
      );
      result.passed = result.issues.length === 0;
      result.score = result.passed ? 100 : Math.max(0, 100 - result.issues.length * 10);
    }
    
    totalScore += result.score;
    if (result.passed) {
      totalPassed++;
    } else {
      failures.push({ file, issues: result.issues });
    }
  });
  
  const avgScore = totalScore / allFiles.length;
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║        ENTERPRISE AUDIT REPORT         ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`Total Files: ${allFiles.length}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${allFiles.length - totalPassed}`);
  console.log(`Average Score: ${avgScore.toFixed(2)}/100`);
  
  if (failures.length > 0) {
    console.log('\n❌ Failures:');
    failures.forEach(f => {
      console.log(`\n📄 ${path.relative(process.cwd(), f.file)}:`);
      f.issues.forEach(issue => console.log(`  - ${issue}`));
    });
  } else {
    console.log('\n✅ All files passed production audit!');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    passed: totalPassed,
    failed: allFiles.length - totalPassed,
    averageScore: avgScore,
    failures
  };
  
  const reportDir = path.join(process.cwd(), '.prompthouse-data');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  
  fs.writeFileSync(
    path.join(reportDir, 'enterprise_audit_report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
  
  console.log(`\n📍 Detailed report saved to .prompthouse-data/enterprise_audit_report.json`);
}

runAudit().catch(console.error);
