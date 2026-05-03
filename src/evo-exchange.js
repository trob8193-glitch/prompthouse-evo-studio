/**
 * PromptHouse Evo Studio — Evo Exchange (Private Marketplace)
 * Owner: Commerce Rail / Sovereignty | Blueprint Section 5.1
 *
 * GATE: Blocked until accounts, marketplace policy, moderation, and owner approval.
 * This module provides the scaffold and schema ONLY.
 * No publishing, selling, or sharing without explicit owner approval + moderation receipt.
 */

import { addProofReceipt, getSovereigntyPolicy } from './prompt-base.js';

const EXCHANGE_KEY = 'ph_evo_exchange_listings';

// Exchange listing statuses
const LISTING_STATES = ['draft', 'pending_review', 'approved', 'published', 'rejected', 'removed'];

export function createExchangeListing(overrides = {}) {
  return {
    id: `listing_${Date.now()}`,
    ownerUserId: 'local_owner',
    recipeId: null,
    name: '',
    description: '',
    type: 'template', // agent | extension | template | app
    price: 0,
    currency: 'usd',
    consentScope: 'marketplace_candidate',
    status: 'draft', // ALWAYS starts as draft
    moderationRequired: true, // NEVER skip moderation
    ownerApprovalRequired: true, // NEVER skip owner approval
    marketplacePolicyAccepted: false,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function getAllListings() {
  try { return JSON.parse(localStorage.getItem(EXCHANGE_KEY) || '[]'); }
  catch { return []; }
}

export function saveListing(listing) {
  const all = getAllListings();
  const idx = all.findIndex(l => l.id === listing.id);
  if (idx >= 0) { all[idx] = listing; } else { all.unshift(listing); }
  localStorage.setItem(EXCHANGE_KEY, JSON.stringify(all));
  return listing;
}

/**
 * Submit a tool recipe for Exchange consideration
 * This creates a DRAFT listing only. Publishing requires full approval chain.
 */
export function submitForExchange(recipeId, params = {}) {
  const { name = '', description = '', type = 'template', price = 0, candidateScore = 0, frictionScore = 0 } = params;

  // Hard block: marketplace policy must be accepted
  if (!params.marketplacePolicyAccepted) {
    addProofReceipt('evo_exchange', 'evo_exchange:submit', 'blocked', {
      evidenceType: 'policy_check',
      evidenceUri: null,
    });
    return {
      blocked: true,
      reason: 'BLOCKED: Marketplace policy must be accepted before submitting to Evo Exchange.',
      listing: null,
    };
  }

  const listing = createExchangeListing({
    recipeId,
    name,
    description,
    type,
    price,
    marketplacePolicyAccepted: true,
    status: 'pending_review',
  });

  saveListing(listing);

  // UNBOUND MODE AUTO-PUBLISH
  if (getSovereigntyPolicy() === 'unbound' && candidateScore === 100 && frictionScore === 0) {
    listing.status = 'published';
    listing.publishedAt = new Date().toISOString();
    listing.moderationRequired = false;
    listing.ownerApprovalRequired = false;
    saveListing(listing);

    addProofReceipt('evo_exchange', 'evo_exchange:unbound_publish', 'verified', {
      evidenceType: 'unbound_auto_approval',
      evidenceUri: `memory:listing:${listing.id}`,
    });

    return {
      blocked: false,
      listing,
      nextStep: 'Listing automatically published via Unbound Autonomy.',
      approvalRequired: false,
      moderationRequired: false,
    };
  }

  addProofReceipt('evo_exchange', 'evo_exchange:submit', 'built', {
    evidenceType: 'exchange_listing_draft',
    evidenceUri: `memory:listing:${listing.id}`,
  });

  return {
    blocked: false,
    listing,
    nextStep: 'Listing is pending_review. Owner approval + moderation required before publishing.',
    approvalRequired: true,
    moderationRequired: true,
  };
}

/**
 * Approve and publish a listing (requires explicit owner call)
 * CANNOT be triggered autonomously.
 */
export function approveAndPublish(listingId, ownerSecret = '') {
  // In production, this would verify owner identity server-side
  if (!ownerSecret || ownerSecret !== 'OWNER_APPROVED') {
    addProofReceipt('evo_exchange', 'evo_exchange:publish', 'blocked', {
      evidenceType: 'approval_check',
    });
    return {
      blocked: true,
      reason: 'BLOCKED: Publishing requires explicit owner approval. This cannot be triggered autonomously.',
    };
  }

  const all = getAllListings();
  const listing = all.find(l => l.id === listingId);
  if (!listing) return { blocked: true, reason: 'Listing not found.' };

  listing.status = 'published';
  listing.publishedAt = new Date().toISOString();
  saveListing(listing);

  addProofReceipt('evo_exchange', 'evo_exchange:publish', 'verified', {
    evidenceType: 'publish_receipt',
    evidenceUri: `memory:listing:${listingId}`,
  });

  return { blocked: false, listing };
}

/**
 * Get Exchange stats (for display only — not verified revenue claims)
 */
export function getExchangeStats() {
  const all = getAllListings();
  return {
    totalDrafts: all.filter(l => l.status === 'draft').length,
    totalPendingReview: all.filter(l => l.status === 'pending_review').length,
    totalPublished: all.filter(l => l.status === 'published').length,
    totalRejected: all.filter(l => l.status === 'rejected').length,
    status: 'blocked', // Exchange is blocked until full marketplace infrastructure exists
    blockedReason: 'Evo Exchange requires: accounts, payment infrastructure, content moderation, marketplace policy, and owner approval chain.',
  };
}
