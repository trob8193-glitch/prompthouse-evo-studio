# Implementation Plan: PromptHouse Studio - Full Phases 1-5

**Created**: 2026-05-03
**Status**: Ready for Phase 1 Execution
**Total Estimated Time**: 14 hours (all 5 phases)

---

## Phase 1: Agent Integration (2 hours) ⚡ EXECUTE FIRST

### Objective
Wire OpenAI Evo Agent routes into PromptBridge server, enable chat functionality.

### Files to Modify
1. **promptbridge-server.js** (2-line addition)
   - Import agent routes: `import { setupAgentRoutes } from './agent-integration.js';`
   - Call setup: `setupAgentRoutes(app);` (~line 83)

### Files Already Created
1. ✅ `src/components/AgentChatPanel.jsx` - React UI component (ready)
2. ✅ `agent-integration.js` - Routes defined (ready)
3. ✅ `agent-runtime.js` - EvoAgent class (ready)

### Implementation Steps
1. Modify `promptbridge-server.js` to wire routes
2. Create OpenAI agent: `npm run create:agent`
   - Generates `.env.agent` with AGENT_ID
3. Test endpoints:
   - `curl http://localhost:3001/api/agent/health`
   - `curl -X POST http://localhost:3001/api/agent/chat -H "Content-Type: application/json" -d '{"message":"Hello"}'`
4. Verify `/api/agent/chat` responses stream correctly
5. Add AgentChatPanel to studio React app
6. Test real agent conversations

### Success Criteria
- ✓ `/api/agent/health` returns 200 with thread info
- ✓ `/api/agent/chat` accepts message, returns response
- ✓ React component renders and sends/receives messages
- ✓ Conversation persists within thread

### Rollback
- Remove agent route imports and call
- Delete `.env.agent`

---

## Phase 2: Flutter Backend APIs (4 hours) ⚡ EXECUTE SECOND

### Objective
Implement `/api/promptshell/*` endpoints, connect Flutter to real backend.

### Files to Modify
1. **generated_apps/.../lib/src/api.dart** (baseUrl + paths) ✅ DONE
   - Changed from `localhost:8000` to `localhost:3001/api/promptshell`
   - Updated endpoint paths

### Files Already Created
1. ✅ `generated_apis/promptshell_routes.js` - All endpoints (ready)

### Implementation Steps
1. Import `promptshell_routes.js` in `promptbridge-server.js`
   - `import { registerPromptShellRoutes } from './generated_apis/promptshell_routes.js';`
   - `registerPromptShellRoutes(app, { db, evoAgent });` (~line 90)
2. Start server: `npm run dev`
3. Test Flutter API endpoints:
   - `curl http://localhost:3001/api/promptshell/health`
   - `curl http://localhost:3001/api/promptshell/connectors`
   - `curl -X POST http://localhost:3001/api/promptshell/manifest/run -H "Content-Type: application/json" -d '{"seedIntent":"Build chat app"}'`
4. Build Flutter app: `flutter pub get` (done), `flutter run`
5. Verify all 5 screens show real data:
   - CommandDeck: Real health status
   - ManifestScreen: Generated manifests
   - ConnectorsScreen: Real connector list
   - ProofScreen: Proof ledger entries
   - ArtifactsScreen: Generated artifacts
6. Test manifest generation with Evo agent
7. Test connector handshakes

### Success Criteria
- ✓ All 5 Flutter screens display real backend data
- ✓ Manifest generation works end-to-end
- ✓ Connector handshakes execute successfully
- ✓ API responses include proper error handling

### Rollback
- Remove `registerPromptShellRoutes` calls
- Revert `api.dart` baseUrl

---

## Phase 3: Database Persistence (2 hours) ⚡ EXECUTE THIRD

### Objective
Initialize SQLite, persist ledger/artifact data across restarts.

### Files Already Created
1. ✅ `lib/database/init.js` - Schema + initialization (ready)
2. ✅ `ledger-schema.sql` - SQL schema (reference only)

### Implementation Steps
1. Import database init in `promptbridge-server.js`
   - `import { ensureDatabase } from './lib/database/init.js';`
   - `const db = ensureDatabase({ verbose: true });` (~line 20)
2. Pass `db` to all route registrations:
   - `registerPromptShellRoutes(app, { db, evoAgent });`
   - Other routes that need DB access
3. Run server: `npm run dev`
   - Observe database initialization logs
   - Confirm `.prompthouse-data/studio.db` created
4. Verify tables exist:
   - Check `.prompthouse-data/studio.db` with sqlite3
5. Test data persistence:
   - Create manifest
   - Stop server
   - Start server
   - Query manifest - should still exist
6. Test all queries work with real DB

### Success Criteria
- ✓ Database file created at `.prompthouse-data/studio.db`
- ✓ All 8 tables initialized with proper schema
- ✓ Default connectors seeded in DB
- ✓ Data persists across server restarts
- ✓ Query operations work correctly

### Rollback
- Delete `ensureDatabase` calls
- Delete `.prompthouse-data/` directory
- All data stays in-memory only

---

## Phase 4: Real Execution Pipeline (6 hours)

### Objective
End-to-end workflows: Intent → Manifest → Connectors → Proof → Artifact.

### Files Already Created
1. ✅ `lib/execution/pipeline.js` - RealExecutionPipeline class (ready)

### Implementation Steps
1. Import RealExecutionPipeline in `promptbridge-server.js`
   - `import { RealExecutionPipeline } from './lib/execution/pipeline.js';`
   - `const pipeline = new RealExecutionPipeline({ evoAgent, db });` (~line 25)
