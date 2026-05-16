<<<<<<< HEAD
=======
/** Embeddings route - api07 **/

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = path.resolve('./memory.db');
const db = new sqlite3.Database(DB_PATH);

const EMBEDDINGS_TABLE = `
CREATE TABLE IF NOT EXISTS embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  vector BLOB NOT NULL
);
`;

db.serialize(() => {
    db.run(EMBEDDINGS_TABLE);
});

const generateEmbedding = async (text) => {
    const response = await fetch('http://127.0.0.1:3001/generate-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        throw new Error('Error generating embedding');
    }

    const { vector } = await response.json();
    return vector;
};

const saveEmbedding = (text, vector) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO embeddings (text, vector) VALUES (?, ?)');
        stmt.run(text, vector, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
        stmt.finalize();
    });
};

const getEmbeddings = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM embeddings', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const clearEmbeddings = () => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM embeddings', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const createEmbedding = async (text) => {
    const vector = await generateEmbedding(text);
    const id = await saveEmbedding(text, vector);
    return { id, text, vector };
};

export const listEmbeddings = async () => {
    return await getEmbeddings();
};

export const removeAllEmbeddings = async () => {
    await clearEmbeddings();
};

export const closeDatabase = () => {
    db.close();
};
>>>>>>> main
