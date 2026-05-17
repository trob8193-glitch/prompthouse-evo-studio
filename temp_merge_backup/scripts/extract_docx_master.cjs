const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const zipPath = String.raw`C:\Users\Noname\Downloads\PH_EVO_PROMPTBRIDGE_EVO_LM_MASTER_SELF_BUILD_DOCX_ONLY (1).zip`;
const dest = path.join(__dirname, '..', 'build_queues', 'docx_master');

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

try {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(dest, true);
  console.log('Successfully extracted to', dest);
} catch (e) {
  console.error('Extraction failed:', e.message);
  process.exit(1);
}
