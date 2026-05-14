import fs from 'fs';
import path from 'path';
import { Log } from '../../src/core/autonomy/SovereignLogger.js';

export class ToolAutogeneratorNode {
  constructor(rootDir = process.cwd()) {
    this.dataDir = path.join(rootDir, '.prompthouse-data');
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
  }

  getAllRecipes() {
    const recipePath = path.join(this.dataDir, 'tool_recipes.json');
    try {
      if (fs.existsSync(recipePath)) {
        return JSON.parse(fs.readFileSync(recipePath, 'utf8'));
      }
    } catch (e) {
      Log.error('❌ [Recipes] Physical Read Error:', e);
    }
    return [];
  }

  saveRecipe(recipe) {
    const recipes = this.getAllRecipes();
    recipes.push(recipe);
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    fs.writeFileSync(path.join(this.dataDir, 'tool_recipes.json'), JSON.stringify(recipes, null, 2));
    Log.info(`✨ [ToolGen] Physical Tool Manifested: ${recipe.name}`);
    return true;
  }
}
