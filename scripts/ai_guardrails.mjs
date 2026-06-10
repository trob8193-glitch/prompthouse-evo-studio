import fs from 'fs';
import path from 'path';

export function getProjectRoot() {
  return process.cwd();
}

export async function safeReadTextFile(fullPath, maxBytes = 120000) {
  const stat = fs.statSync(fullPath);
  if (stat.size > maxBytes) {
    throw new Error('File too large');
  }
  return fs.readFileSync(fullPath, 'utf8');
}

export function redactSensitiveText(content) {
  // Redact simple keys
  return content.replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED_OPENAI_KEY]')
                .replace(/rk_[live|test]_[A-Za-z0-9_-]{20,}/g, '[REDACTED_STRIPE_KEY]');
}

export async function listFilesSafe(rootDir, scanRoots, config) {
  let files = [];
  let skippedFiles = [];
  
  const crawl = (currentDir) => {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath);
      
      if (config.excludePaths && config.excludePaths.some(ex => relPath.startsWith(ex) || entry.name === ex)) {
        continue;
      }

      if (entry.isDirectory()) {
        crawl(fullPath);
      } else {
        const ext = path.extname(entry.name);
        const shouldInclude = config.includeExtensions.includes(ext) || config.alwaysIncludeFiles.includes(relPath);
        if (shouldInclude) {
          const stat = fs.statSync(fullPath);
          files.push({ path: relPath, fullPath, sizeBytes: stat.size });
        } else {
          skippedFiles.push({ path: relPath, reason: 'Extension not included' });
        }
      }
    }
  };

  for (const root of scanRoots) {
    crawl(path.join(rootDir, root));
  }

  return { files, skippedFiles };
}

export async function writeTextFileSafe(rootDir, relativePath, content) {
  const fullPath = path.join(rootDir, relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
