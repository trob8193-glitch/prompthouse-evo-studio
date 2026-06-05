import fs from 'fs';
import path from 'path';

export function reviewStoreDir(rootDir = process.cwd()) {
  return path.join(rootDir, '.prompthouse-data', 'reviews');
}

export function saveReview({ rootDir = process.cwd(), review } = {}) {
  if (!review?.moduleId) throw new Error('Review requires moduleId.');
  const dir = reviewStoreDir(rootDir);
  fs.mkdirSync(dir, { recursive: true });
  const safeName = String(review.moduleId).replace(/[^a-z0-9_-]/gi, '_');
  const file = path.join(dir, `review-${safeName}-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(review, null, 2), 'utf8');
  return { file, review };
}

export function listReviews({ rootDir = process.cwd(), limit = 100 } = {}) {
  const dir = reviewStoreDir(rootDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .slice(-limit)
    .map(file => {
      const fullPath = path.join(dir, file);
      try {
        return { file: fullPath, review: JSON.parse(fs.readFileSync(fullPath, 'utf8')) };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export default { reviewStoreDir, saveReview, listReviews };
