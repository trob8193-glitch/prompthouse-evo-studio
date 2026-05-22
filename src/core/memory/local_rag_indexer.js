import fs from 'fs';
import path from 'path';

/**
 * Local RAG Indexer (JavaScript-native TF-IDF Memory)
 * Scans the src/ directory and extracts keywords to inject into the Genesis Swarm.
 */

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist']);

function walkDir(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (IGNORE_DIRS.has(file)) return;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}

export function buildLocalMemory(rootDir = './src') {
    console.log("🧠 [RAG Indexer] Scanning codebase memory...");
    const files = walkDir(rootDir);
    
    // Build a lightweight TF-IDF or keyword map
    const memory = [];
    
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        // Extract component names and keywords (heuristic)
        const exportMatch = content.match(/export (?:default )?(?:function|class|const) (\w+)/);
        if (exportMatch) {
            const lines = content.split('\n').length;
            memory.push(`Component: ${exportMatch[1]} (${lines} lines)`);
        }
    }
    
    // Pick 5 random memories to inject so the AI learns from past structure
    const shuffled = memory.sort(() => 0.5 - Math.random());
    const context = shuffled.slice(0, 5).join(' | ');
    
    console.log(`🧠 [RAG Indexer] Retrieved ${memory.length} memories. Active Context: ${context}`);
    return `Past architectural structures exist for: ${context}`;
}
