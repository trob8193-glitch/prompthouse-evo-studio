const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

const memoryRoutes = `
// ─── ANCESTRAL MEMORY ROUTES ────────────────────────────────────────────────

app.post('/api/memory/recall', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    const SHARD_DIR = join(process.cwd(), '.sovereign-shards');
    
    if (!existsSync(SHARD_DIR)) {
      return res.json({ success: true, shards: [] });
    }

    const files = readdirSync(SHARD_DIR).filter(f => f.endsWith('.json'));
    const results = [];

    for (const file of files) {
      const content = readFileSync(join(SHARD_DIR, file), 'utf8');
      // Simple relevance scoring (keyword density for now, can be upgraded to local embeddings)
      const score = query.split(' ').reduce((acc, word) => {
        const regex = new RegExp(word, 'gi');
        const matches = content.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);

      if (score > 0) {
        results.push({
          shardKey: file.replace('.json', ''),
          score,
          preview: content.slice(0, 200) + '...'
        });
      }
    }

    const topShards = results.sort((a, b) => b.score - a.score).slice(0, limit);
    res.json({ success: true, shards: topShards });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
`;

// Inject before COGNITIVE CONSCIOUSNESS ROUTES
content = content.replace('// ─── COGNITIVE CONSCIOUSNESS ROUTES ──────────────────────────────────────────', memoryRoutes + '\n// ─── COGNITIVE CONSCIOUSNESS ROUTES ──────────────────────────────────────────');

fs.writeFileSync(path, content);
console.log('Successfully injected Ancestral Memory routes.');
