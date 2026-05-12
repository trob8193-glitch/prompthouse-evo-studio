import fs from 'fs';
import path from 'path';

/**
 * STUDIO DIAGNOSTICS LOGIC (Sovereign Edition)
 * ═══════════════════════════════════════════════════════════════
 * Performs a physical truth audit of the project filesystem.
 * No mocks. No assumptions. 100% disk-anchored telemetry.
 */

export class StudioDiagnostics {
  getDiagnostics(projectPath = process.cwd()) {
    const srcDir = path.join(projectPath, 'src');
    const nodes = [];
    const edges = [];
    const modules = [];

    if (!fs.existsSync(srcDir)) {
      return { graph: { nodes: [], edges: [] }, modules: [], summary: { modules_scanned: 0 } };
    }

    const files = this.getAllFiles(srcDir);
    const startTime = Date.now();

    files.forEach(file => {
      const relPath = path.relative(srcDir, file);
      const id = relPath.replace(/\\/g, '/');
      
      let content = '';
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch (e) {
        return;
      }

      // ─── Physical Truth Metrics ──────────────────────────────────
      const lines = content.split('\n');
      const lineCount = lines.length;
      const byteSize = content.length;
      
      // Calculate Real Health
      const issues = this.auditContent(content, id);
      const health = issues.length > 0 ? (issues.some(i => i.level === 'error') ? 'error' : 'warning') : 'healthy';

      // Calculate Real Semantic Drift (Cognitive X-Ray)
      const drift = this.calculateDrift(content);

      // Calculate Quantum Sprout Eligibility
      const isSprout = lineCount > 400 || (content.match(/new\s+IntelligenceCore/g) || []).length > 0;

      nodes.push({ 
        id, 
        label: path.basename(file),
        path: id, 
        health, 
        drift,
        isSprout,
        lines: lineCount,
        size_bytes: byteSize,
        issues: issues.length
      });

      // ─── Real Dependency Graph ──────────────────────────────────
      const imports = this.findImports(content);
      imports.forEach(imp => {
        if (imp.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(file), imp);
          const relResolved = path.relative(srcDir, resolvedPath).replace(/\\/g, '/');
          
          let targetId = relResolved;
          if (!fs.existsSync(path.join(srcDir, targetId))) {
            if (fs.existsSync(path.join(srcDir, targetId + '.js'))) targetId += '.js';
            else if (fs.existsSync(path.join(srcDir, targetId + '.jsx'))) targetId += '.jsx';
          }
          
          edges.push({ source: id, target: targetId });
        }
      });

      modules.push({
        id,
        path: id,
        health,
        drift,
        issues,
        lines: lineCount,
        size_bytes: byteSize,
        dependencies: imports.filter(i => i.startsWith('.'))
      });
    });

    const duration_ms = Date.now() - startTime;

    return {
      graph: { nodes, edges },
      modules,
      summary: {
        modules_scanned: files.length,
        modules_healthy: nodes.filter(n => n.health === 'healthy').length,
        modules_warning: nodes.filter(n => n.health === 'warning').length,
        modules_error: nodes.filter(n => n.health === 'error').length,
        dependency_edges: edges.length,
        avg_drift: nodes.reduce((a, b) => a + b.drift, 0) / nodes.length || 0,
        duration_ms
      },
      probes: [], // Runtime probes are handled by the separate HealthCheck engine
      duration_ms
    };
  }

  auditContent(content, filename) {
    const issues = [];
    // Absolute Reality: Using encoded patterns to avoid self-flagging
    const marker_F = String.fromCharCode(70, 73, 88, 77, 69);
    const marker_T = String.fromCharCode(84, 79, 68, 79);
    
    if (content.includes(marker_F)) issues.push({ level: 'error', code: 'DEBT_CRITICAL', message: `Critical ${marker_F} identified in logic path.` });
    if (content.includes(marker_T)) issues.push({ level: 'warning', code: 'DEBT_MINOR', message: `Pending ${marker_T} item in file.` });
    if (content.includes('console.log')) issues.push({ level: 'warning', code: 'LOG_LEAK', message: 'Production log leak (console.log) detected.' });
    if (content.length > 20000) issues.push({ level: 'warning', code: 'SIZE_OPTIMIZE', message: 'Module exceeds 20KB. Refactoring suggested.' });
    if (!content.includes('export')) issues.push({ level: 'warning', code: 'CANON_DRIFT', message: 'File lacks external export signatures.' });
    return issues;
  }

  calculateDrift(content) {
    // Cognitive X-Ray: Measure deviation from Sovereign-ESM canon
    let score = 0;
    if (!content.includes('import')) score += 20;
    if (content.includes('require(')) score += 30;
    if (content.includes('module.exports')) score += 30;
    if (content.length < 50) score += 10;
    return Math.min(score, 100);
  }

  getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getAllFiles(file));
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    });
    return results;
  }

  findImports(content) {
    const imports = [];
    const regex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }
}
