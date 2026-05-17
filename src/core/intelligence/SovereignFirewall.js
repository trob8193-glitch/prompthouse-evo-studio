import { ContextCompactor } from './ContextCompactor.js';
import { SemanticRouter } from './SemanticRouter.js';
import { ShadowCache } from './ShadowCache.js';
import { SyntaxSandbox } from './SyntaxSandbox.js';

/**
 * SOVEREIGN FIREWALL
 * ═══════════════════════════════════════════════════════════════
 * The master cost-saving interception membrane. All AI requests
 * flow through here to be compacted, cached, routed, and verified.
 */
export class SovereignFirewall {
  static async intercept(prompt, context = '', options = {}) {
    const { aiAdaptor, systemPrompt = 'You are a Sovereign AI.' } = options;
    const startTime = Date.now();
    let tokensSaved = 0;
    let moneySaved = 0;

<<<<<<< HEAD
    
=======
    console.log('[FIREWALL] Intercepting request...');
>>>>>>> main

    // 1. Context Compaction
    const compactor = new ContextCompactor();
    const { compactedContext, savings } = compactor.compress(context);
    tokensSaved += savings.tokens;
    moneySaved += savings.cost;
<<<<<<< HEAD
    
=======
    console.log(`[FIREWALL] Compacted Context. Saved ${savings.tokens} tokens ($${savings.cost.toFixed(4)}).`);
>>>>>>> main

    // 2. Shadow Cache Lookup
    const cache = new ShadowCache();
    const cacheKey = cache.generateHash(prompt, compactedContext);
    const cachedResponse = await cache.lookup(cacheKey);

    if (cachedResponse) {
<<<<<<< HEAD
      
=======
      console.log('[FIREWALL] CACHE HIT! Bypassing API completely.');
>>>>>>> main
      const simulatedTokens = prompt.length + compactedContext.length + cachedResponse.length; 
      const simulatedCost = (simulatedTokens / 1000) * 0.005; 
      
      return {
        result: cachedResponse,
        source: 'shadow_cache',
        metrics: {
          timeMs: Date.now() - startTime,
          tokensSaved: tokensSaved + simulatedTokens,
          moneySaved: moneySaved + simulatedCost
        }
      };
    }

    // 3. Semantic Routing (Local vs Cloud)
    const router = new SemanticRouter();
    const route = router.determineRoute(prompt, compactedContext);
<<<<<<< HEAD
    
=======
    console.log(`[FIREWALL] Routing to: ${route.provider} (${route.model})`);
>>>>>>> main

    // 4. Execution 
    let generatedResponse = await this._executeModel(prompt, compactedContext, route, aiAdaptor, systemPrompt);
    
    if (route.provider === 'local') {
      // Calculate savings by using local instead of GPT-4o
      const simulatedTokens = prompt.length + compactedContext.length + generatedResponse.length;
      const simulatedCost = (simulatedTokens / 1000) * 0.005;
      moneySaved += simulatedCost;
<<<<<<< HEAD
      
=======
      console.log(`[FIREWALL] Local Execution Saved $${simulatedCost.toFixed(4)}`);
>>>>>>> main
    }

    // 5. Zero-Shot Pre-flight Sandbox
    const sandbox = new SyntaxSandbox();
    if (sandbox.containsCode(generatedResponse)) {
<<<<<<< HEAD
      
      const { fixedCode, wasFixed } = await sandbox.verifyAndFix(generatedResponse);
      if (wasFixed) {
        
=======
      console.log('[FIREWALL] Entering Pre-flight Sandbox...');
      const { fixedCode, wasFixed } = await sandbox.verifyAndFix(generatedResponse);
      if (wasFixed) {
        console.log('[FIREWALL] Syntax errors caught and fixed locally!');
>>>>>>> main
        generatedResponse = fixedCode;
      }
    }

    // 6. Save to Shadow Cache
    await cache.store(cacheKey, generatedResponse);

    return {
      result: generatedResponse,
      source: route.provider,
      metrics: {
        timeMs: Date.now() - startTime,
        tokensSaved: tokensSaved,
        moneySaved: moneySaved
      }
    };
  }

  static async _executeModel(prompt, context, route, aiAdaptor, systemPrompt) {
    if (route.provider === 'local') {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: route.model,
            prompt: `System: ${systemPrompt}\n\nContext:\n${context}\n\nUser: ${prompt}`,
            stream: false
          }),
          signal: AbortSignal.timeout(30000)
        });
        if (response.ok) {
          const data = await response.json();
          return data.response;
        }
      } catch (err) {
        console.warn('[FIREWALL] Local model failed, falling back to OpenAI...', err.message);
        route.provider = 'openai'; // Fallback
      }
    }
    
    // Cloud Execution
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n\nUser: ${prompt}` }
    ];
    const aiResponse = await aiAdaptor.generateResponse(messages);
    return aiResponse.message || aiResponse.content || JSON.stringify(aiResponse);
  }
}
