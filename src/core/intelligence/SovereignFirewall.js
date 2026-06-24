import { ContextCompactor } from './ContextCompactor.js';
import { SemanticRouter } from './SemanticRouter.js';
import { ShadowCache } from './ShadowCache.js';
import { SyntaxSandbox } from './SyntaxSandbox.js';
import { LocalVectorDB } from '../memory/LocalVectorDB.js';
import { SHADOW_FORGE } from '../autonomy/ShadowForge.js';

/**
 * EVO STUDIO FIREWALL
 * ═══════════════════════════════════════════════════════════════
 * The master cost-saving interception membrane. All AI requests
 * flow through here to be compacted, cached, routed, and verified.
 */
export class SovereignFirewall {
  static async intercept(prompt, context = '', options = {}) {
    const { aiAdaptor, systemPrompt = 'You are a Evo Studio AI.' } = options;
    const startTime = Date.now();
    let tokensSaved = 0;
    let moneySaved = 0;

    

    // 1. Context Compaction
    const compactor = new ContextCompactor();
    const { compactedContext, savings } = compactor.compress(context);
    tokensSaved += savings.tokens;
    moneySaved += savings.cost;
    

    // 2. Shadow Cache Lookup
    const cache = new ShadowCache();
    const cacheKey = cache.generateHash(prompt, compactedContext);
    const cachedResponse = await cache.lookup(cacheKey);

    if (cachedResponse) {
      
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
    
    // [RAG SHADOW MEMORY] Inject local codebase knowledge
    if (route.provider === 'local') {
      try {
        const vdb = new LocalVectorDB();
        const results = await vdb.search(prompt, 2);
        if (results && results.length > 0) {
          compactedContext = "[RAG CONTEXT]\n" + results.map(r => `File: ${r.metadata?.path || r.id}\n${r.text}`).join('\n\n') + "\n[END RAG CONTEXT]\n\n" + compactedContext;
        }
      } catch (e) {
        void('[FIREWALL] RAG Vector Search failed:', e.message);
      }
    }

    // 4. Execution 
    let generatedResponse = await this._executeModel(prompt, compactedContext, route, aiAdaptor, systemPrompt);
    
    if (route.provider === 'local') {
      // Calculate savings by using local instead of GPT-4o
      const simulatedTokens = prompt.length + compactedContext.length + generatedResponse.length;
      const simulatedCost = (simulatedTokens / 1000) * 0.005;
      moneySaved += simulatedCost;
      
    }

    // 5. Zero-Shot Pre-flight Sandbox
    const sandbox = new SyntaxSandbox();
    if (sandbox.containsCode(generatedResponse)) {
      
      const { fixedCode, wasFixed } = await sandbox.verifyAndFix(generatedResponse);
      if (wasFixed) {
        
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
        // [NATIVE TOOL CALLING] Instruct the local model to use ShadowForge
        const enhancedSystemPrompt = `${systemPrompt}\n\n[Sovereign Sandbox]: If you need to test code for infinite loops or syntax before giving it to the user, output exactly this JSON format: {"action":"test_mutation","fileId":"test_name","logic":"<code to test>"}.`;
        
        let responseContent = '';
        let toolAttempts = 0;
        let currentPrompt = `System: ${enhancedSystemPrompt}\n\nContext:\n${context}\n\nUser: ${prompt}`;

        while (toolAttempts < 2) {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: route.model,
              prompt: currentPrompt,
              stream: false
            }),
            signal: AbortSignal.timeout(30000)
          });
          if (!response.ok) throw new Error('Local inference failed');
          const data = await response.json();
          responseContent = data.response;

          // Check if the model attempted Native Tool Calling
          try {
            const parsed = JSON.parse(responseContent.trim());
            if (parsed.action === 'test_mutation') {
              void(`[FIREWALL] Local Model invoked Tool: test_mutation`);
              const success = await SHADOW_FORGE.shadowBuild(parsed.fileId || 'temp', parsed.logic || '');
              toolAttempts++;
              const resultMessage = success ? 'Tool Result: The code compiled and is safe. Now provide your final answer to the user.' : 'Tool Result: The code FAILED syntax or AST checks. Please fix the errors and output either the fixed JSON or the final answer.';
              currentPrompt += `\nAssistant: ${responseContent}\nSystem: ${resultMessage}`;
              continue;
            }
          } catch(e) {
            // Not a JSON tool call, just regular output
            break;
          }
        }
        return responseContent;
      } catch (err) {
        void('[FIREWALL] Local model failed, falling back to OpenAI...', err.message);
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
