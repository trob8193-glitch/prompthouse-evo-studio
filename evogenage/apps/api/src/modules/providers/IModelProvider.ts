/**
 * EVOGENAGE — MODEL PROVIDER INTERFACE (SOVEREIGN ADAPTER)
 * ═══════════════════════════════════════════════════════════════
 * All generation engines must implement this physical contract.
 */

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  seed?: number;
  assetType: string;
}

export interface GenerationResponse {
  assetUrl: string;
  providerMetadata: any;
  durationMs: number;
}

export interface IModelProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  statusCheck(): Promise<'online' | 'offline' | 'degraded'>;
  generateImage(request: GenerationRequest): Promise<GenerationResponse>;
}
