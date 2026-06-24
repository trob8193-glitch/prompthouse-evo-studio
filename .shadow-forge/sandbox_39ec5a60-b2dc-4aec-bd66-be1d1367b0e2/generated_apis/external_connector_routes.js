/**
 * PromptHouse external connector routes.
 *
 * Top-level API for connector inventory and live provider probes.
 */

import { buildConnectorProbePlan, executeConnectorProbe } from '../lib/connectors/externalConnectorExecutor.js';
import { createProviderReceipt } from '../server/services/provider-receipts.js';
import {
  ensurePromptShellSchema,
  listPromptShellConnectors,
  resolvePromptShellConnector,
} from './promptshell_routes.js';

const ok = (res, payload = {}) => res.json({ success: true, ok: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, ok: false, error: error?.message || String(error) });

export function registerExternalConnectorRoutes(app, { db, connectorExecutor = executeConnectorProbe } = {}) {
  ensurePromptShellSchema(db);

  app.get('/api/connectors', (req, res) => {
    try {
      const connectors = listPromptShellConnectors(db).map((connector) => ({
        ...connector,
        probePlan: buildConnectorProbePlan(connector),
      }));
      ok(res, {
        count: connectors.length,
        connectors,
        truthState: 'LOCAL_ONLY',
      });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/connectors/:connectorId/probe', async (req, res) => {
    try {
      const connector = resolvePromptShellConnector(db, req.params.connectorId);
      if (!connector) {
        return fail(res, `Unknown connector: ${req.params.connectorId}`, 404);
      }

      const probe = await connectorExecutor(connector, {
        id: `probe_${Date.now().toString(36)}`,
        mode: 'live',
        ownerApproval: req.body?.ownerApproval,
        ownerApprovals: req.body?.ownerApprovals,
        receiptSink: req.body?.writeReceipt === false ? null : createProviderReceipt,
      });

      ok(res, {
        probe,
        truthState: probe.truthState,
      });
    } catch (error) {
      fail(res, error);
    }
  });

  console.log('External connector routes registered: /api/connectors/*');
}

export default registerExternalConnectorRoutes;
