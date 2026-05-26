import { nowIso } from './core.js';

export function createLesson({ receipt = {}, source = 'evolution-cycle' } = {}) {
  const truthState = receipt.truthState || 'UNKNOWN';
  const blockedReasons = Array.isArray(receipt.blockedReasons) ? receipt.blockedReasons : [];
  const proofCommands = receipt.proof?.commands || receipt.proof?.results?.map(item => item.command).filter(Boolean) || [];
  return {
    id: `lesson_${receipt.runId || Date.now()}`,
    createdAt: nowIso(),
    source,
    objective: receipt.objective || 'Unknown objective',
    truthState,
    problem: blockedReasons.length ? blockedReasons.join('; ') : `Cycle ended as ${truthState}`,
    cause: blockedReasons.length ? 'Policy or proof gate stopped promotion.' : 'Cycle result needs ranking before promotion.',
    safePattern: 'Capture lesson, evaluate it, require receipt, then promote only if proof improves.',
    repairStrategy: proofCommands.length ? `Repeat proof commands: ${proofCommands.join(' && ')}` : 'Run dataset, evaluation, studio verification, tests, and build before promotion.',
    proofCommands,
    blockedReasons,
    risk: blockedReasons.some(item => String(item).toLowerCase().includes('cost')) ? 'cost-risk' : 'standard-risk'
  };
}

export function scoreLesson(lesson = {}) {
  let score = 40;
  if (lesson.truthState?.includes('PROOF_PASSED')) score += 25;
  if (lesson.truthState?.includes('BLOCKED')) score += 18;
  if (lesson.truthState?.includes('ROLLED_BACK')) score += 22;
  if ((lesson.blockedReasons || []).length) score += 10;
  if ((lesson.proofCommands || []).length) score += 8;
  if ((lesson.risk || '').includes('cost')) score += 8;
  return Math.min(100, score);
}

export function rankMemory({ lessons = [] } = {}) {
  return lessons.map(lesson => ({ ...lesson, score: scoreLesson(lesson) })).sort((a, b) => b.score - a.score);
}

export function createCurriculum({ lessons = [], heatmap = {} } = {}) {
  const weakAreas = Object.entries(heatmap.areas || {}).sort((a, b) => a[1].score - b[1].score).map(([area]) => area);
  const repeated = lessons.reduce((acc, lesson) => {
    const key = lesson.risk || 'standard-risk';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const fallback = ['truth-labeling', 'cost-firewall', 'react-repair', 'build-proof', 'evolution-cycle'];
  const goals = [...weakAreas.slice(0, 5), ...Object.keys(repeated).slice(0, 5)].filter(Boolean);
  return {
    id: `curriculum_${Date.now()}`,
    createdAt: nowIso(),
    truthState: 'CURRICULUM_READY',
    goals: (goals.length ? goals : fallback).map((goal, index) => ({
      id: `goal_${index + 1}`,
      area: goal,
      objective: `Improve Evo behavior for ${goal} using verified lessons and receipts.`,
      requiredProof: ['npm run evo:strict', 'npm run verify:studio', 'npm test', 'npm run build']
    }))
  };
}

export function createQueue({ lessons = [], curriculum = {} } = {}) {
  const ranked = rankMemory({ lessons });
  return ranked.map((lesson, index) => ({
    id: `queue_${lesson.id}`,
    createdAt: nowIso(),
    priority: index + 1,
    status: lesson.score >= 75 ? 'VALIDATED' : 'NEEDS_REVIEW',
    lessonId: lesson.id,
    score: lesson.score,
    curriculumGoals: (curriculum.goals || []).slice(0, 3).map(goal => goal.area),
    approvalRequired: true,
    receiptRequired: true,
    rollbackRequired: true
  }));
}
