/** Fixed Feature: Agent Arena / Role Duel (pb22) **/
import { universalSend } from '../../lib/universal-transport.js';
export async function runDuel(agentA, agentB, prompt) {
  const responses = await Promise.all([
    universalSend([{role:'user', content: prompt}], agentA),
    universalSend([{role:'user', content: prompt}], agentB)
  ]);
  return { a: responses[0].message, b: responses[1].message, timestamp: Date.now() };
}