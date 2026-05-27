import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { GhostEditorLogic } from '../src/features/ghost_editor_logic.js';
import { createOwnerApprovalEnvelope } from '../src/owner-approval.js';

function createTempCodeFile(initialSource = 'export const value = 1;\n') {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost-editor-'));
  const targetPath = path.join(tempDir, 'sample.js');
  fs.writeFileSync(targetPath, initialSource, 'utf8');
  return { tempDir, targetPath };
}

function createTempCoreCodeFile(initialSource = 'export const coreValue = 1;\n') {
  const tempDir = fs.mkdtempSync(path.join(process.cwd(), 'src', 'core', '.ghost-editor-'));
  const targetPath = path.join(tempDir, 'sample.js');
  fs.writeFileSync(targetPath, initialSource, 'utf8');
  return { tempDir, targetPath };
}

describe('GhostEditorLogic merge safety', () => {
  it('rejects API error payloads and keeps the file unchanged', () => {
    const { tempDir, targetPath } = createTempCodeFile();
    const logic = new GhostEditorLogic(null);
    const original = fs.readFileSync(targetPath, 'utf8');

    expect(() =>
      logic.mergeOptimization(
        targetPath,
        '429 You exceeded your current quota, please check your plan and billing details.',
      ),
    ).toThrow('payload looks like an API or HTML error response');

    const after = fs.readFileSync(targetPath, 'utf8');
    expect(after).toBe(original);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('accepts valid code payloads and writes the file', () => {
    const { tempDir, targetPath } = createTempCodeFile('export const value = 1;\n');
    const logic = new GhostEditorLogic(null);

    const result = logic.mergeOptimization(targetPath, 'export const value = 2;\n');

    expect(result.success).toBe(true);
    expect(fs.readFileSync(targetPath, 'utf8')).toContain('value = 2');
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('blocks src/core merges without explicit owner approval', () => {
    const { tempDir, targetPath } = createTempCoreCodeFile();
    const logic = new GhostEditorLogic(null);
    const original = fs.readFileSync(targetPath, 'utf8');

    expect(() => logic.mergeOptimization(targetPath, 'export const coreValue = 2;\n')).toThrow(
      'Missing explicit owner approval for scope: core_merge',
    );

    expect(fs.readFileSync(targetPath, 'utf8')).toBe(original);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('allows src/core merges when explicit owner approval is present', () => {
    const { tempDir, targetPath } = createTempCoreCodeFile();
    const logic = new GhostEditorLogic(null);
    const approval = createOwnerApprovalEnvelope({
      granted: true,
      actor: 'studio_owner',
      scope: 'core_merge',
      receiptId: 'core_merge_receipt_001',
      grantedAt: '2026-05-10T13:55:00.000Z',
    });

    const result = logic.mergeOptimization(targetPath, 'export const coreValue = 3;\n', approval);

    expect(result.success).toBe(true);
    expect(fs.readFileSync(targetPath, 'utf8')).toContain('coreValue = 3');
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
