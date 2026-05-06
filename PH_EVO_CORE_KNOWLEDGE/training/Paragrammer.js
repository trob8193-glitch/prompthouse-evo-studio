/**
 * PH EVO STUDIO — MASTER PARAGRAMMER (V10: OMNI SOVEREIGN)
 * ═══════════════════════════════════════════════════════════════
 * This module ingests all ten corpus files and seeds them into the Sovereign Brain.
 */

import fs from 'fs';
import path from 'path';

const CORPUS_FILES = [
  path.join(process.cwd(), 'src/core/training/raw_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/creative_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/universal_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/hardened_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/progression_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/infinite_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/business_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/ui_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/bridge_corpus.txt'),
  path.join(process.cwd(), 'src/core/training/extension_corpus.txt')
];
const SEED_PATH = path.join(process.cwd(), 'src/core/training/paragram_seeds.jsonl');
const BRAIN_PATH = path.join(process.cwd(), '.sovereign-brain.json');

async function runSeeding() {
  console.log('🚀 [Paragrammer] Starting OMNI SOVEREIGN Seeding Cycle...');
  
  let allParagrams = [];

  for (const file of CORPUS_FILES) {
    if (!fs.existsSync(file)) continue;
    
    console.log(`  🔍 Processing: ${path.basename(file)}`);
    const raw = fs.readFileSync(file, 'utf8');
    const sections = raw.split(/\[\d+\]/).filter(s => s.trim().length > 0);
    
    const paragrams = sections.map((text, index) => {
      const lines = text.trim().split('\n');
      const title = lines[0].replace(':', '').trim();
      const content = lines.slice(1).join(' ').trim();
      
      return {
        id: `pg_${path.basename(file, '.txt')}_${index + 1}`,
        title,
        content,
        category: title.split(' ')[0].toLowerCase(),
        timestamp: new Date().toISOString()
      };
    });
    
    allParagrams = allParagrams.concat(paragrams);
  }

  // 1. Generate JSONL
  const jsonl = allParagrams.map(p => JSON.stringify(p)).join('\n');
  fs.writeFileSync(SEED_PATH, jsonl, 'utf8');

  // 2. Seed Brain
  if (fs.existsSync(BRAIN_PATH)) {
    const brain = JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf8'));
    if (!brain.internalized_patterns) brain.internalized_patterns = [];
    
    const existingIds = new Set(brain.internalized_patterns.map(p => p.id));

    allParagrams.forEach(p => {
      if (!existingIds.has(p.id)) {
        brain.internalized_patterns.push({
          type: 'paragram_seed',
          id: p.id,
          summary: `Seeded knowledge: ${p.title}`,
          category: p.category,
          learned_at: p.timestamp
        });
      }
    });

    // Omni IQ Bonus: +250 per paragram for the final integration tier
    const iqBonus = allParagrams.length * 250; 
    brain.studio_iq = (brain.studio_iq || 100) + iqBonus;

    fs.writeFileSync(BRAIN_PATH, JSON.stringify(brain, null, 2), 'utf8');
    console.log(`  ✓ Sovereign Brain Seeded. OMNI IQ: ${brain.studio_iq} (+${iqBonus})`);
  }

  console.log('🏆 [Paragrammer] OMNI SOVEREIGN Seeding Complete. Studio is now Omnipresent.');
}

runSeeding();
