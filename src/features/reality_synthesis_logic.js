import fs from 'fs';
import path from 'path';

export class RealitySynthesisLogic {
  constructor() {
    this.status = 'ACTIVE';
    this.iq_baseline = 2000000;
    this.dataDir = path.join(process.cwd(), '.prompthouse-data');
    this.logFilePath = path.join(this.dataDir, 'evo_training.jsonl');
  }

  async execute(params = {}) {
    if (!params.jsonCaptures || !Array.isArray(params.jsonCaptures)) {
      throw new Error("Invalid input, expected 'jsonCaptures' to be an array");
    }

    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });

    const componentSuggestions = [];

    for (const capture of params.jsonCaptures) {
      const uiPattern = this._identifyUIPattern(capture);
      if (uiPattern) {
        componentSuggestions.push(this._synthesizeComponent(uiPattern));
        this._logTrainingData(capture, uiPattern.id);
      }
    }

    return { suggestions: componentSuggestions };
  }

  _identifyUIPattern(jsonCapture) {
    const text = this._normalizeCapture(jsonCapture);
    const lower = text.toLowerCase();

    const hasPassword = lower.includes('password');
    const hasEmail = lower.includes('email') || lower.includes('type\":\"email\"') || lower.includes(\"type='email'\") || lower.includes('username');
    const hasForm = lower.includes('<form') || lower.includes('form');

    const hasPrice = lower.includes('price') || lower.includes('$') || lower.includes('pricing');
    const hasTable = lower.includes('<table') || lower.includes('table');

    if (hasForm && (hasPassword || hasEmail)) {
      const confidence = hasPassword && hasEmail ? 0.92 : 0.78;
      return { id: 'login_form', label: 'Login Form', confidence };
    }

    if (hasTable && hasPrice) {
      return { id: 'pricing_table', label: 'Pricing Table', confidence: 0.74 };
    }

    return null;
  }

  _synthesizeComponent(uiPattern) {
    switch (uiPattern.id) {
      case 'login_form':
        return {
          id: 'suggest_login_form',
          pattern: uiPattern.id,
          confidence: uiPattern.confidence,
          componentName: 'LoginForm',
          jsx: `export function LoginForm({ onSubmit, disabled }) {\n  return (\n    <form onSubmit={onSubmit} className=\\\"space-y-3\\\">\n      <input name=\\\"email\\\" type=\\\"email\\\" required className=\\\"field-input\\\" aria-label=\\\"Email\\\" />\n      <input name=\\\"password\\\" type=\\\"password\\\" required className=\\\"field-input\\\" aria-label=\\\"Password\\\" />\n      <button type=\\\"submit\\\" className=\\\"btn btn-primary\\\" disabled={disabled}>Sign in</button>\n    </form>\n  );\n}`,
          notes: ['Requires a real auth endpoint and proof receipts before claiming verified login.'],
        };
      case 'pricing_table':
        return {
          id: 'suggest_pricing_table',
          pattern: uiPattern.id,
          confidence: uiPattern.confidence,
          componentName: 'PricingTable',
          jsx: `export function PricingTable({ plans = [] }) {\n  return (\n    <table className=\\\"w-full text-sm\\\">\n      <thead><tr><th className=\\\"text-left\\\">Plan</th><th className=\\\"text-left\\\">Price</th></tr></thead>\n      <tbody>\n        {plans.map((p) => (\n          <tr key={p.id}><td>{p.name}</td><td>{p.price}</td></tr>\n        ))}\n      </tbody>\n    </table>\n  );\n}`,
          notes: ['Do not hardcode prices; render from real plan data.'],
        };
      default:
        return null;
    }
  }

  _normalizeCapture(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  _logTrainingData(input, output) {
    const logData = { input, output, timestamp: new Date().toISOString() };
    try {
      fs.appendFileSync(this.logFilePath, JSON.stringify(logData) + '\n', { encoding: 'utf8' });
    } catch (err) {
      console.error('Error logging training data', err);
    }
  }
}
