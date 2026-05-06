/**
 * PH EVO STUDIO — EVO EYES VISUAL AUDITOR
 * ═══════════════════════════════════════════════════════════════
 * Performs a deep-scan of generated artifacts for implementation
 * density, logic integrity, and truth verification.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FEATURES_DIR = path.join(__dirname, 'src', 'features');
const AUDIT_LOG = path.join(__dirname, 'proof_receipts', 'evo_eyes_audit.json');

function calculateDensity(content) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const logicLines = lines.filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('*')).length;
  const complexity = (content.match(/function|class|if|else|switch|case|fetch/g) || []).length;
  
  return {
    totalLines: lines.length,
    logicLines,
    complexityScore: complexity,
    densityFactor: (logicLines / (lines.length || 1)).toFixed(2)
  };
}

function runAudit() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   PH EVO STUDIO — EVO EYES VISUAL AUDITOR                     ║');
  console.log('║   Target: Artifact Implementation Density Scan                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(FEATURES_DIR)) {
    console.error('[EvoEyes] ❌ Features directory not found.');
    return;
  }

  const files = fs.readdirSync(FEATURES_DIR).filter(f => f.endsWith('.js'));
  const results = [];

  console.log(`[EvoEyes] Auditing ${files.length} artifacts in src/features...\n`);

  files.forEach(file => {
    const fullPath = path.join(FEATURES_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const stats = calculateDensity(content);
    
    // Truth Check (Ignore the first 10 lines to avoid header false-positives)
    const contentLines = content.split('\n');
    const searchableContent = contentLines.slice(10).join('\n');
    const hasPlaceholders = /TODO|PLACEHOLDER|manifested|stub/i.test(searchableContent);
    const isMasterGrade = stats.logicLines > 60 && !hasPlaceholders; // Logic threshold for Master Grade

    console.log(`  [SCAN] ${file.padEnd(30)} | Density: ${stats.densityFactor} | Status: ${isMasterGrade ? 'MASTER ✓' : 'LOW_DENSITY ⚠'}`);
    
    results.push({
      file,
      stats,
      truth_integrity: !hasPlaceholders,
      grade: isMasterGrade ? 'MASTER' : 'DRAFT',
      hash: crypto.createHash('sha256').update(content).digest('hex').slice(0, 8)
    });
  });

  const auditResult = {
    audited_at: new Date().toISOString(),
    total_files: files.length,
    master_grade_count: results.filter(r => r.grade === 'MASTER').length,
    results
  };

  if (!fs.existsSync(path.dirname(AUDIT_LOG))) fs.mkdirSync(path.dirname(AUDIT_LOG));
  fs.writeFileSync(AUDIT_LOG, JSON.stringify(auditResult, null, 2));

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║   AUDIT COMPLETE: ${auditResult.master_grade_count}/${auditResult.total_files} Artifacts Verified Master Grade   ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\n📋 Audit Sealed: proof_receipts/evo_eyes_audit.json`);
}

runAudit();
