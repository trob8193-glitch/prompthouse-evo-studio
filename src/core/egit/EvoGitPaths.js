import fs from 'fs';
import path from 'path';

export function egitPaths(rootDir = process.cwd()) {
  const root = path.join(rootDir, '.prompthouse-data', 'egit');
  return {
    root,
    objects: path.join(root, 'objects'),
    snapshots: path.join(root, 'snapshots'),
    receipts: path.join(root, 'receipts'),
    handshakes: path.join(root, 'handshakes'),
    adapters: path.join(root, 'adapters'),
    daemonReceipts: path.join(root, 'daemon-receipts'),
    index: path.join(root, 'index.json')
  };
}

export function ensureEgitDirs(rootDir = process.cwd()) {
  const paths = egitPaths(rootDir);
  Object.entries(paths).forEach(([key, value]) => {
    if (key !== 'index') fs.mkdirSync(value, { recursive: true });
  });
  return paths;
}
