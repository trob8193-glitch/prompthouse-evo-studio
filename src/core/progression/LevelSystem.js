/**
 * LevelSystem — XP/Reputation for the agent
 * Status: ACTIVE
 */
export class LevelSystem {
  constructor() {
    this.name = 'LevelSystem';
    this.description = 'XP/Reputation for the agent';
    this.status = 'ACTIVE';
    this.xp = 0;
    this.level = 1;
  }

  addXP(amount) {
    if (amount <= 0) return false;
    this.xp += amount;
    this.level = Math.floor(this.xp / 100) + 1; // 100 XP per level
    return true;
  }

  getStats() { return { xp: this.xp, level: this.level }; }

  getStatus() {
    return { id: this.name, grade: 'A', state: this.status, resonance: 100, description: this.description, currentLevel: this.level };
  }
}