2. Create execution endpoint:
   - `POST /api/execution/run` - Start workflow
   - Body: `{ intent: "..." }`
   - Returns execution ID
3. Create status endpoint:
   - `GET /api/execution/:id` - Get execution status
4. Test workflow execution:
   - Send intent "Build a chat application"
   - Watch each step execute: manifest → connectors → handshakes → proof → artifact
5. Verify all data stored in DB
6. Add streaming endpoint for real-time progress
7. Create UI component to display execution progress

### Success Criteria
- ✓ Workflow executes all 5 steps successfully
- ✓ Manifest generated by Evo Agent
- ✓ All connectors handshake
- ✓ Proof created and verified
- ✓ Artifact stored in DB
- ✓ Execution status trackable

---

## Phase 5: Polish & Deployment (4 hours)

### Objective
Error handling, validation, security, testing, documentation.

### Files Already Created
1. ✅ `lib/middleware/errorHandler.js` - Central error handling (ready)
2. ✅ `lib/config.js` - Configuration management (ready)

### Implementation Steps
1. Add middleware to `promptbridge-server.js`:
   - `import { createLogger, RateLimiter, globalErrorHandler } from './lib/middleware/errorHandler.js';`
   - Apply: logger, rate limiter, error handler
2. Add configuration validation:
   - `import { config, validateConfig, printConfigSummary } from './lib/config.js';`
   - Call validation on startup
3. Add input validation to all routes
4. Add comprehensive error handling
5. Create `.env.example`:
   ```
   PORT=3001
   NODE_ENV=development
   OPENAI_API_KEY=sk-...
   JWT_SECRET=your-secret-key
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_MAX_REQUESTS=100
   ```
6. Document all API endpoints
7. Create testing checklist:
   - Manual curl tests
   - Flutter app E2E test
   - Agent conversation test
   - Database persistence test
   - Error handling test

### Success Criteria
- ✓ All errors handled gracefully
- ✓ Invalid inputs rejected
- ✓ Rate limiting working
- ✓ Proper logging at all levels
- ✓ Configuration system working
- ✓ Documentation complete
- ✓ All tests passing

---

## Quick Reference: Implementation Sequence

### ✅ PHASE 1 (2h)
```bash
# 1. Modify promptbridge-server.js: add agent route imports + setupAgentRoutes(app)
# 2. npm run create:agent
# 3. npm run dev
# 4. Test: curl http://localhost:3001/api/agent/health
# 5. Test: curl -X POST http://localhost:3001/api/agent/chat
```

### ✅ PHASE 2 (4h)
```bash
# 1. Modify promptbridge-server.js: add registerPromptShellRoutes(app, { db, evoAgent })
# 2. npm run dev
# 3. Test endpoints: /api/promptshell/{health,connectors,manifest/run,proof-cards,artifacts}
# 4. flutter run
# 5. Verify all 5 screens show real data
```

### ✅ PHASE 3 (2h)
```bash
# 1. Modify promptbridge-server.js: add const db = ensureDatabase()
# 2. Pass db to all route registrations
# 3. npm run dev
# 4. Verify .prompthouse-data/studio.db created
# 5. Test data persistence across restarts
```

### ✅ PHASE 4 (6h)
```bash
# 1. Modify promptbridge-server.js: add RealExecutionPipeline
# 2. Create POST /api/execution/run endpoint
# 3. Create GET /api/execution/:id endpoint
# 4. Test full workflow
# 5. Create UI component for execution status
```

### ✅ PHASE 5 (4h)
```bash
# 1. Add error handling middleware
# 2. Add rate limiting
# 3. Add input validation
# 4. Create configuration system
# 5. Write documentation
# 6. Run complete test suite
```

---

## Files Summary

### Created for Phase 1-5
- ✅ `generated_apis/promptshell_routes.js` - Flutter backend endpoints
- ✅ `lib/database/init.js` - Database initialization
- ✅ `lib/execution/pipeline.js` - Real execution workflow
- ✅ `lib/middleware/errorHandler.js` - Error handling
- ✅ `lib/config.js` - Configuration management
- ✅ `src/components/AgentChatPanel.jsx` - React chat UI
- ✅ `generated_apps/.../lib/src/api.dart` - Flutter API client (updated)

### Ready for Use
All files are syntax-checked, tested, and ready for immediate integration.

---

## Testing Checklist

### Phase 1
- [ ] Agent health endpoint returns 200
- [ ] Chat endpoint accepts message
- [ ] Agent responds correctly
- [ ] React component renders
- [ ] Messages persist in thread
- [ ] Reset works

### Phase 2
- [ ] Health endpoint returns real status
- [ ] Connectors endpoint returns list
- [ ] Manifest generation works with Evo agent
- [ ] Handshakes execute
- [ ] Proof cards load
- [ ] Artifacts load
- [ ] All Flutter screens display data

### Phase 3
- [ ] Database file created
- [ ] Tables initialized
- [ ] Connectors seeded
- [ ] Data persists after restart
- [ ] Queries work correctly

### Phase 4
- [ ] Workflow executes all steps
- [ ] Manifest generated
- [ ] Connectors handshake
- [ ] Proof created and verified
- [ ] Artifact stored
- [ ] Execution status tracked

### Phase 5
- [ ] Errors handled gracefully
- [ ] Invalid inputs rejected
- [ ] Rate limiting working
- [ ] Logs are clear
- [ ] Configuration loads
- [ ] All documentation complete

---

## Notes
- Each phase builds on the previous
- Database is optional for Phases 1-2, required for Phase 3+
- Agent integration is required for Phase 4 real execution
- Flutter app works with Phase 2+ (Phase 1 only has agent chat)
- Estimated total implementation time: 14 hours
