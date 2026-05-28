import { UniversalImageAdaptor } from '../../../lib/ai/UniversalImageAdaptor.js';
import { CREATIVE_ENGINES } from './AssetContracts.js';

export function mapCreativeEngine(engine = CREATIVE_ENGINES.EVO_DIFFUSER) {
  switch (engine) {
    case CREATIVE_ENGINES.EVO_DIFFUSER:
    case CREATIVE_ENGINES.STABLE_DIFFUSION:
      return 'stablediffusion';
    case CREATIVE_ENGINES.EVO_PIXEL:
    case CREATIVE_ENGINES.IMAGE_GENERATOR:
    case CREATIVE_ENGINES.DALLE:
      return 'dalle';
    default:
      return engine;
  }
}

export class CreativeEngineRouter {
  constructor({ keys = process.env } = {}) {
    this.adaptor = new UniversalImageAdaptor({
      openai: keys.OPENAI_API_KEY,
    });
  }

  selectEngine(request) {
    const preferred = request.preferredEngine || CREATIVE_ENGINES.EVO_DIFFUSER;
    if (preferred === CREATIVE_ENGINES.EVO_DIFFUSER) return CREATIVE_ENGINES.STABLE_DIFFUSION;
    if (preferred === CREATIVE_ENGINES.EVO_PIXEL) return CREATIVE_ENGINES.DALLE;
    if (preferred === CREATIVE_ENGINES.IMAGE_GENERATOR) return CREATIVE_ENGINES.DALLE;
    return preferred;
  }

  async generate(request) {
    const selectedEngine = request.selectedEngine || this.selectEngine(request);
    const adaptorEngine = mapCreativeEngine(selectedEngine);
    const prompt = buildPrompt(request);
    const result = await this.adaptor.generate(prompt, adaptorEngine, {
      steps: request.metadata?.steps || 30,
      cfg: request.metadata?.cfg || 7,
    });
    return {
      ...result,
      selectedEngine,
      adaptorEngine,
      prompt,
    };
  }
}

export function buildPrompt(request) {
  const style = request.styleProfile ? `Style profile: ${request.styleProfile}.` : '';
  const goal = request.goal ? `Goal: ${request.goal}.` : '';
  const type = request.assetType ? `Asset type: ${request.assetType}.` : '';
  return [type, goal, style, request.prompt].filter(Boolean).join(' ');
}
