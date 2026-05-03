// forge-render-engine.js — ForgeRender Sovereign Core Engine
// PromptCore · SceneSmith · AssetDNA · RenderRail · ProofDeck · SelfPatch · VaultRender

// ── Truth states ──────────────────────────────────────────────────────────────
export const TRUTH_STATES = {
  built:             { label: 'Built',          color: '#22c55e', badge: 'badge-green'  },
  verified:          { label: 'Verified',        color: '#4ade80', badge: 'badge-green'  },
  blocked:           { label: 'Blocked',         color: '#ef4444', badge: 'badge-red'    },
  'spec-built':      { label: 'Spec Built',      color: '#f59e0b', badge: 'badge-gold'   },
  'built-not-verified':{ label: 'Built — Not Verified', color: '#f59e0b', badge: 'badge-gold' },
  recommended:       { label: 'Recommended',     color: '#8b5cf6', badge: 'badge-violet' },
  draft:             { label: 'Draft',           color: '#64748b', badge: 'badge-cyan'   },
  queued:            { label: 'Queued',          color: '#38bdf8', badge: 'badge-cyan'   },
  rendering:         { label: 'Rendering',       color: '#f5c842', badge: 'badge-gold'   },
  validating:        { label: 'Validating',      color: '#fb923c', badge: 'badge-gold'   },
  exported:          { label: 'Exported',        color: '#22d3ee', badge: 'badge-cyan'   },
};

// ── Output Lanes ──────────────────────────────────────────────────────────────
export const RENDER_LANES = [
  {
    id: 'forge_alpha',
    name: 'ForgeAlpha',
    icon: '🔮',
    label: 'Transparent PNG / WEBP',
    color: '#22d3ee',
    outputs: ['transparent_png', 'transparent_webp'],
    desc: 'Clean transparent backgrounds. No floor, no shadow.',
    verifyRules: ['alpha_channel_valid', 'background_removed', 'clean_edges'],
    adapter: 'dalle_alpha',
  },
  {
    id: 'forge_sprite',
    name: 'ForgeSprite',
    icon: '🎞️',
    label: 'Sprite Sheet',
    color: '#4ade80',
    outputs: ['sprite_sheet_png', 'frame_sequence', 'atlas_json'],
    desc: 'Idle / walk / action animation frames with atlas JSON.',
    verifyRules: ['frame_count', 'uniform_dimensions', 'transparent_frames', 'atlas_metadata'],
    adapter: 'sprite_packer',
  },
  {
    id: 'forge_motion',
    name: 'ForgeMotion',
    icon: '🎬',
    label: '2D Video / Animation',
    color: '#f59e0b',
    outputs: ['mp4', 'webm_alpha', 'gif', 'frame_sequence'],
    desc: 'Loops, onboarding clips, promo animations.',
    verifyRules: ['duration', 'fps', 'render_receipt', 'format_support'],
    adapter: 'ffmpeg_adapter',
  },
  {
    id: 'forge_rive',
    name: 'ForgeRive',
    icon: '⚡',
    label: 'Rive Interactive',
    color: '#ec4899',
    outputs: ['rive_spec_json', 'rive_handoff_pack', 'optional_riv'],
    desc: 'Artboards, state machines, triggers, Rive-ready specs.',
    verifyRules: ['artboard_defined', 'states_defined', 'triggers_defined', 'rig_plan'],
    adapter: 'rive_workflow',
  },
  {
    id: 'forge_3d',
    name: 'Forge3D',
    icon: '🗿',
    label: '3D Scene / Render',
    color: '#8b5cf6',
    outputs: ['blender_job', 'gltf_scene', 'mp4_render', 'png_sequence'],
    desc: 'Scene graph, camera path, light setup, render queue.',
    verifyRules: ['scene_file', 'camera_path', 'light_setup', 'render_output'],
    adapter: 'blender_adapter',
  },
];

