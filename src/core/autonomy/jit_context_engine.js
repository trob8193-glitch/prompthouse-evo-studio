import fs from 'fs';
import path from 'path';

/**
 * JIT Context Engine
 * Prevents "Context Window Wall" by dynamically slicing the codebase
 * and building a precise context payload based strictly on local dependencies.
 */
export class JITContextEngine {
    constructor(rootDir) {
        this.rootDir = rootDir;
    }

    /**
     * Parses a file to find local imports.
     * Simplistic regex parser for imports.
     */
    findLocalDependencies(filePath) {
        if (!fs.existsSync(filePath)) return [];
        const content = fs.readFileSync(filePath, 'utf8');
        const dependencies = [];
        
        // Match import { X } from './path' or import X from './path'
        const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            // Only care about local relative imports for JIT context
            if (importPath.startsWith('.')) {
                const absolutePath = path.resolve(path.dirname(filePath), importPath);
                
                // Add extensions if missing (naive resolution for JS/JSX)
                let resolvedPath = absolutePath;
                if (!fs.existsSync(resolvedPath)) {
                    if (fs.existsSync(absolutePath + '.js')) resolvedPath += '.js';
                    else if (fs.existsSync(absolutePath + '.jsx')) resolvedPath += '.jsx';
                    else if (fs.existsSync(absolutePath + '.mjs')) resolvedPath += '.mjs';
                }
                
                if (fs.existsSync(resolvedPath)) {
                    dependencies.push(resolvedPath);
                }
            }
        }
        
        return dependencies;
    }

    /**
     * Builds a precise context slice for the AI.
     */
    buildContext(targetFilePath, taskDescription, maxDepth = 1) {
        const contextFiles = new Set();
        
        const traverse = (currentPath, depth) => {
            if (depth > maxDepth) return;
            if (contextFiles.has(currentPath)) return;
            
            contextFiles.add(currentPath);
            const deps = this.findLocalDependencies(currentPath);
            deps.forEach(dep => traverse(dep, depth + 1));
        };

        if (fs.existsSync(targetFilePath)) {
            traverse(targetFilePath, 0);
        }

        let contextString = `[JIT Context Injector] Task: ${taskDescription}\n\n`;
        contextString += `--- TARGET FILE & DEPENDENCIES ---\n`;
        
        for (const file of contextFiles) {
            const relativeName = path.relative(this.rootDir, file);
            const content = fs.readFileSync(file, 'utf8');
            contextString += `\n// File: ${relativeName}\n`;
            contextString += `\`\`\`javascript\n${content}\n\`\`\`\n`;
        }
        
        return contextString;
    }
}
