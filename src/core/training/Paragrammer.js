/**
 * Paragrammer — Generates training paragrams and augmented data for model fine-tuning
 * Status: ACTIVE
 */
export class Paragrammer {
  constructor() {
    this.name = 'Paragrammer';
    this.description = 'Generates training paragrams and augmented data for model fine-tuning';
    this.status = 'ACTIVE';
  }

  extractParameters(text) {
    if (!text || typeof text !== 'string') return [];

    // Simple regex to find parameters like {{paramName}} or {param_name}
    const paramRegex = /\{\{?([a-zA-Z0-9_]+)\}?\}/g;
    const matches = [];
    let match;

    while ((match = paramRegex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    return matches;
  }

  createTemplate(text, valuesToReplace) {
    if (!text || !valuesToReplace) return text;
    let template = text;

    for (const [key, value] of Object.entries(valuesToReplace)) {
      // Replace instances of 'value' with '{{key}}'
      const regex = new RegExp(value, 'g');
      template = template.replace(regex, `{{${key}}}`);
    }

    return template;
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

