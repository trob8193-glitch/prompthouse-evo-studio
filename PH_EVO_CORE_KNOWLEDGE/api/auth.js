/** Auth - api01 **/

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = 'your_jwt_secret'; // Replace with your actual secret
const TOKEN_EXPIRY = '1h';
const USERS_FILE = path.join(__dirname, 'users.json');

const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const register = async (username, password) => {
    const users = readUsers();
    if (users[username]) {
        throw new Error('User already exists');
    }
    users[username] = { password }; // In a real app, hash the password
    writeUsers(users);
    return { message: 'User registered successfully' };
};

export const login = async (username, password) => {
    const users = readUsers();
    const user = users[username];
    if (!user || user.password !== password) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return { token };
};

export const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send('Invalid token.');
        }
        req.user = decoded;
        next();
    });
};

export const getCurrentUser = (req) => {
    return req.user;
};

export const logout = async (token) => {
    // In a real application, you would blacklist the token
    return { message: 'Logged out successfully' };
};

// Example usage with local bridge
const localBridgeUrl = 'http://127.0.0.1:3001';

export const bridgeRegister = async (username, password) => {
    const response = await fetch(`${localBridgeUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return response.json();
};

export const bridgeLogin = async (username, password) => {
    const response = await fetch(`${localBridgeUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return response.json();
};