import { describe, expect, it } from 'vitest';
import {
  buildProjectDuplicateReport,
  calculateProjectCoverage,
  createProjectHandshakeRecord,
  detectSourceType,
  detectSourceAccess,
  mergeProjectHandshakeRecord,
  normalizeProjectUrl,
} from '../src/project-handshake.js';

describe('Project source handshake', () => {
  it('normalizes source URLs for stable duplicate checks', () => {
    const a = normalizeProjectUrl('HTTPS://ChatGPT.com/g/g-p-abc/project/?b=2&a=1#top');
    const b = normalizeProjectUrl('https://chatgpt.com/g/g-p-abc/project?a=1&b=2');
    expect(a).toBe(b);
  });

  it('marks private ChatGPT project links as blocked until readable source exists', () => {
    const access = detectSourceAccess({
      url: 'https://chatgpt.com/g/g-p-abc/project',
      httpStatus: 200,
      contentType: 'text/html',
      text: '<html><body>Log in to ChatGPT</body></html>',
    });

    expect(access.canVerifyParity).toBe(false);
    expect(access.state).toBe('blocked_login_required');
  });

  it('does not create a second record for the same source URL', () => {
    const first = createProjectHandshakeRecord({
      url: 'https://chatgpt.com/g/g-p-abc/project',
      fetchProbe: { httpStatus: null },
      timestamp: '2026-05-03T10:00:00.000Z',
    });
    const second = createProjectHandshakeRecord({
      url: 'https://chatgpt.com/g/g-p-abc/project/',
      fetchProbe: { httpStatus: null },
      timestamp: '2026-05-03T10:01:00.000Z',
    });
    const merged = mergeProjectHandshakeRecord([first], second);

    expect(merged.added).toBe(false);
    expect(merged.dedupeStatus).toBe('duplicate_reused');
    expect(merged.records).toHaveLength(1);
    expect(buildProjectDuplicateReport(merged.records).duplicateFree).toBe(true);
  });

  it('only reports complete coverage when every readable source claim is matched', () => {
    const coverage = calculateProjectCoverage(
      ['PromptBridge status heartbeat', 'Project link duplicate audit'],
      ['PromptBridge status heartbeat', 'Project link duplicate audit', 'Proof receipts'],
      { canVerifyParity: true },
    );

    expect(coverage.status).toBe('complete');
    expect(coverage.coveragePercent).toBe(100);
  });

  it('classifies local DOCX sources as build packet imports', () => {
    const type = detectSourceType({
      url: 'file:///C:/Users/Noname/Downloads/Prompt_House_Evo_Native_AI_Chat_Prompt_OS_Build_Packet.docx',
      sourcePath: 'C:/Users/Noname/Downloads/Prompt_House_Evo_Native_AI_Chat_Prompt_OS_Build_Packet.docx',
      packetAuthority: { title: 'Prompt House Evo Studio' },
    });

    const record = createProjectHandshakeRecord({
      url: 'file:///C:/Users/Noname/Downloads/Prompt_House_Evo_Native_AI_Chat_Prompt_OS_Build_Packet.docx',
      sourcePath: 'C:/Users/Noname/Downloads/Prompt_House_Evo_Native_AI_Chat_Prompt_OS_Build_Packet.docx',
      sourceText: 'Workspace Shell\nMission Control\nPrompt Registry',
      featureClaims: ['Workspace Shell', 'Mission Control', 'Prompt Registry'],
      localCapabilities: ['Workspace Shell', 'Mission Control', 'Prompt Registry'],
      packetAuthority: { promptCells: [{ id: 'packet_01' }], missionPhases: ['Intake', 'Build'] },
    });

    expect(type).toBe('local_build_packet_docx');
    expect(record.sourceType).toBe('local_build_packet_docx');
    expect(record.coverage.coveragePercent).toBe(100);
  });
});
