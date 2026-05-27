import Database from 'better-sqlite3';
const db = new Database('./prompthouse.db');
console.log('--- USERS ---');
console.log(db.prepare('SELECT email, role FROM users').all());
console.log('--- ORGS ---');
console.log(db.prepare('SELECT name, slug FROM organizations').all());
