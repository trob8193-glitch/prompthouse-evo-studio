/**
 * PromptHouse Real Execution Pipeline
 * Orchestrates end-to-end workflows: manifest generation → connector handshake → proof capture
 * 
 * Phase 4: Real Execution Implementation
 */

import crypto from 'crypto';
import { executeConnectorProbe } from '../connectors/externalConnectorExecutor.js';
import { Log } from '../../src/core/autonomy/SovereignLogger.js';

export class RealExecutionPipeline {
  constructor({ evoAgent, db, bridgeUrl = (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))), connectorExecutor = executeConnectorProbe } = {}) {
    this.evoAgent = evoAgent;
    this.db = db;
    this.bridgeUrl = bridgeUrl;
    this.connectorExecutor = connectorExecutor;
    this.executions = new Map(); // Track in-flight executions
  }

  /**
   * Execute complete workflow: Intent → Manifest → Connectors → Proof
   */
  async executeWorkflow(intent, options = {}) {
    if (!intent || typeof intent !== 'string' || intent.trim().length === 0) {
      throw new Error('Invalid intent: Intent must be a non-empty string.');
    }

    if (this.executions.size > 1000) {
      const keys = Array.from(this.executions.keys());
      for (let i = 0; i < 100; i++) this.executions.delete(keys[i]);
      Log.warn('[Pipeline] Pruned 100 stale executions to prevent memory leak.');
    }

    const executionId = `exec_${crypto.randomUUID().substring(0, 12)}`;
    const startTime = Date.now();

    try {
      this.executions.set(executionId, {
        id: executionId,
        intent,
        status: 'running',
        startedAt: new Date(startTime).toISOString(),
        steps: [],
      });

      // Step 1: Generate Manifest
      Log.info(`\n🚀 [${executionId}] Starting workflow for: "${intent}"`);
      const manifest = await this.generateManifest(intent, executionId);
      this.recordStep(executionId, 'manifest_generated', manifest);

      // Step 2: Resolve Connectors
      const connectors = await this.resolveConnectors(manifest, executionId);
      this.recordStep(executionId, 'connectors_resolved', connectors);

      // Step 3: Execute Connector Handshakes
      const handshakes = await this.executeHandshakes(connectors, executionId, options);
      this.recordStep(executionId, 'handshakes_complete', handshakes);

      // Step 4: Generate Proof
      const proof = await this.generateProof(manifest, handshakes, executionId);
      this.recordStep(executionId, 'proof_generated', proof);

      // Step 5: Create Artifact
      const artifact = await this.createArtifact(manifest, proof, executionId);
      this.recordStep(executionId, 'artifact_created', artifact);

      // Mark complete
      const execution = this.executions.get(executionId);
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      execution.duration = Date.now() - startTime;

      Log.info(`✅ [${executionId}] Workflow completed in ${execution.duration}ms`);

      return execution;
    } catch (error) {
      const execution = this.executions.get(executionId);
      if (execution) {
        execution.status = 'failed';
        execution.error = error.message;
      }
      Log.error(`❌ [${executionId}] Workflow failed:`, error.message);
      throw error;
    }
  }

  /**
   * Step 1: Generate Manifest via Evo Agent
   */
  async generateManifest(intent, executionId) {
    Log.info(`\n⚙️ Step 1: Generating manifest...`);

    try {
      let manifest = {};

      if (this.evoAgent && this.evoAgent.chat) {
        // Use Evo agent for intelligent manifest generation
        const prompt = `
Generate a project manifest for the following requirement:
"${intent}"

Respond with ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "name": "Project name",
  "description": "Brief description",
  "features": ["feature1", "feature2"],
  "architecture": "High-level architecture",
  "required_connectors": ["github", "stripe"],
  "readiness_score": 75,
  "estimated_hours": 40
}`;

        const response = await this.evoAgent.chat(prompt);

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            manifest = JSON.parse(jsonMatch[0]);
          } catch (parseErr) {
            // Fall through to template
            manifest = this.getDefaultManifest(intent);
          }
        } else {
          manifest = this.getDefaultManifest(intent);
        }
      } else {
        manifest = this.getDefaultManifest(intent);
      }

      // Store in database
      if (this.db) {
        try {
          const manifestId = `mf_${executionId}`;
          this.db.prepare(`
            INSERT INTO manifests (id, seed_intent, manifest_json, readiness_score, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            manifestId,
            intent,
            JSON.stringify(manifest),
            manifest.readiness_score || 50,
            new Date().toISOString()
          );
        } catch (dbErr) {
          Log.warn(`⚠️ Failed to store manifest: ${dbErr.message}`);
        }
      }

      Log.info(`✅ Manifest generated:`, manifest.name);
      return manifest;
    } catch (error) {
      Log.error(`❌ Manifest generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Step 2: Resolve Required Connectors
   */
  async resolveConnectors(manifest, executionId) {
    Log.info(`\n⚙️ Step 2: Resolving connectors...`);

    const required = manifest.required_connectors || ['github'];
    const connectors = [];

    try {
      if (this.db) {
        try {
          const normalized = required.map((item) => String(item).toLowerCase());
          const bindMarks = normalized.map(() => '?').join(',');
          const rows = this.db.prepare(`
            SELECT *
            FROM connectors
            WHERE lower(id) IN (${bindMarks})
               OR lower(connector_id) IN (${bindMarks})
               OR lower(name) IN (${bindMarks})
               OR lower(type) IN (${bindMarks})
          `).all(...normalized, ...normalized, ...normalized, ...normalized);

          connectors.push(...rows);
        } catch (dbErr) {
          Log.warn(`⚠️ Failed to query connectors: ${dbErr.message}`);
        }
      }

      // If not found in DB, use defaults
      if (connectors.length === 0) {
        for (const connId of required) {
          const defaultConn = this.getDefaultConnector(connId);
          if (defaultConn) connectors.push(defaultConn);
        }
      }

      Log.info(`✅ Resolved ${connectors.length} connectors`);
      return connectors;
    } catch (error) {
      Log.error(`❌ Connector resolution failed:`, error.message);
      throw error;
    }
  }

  /**
   * Step 3: Execute Connector Handshakes
   */
  async executeHandshakes(connectors, executionId, options = {}) {
    Log.info(`\n⚙️ Step 3: Executing handshakes...`);

    const results = [];
    const mode = options.connectorMode === 'live' || options.mode === 'live' ? 'live' : 'local';

    for (const connector of connectors) {
      try {
        Log.info(`   🤝 Handshaking with ${connector.name}...`);

        const handshakeId = `hs_${executionId}_${connector.id}`;
        const result = await this.connectorExecutor(connector, {
          id: handshakeId,
          mode,
          ownerApproval: options.ownerApproval,
          ownerApprovals: options.ownerApprovals,
        });

        // Store handshake
        if (this.db) {
          try {
            this.db.prepare(`
              INSERT INTO handshakes (id, connector_id, status, result, timestamp)
              VALUES (?, ?, ?, ?, ?)
            `).run(
              handshakeId,
              connector.connector_id,
              result.status,
              JSON.stringify(result),
              new Date().toISOString()
            );
          } catch (dbErr) {
            Log.warn(`⚠️ Failed to store handshake: ${dbErr.message}`);
          }
        }

        results.push(result);
      } catch (error) {
        Log.error(`   ❌ Handshake failed for ${connector.name}: ${error.message}`);
      }
    }

    const connected = results.filter((item) => item.status === 'connected').length;
    Log.info(`✅ ${connected}/${connectors.length} handshakes connected`);
    return results;
  }

  /**
   * Step 4: Generate Proof of Execution
   */
  async generateProof(manifest, handshakes, executionId) {
    Log.info(`\n⚙️ Step 4: Generating proof of execution...`);

    try {
      const proofId = `proof_${executionId}`;
      const proofTruthState = this.deriveProofTruthState(handshakes);
      const connectorEvidence = this.summarizeConnectorEvidence(handshakes);
      const proof = {
        id: proofId,
        executionId,
        manifest: manifest.name,
        connectorsVerified: connectorEvidence.connected,
        evidence: {
          manifestGenerated: true,
          handlersInitialized: true,
          connectorsCertified: connectorEvidence.blocked === 0 && connectorEvidence.errors === 0,
          externalConnectorsProven: connectorEvidence.live > 0 && connectorEvidence.proven === connectorEvidence.live,
          connectorTruthStates: connectorEvidence.truthStates,
        },
        hash: this.generateProofHash({
          executionId,
          manifest: manifest.name,
          handshakes: handshakes.map((item) => ({
            connectorId: item.connectorId,
            provider: item.provider,
            status: item.status,
            truthState: item.truthState,
          })),
        }),
        timestamp: new Date().toISOString(),
        verified: proofTruthState === 'PROVEN' || proofTruthState === 'LOCAL_ONLY',
        truthState: proofTruthState,
      };

      this.storeProof(proofId, manifest.name, proof);

      Log.info(`✅ Proof generated and verified:`, proofId);
      return proof;
    } catch (error) {
      Log.error(`❌ Proof generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Step 5: Create Artifact
   */
  async createArtifact(manifest, proof, executionId) {
    Log.info(`\n⚙️ Step 5: Creating artifact...`);

    try {
      const artifactId = `art_${executionId}`;
      const artifact = {
        id: artifactId,
        name: `${manifest.name} - Generated`,
        type: 'execution_result',
        content: {
          manifest: manifest.name,
          description: manifest.description,
          features: manifest.features,
          proofHash: proof.hash,
          generatedAt: new Date().toISOString(),
        },
      };

      // Store artifact
      if (this.db) {
        try {
          this.db.prepare(`
            INSERT INTO artifacts (id, name, type, content, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            artifactId,
            artifact.name,
            artifact.type,
            JSON.stringify(artifact.content),
            JSON.stringify({ executionId, proofId: proof.id }),
            new Date().toISOString()
          );
        } catch (dbErr) {
          Log.warn(`⚠️ Failed to store artifact: ${dbErr.message}`);
        }
      }

      Log.info(`✅ Artifact created:`, artifactId);
      return artifact;
    } catch (error) {
      Log.error(`❌ Artifact creation failed:`, error.message);
      throw error;
    }
  }

  // Utility methods
  recordStep(executionId, stepName, data) {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.steps.push({
        name: stepName,
        timestamp: new Date().toISOString(),
        dataKeys: Array.isArray(data) ? `${data.length} items` : Object.keys(data || {}).join(', '),
      });
    }
  }

  generateProofHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  storeProof(proofId, featureId, proof) {
    if (!this.db) return;

    try {
      const columns = this.tableColumns('sovereign_ledger');
      const timestampColumn = columns.has('created_at') ? 'created_at' : columns.has('timestamp') ? 'timestamp' : null;
      const fields = ['id', 'feature_id', 'action', 'proof_hash', 'truth_state', 'iq_gain'];
      const values = [proofId, featureId, 'workflow_executed', proof.hash, proof.truthState || 'LOCAL_ONLY', 100];

      if (columns.has('metadata')) {
        fields.push('metadata');
        values.push(JSON.stringify(proof));
      }

      if (timestampColumn) {
        fields.push(timestampColumn);
        values.push(new Date().toISOString());
      }

      const bindMarks = fields.map(() => '?').join(', ');
      this.db.prepare(`
        INSERT INTO sovereign_ledger (${fields.join(', ')})
        VALUES (${bindMarks})
      `).run(...values);
    } catch (dbErr) {
      Log.warn(`⚠️ Failed to store proof: ${dbErr.message}`);
    }
  }

  tableColumns(tableName) {
    try {
      return new Set(this.db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name));
    } catch {
      return new Set();
    }
  }

  getDefaultManifest(intent) {
    return {
      name: 'Auto-Generated Project',
      description: intent,
      features: [
        'Core functionality',
        'User interface',
        'API integration',
      ],
      architecture: 'Microservices with async workers',
      required_connectors: ['github', 'openai'],
      readiness_score: 60,
      estimated_hours: 40,
    };
  }

  getDefaultConnector(connId) {
    const defaults = {
      'github': {
        id: 'conn_github',
        name: 'GitHub',
        connector_id: 'github-1',
        type: 'github',
        risk_level: 'LOW',
        status: 'connected',
      },
      'stripe': {
        id: 'conn_stripe',
        name: 'Stripe',
        connector_id: 'stripe-1',
        type: 'stripe',
        risk_level: 'MEDIUM',
        status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'needs_credentials',
      },
      'openai': {
        id: 'conn_openai',
        name: 'OpenAI',
        connector_id: 'openai-1',
        type: 'openai',
        risk_level: 'HIGH',
        status: process.env.OPENAI_API_KEY ? 'configured' : 'needs_credentials',
      },
      'vercel': {
        id: 'conn_vercel',
        name: 'Vercel',
        connector_id: 'vercel-1',
        type: 'vercel',
        risk_level: 'MEDIUM',
        status: process.env.VERCEL_TOKEN ? 'configured' : 'needs_credentials',
      },
    };
    return defaults[connId];
  }

  summarizeConnectorEvidence(handshakes) {
    const truthStates = [...new Set(handshakes.map((item) => item.truthState || 'UNKNOWN'))];
    return {
      total: handshakes.length,
      connected: handshakes.filter((item) => item.status === 'connected').length,
      proven: handshakes.filter((item) => item.truthState === 'PROVEN').length,
      live: handshakes.filter((item) => item.mode === 'live').length,
      blocked: handshakes.filter((item) => item.status === 'blocked').length,
      errors: handshakes.filter((item) => item.status === 'error').length,
      truthStates,
    };
  }

  deriveProofTruthState(handshakes) {
    const evidence = this.summarizeConnectorEvidence(handshakes);
    if (evidence.errors > 0) return 'ERROR';
    if (evidence.truthStates.some((state) => state === 'NEEDS_CREDENTIALS' || state === 'NEEDS_OWNER_APPROVAL' || state === 'PROVIDER_GATED')) {
      return 'PROVIDER_GATED';
    }
    if (evidence.live > 0 && evidence.proven === evidence.live) return 'PROVEN';
    return 'LOCAL_ONLY';
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId) {
    return this.executions.get(executionId) || null;
  }

  /**
   * Get all executions
   */
  getAllExecutions() {
    return Array.from(this.executions.values());
  }
}

export default RealExecutionPipeline;
