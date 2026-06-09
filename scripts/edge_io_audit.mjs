#!/usr/bin/env node
import { buildEdgeIoAudit } from '../src/core/edge-io/EdgeIoAudit.js';

const report = buildEdgeIoAudit({ rootDir: process.cwd() });
console.log(JSON.stringify({
  truthState: report.truthState,
  surfaces: report.surfaces.length,
  blockers: report.blockers.length,
  reportPath: report.reportPath,
  blockedSurfaces: report.blockers.map((item) => item.surface)
}, null, 2));
