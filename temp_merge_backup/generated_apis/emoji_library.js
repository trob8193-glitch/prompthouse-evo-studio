import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

export default function registerRoutes(app) {
  app.get('/api/generated/emojis', (req, res) => {
    const emojiDir = join(process.cwd(), 'public', 'assets', 'emojis');
    
    if (!existsSync(emojiDir)) {
      return res.status(404).json({ success: false, error: "Emoji directory not found." });
    }
    
    try {
      const files = readdirSync(emojiDir);
      const emojis = files.filter(f => f.endsWith('.png'));
      
      res.json({
        success: true,
        count: emojis.length,
        emojis: emojis.slice(0, 50), // Return first 50 to avoid huge response
        total_count: emojis.length,
        message: "Emoji library fetched successfully!"
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
}
