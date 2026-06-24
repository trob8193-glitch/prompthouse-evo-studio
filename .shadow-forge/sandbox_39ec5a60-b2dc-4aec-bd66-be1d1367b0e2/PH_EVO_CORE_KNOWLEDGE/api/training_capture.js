/** Training capture - api10 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'training_capture.log');

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Function to log training candidate data to a file
const logToFile = async (data) => {
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
};

// Function to send training candidate data to the local server
const sendToServer = async (data) => {
    const response = await fetch('http://127.0.0.1:3001/api/training-capture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to log data to server: ${response.statusText}`);
    }
};

// Main function to capture training candidate data
export const captureTrainingData = async (candidateData) => {
    try {
        // Log data to file
        await logToFile(candidateData);
        
        // Send data to the local server
        await sendToServer(candidateData);
        
        console.log('Training candidate data logged successfully.');
    } catch (error) {
        console.error('Error capturing training data:', error);
    }
};

// Function to clear logs (optional utility for maintenance)
export const clearLogs = () => {
    try {
        fs.unlinkSync(LOG_FILE);
        console.log('Training logs cleared.');
    } catch (error) {
        console.error('Error clearing logs:', error);
    }
};

// Function to read logs (optional utility for debugging)
export const readLogs = () => {
    try {
        const logs = fs.readFileSync(LOG_FILE, 'utf8');
        return logs.split('\n').filter(Boolean); // Return non-empty log entries
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
};

// Exporting additional utilities if needed
export const logFileExists = () => fs.existsSync(LOG_FILE);
export const getLogFilePath = () => LOG_FILE;