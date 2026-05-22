import Database from 'better-sqlite3';
import path from 'path';

// Schema Engineer
// Intercepts new features, reads their code, and creates backend SQLite tables if required.

const LOCAL_LM_URL = 'http://127.0.0.1:3001/api/llm/generate';

export async function ensureSchemaForFeature(componentName, code) {
    console.log(`🗄️ [Schema Engineer] Analyzing '${componentName}' for required data structures...`);

    const prompt = `
    You are the Database Schema Engineer. 
    Review this React component code:
    ${code}
    
    If this component requires data persistence, output ONLY a valid SQLite CREATE TABLE query (e.g. CREATE TABLE IF NOT EXISTS ...).
    If no database table is needed, output EXACTLY the word: NULL.
    Do not use markdown. Do not explain.
    `;

    try {
        const response = await fetch(LOCAL_LM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, model: 'evo-lm' })
        });

        if (!response.ok) return;

        const data = await response.json();
        const sql = (data.text || data.response || data).replace(/```sql?/g, '').replace(/```/g, '').trim();

        if (sql === 'NULL' || sql.length < 10) {
            console.log("🗄️ [Schema Engineer] No persistent data structures required.");
            return;
        }

        // SQL Firewall: strictly block destructive queries
        const uppercaseSql = sql.toUpperCase();
        const destructiveKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'UPDATE', 'GRANT', 'REVOKE'];
        for (const keyword of destructiveKeywords) {
            if (uppercaseSql.includes(keyword)) {
                console.error(`❌ [Schema Firewall] Destructive keyword "${keyword}" detected. Execution aborted for safety.`);
                return;
            }
        }

        console.log("🗄️ [Schema Engineer] Database structure inferred. Executing migration...");
        const dbPath = path.resolve('./prompthouse.db');
        const db = new Database(dbPath);
        
        db.exec(sql);
        console.log(`✅ [Schema Engineer] Schema applied to ${dbPath}`);
        
    } catch (err) {
        console.error("❌ [Schema Engineer] Failed to infer/apply schema:", err);
    }
}
