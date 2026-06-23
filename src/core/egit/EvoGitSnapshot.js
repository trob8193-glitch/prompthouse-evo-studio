import fs from 'fs';
import path from 'path';
// import { readGitState, createRepoSnapshot } from '../evolution/RepoSnapshot.js';
function readGitState() { return { status: 'simulated' }; }
function createRepoSnapshot() { return { files: 0, status: 'simulated' }; }
import { ensureEgitDirs } from './EvoGitPaths.js';
import { writeEvoObject } from './EvoGitObjectStore.js';
import { checkLocalToolAdapters } from './EvoGitAdapters.js';
import { checkApiAdapters } from './EvoGitApiAdapters.js';
import { summarizeToolReadiness } from './EvoGitRegistry.js';

function listDir(rootDir, relPath) {
  const dir = path.join(rootDir, relPath);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).slice(0, 200).map(name => ({ name, path: `${relPath}/${name}` }));
}

export function createEvoGitSnapshot({ rootDir = process.cwd(), label = 'egit_snapshot', includeAdapters = true } = {}) {
  const paths = ensureEgitDirs(rootDir);
  if (includeAdapters) {
    checkLocalToolAdapters({ rootDir });
    checkApiAdapters({ rootDir });
  }

  const repo = createRepoSnapshot({ rootDir, label });
  const payload = {
    label,
    createdAt: new Date().toISOString(),
    git: readGitState(rootDir),
    repoSnapshot: repo,
    artifactSurfaces: {
      generatedApps: listDir(rootDir, 'generated_apps'),
      buildkitImport: listDir(rootDir, 'buildkit_import'),
      buildQueues: listDir(rootDir, 'build_queues'),
      tempPrompts: listDir(rootDir, 'temp_prompts')
    },
    adapters: summarizeToolReadiness({ rootDir }),
    truthState: 'SNAPSHOT_CREATED'
  };

  const object = writeEvoObject({ rootDir, type: 'egit_snapshot', payload });
  const snapshot = { id: `egit_snapshot_${Date.now()}`, objectId: object.objectId, ...payload };
  fs.writeFileSync(path.join(paths.snapshots, `${snapshot.id}.json`), JSON.stringify(snapshot, null, 2), 'utf8');
  return snapshot;
}
