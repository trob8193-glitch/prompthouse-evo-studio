export class KnowledgeDistiller {
  constructor() {
    this.memory = [];
  }
  async distill(context) {
    return `distilled: ${context}`;
  }
}