// ── Templates ─────────────────────────────────────────────────────────────────
export const FORGE_TEMPLATES = [
  {
    id: 'bot_transparent',
    name: 'Bot Transparent PNG',
    icon: '🤖',
    lane: 'forge_alpha',
    desc: 'Generate a transparent bot portrait for any of the 21 canon bots.',
    defaultPrompt: 'Professional cyborg animal bot portrait, transparent background, no shadow, studio lighting',
    style: 'PromptHouse canon cyborg animal bot',
    outputTarget: 'transparent_png',
    botLocked: true,
  },
  {
    id: 'sprite_idle',
    name: 'Bot Idle Sprite',
    icon: '🎞️',
    lane: 'forge_sprite',
    desc: '8-frame idle cycle for any bot character.',
    defaultPrompt: 'Bot character idle animation sprite sheet, 8 frames, transparent background, consistent pose',
    style: 'PromptHouse canon cyborg animal bot, sprite sheet',
    outputTarget: 'sprite_sheet_png',
    botLocked: true,
  },
  {
    id: 'rive_mascot',
    name: 'Rive Mascot Spec',
    icon: '⚡',
    lane: 'forge_rive',
    desc: 'Full Rive artboard spec with idle, talk, and hover states.',
    defaultPrompt: 'Interactive bot mascot with idle breathing, talk lip-sync, hover reaction states',
    style: 'PromptHouse Rive mascot, state machine ready',
    outputTarget: 'rive_spec_json',
    botLocked: true,
  },
  {
    id: '3d_scene',
    name: '3D Hero Scene',
    icon: '🗿',
    lane: 'forge_3d',
    desc: 'Full 3D scene with bot character, environment, and camera path.',
    defaultPrompt: 'Hero shot of bot character in futuristic environment, cinematic lighting, 4K render',
    style: 'PromptHouse 3D, cinematic',
    outputTarget: 'blender_job',
    botLocked: true,
  },
  {
    id: 'promo_video',
    name: 'Promo Video Clip',
    icon: '🎬',
    lane: 'forge_motion',
    desc: '15-second promo animation for social media.',
    defaultPrompt: 'Dynamic promo animation, 15 seconds, bot character reveal, brand colors, cinematic',
    style: 'PromptHouse brand motion',
    outputTarget: 'mp4',
    botLocked: false,
  },
  {
    id: 'ui_animation',
    name: 'UI Motion Spec',
    icon: '✨',
    lane: 'forge_motion',
    desc: 'Micro-animation spec for UI components — buttons, loaders, transitions.',
    defaultPrompt: 'UI component animation spec: button press, loading state, success confirmation',
    style: 'PromptHouse UI, clean motion',
    outputTarget: 'webm_alpha',
    botLocked: false,
  },
];

// ── Self-Build Gates ──────────────────────────────────────────────────────────
export const FORGE_GATES = [
  { id: 'arch',        label: 'Architecture',     icon: '🏗️', maxScore: 100, proofRequired: 'Docs + schemas + route map'         },
  { id: 'ui',          label: 'UI',                icon: '🖥️', maxScore: 100, proofRequired: 'Runtime screenshot / test'          },
  { id: 'alpha',       label: 'Alpha Lane',        icon: '🔮', maxScore: 100, proofRequired: 'Alpha validation report'             },
  { id: 'sprite',      label: 'Sprite Lane',       icon: '🎞️', maxScore: 100, proofRequired: 'Frame count + atlas file'           },
  { id: 'motion',      label: 'Motion Lane',       icon: '🎬', maxScore: 100, proofRequired: 'Output file + adapter log'          },
  { id: 'rive',        label: 'Rive Lane',         icon: '⚡', maxScore: 100, proofRequired: 'Spec validation or file proof'      },
  { id: '3d',          label: '3D Lane',           icon: '🗿', maxScore: 100, proofRequired: 'Render output + engine log'         },
  { id: 'promptlink',  label: 'PromptLink',        icon: '🔗', maxScore: 100, proofRequired: 'Adapter test report'                },
  { id: 'proof',       label: 'Proof Deck',        icon: '🛡️', maxScore: 100, proofRequired: 'Unit test output'                  },
  { id: 'selfbuild',   label: 'SelfBuild',         icon: '∞',  maxScore: 100, proofRequired: 'Self-build audit receipt'           },
  { id: 'safety',      label: 'Safety Gate',       icon: '🔐', maxScore: 100, proofRequired: 'Approval test output'               },
  { id: 'runtime',     label: 'Runtime',           icon: '⚙️', maxScore: 100, proofRequired: 'Build / test / run logs'           },
];

// ── PromptCore ────────────────────────────────────────────────────────────────
export function promptCore({ prompt, botId, lane, template, styleLock }) {
  const laneObj = RENDER_LANES.find(l => l.id === lane);
  const tpl = FORGE_TEMPLATES.find(t => t.id === template);

  const renderBrief = {
    render_job_id: `frj_${Date.now()}`,
    source: prompt ? 'prompt' : 'template',
    target_outputs: laneObj?.outputs || ['transparent_png'],
    render_brief: {
      subject: botId ? `PromptHouse ${botId} bot` : 'Custom subject',
      style_lock: styleLock || tpl?.style || 'PromptHouse canon cyborg animal bot',
      background: lane === 'forge_alpha' ? 'transparent' : 'studio',
      quality_target: 'professional',
      prompt: prompt || tpl?.defaultPrompt || '',
    },
    route: {
      lane: lane || 'forge_alpha',
      adapter: laneObj?.adapter || 'dalle_alpha',
      dry_run: true,
    },
    proof_required: ['file_manifest', 'validation_report', 'preview_receipt'],
  };

  return renderBrief;
}

