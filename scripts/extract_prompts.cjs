const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const ZIP_PATH = String.raw`C:\Users\Noname\Downloads\EVO_DUEL_HOUSE_MAX_TEMPLATE_LIBRARY_319_FULL_PROMPTS_AND_FIRING_ORDERS.zip`;
const OUTPUT_FILE = path.join(__dirname, '..', '.prompthouse-data', 'promptbase.json');

console.log('Extracting and parsing prompts from ZIP...');

if (!fs.existsSync(ZIP_PATH)) {
  console.error(`File not found: ${ZIP_PATH}`);
  process.exit(1);
}

try {
  const zip = new AdmZip(ZIP_PATH);
  const zipEntries = zip.getEntries();
  
  let importedCount = 0;
  const newMissions = [];
  
  // Read existing promptbase
  let existingMissions = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existingMissions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  }

  zipEntries.forEach(entry => {
    // We only care about text/md files, ignore directories and images
    if (!entry.isDirectory && (entry.entryName.endsWith('.md') || entry.entryName.endsWith('.txt'))) {
      const content = entry.getData().toString('utf8');
      
      // Parse file name to generate a title
      const fileName = entry.name.replace('.md', '').replace('.txt', '').replace(/_/g, ' ');
      
      newMissions.push({
        id: `mission_zip_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
        ownerUserId: 'local_owner',
        title: fileName,
        intent: `Imported from ${entry.entryName}`,
        activeBot: 'memory',
        truthStates: ['verified'],
        content: content.substring(0, 5000), // Store up to 5000 chars of the prompt as intent/content
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      importedCount++;
    }
  });

  const merged = [...newMissions, ...existingMissions];
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`Successfully imported ${importedCount} prompts into PromptBase.`);

} catch (e) {
  console.error('Error processing ZIP:', e.message);
}
