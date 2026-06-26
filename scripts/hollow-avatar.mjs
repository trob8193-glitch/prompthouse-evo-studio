import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace this with the actual path to your generated avatar
const inputImage = 'C:\\Users\\Noname\\.gemini\\antigravity-ide\\brain\\5ef5ff90-4dbd-4020-aad5-8c7a0e2bc246\\evo_avatar_v1_1782327080302.png';
const outputImage = path.join(__dirname, '../public/evo_bot.png');

async function hollowAvatar() {
  console.log(`[Evo Hollow Engine] Loading avatar from ${inputImage}...`);
  try {
    const image = await Jimp.read(inputImage);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Tolerance for "darkness"
    const threshold = 30; // 0-255

    image.scan(0, 0, width, height, function(x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      
      // If the pixel is dark enough (close to pure black)
      if (red <= threshold && green <= threshold && blue <= threshold) {
        // Hollowing out the black background completely (alpha = 0)
        this.bitmap.data[idx + 3] = 0;
      }
    });

    console.log(`[Evo Hollow Engine] Background hollowed out successfully!`);
    image.write(outputImage);
    console.log(`[Evo Hollow Engine] Transparent bot saved to ${outputImage}`);
  } catch (error) {
    console.error(`[Evo Hollow Engine] Failed to hollow out image:`, error);
  }
}

hollowAvatar();
