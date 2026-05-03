/** Private device memory - mem02 **/

import crypto from 'crypto';
import fs from 'fs';
import fetch from 'node-fetch';
import { promises as fsPromises } from 'fs';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.randomBytes(32); // Should be stored securely
const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (ciphertext) => {
    const parts = ciphertext.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

const saveToLocal = async (key, value) => {
    const encryptedValue = encrypt(value);
    await fsPromises.writeFile(`./storage/${key}.json`, JSON.stringify({ data: encryptedValue }));
};

const loadFromLocal = async (key) => {
    try {
        const data = await fsPromises.readFile(`./storage/${key}.json`, 'utf8');
        const parsedData = JSON.parse(data);
        return decrypt(parsedData.data);
    } catch (err) {
        throw new Error('Data not found or cannot be read.');
    }
};

const saveToServer = async (key, value) => {
    const encryptedValue = encrypt(value);
    const response = await fetch('http://localhost:3001/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data: encryptedValue })
    });
    
    if (!response.ok) {
        throw new Error('Failed to save data to server.');
    }
};

const loadFromServer = async (key) => {
    const response = await fetch(`http://localhost:3001/load/${key}`);
    
    if (!response.ok) {
        throw new Error('Data not found on server.');
    }
    
    const { data } = await response.json();
    return decrypt(data);
};

export const PrivateDeviceMemory = {
    save: async (key, value, useServer = false) => {
        if (useServer) {
            await saveToServer(key, value);
        } else {
            await saveToLocal(key, value);
        }
    },
    load: async (key, useServer = false) => {
        if (useServer) {
            return await loadFromServer(key);
        } else {
            return await loadFromLocal(key);
        }
    }
};