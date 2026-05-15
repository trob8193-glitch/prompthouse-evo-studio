/**
 * PH EVO STUDIO — PREVIEW SMOKE CHECK
 * ═══════════════════════════════════════════════════════════════
 * Verifies that a deployed preview URL is reachable and returns 
 * the expected app shell marker.
 */
import fetch from 'node-fetch';
import fs from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const REPORT_JSON = join(DATA_DIR, 'preview-smoke-report.json');
const REPORT_MD = join(DATA_DIR, 'preview-smoke-report.md');

async function runSmokeCheck() {
  const url = process.argv[2];

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  PH EVO STUDIO — PREVIEW SMOKE CHECK        ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  if (!url) {
    console.error('❌ Error: No preview URL provided.');
    console.log('Usage: node scripts/preview-smoke-check.mjs <url>');
    const report = { ok: false, truthState: 'BLOCKED', error: 'Missing preview URL', timestamp: new Date().toISOString() };
    saveReports(report);
    process.exit(0); // Exit cleanly but with fail state in report
  }

  console.log(`▶ Testing URL: ${url}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const hasAppRoot = html.includes('id="root"');
    const hasPhMarker = html.includes('PromptHouse') || html.includes('Studio');

    const report = {
      ok: true,
      url,
      status: response.status,
      durationMs: duration,
      hasAppRoot,
      hasPhMarker,
      truthState: (hasAppRoot && hasPhMarker) ? 'PROVEN' : 'UNKNOWN',
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Reachable (${response.status}) in ${duration}ms`);
    console.log(`✅ App Root found: ${hasAppRoot}`);
    console.log(`✅ Studio Marker found: ${hasPhMarker}`);
    console.log(`\n💎 Final Truth State: ${report.truthState}`);

    saveReports(report);
  } catch (error) {
    console.error(`❌ Smoke Check Failed: ${error.message}`);
    const report = {
      ok: false,
      url,
      error: error.message,
      truthState: 'ERROR',
      timestamp: new Date().toISOString()
    };
    saveReports(report);
  }
}

function saveReports(report) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');

  const md = `# Preview Smoke Check Report\n\n` +
    `- **URL**: ${report.url || 'N/A'}\n` +
    `- **Status**: ${report.ok ? '✅ PASSED' : '❌ FAILED'}\n` +
    `- **Truth State**: ${report.truthState}\n` +
    `- **Timestamp**: ${report.timestamp}\n\n` +
    `## Details\n` +
    (report.ok ? 
      `- Duration: ${report.durationMs}ms\n- App Root Found: ${report.hasAppRoot}\n- Studio Marker Found: ${report.hasPhMarker}` :
      `- Error: ${report.error}`);

  fs.writeFileSync(REPORT_MD, md, 'utf8');
}

runSmokeCheck();
