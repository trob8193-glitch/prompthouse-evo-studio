/**
 * PromptHouse Evo Studio — Pattern Analyzer
 * Reads feedback logs. Identifies which prompt types fail most often.
 * Sends structured failure data to the AI for root-cause analysis.
 * No fake logic. Real statistical analysis + real AI diagnosis.
 */

const BRIDGE = 'http://localhost:3001';

/**
 * Analyze all rated feedback to find failure patterns.
 * Groups interactions by domain + stackVersion, calculates failure rates,
 * and returns the weakest patterns (>30% bad with minimum 5 samples).
 */
export async function identifyWeakPatterns() {
  let feedback;
  try {
    const res = await fetch(`${BRIDGE}/api/feedback?limit=2000`);
    feedback = await res.json();
  } catch (e) {
    console.error('[PatternAnalyzer] Cannot reach bridge:', e.message);
    return { weakPatterns: [], sampleSize: 0 };
  }

  // Only analyze rated interactions
  const rated = feedback.filter(f => f.rating === 'good' || f.rating === 'bad');
  if (rated.length < 5) {
    return { weakPatterns: [], sampleSize: rated.length, message: 'Not enough rated interactions (need 5+)' };
  }

  // Group by domain + stackVersion
  const groups = {};
  rated.forEach(f => {
    const key = `${f.domain}::${f.stackVersion}`;
    if (!groups[key]) groups[key] = { domain: f.domain, stackVersion: f.stackVersion, good: 0, bad: 0, total: 0, badExamples: [] };
    groups[key].total++;
    if (f.rating === 'good') groups[key].good++;
    if (f.rating === 'bad') {
      groups[key].bad++;
      groups[key].badExamples.push({ prompt: f.prompt?.slice(0, 200), reason: f.reason || 'No reason given' });
    }
  });

  // Find patterns with >30% failure rate and minimum 5 samples
  const weakPatterns = Object.values(groups)
    .map(g => ({ ...g, failureRate: Math.round((g.bad / g.total) * 100) }))
    .filter(g => g.failureRate > 30 && g.total >= 5)
    .sort((a, b) => b.failureRate - a.failureRate);

  return { weakPatterns, sampleSize: rated.length };
}

/**
 * Send the weak patterns to the AI for root-cause analysis.
 * Returns a structured report explaining WHY those patterns fail
 * and WHAT should change in the 6-layer stack.
 */
export async function generateAnalysisReport(weakPatterns) {
  if (!weakPatterns || weakPatterns.length === 0) {
    return { report: null, message: 'No weak patterns to analyze.' };
  }

  const prompt = `You are a prompt engineering quality analyst for PromptHouse Evo Studio.

The following prompt patterns have high failure rates based on user feedback:

${weakPatterns.map((p, i) => `
Pattern ${i + 1}: domain="${p.domain}", stackVersion="${p.stackVersion}"
- Total uses: ${p.total}, Bad ratings: ${p.bad} (${p.failureRate}% failure rate)
- Example bad prompts and user complaints:
${p.badExamples.slice(0, 3).map(e => `  - Prompt: "${e.prompt}" / Reason: "${e.reason}"`).join('\n')}
`).join('\n')}

Analyze these failure patterns and respond in strict JSON format:
{
  "patterns": [
    {
      "domain": "string",
      "rootCause": "string explaining WHY this pattern fails",
      "stackWeakness": "which layer of the 6-layer stack is causing the issue (identity/mission/domain_lock/constraints/variables/format)",
      "specificFix": "exact text change to make in that stack layer",
      "confidence": 0-100
    }
  ]
}`;

  try {
    const res = await fetch(`${BRIDGE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const raw = data.message || '';

    // Parse JSON from the response (handle markdown code blocks)
    const cleaned = raw.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return { report: parsed, raw: raw, analyzedAt: new Date().toISOString() };
  } catch (e) {
    console.error('[PatternAnalyzer] AI analysis failed:', e.message);
    return { report: null, error: e.message };
  }
}

/**
 * Full analysis pipeline: identify patterns → send to AI → return actionable report.
 */
export async function runPatternAnalysis() {
  console.log('[PatternAnalyzer] Starting full analysis cycle...');

  const { weakPatterns, sampleSize, message } = await identifyWeakPatterns();

  if (weakPatterns.length === 0) {
    console.log(`[PatternAnalyzer] No weak patterns found (${sampleSize} samples analyzed). ${message || ''}`);
    return { weakPatterns: [], report: null, sampleSize };
  }

  console.log(`[PatternAnalyzer] Found ${weakPatterns.length} weak patterns from ${sampleSize} samples. Sending to AI...`);

  const { report, error } = await generateAnalysisReport(weakPatterns);

  if (error) {
    console.error(`[PatternAnalyzer] Analysis failed: ${error}`);
    return { weakPatterns, report: null, error, sampleSize };
  }

  console.log(`[PatternAnalyzer] Analysis complete. ${report?.patterns?.length || 0} root causes identified.`);
  return { weakPatterns, report, sampleSize, analyzedAt: new Date().toISOString() };
}
