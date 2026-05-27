import { createCurriculum, createQueue } from './LearningEngines.js';
import { forgeScenarios, runArena, buildHeatmap, createPromptVariants, buildCapsules, evaluateStopGate } from './ProofEngines.js';
import { SPINECORE_VERSION, SPINECORE_MODULES, SPINECORE_CONTRACT } from './core.js';

export function runSpineCore({ lessons = [], objective = 'Improve learning pipeline' } = {}) {
  const firstHeatmap = buildHeatmap({ lessons, arena: [] });
  const curriculum = createCurriculum({ lessons, heatmap: firstHeatmap });
  const queue = createQueue({ lessons, curriculum });
  const scenarios = forgeScenarios({ curriculum });
  const arena = runArena({ scenarios });
  const heatmap = buildHeatmap({ lessons, arena });
  const promptVariants = createPromptVariants({ curriculum });
  const capsules = buildCapsules({ lessons, arena });
  const stopGate = evaluateStopGate({ heatmap, arena, queue });
  return {
    success: true,
    version: SPINECORE_VERSION,
    objective,
    modules: SPINECORE_MODULES,
    contract: SPINECORE_CONTRACT,
    curriculum,
    queue,
    scenarios,
    arena,
    heatmap,
    promptVariants,
    capsules,
    stopGate,
    counts: {
      lessons: lessons.length,
      queue: queue.length,
      scenarios: scenarios.length,
      arena: arena.length,
      capsules: capsules.length,
      promptVariants: promptVariants.length
    }
  };
}
