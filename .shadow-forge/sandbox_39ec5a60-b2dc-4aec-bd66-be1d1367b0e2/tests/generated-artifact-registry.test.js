import { describe, expect, it } from 'vitest';
import {
  buildGeneratedArtifactRegistry,
  classifyWorkspacePath,
  parseGitStatusLine,
} from '../src/generated-artifact-registry.js';

describe('generated artifact registry', () => {
  it('classifies quoted generated and imported paths correctly', () => {
    expect(classifyWorkspacePath('generated_apps/ProofOS_Feature_3_Prompt-to-Product Compiler/src/ui/Screen.tsx')).toBe('generated');
    expect(classifyWorkspacePath('buildkit_import/incoming_prompthouse_20260430_172709/packet.docx')).toBe('imported');
    expect(classifyWorkspacePath('public/assets/avatars/companion (2).png')).toBe('source');
  });

  it('normalizes quoted git status paths and blocks release claims on unknown entries', () => {
    const registry = buildGeneratedArtifactRegistry({
      rootDir: process.cwd(),
      gitStatusLines: [
        '?? "generated_apps/ProofOS_Feature_3_Prompt-to-Product Compiler/src/ui/Screen.tsx"',
        '?? "buildkit_import/incoming_prompthouse_20260430_172709/packet.docx"',
        '',
      ],
    });

    expect(parseGitStatusLine('?? "public/assets/avatars/companion (2).png"').path).toBe('public/assets/avatars/companion (2).png');
    expect(registry.counts.byType.generated).toBe(1);
    expect(registry.counts.byType.imported).toBe(1);
    expect(registry.counts.byType.unknown).toBe(1);
    expect(registry.unknownEntries).toHaveLength(1);
    expect(registry.releaseClaimAllowed).toBe(false);
  });
});
