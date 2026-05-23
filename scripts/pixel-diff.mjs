import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export function compareScreenshots(img1Path, img2Path, diffOutputPath) {
  console.log(`\x1b[36m🔍 [PIXEL-DIFF]\x1b[0m Comparing ${img1Path} against ${img2Path}...`);
  
  if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
    console.error(`\x1b[31m❌ [PIXEL-DIFF] Missing images for comparison.\x1b[0m`);
    return null;
  }

  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));
  const { width, height } = img1;
  
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
  const totalPixels = width * height;
  const diffRatio = numDiffPixels / totalPixels;

  fs.writeFileSync(diffOutputPath, PNG.sync.write(diff));

  console.log(`📊 [PIXEL-DIFF] Differences: ${numDiffPixels} pixels (${(diffRatio * 100).toFixed(2)}%)`);
  console.log(`🔴 [PIXEL-DIFF] Red-diff map saved to ${diffOutputPath}`);

  return {
    diffPixels: numDiffPixels,
    diffRatio: diffRatio,
    isIdentical: numDiffPixels === 0
  };
}

if (process.argv[1] && process.argv[1].endsWith('pixel-diff.mjs')) {
  const file1 = process.argv[2] || 'target_screenshot.png';
  const file2 = process.argv[3] || 'spatial_screenshot.png';
  const out = process.argv[4] || 'pixel_diff_result.png';
  compareScreenshots(file1, file2, out);
}
