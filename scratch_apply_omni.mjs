import { applyThemeEvolution } from './src/core/theme-evolution/ThemeApply.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

applyThemeEvolution({ rootDir, themeId: 'omniRainbow' });
console.log('OmniRainbow theme applied to Memory.');
