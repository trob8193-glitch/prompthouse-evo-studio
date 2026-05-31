// ═══════════════════════════════════════════════════════════════
//  Sovereign Database Client — Prisma + SQLite
//  Enterprise-grade persistence layer for PH Evo Studio
//  Replaces flat JSON files with ACID-compliant transactions
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── CONFIG OPERATIONS ────────────────────────────────────────

/**
 * Get a config value by key. Returns parsed JSON or raw string.
 */
export async function getConfig(key) {
  const row = await prisma.config.findUnique({ where: { key } });
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

/**
 * Set a config value (upsert). Accepts any JSON-serializable value.
 */
export async function setConfig(key, value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return prisma.config.upsert({
    where: { key },
    update: { value: serialized },
    create: { key, value: serialized },
  });
}

/**
 * Get all config entries as a flat object.
 */
export async function getAllConfig() {
  const rows = await prisma.config.findMany();
  const result = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}

// ─── PROOF RECEIPT OPERATIONS ─────────────────────────────────

/**
 * Record a proof receipt for any daemon/mission.
 */
export async function createProofReceipt({ mission, status, details, filesChanged }) {
  return prisma.proofReceipt.create({
    data: {
      mission,
      status,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      filesChanged: filesChanged || 0,
    },
  });
}

/**
 * Fetch the last N proof receipts.
 */
export async function getRecentProofReceipts(limit = 20) {
  return prisma.proofReceipt.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

// ─── SOVEREIGN MEMORY OPERATIONS ──────────────────────────────

/**
 * Store or update a memory shard for a given agent.
 */
export async function setMemory(agent, key, memory) {
  const serialized = typeof memory === 'string' ? memory : JSON.stringify(memory);
  return prisma.sovereignMemory.upsert({
    where: { agent_key: { agent, key } },
    update: { memory: serialized, timestamp: new Date() },
    create: { agent, key, memory: serialized },
  });
}

/**
 * Retrieve a specific memory shard.
 */
export async function getMemory(agent, key) {
  const row = await prisma.sovereignMemory.findUnique({
    where: { agent_key: { agent, key } },
  });
  if (!row) return null;
  try {
    return JSON.parse(row.memory);
  } catch {
    return row.memory;
  }
}

/**
 * Get all memories for a specific agent.
 */
export async function getAgentMemories(agent) {
  const rows = await prisma.sovereignMemory.findMany({
    where: { agent },
    orderBy: { timestamp: 'desc' },
  });
  return rows.map((r) => {
    try {
      return { key: r.key, memory: JSON.parse(r.memory), timestamp: r.timestamp };
    } catch {
      return { key: r.key, memory: r.memory, timestamp: r.timestamp };
    }
  });
}

// ─── NIGHTFORGE STATE ─────────────────────────────────────────

/**
 * Get the singleton NightForge state.
 */
export async function getNightForgeState() {
  const row = await prisma.nightForgeState.findUnique({
    where: { id: 'nightforge_singleton' },
  });
  if (!row) return null;
  try {
    return JSON.parse(row.stateData);
  } catch {
    return row.stateData;
  }
}

/**
 * Upsert the NightForge daemon state.
 */
export async function setNightForgeState(state) {
  const serialized = typeof state === 'string' ? state : JSON.stringify(state);
  return prisma.nightForgeState.upsert({
    where: { id: 'nightforge_singleton' },
    update: { stateData: serialized },
    create: { id: 'nightforge_singleton', stateData: serialized },
  });
}

// ─── LIFECYCLE ────────────────────────────────────────────────

/**
 * Graceful shutdown hook.
 */
export async function disconnect() {
  await prisma.$disconnect();
}

export { prisma };
export default {
  getConfig,
  setConfig,
  getAllConfig,
  createProofReceipt,
  getRecentProofReceipts,
  setMemory,
  getMemory,
  getAgentMemories,
  getNightForgeState,
  setNightForgeState,
  disconnect,
  prisma,
};
