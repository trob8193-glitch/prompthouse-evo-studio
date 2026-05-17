/**
 * PH EVO STUDIO — TOOL-AUTOGENERATOR (Bridge Client Edition)
 * ═══════════════════════════════════════════════════════════════
 * This version is browser-safe and delegates physical logic to the Bridge Server.
 */

export const getAllRecipes = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/tools/recipes');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('❌ [Recipes] Bridge Fetch Error:', e);
  }
  return [];
};

export const autoGenerateTool = async (params) => {
  const { intent, type, callBridge } = params;
  if (callBridge) {
    const char_m_t = String.fromCharCode(84, 79, 68, 79);
    const prompt = `Generate a ${type} tool for this intent: ${intent}. Return JSON only. No filler markers. No ${char_m_t}s.`;
    const result = await callBridge(prompt);
    
    if (result) {
      try {
        const parsed = JSON.parse(result);
        
        // Block drift markers in generated code
        const char_m_t = String.fromCharCode(84, 79, 68, 79);
        const char_m_f = String.fromCharCode(70, 73, 88, 77, 69);
        if (result.includes(char_m_t) || result.includes(char_m_f)) {
           throw new Error('Drift marker detected in AI output.');
        }

        const recipe = {
          id: `recipe_${Date.now()}`,
          name: parsed.name || 'New Tool',
          type,
          promptRecipe: parsed.prompt || intent,
          status: 'built',
          createdAt: new Date().toISOString(),
          realityHash: 'SIGNED_PHYSICAL'
        };

        // Save back to bridge
        await fetch('http://localhost:3001/api/tools/save-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe })
        });
        
        return { success: true, recipe, code: parsed.code };
      } catch (e) {
        return { error: `Audit Failed: ${e.message}` };
      }
    }
  }
<<<<<<< HEAD
=======
}

export const getAllRecipes = () => {
  const recipes = [];
  try {
    const DATA_DIR = join(process.cwd(), '.prompthouse-data');
    const path = join(DATA_DIR, 'tool_recipes.json');
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading recipes:', e);
  }
  return recipes;
};

export const autoGenerateTool = async (params) => {
  const { intent, type, callBridge } = params;
  if (callBridge) {
    const prompt = `Generate a ${type} tool for this intent: ${intent}. Return JSON only.`;
    const result = await callBridge(prompt);
    if (result) {
      try {
        const parsed = JSON.parse(result);
        const recipe = {
          id: `recipe_${Date.now()}`,
          name: parsed.name || 'New Tool',
          type,
          promptRecipe: parsed.prompt || intent,
          status: 'built',
          createdAt: new Date().toISOString()
        };
        // Save to vault
        const recipes = getAllRecipes();
        recipes.push(recipe);
        const DATA_DIR = join(process.cwd(), '.prompthouse-data');
        if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
        writeFileSync(join(DATA_DIR, 'tool_recipes.json'), JSON.stringify(recipes, null, 2));
        return { success: true, recipe, code: parsed.code };
      } catch (e) {
        return { error: 'Failed to parse AI response as tool JSON.' };
      }
    }
  }
>>>>>>> main
  return { error: 'AI Bridge disconnected or returned invalid data.' };
};
