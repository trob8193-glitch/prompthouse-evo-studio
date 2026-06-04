/**
 * KnowledgeDistiller — Distills and compresses knowledge from agent interactions into reusable patterns
 * Status: ACTIVE
 */
export class KnowledgeDistiller {
  constructor() {
    this.name = 'KnowledgeDistiller';
    this.description = 'Distills and compresses knowledge from agent interactions into reusable patterns';
    this.status = 'ACTIVE';
    this.stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'in', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'with', 'it', 'this', 'that', 'from', 'by', 'as', 'are', 'was', 'were', 'be', 'been']);
  }

  extractKeywords(text) {
    if (!text || typeof text !== 'string') return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));
      
    const freqs = {};
    words.forEach(w => freqs[w] = (freqs[w] || 0) + 1);
    
    return Object.entries(freqs)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }

  distillInteraction(logData) {
    const rawText = Array.isArray(logData) ? logData.join(' ') : String(logData);
    const keywords = this.extractKeywords(rawText);
    
    const pattern = {
      id: 'pattern_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      summary: keywords.length > 0 ? `Interaction involving: ${keywords.slice(0, 3).join(', ')}` : 'Empty interaction pattern',
      keywords: keywords.slice(0, 10),
      originalLength: rawText.length,
      confidenceScore: Math.min(100, keywords.length * 10)
    };
    
    return pattern;
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description
    };
  }
}
