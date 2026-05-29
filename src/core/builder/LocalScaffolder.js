import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class LocalScaffolder {
  constructor(baseDir = './generated_apps') {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async scaffoldReactApp(projectName, options = {}) {
    const projectPath = path.join(this.baseDir, projectName);
    
    if (fs.existsSync(projectPath)) {
      throw new Error(`Project ${projectName} already exists at ${projectPath}`);
    }

    // Step 1: Create Vite project
    console.log(`[Scaffolder] Creating Vite + React + SWC app at ${projectPath}`);
    await execAsync(`npm create vite@latest ${projectName} -- --template react-swc`, { cwd: this.baseDir });

    // Step 2: Install core dependencies
    console.log(`[Scaffolder] Installing dependencies for ${projectName}`);
    await execAsync(`npm install`, { cwd: projectPath });
    await execAsync(`npm install tailwindcss postcss autoprefixer lucide-react react-router-dom zustand`, { cwd: projectPath });

    // Step 3: Inject Tailwind & PostCSS Config
    const postcssConfigPath = path.join(projectPath, 'postcss.config.js');
    fs.writeFileSync(postcssConfigPath, `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
    `.trim());
    const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
    fs.writeFileSync(tailwindConfigPath, `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
    `.trim());

    // Step 4: Inject index.css with Tailwind directives
    const indexCssPath = path.join(projectPath, 'src', 'index.css');
    fs.writeFileSync(indexCssPath, `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
    `.trim());

    // Step 5: Replace App.jsx with a cool starting point
    const appJsxPath = path.join(projectPath, 'src', 'App.jsx');
    fs.writeFileSync(appJsxPath, `
import { Rocket } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md w-full text-center">
        <Rocket className="w-16 h-16 text-indigo-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-white mb-2">Autonomous Build Successful</h1>
        <p className="text-slate-400 mb-8">This app was fully scaffolded by the TriBrain Evo Studio.</p>
        
        <div className="w-full space-y-4">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-500 font-mono text-sm">Framework</span>
            <span className="text-indigo-400 font-bold">React + Vite</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-500 font-mono text-sm">Styling</span>
            <span className="text-sky-400 font-bold">TailwindCSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
    `.trim());

    console.log(`[Scaffolder] Project ${projectName} is ready at ${projectPath}`);
    return {
      success: true,
      path: projectPath,
      message: `Scaffolded ${projectName} successfully with React, Vite, and TailwindCSS.`
    };
  }
}
