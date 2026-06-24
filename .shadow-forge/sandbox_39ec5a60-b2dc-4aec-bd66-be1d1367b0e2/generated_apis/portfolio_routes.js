import fs from 'fs';
import path from 'path';

export default function registerPortfolioRoutes(app) {
    const appsDir = path.join(process.cwd(), 'generated_apps');
    const staticMount = '/generated-apps';

    app.use(staticMount, (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    }, expressStatic(appsDir));

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

        const targetDir = path.resolve(appsDir, projectId);
        const appRoot = path.resolve(appsDir);
        if (!targetDir.startsWith(appRoot + path.sep)) {
            return res.status(400).json({ error: 'Invalid projectId', truthState: 'LAUNCH_BLOCKED' });
        }

        if (!fs.existsSync(targetDir)) {
            return res.status(404).json({ error: 'App not found', truthState: 'LAUNCH_BLOCKED' });
        }

        const indexPath = findRunnableIndex(targetDir);
        if (!indexPath) {
            return res.status(409).json({
                success: false,
                truthState: 'LAUNCH_BLOCKED',
                error: 'No runnable index.html found for this generated app',
                path: targetDir
            });
        }

        const relativeIndex = path.relative(appRoot, indexPath)
            .split(path.sep)
            .map(part => encodeURIComponent(part))
            .join('/');
        res.json({ 
            success: true, 
            truthState: 'LOCAL_ARTIFACT_AVAILABLE',
            message: `App ${projectId} is available from the local bridge.`,
            url: `${staticMount}/${relativeIndex}`
        });
    });
}

function findRunnableIndex(rootDir, depth = 0) {
    const direct = path.join(rootDir, 'index.html');
    if (fs.existsSync(direct)) return direct;
    if (depth >= 4 || !fs.existsSync(rootDir)) return null;

    for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const found = findRunnableIndex(path.join(rootDir, entry.name), depth + 1);
        if (found) return found;
    }

    return null;
}

function expressStatic(rootDir) {
    return (req, res, next) => {
        const requestPath = decodeURIComponent(req.path || '/');
        const targetPath = path.resolve(rootDir, `.${requestPath}`);
        const appRoot = path.resolve(rootDir);

        if (!targetPath.startsWith(appRoot + path.sep) || !fs.existsSync(targetPath)) {
            next();
            return;
        }

        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
            next();
            return;
        }

        const contentType = targetPath.endsWith('.html')
            ? 'text/html; charset=utf-8'
            : targetPath.endsWith('.js')
                ? 'text/javascript; charset=utf-8'
                : targetPath.endsWith('.css')
                    ? 'text/css; charset=utf-8'
                    : 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(targetPath).pipe(res);
    };
}
