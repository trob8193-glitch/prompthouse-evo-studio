/**
 * EVOGENAGE — ASSET PACK BLUEPRINTS (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Blueprints for atomic multi-job generation batches.
 */

export const ASSET_PACKS = [
  {
    id: 'bot_emoji_40',
    name: '40 Bot Emoji Pack',
    description: 'A full set of 40 transparent bot emojis for chat and reactions.',
    itemCount: 40,
    assetType: 'bot_emoji',
    stylePresetId: 'transparent_bot_emoji',
    baseCreditsPerItem: 2
  },
  {
    id: 'app_icon_20',
    name: '20 App Icon Pack',
    description: '20 unique high-fidelity app icons for different categories.',
    itemCount: 20,
    assetType: 'app_icon',
    stylePresetId: 'cinematic_app_icon',
    baseCreditsPerItem: 5
  },
  {
    id: 'social_post_12',
    name: '12 Social Post Pack',
    description: '12 coordinated promo banners for social media deployment.',
    itemCount: 12,
    assetType: 'promo_banner',
    stylePresetId: 'promo_banner',
    baseCreditsPerItem: 10
  }
];
