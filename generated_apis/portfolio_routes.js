import express from 'express';
import fs from 'fs';
import path from 'path';

export default function registerPortfolioRoutes(app) {
    const appsDir = path.join(process.cwd(), 'generated_apps');

    app.get('/api/portfolio', (req, res) => {
        if (!fs.existsSync(appsDir)) {
            return res.json({ projects: [] });
        }

        try {
            const projects = fs.readdirSync(appsDir)
                .map(folder => {
                    const folderPath = path.join(appsDir, folder);
                    const stats = fs.statSync(folderPath);
                    if (stats.isDirectory()) {
                        return {
                            id: folder,
                            name: folder.replace(/_/g, ' '),
                            createdAt: stats.birthtime,
                            modifiedAt: stats.mtime,
                            path: folderPath
                        };
                    }
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => b.modifiedAt - a.modifiedAt); // Sort newest first

            res.json({ projects });
        } catch (error) {
            console.error('[Portfolio API] Error reading generated_apps:', error);
            res.status(500).json({ error: 'Failed to load portfolio' });
        }
    });

    app.post('/api/portfolio/launch', (req, res) => {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

        const targetDir = path.join(appsDir, projectId);
        if (!fs.existsSync(targetDir)) {
            return res.status(404).json({ error: 'App not found' });
        }

        // Future MVP: Add spawn('npm', ['run', 'dev']) logic to launch on a dynamic port
        // For now, we return success so the UI can mock the state.
        res.json({ 
            success: true, 
            message: `App ${projectId} launched successfully!`, 
            url: `http://localhost:8080` // Mock URL for now
        });
    });
}