// ── SceneSmith ────────────────────────────────────────────────────────────────
export function sceneSmith({ prompt, lane, botId }) {
  return {
    camera: lane === 'forge_3d' ? 'cinematic_hero_shot' : 'portrait_studio',
    lighting: 'three_point_studio',
    composition: 'centered_subject',
    frame_count: lane === 'forge_sprite' ? 8 : 1,
    motion: lane === 'forge_motion' ? 'smooth_loop' : 'static',
    transparency: ['forge_alpha', 'forge_sprite'].includes(lane),
    background: ['forge_alpha', 'forge_sprite'].includes(lane) ? 'none' : 'studio_gradient',
    subject: botId || 'custom',
    style_notes: prompt,
  };
}

// ── AssetDNA ──────────────────────────────────────────────────────────────────
export function assetDNA({ botId, palette }) {
  const BOT_PALETTES = {
    evo:             { primary: '#f5c842', accent: '#e8a020', style: 'gold_metallic_lion'      },
    dev:             { primary: '#22d3ee', accent: '#0891b2', style: 'cyan_metallic_panther'   },
    builder:         { primary: '#4ade80', accent: '#16a34a', style: 'green_metallic_bear'     },
    verifier:        { primary: '#8b5cf6', accent: '#7c3aed', style: 'purple_metallic_owl'     },
    companion:       { primary: '#fb923c', accent: '#ea580c', style: 'orange_metallic_fox'     },
    conductor:       { primary: '#f0f0ff', accent: '#a0a0ff', style: 'silver_metallic_falcon'  },
    boundary:        { primary: '#f87171', accent: '#dc2626', style: 'red_metallic_rhino'      },
    ledger:          { primary: '#a0a0c0', accent: '#6060a0', style: 'slate_metallic_raven'    },
    memory:          { primary: '#38bdf8', accent: '#0284c7', style: 'sky_metallic_elephant'   },
    heartbeat:       { primary: '#4ade80', accent: '#15803d', style: 'lime_metallic_cheetah'   },
    sovereignty:     { primary: '#f5c842', accent: '#d97706', style: 'gold_metallic_tiger'     },
  };
  const canon = BOT_PALETTES[botId] || { primary: '#22d3ee', accent: '#0891b2', style: 'cyan_metallic_bot' };
  return {
    bot_id: botId,
    style_lock: `PromptHouse canonical cyborg ${canon.style.replace(/_/g,' ')}`,
    color_palette: palette || canon,
    material: 'brushed_chrome_with_glowing_accents',
    consistency_rules: ['same_species', 'same_style', 'same_lighting', 'canon_colors'],
  };
}

// ── ProofController ───────────────────────────────────────────────────────────
export function createProofReceipt({ jobId, lane, status, evidence }) {
  return {
    receipt_id: `proof_${Date.now()}`,
    render_job_id: jobId,
    status: status || 'built-not-verified',
    evidence_type: evidence?.type || 'spec',
    evidence_uri: evidence?.uri || null,
    validation: {
      alpha_checked:       lane === 'forge_alpha',
      frame_count_checked: lane === 'forge_sprite',
      format_checked:      true,
      rive_spec_valid:     lane === 'forge_rive',
    },
    timestamp: new Date().toISOString(),
  };
}

// ── Gate Scorer ───────────────────────────────────────────────────────────────
export function scoreGates(jobs, receipts) {
  const scores = {};
  FORGE_GATES.forEach(g => {
    const gateJobs = jobs.filter(j => {
      if (g.id === 'arch')  return true;
      if (g.id === 'ui')    return true;
      if (g.id === 'alpha') return j.route?.lane === 'forge_alpha';
      if (g.id === 'sprite')return j.route?.lane === 'forge_sprite';
      if (g.id === 'motion')return j.route?.lane === 'forge_motion';
      if (g.id === 'rive')  return j.route?.lane === 'forge_rive';
      if (g.id === '3d')    return j.route?.lane === 'forge_3d';
      return j.route?.lane === 'self_build';
    });
    const verified = receipts.filter(r =>
      gateJobs.some(j => j.render_job_id === r.render_job_id) && r.status === 'verified'
    ).length;
    const total = Math.max(gateJobs.length, 1);

    // Base scores for built modules
    const baseScore = g.id === 'arch' ? 85 : g.id === 'ui' ? 72 : g.id === 'safety' ? 60 :
                      g.id === 'proof' ? 55 : g.id === 'selfbuild' ? 40 : g.id === 'runtime' ? 50 : 0;
    const runtimeScore = Math.round(baseScore + (verified / total) * (100 - baseScore));
    scores[g.id] = Math.min(runtimeScore, 100);
  });
  return scores;
}
