#!/usr/bin/env node
import { listReviews } from '../src/core/proof/ReviewStore.js';

const reviews = listReviews({ rootDir: process.cwd(), limit: 100 });
const summary = reviews.reduce((acc, item) => {
  acc.total += 1;
  if (item.review?.approved) acc.approved += 1;
  else acc.reviewRequired += 1;
  return acc;
}, { total: 0, approved: 0, reviewRequired: 0 });

console.log(JSON.stringify({
  truthState: summary.reviewRequired ? 'REVIEW_LEDGER_HAS_OPEN_ITEMS' : 'REVIEW_LEDGER_CLEAR',
  summary,
  reviews: reviews.map(item => ({
    file: item.file,
    moduleId: item.review.moduleId,
    targetStage: item.review.targetStage,
    approved: item.review.approved,
    truthState: item.review.truthState,
    issues: item.review.issues || [],
    signedAt: item.review.signedAt || null
  }))
}, null, 2));
