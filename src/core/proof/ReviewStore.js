import db from '../db/quad_schema.js';
import crypto from 'crypto';

export function saveReview({ review } = {}) {
  if (!review?.moduleId) throw new Error('Review requires moduleId.');
  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO reviews_ledger (id, module_id, author, status, score, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    review.moduleId,
    review.author || 'Gatekeeper',
    review.status || 'UNVERIFIED',
    review.score || 0,
    JSON.stringify(review)
  );
  return { id, review };
}

export function listReviews({ limit = 100 } = {}) {
  const stmt = db.prepare('SELECT * FROM reviews_ledger ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit).map(row => ({
    id: row.id,
    moduleId: row.module_id,
    author: row.author,
    status: row.status,
    score: row.score,
    createdAt: row.created_at,
    review: JSON.parse(row.details_json)
  }));
}

export default { saveReview, listReviews };
