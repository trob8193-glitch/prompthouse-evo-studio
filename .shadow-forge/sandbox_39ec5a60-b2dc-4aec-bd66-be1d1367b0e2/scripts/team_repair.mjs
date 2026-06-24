import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const keys = {
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY
};

const ai = new UniversalAIAdaptor(keys);

async function runTeamRepair() {
  Log.info('🚀 [Team Repair] Starting collaborative review...');
  
  const reportPath = path.join(process.cwd(), '.prompthouse-data', 'enterprise_audit_report.json');
  if (!fs.existsSync(reportPath)) {
    Log.error('❌ Audit report missing. Run enterprise audit first.');
    process.exit(1);
  }
  
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const failures = report.failures;
  
  Log.info(`📊 Found ${failures.length} failed files in report.`);
  
  for (const failure of failures) {
    const file = failure.file;
    const issues = failure.issues;
    
    Log.info(`\n📄 Analyzing ${path.basename(file)}...`);
    Log.info(`  Issues: ${issues.join(', ')}`);
    
    if (!fs.existsSync(file)) {
      Log.info('  ⚠️ File not found on disk.');
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Step 1: Use Gemini for analysis (if key available)
    const analysisPrompt = `Analyze this file content and the audit failures listed.
File: ${path.basename(file)}
Failures: ${issues.join(', ')}

Content:
${content.slice(0, 5000)} // Truncate if too long

Is this a real failure (e.g. incomplete code, missing implementation, actual TODO that should be resolved) or a false positive (e.g. placeholder in string, attribute, or text describing rules)?
Answer with either "REAL" or "FALSE_POSITIVE" at the start, followed by a brief explanation.`;

    let analysis = 'UNKNOWN';
    try {
      const resp = await ai.chat([
        { role: 'user', content: analysisPrompt }
      ], { provider: 'gemini', model: 'gemini-1.5-pro' });
      
      if (resp.success) {
        analysis = resp.content;
        Log.info(`🧠 [Gemini] Analysis: ${analysis.split('\n')[0]}`);
      } else {
        Log.info(`⚠️ [Gemini] Failed: ${resp.error}. Falling back to OpenAI...`);
        const respOpenAI = await ai.chat([
          { role: 'user', content: analysisPrompt }
        ], { provider: 'openai', model: 'gpt-4o' });
        
        if (respOpenAI.success) {
          analysis = respOpenAI.content;
          Log.info(`🤖 [OpenAI] Analysis: ${analysis.split('\n')[0]}`);
        }
      }
    } catch (e) {
      Log.error(`❌ Error during analysis: ${e.message}`);
    }
    
    // Step 2: If real, use OpenAI to suggest fix
    if (analysis.startsWith('REAL')) {
      Log.info('🔧 Real issue detected. Requesting fix from OpenAI...');
      const fixPrompt = `Suggest a fix for the following file to resolve the audit failures.
File: ${path.basename(file)}
Failures: ${issues.join(', ')}
Analysis: ${analysis}

Content:
${content.slice(0, 5000)}

Return ONLY the corrected code for the relevant part, or the whole file if it is small. Use backticks for code blocks.`;

      try {
        const respFix = await ai.chat([
          { role: 'user', content: fixPrompt }
        ], { provider: 'openai', model: 'gpt-4o' });
        
        if (respFix.success) {
          Log.info('📝 [OpenAI] Fix suggested:');
          Log.info(respFix.content.slice(0, 200) + '...');
          // Here we could apply the fix, but let's just log it for now to avoid breaking things!
          // Or we can save it to a .fix file!
          const fixPath = file + '.fix';
          fs.writeFileSync(fixPath, respFix.content, 'utf8');
          Log.info(`📍 Fix saved to ${path.basename(fixPath)}`);
        }
      } catch (e) {
        Log.error(`❌ Error during fix generation: ${e.message}`);
      }
    } else {
      Log.info('✅ Confirmed as false positive or non-issue.');
    }
  }
  
  Log.info('\n🏁 [Team Repair] Completed.');
}

runTeamRepair().catch(console.error);
