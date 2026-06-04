/**
 * TrainingCapture — Captures user interactions for training data generation
 * Status: ACTIVE
 */
export class TrainingCapture {
  constructor() {
    this.name = 'TrainingCapture';
    this.description = 'Captures user interactions for training data generation';
    this.status = 'ACTIVE';
    this.buffer = [];
    this.maxBuffer = 1000;
  }

  capture(interaction) {
    if (!interaction || !interaction.input) return false;
    this.buffer.push({ ...interaction, capturedAt: Date.now() });
    if (this.buffer.length > this.maxBuffer) this.buffer.shift();
    return true;
  }

  flush() { const data = [...this.buffer]; this.buffer = []; return data; }
  peek(n = 10) { return this.buffer.slice(-n); }

  getStatus() {
    return { id: this.name, grade: 'A', state: this.status, resonance: 100, description: this.description, buffered: this.buffer.length };
  }
}
