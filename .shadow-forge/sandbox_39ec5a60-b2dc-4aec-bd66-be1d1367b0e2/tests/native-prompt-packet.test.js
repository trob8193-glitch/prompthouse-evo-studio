import { existsSync } from 'fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROMPT_PACKET_PATH,
  buildPromptPacketPreview,
  extractPromptPacketAuthority,
} from '../src/native-prompt-packet.js';

describe('native prompt packet authority', () => {
  it('extracts mission phases, layers, and canonical claims from prompt packet text', () => {
    const authority = extractPromptPacketAuthority({
      filePath: 'C:/packet.docx',
      paragraphs: [
        'Prompt House Evo Studio',
        'Native AI Chat Prompt OS Build Packet',
        'Purpose: Preserve and extend the studio shell.',
        'Version: 1.0 | Build Target: PromptHouse Evo Studio',
        'EXISTING STUDIO SURFACES TO PRESERVE AND WIRE',
        '- Workspace Shell',
        '- Prompt Registry',
        'DEFAULT OUTPUT FORMAT FOR EVERY BUILD TURN',
        'Intent Layer',
        'Router Layer',
        'Proof Layer',
        'Intake',
        'Canon Check',
        'Route',
        'Build',
        'Verify',
        'Boundary',
        'Deliver',
      ],
    });

    expect(authority.sourceType).toBe('local_build_packet_docx');
    expect(authority.missionPhases).toEqual(['Intake', 'Canon Check', 'Route', 'Build', 'Verify', 'Boundary', 'Deliver']);
    expect(authority.operatingLayers.map((layer) => layer.label)).toEqual(['Intent Layer', 'Router Layer', 'Proof Layer']);
    expect(authority.canonicalClaims).toContain('Workspace Shell');
    expect(authority.canonicalClaims).toContain('Prompt Registry');
  });

  it('can preview the uploaded DOCX when it exists on this machine', () => {
    if (!existsSync(DEFAULT_PROMPT_PACKET_PATH)) return;

    const preview = buildPromptPacketPreview(DEFAULT_PROMPT_PACKET_PATH);

    expect(preview.authority.sourceType).toBe('local_build_packet_docx');
    expect(preview.authority.canonicalClaims.length).toBeGreaterThan(0);
  });
});
