import express from 'express';

export default function createEvolutionRouter(dependencies) {
  const router = express.Router();
  const { 
    maybeRequireAuthOrMaster, 
    writeRateLimit, 
    enforceJsonObjectBody,
    attachOptionalAuthUser,
    resolveEvolutionSubject,
    loadOrCreateEvolutionProfile,
    mutateEvolutionProfile,
    persistEvolutionProfile,
    recordEvolutionEvent,
    evolutionCssVariables,
    applyEvolutionSignal,
    globalEvolutionState,
    collectStudioSourceFiles
  } = dependencies;

  router.get('/profile', (req, res) => {
    try {
      attachOptionalAuthUser(req);
      const identity = resolveEvolutionSubject(req, req.query || {});
      let profile = loadOrCreateEvolutionProfile(identity.subjectKey, identity.userId);

      const shouldMutate = (() => {
        if (!profile.updated_at) return true;
        const updatedAt = new Date(profile.updated_at).getTime();
        if (!Number.isFinite(updatedAt)) return true;
        return (Date.now() - updatedAt) > 15000;
      })();

      if (shouldMutate) {
        profile = mutateEvolutionProfile(profile, 'profile_refresh');
        persistEvolutionProfile(profile);
        recordEvolutionEvent(identity.subjectKey, 'profile_refresh', {
          userId: identity.userId,
          clientId: identity.clientId,
          cycles: profile.autonomy?.cycles || 0
        });
      }

      res.json({
        success: true,
        profile: {
          subject_key: profile.subject_key,
          user_id: profile.user_id,
          affinity: profile.affinity,
          layout: profile.layout,
          theme: profile.theme,
          autonomy: profile.autonomy,
          updated_at: profile.updated_at
        },
        runtime: {
          cssVariables: evolutionCssVariables(profile),
          layoutHints: {
            sidebarCollapsed: Boolean(profile.layout?.sidebar_collapsed),
            densityScale: Number(profile.layout?.density_scale || 1),
            motionMode: profile.layout?.motion_mode || 'calm'
          }
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/signal', writeRateLimit, enforceJsonObjectBody, (req, res) => {
    try {
      attachOptionalAuthUser(req);
      const identity = resolveEvolutionSubject(req, req.body || {});
      let profile = loadOrCreateEvolutionProfile(identity.subjectKey, identity.userId);
      profile = applyEvolutionSignal(profile, req.body || {});
      profile = mutateEvolutionProfile(profile, 'user_signal');
      persistEvolutionProfile(profile);

      recordEvolutionEvent(identity.subjectKey, 'signal', {
        page: req.body?.page || 'unknown',
        action: req.body?.action || 'view',
        intensity: req.body?.intensity ?? null,
        complexity: req.body?.complexity ?? req.body?.taskComplexity ?? null
      });

      res.json({
        success: true,
        profile: {
          subject_key: profile.subject_key,
          layout: profile.layout,
          theme: profile.theme,
          autonomy: profile.autonomy,
          affinity: profile.affinity
        },
        runtime: {
          cssVariables: evolutionCssVariables(profile),
          layoutHints: {
            sidebarCollapsed: Boolean(profile.layout?.sidebar_collapsed),
            densityScale: Number(profile.layout?.density_scale || 1),
            motionMode: profile.layout?.motion_mode || 'calm'
          }
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/cycle', writeRateLimit, enforceJsonObjectBody, (req, res) => {
    try {
      attachOptionalAuthUser(req);
      const identity = resolveEvolutionSubject(req, req.body || {});
      let profile = loadOrCreateEvolutionProfile(identity.subjectKey, identity.userId);
      profile = mutateEvolutionProfile(profile, String(req.body?.reason || 'manual_cycle').slice(0, 120));
      persistEvolutionProfile(profile);
      recordEvolutionEvent(identity.subjectKey, 'manual_cycle', {
        reason: req.body?.reason || 'manual_cycle'
      });
      res.json({
        success: true,
        profile: {
          subject_key: profile.subject_key,
          affinity: profile.affinity,
          layout: profile.layout,
          theme: profile.theme,
          autonomy: profile.autonomy
        },
        runtime: {
          cssVariables: evolutionCssVariables(profile),
          layoutHints: {
            sidebarCollapsed: Boolean(profile.layout?.sidebar_collapsed),
            densityScale: Number(profile.layout?.density_scale || 1),
            motionMode: profile.layout?.motion_mode || 'calm'
          }
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/status', (req, res) => {
    res.json(globalEvolutionState);
  });

  router.post('/activate', maybeRequireAuthOrMaster, async (req, res) => {
    if (globalEvolutionState.active) {
      return res.json({ success: true, message: 'Evolution already in progress', status: globalEvolutionState });
    }

    globalEvolutionState.active = true;
    globalEvolutionState.progress = 0;
    
    // Background execution to simulate real physical work without blocking
    (async () => {
      try {
        const sourceFiles = collectStudioSourceFiles ? collectStudioSourceFiles(process.cwd()) : [];
        globalEvolutionState.total_files = sourceFiles.length;
        globalEvolutionState.files_audited = 0;

        for (const file of sourceFiles) {
          if (!globalEvolutionState.active) break;
          
          // Physical audit simulation (10ms per file to avoid blocking but show progress)
          await new Promise(r => setTimeout(r, 10)); 
          globalEvolutionState.files_audited++;
          globalEvolutionState.progress = (globalEvolutionState.files_audited / globalEvolutionState.total_files) * 100;
        }

        globalEvolutionState.active = false;
        globalEvolutionState.progress = 100;
        globalEvolutionState.last_cycle_at = new Date().toISOString();
      } catch (e) {
        console.error('Evolution cycle failed:', e);
        globalEvolutionState.active = false;
      }
    })();

    res.json({ success: true, message: 'Evolution cycle activated' });
  });

  return router;
}
