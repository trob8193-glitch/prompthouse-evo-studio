#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {
  getEnterpriseArchitectureStatus,
  getEnterpriseExpansionRoadmap,
} from '../src/core/architecture/EnterpriseArchitectureContract.js';
import {
  getQuadBrainStatus,
  routeQuadBrainSurface,
  QUADBRAIN_SURFACES,
  QUADBRAIN_ABILITY_CLASSES,
} from '../src/core/quadbrain/index.js';

const rootDir = process.cwd();
const outDir = path.join(rootDir, '.prompthouse-data', 'architecture');
const compact = process.argv.includes('--compact');
const noWrite = process.argv.includes('--no-write');

const architecture = getEnterpriseArchitectureStatus({ compact });
const roadmap = getEnterpriseExpansionRoadmap();
const quadbrain = getQuadBrainStatus();
const routes = [
  routeQuadBrainSurface({
    surface: QUADBRAIN_SURFACES.ENTERPRISE_ARCHITECTURE_PANEL,
    abilityClass: QUADBRAIN_ABILITY_CLASSES.REPORT,
  }),
  routeQuadBrainSurface({
    surface: QUADBRAIN_SURFACES.CUSTOMER_AUDIT_REPORT,
    abilityClass: QUADBRAIN_ABILITY_CLASSES.RELEASE_VERDICT,
  }),
  routeQuadBrainSurface({
    surface: QUADBRAIN_SURFACES.COST_FIREWALL_CONSOLE,
    abilityClass: QUADBRAIN_ABILITY_CLASSES.GOVERN_COST,
  }),
  routeQuadBrainSurface({
    surface: QUADBRAIN_SURFACES.MEDIA_MODEL_GOVERNANCE_PANEL,
    abilityClass: QUADBRAIN_ABILITY_CLASSES.GOVERN_MEDIA_MODEL,
  }),
];

const failedRoutes = routes.filter(route => !route.success);
const receipt = {
  success: failedRoutes.length === 0,
  truthState: failedRoutes.length ? 'ENTERPRISE_ARCHITECTURE_ROUTE_REVIEW_REQUIRED' : 'ENTERPRISE_ARCHITECTURE_READY_WITH_ROUTE_PROOF',
  generatedAt: new Date().toISOString(),
  architecture,
  roadmap,
  quadbrain: {
    truthLabel: quadbrain.truthLabel,
    brainCount: quadbrain.canon.brains.length,
    surfaces: quadbrain.surfaces,
  },
  routeProof: routes,
  failedRoutes,
};

if (!noWrite) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'latest.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.success ? 0 : 1);
