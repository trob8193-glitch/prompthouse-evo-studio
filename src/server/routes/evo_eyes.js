import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export default function createEvoEyesRouter(dependencies) {
  const router = express.Router();
  const { 
    maybeRequireAuthOrMaster, 
    writeRateLimit, 
    enforceJsonObjectBody,
    CostFirewall,
    ModelRouter,
    scanStudioModules,
    runEvoLmTeamChat,
    ai,
    userConfig,
    truthGate,
    appendTrainingExamples,
    DATA_DIR
  } = dependencies;

  const toSafeJson = (obj) => JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value);

  router.post('/team-run', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
    try {
      const {
        objective,
        messages = [],
        orgId = 'org_test',
        train = true,
        includeProviders = ['evo_lm', 'openai', 'gemini'],
        mode = 'balanced'
      } = req.body || {};

      if (!objective || typeof objective !== 'string' || !objective.trim()) {
        return res.status(400).json({ error: 'objective is required.' });
      }

      await CostFirewall.authorize(orgId, '/api/evo-eyes/team-run');
      const routedProvider = await ModelRouter.route(orgId, '/api/evo-eyes/team-run');

      const evoEyesSnapshot = scanStudioModules ? scanStudioModules(12) : { files: [], total_modules: 0 };
      const baseMessages = Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: 'user', content: objective }];
      const coordinationPrompt = [
        'You are a studio coordination engine.',
        'Use codebase scan signals and produce concise execution guidance.',
        `Coordination mode: ${mode}.`,
        `EvoEyesTopModules: ${evoEyesSnapshot.files.map(item => `${item.path}(${item.density})`).join(', ')}`,
      ].join(' ');

      const providerOutputs = [];
      const requested = new Set(includeProviders);
      const canUseCloud = routedProvider === 'any' || routedProvider === 'cloud' || routedProvider === 'openai' || routedProvider === 'gemini';

      if (requested.has('evo_lm') && runEvoLmTeamChat) {
        const evoLm = await runEvoLmTeamChat(baseMessages, coordinationPrompt);
        providerOutputs.push({
          provider: 'evo_lm',
          success: evoLm.success,
          from_cache: evoLm.from_cache,
          content: evoLm.message,
          model: evoLm.model,
          transport: evoLm.transport
        });
      }

      if (requested.has('openai') && userConfig?.keys?.openai && canUseCloud) {
        const openaiResult = await ai.chat(
          coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
          { provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' }
        );
        if (openaiResult.success && openaiResult.content && truthGate) truthGate.enforce(openaiResult.content, 'TeamRun:openai');
        providerOutputs.push({
          provider: 'openai',
          success: Boolean(openaiResult.success),
          from_cache: Boolean(openaiResult.from_cache),
          content: openaiResult.content || openaiResult.error || '',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          transport: 'universal_ai_adaptor'
        });
      }

      if (requested.has('gemini') && userConfig?.keys?.gemini && canUseCloud) {
        const geminiResult = await ai.chat(
          coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
          { provider: 'gemini', model: 'gemini-1.5-pro' }
        );
        if (geminiResult.success && geminiResult.content && truthGate) truthGate.enforce(geminiResult.content, 'TeamRun:gemini');
        providerOutputs.push({
          provider: 'gemini',
          success: Boolean(geminiResult.success),
          from_cache: Boolean(geminiResult.from_cache),
          content: geminiResult.content || geminiResult.error || '',
          model: 'gemini-1.5-pro',
          transport: 'universal_ai_adaptor'
        });
      }

      if (providerOutputs.length === 0) {
        return res.status(412).json({
          error: 'No provider available for requested team run.',
          routedProvider,
          includeProviders: Array.from(requested)
        });
      }

      const synthesisInput = providerOutputs
        .map(item => `${item.provider.toUpperCase()}(${item.success ? 'ok' : 'error'}): ${item.content}`)
        .join('\\n\\n');
      const synthMessages = [
        { role: 'user', content: `Objective:\\n${objective}\\n\\nProvider outputs:\\n${synthesisInput}` }
      ];
      
      let synthesis = { message: null, provider: null, transport: null };
      if (runEvoLmTeamChat) {
         synthesis = await runEvoLmTeamChat(synthMessages, 'Synthesize the best final action plan with no hype. Keep it implementation-ready.');
      }
      
      const finalOutput = synthesis.message || providerOutputs.find(item => item.success)?.content || providerOutputs[0].content;

      const externalCalls = providerOutputs.filter(item => (item.provider === 'openai' || item.provider === 'gemini') && !item.from_cache).length;
      const cacheHits = providerOutputs.filter(item => item.from_cache).length;
      const creditsUsed = Math.max(1, externalCalls);
      
      if (CostFirewall) {
         await CostFirewall.deduct(orgId, '/api/evo-eyes/team-run', creditsUsed);
      }

      const receipt = {
        id: `team_run_${Date.now()}`,
        objective,
        orgId,
        routedProvider,
        mode,
        providers: providerOutputs.map(item => ({ provider: item.provider, success: item.success, from_cache: item.from_cache })),
        creditsUsed,
        timestamp: new Date().toISOString()
      };
      
      if (DATA_DIR) {
         writeFileSync(join(DATA_DIR, 'team_run_receipts.jsonl'), `${toSafeJson(receipt)}\\n`, { flag: 'a', encoding: 'utf8' });
      }

      let trainingFile = null;
      if (train && appendTrainingExamples) {
        trainingFile = appendTrainingExamples([
          {
            systemPrompt: 'You are PromptHouse Evo Studio memory trainer. Preserve cost-aware multi-provider orchestration steps.',
            input: `Objective: ${objective}\\nMode: ${mode}\\nRoutedProvider: ${routedProvider}`,
            output: finalOutput,
            transport: 'evo_team_run',
            timestamp: new Date().toISOString()
          }
        ], 'evo_team_run');
      }

      return res.json({
        success: true,
        teamRunId: receipt.id,
        routedProvider,
        evoEyes: {
          totalModules: evoEyesSnapshot.total_modules,
          topModules: evoEyesSnapshot.files
        },
        providerOutputs,
        synthesis: {
          provider: synthesis.provider || 'evo_lm',
          transport: synthesis.transport,
          output: finalOutput
        },
        costSummary: {
          externalCalls,
          cacheHits,
          creditsUsed
        },
        training: {
          enabled: Boolean(train),
          file: trainingFile
        }
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.get('/team-last', (req, res) => {
    try {
      if (!DATA_DIR) return res.json({ success: true, hasData: false, receipt: null });
      const file = join(DATA_DIR, 'team_run_receipts.jsonl');
      if (!existsSync(file)) {
        return res.json({ success: true, hasData: false, receipt: null });
      }
      const content = readFileSync(file, 'utf8').trim();
      if (!content) return res.json({ success: true, hasData: false, receipt: null });
      const lines = content.split('\\n').filter(Boolean);
      const latest = JSON.parse(lines[lines.length - 1]);
      return res.json({ success: true, hasData: true, receipt: latest });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}
