const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const ZIP_FILES = [
  { path: String.raw`C:\Users\Noname\Downloads\PH_EVO_API_EVO_LM_MODEL_FOUNDRY_MASTER_SELF_BUILD.zip`, dest: 'evo_lm_foundry' },
  { path: String.raw`C:\Users\Noname\Downloads\PH_EVO_PROMPTBRIDGE_MASTER_SELF_BUILD.zip`, dest: 'promptbridge_master' }
];

const BASE_DEST = path.join(__dirname, '..', 'build_queues');

if (!fs.existsSync(BASE_DEST)) fs.mkdirSync(BASE_DEST, { recursive: true });

ZIP_FILES.forEach(zipInfo => {
  console.log(`Extracting ${zipInfo.path}...`);
  try {
    const zip = new AdmZip(zipInfo.path);
    const destDir = path.join(BASE_DEST, zipInfo.dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    zip.extractAllTo(destDir, true);
    console.log(`Successfully extracted to ${destDir}`);
  } catch (e) {
    console.error(`Error extracting ${zipInfo.path}: ${e.message}`);
  }
});
