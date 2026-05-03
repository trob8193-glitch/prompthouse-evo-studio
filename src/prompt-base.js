/**
 * PromptHouse Evo Studio — PromptBase & Saved Missions Store
 * Step 3 of Build Packet: Wire PromptBase and Saved Missions
 * Owner: Memory Bot | Truth State: built
 */

import { createMission, createProofReceipt } from './models.js';

const MISSIONS_KEY = 'ph_evo_missions';
const RECEIPTS_KEY = 'ph_evo_receipts';
const VECTORPACKS_KEY = 'ph_evo_vectorpacks';
const COMMERCE_KEY = 'ph_evo_commerce';
const NIGHTFORGE_KEY = 'ph_evo_nightforge';
const SOVEREIGNTY_POLICY_KEY = 'ph_evo_sovereignty_policy'; // 'manual' | 'unbound'

// ─── Persistence Bridge ───────────────────────────────────────────────────────
async function bridgeFetch(endpoint, method = 'GET', body = null) {
  try {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`http://localhost:3001/api/browser-bridge/${endpoint}`, options);
    if (!res.ok) throw new Error(`Bridge Error: ${res.status}`);
    return await res.json();
  } catch (e) {
    // Fallback to localStorage if bridge offline
    return null;
  }
}

// ─── Sovereignty Policy ────────────────────────────────────────────────────────
export function getSovereigntyPolicy() {
  if (typeof localStorage === 'undefined') return 'manual';
  return localStorage.getItem(SOVEREIGNTY_POLICY_KEY) || 'manual';
}

export function setSovereigntyPolicy(policy) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SOVEREIGNTY_POLICY_KEY, policy === 'unbound' ? 'unbound' : 'manual');
  }
}

// ─── Shared Sync Logic ─────────────────────────────────────────────────────────
export async function syncTruthFromBridge() {
  const bridgeReceipts = await bridgeFetch('proof');
  if (bridgeReceipts && Array.isArray(bridgeReceipts)) {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(bridgeReceipts));
  }
  const bridgeMissions = await bridgeFetch('promptbase');
  if (bridgeMissions && Array.isArray(bridgeMissions)) {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(bridgeMissions));
  }
}

// ─── Missions ──────────────────────────────────────────────────────────────────
export function getAllMissions() {
  try { return JSON.parse(localStorage.getItem(MISSIONS_KEY) || '[]'); }
  catch { return []; }
}

export async function saveMission(mission) {
  const all = getAllMissions();
  const idx = all.findIndex(m => m.id === mission.id);
  const updated = { ...mission, updatedAt: new Date().toISOString() };
  if (idx >= 0) { all[idx] = updated; } else { all.unshift(updated); }
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(all));
  
  // Push to bridge
  await bridgeFetch('promptbase', 'POST', updated); 
  return updated;
}

export function deleteMission(id) {
  const all = getAllMissions().filter(m => m.id !== id);
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(all));
}

export function createAndSaveMission(fields = {}) {
  const m = createMission(fields);
  return saveMission(m);
}

// ─── Proof Receipts ────────────────────────────────────────────────────────────
export function getAllReceipts() {
  try { return JSON.parse(localStorage.getItem(RECEIPTS_KEY) || '[]'); }
  catch { return []; }
}

export async function saveReceipt(receipt) {
  const all = getAllReceipts();
  all.unshift(receipt);
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(all.slice(0, 500)));
  
  // Push to bridge
  await bridgeFetch('proof', 'POST', receipt);
  return receipt;
}

export function getReceiptsForMission(missionId) {
  return getAllReceipts().filter(r => r.missionId === missionId);
}

export function addProofReceipt(missionId, action, status, extras = {}) {
  const r = createProofReceipt(missionId, action, status, extras);
  return saveReceipt(r);
}

// ─── VectorPacks ───────────────────────────────────────────────────────────────
export function getVectorPack(missionId) {
  try {
    const all = JSON.parse(localStorage.getItem(VECTORPACKS_KEY) || '{}');
    return all[missionId] || null;
  } catch { return null; }
}

export function saveVectorPack(pack) {
  try {
    const all = JSON.parse(localStorage.getItem(VECTORPACKS_KEY) || '{}');
    all[pack.missionId] = pack;
    localStorage.setItem(VECTORPACKS_KEY, JSON.stringify(all));
  } catch {}
  return pack;
}

// ─── Commerce Specs ────────────────────────────────────────────────────────────
export function getAllCommerceSpecs() {
  try { return JSON.parse(localStorage.getItem(COMMERCE_KEY) || '[]'); }
  catch { return []; }
}

export function saveCommerceSpec(spec) {
  const all = getAllCommerceSpecs();
  const idx = all.findIndex(s => s.id === spec.id);
  if (idx >= 0) { all[idx] = spec; } else { all.unshift(spec); }
  localStorage.setItem(COMMERCE_KEY, JSON.stringify(all));
  
  // Push to bridge
  bridgeFetch('forgecapsule', 'POST', { type: 'commerce_spec', content: spec });
  return spec;
}

// ─── NightForge Proposals ──────────────────────────────────────────────────────
export function getAllPatchProposals() {
  try { return JSON.parse(localStorage.getItem(NIGHTFORGE_KEY) || '[]'); }
  catch { return []; }
}

export function savePatchProposal(proposal) {
  const all = getAllPatchProposals();
  all.unshift(proposal);
  localStorage.setItem(NIGHTFORGE_KEY, JSON.stringify(all.slice(0, 100)));
  return proposal;
}

// ─── Gate Score Summary ────────────────────────────────────────────────────────
export function computeAllGateScores(gateDefinitions) {
  const receipts = getAllReceipts();
  return gateDefinitions.map(gate => {
    const relevant = receipts.filter(r => r.action && (r.action.includes(gate.id) || r.action.includes(gate.label.toLowerCase().replace(/ /g, '_'))));
    if (!relevant.length) return { ...gate, score: 0, status: 'blocked' };
    
    // Use ONLY the latest receipt for the gate score, enabling true 100% recovery
    const latest = relevant[0];
    let score = 0;
    if (latest.status === 'verified') score = 100;
    else if (latest.status === 'built') score = 50;
    
    return { ...gate, score, status: latest.status };
  });
}
