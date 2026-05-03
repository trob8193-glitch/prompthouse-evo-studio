/** Audit log - mem09 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const AUDIT_LOG_FILE = path.join(__dirname, 'audit_log.json');
const LOCAL_BRIDGE_URL = 'http://localhost:3001/audit';

class AuditLog {
    constructor() {
        this.createAuditLogFile();
    }

    createAuditLogFile() {
        if (!fs.existsSync(AUDIT_LOG_FILE)) {
            fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify([]));
        }
    }

    async logOperation(operationType, details) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, operationType, details };
        await this.persistLog(logEntry);
    }

    async persistLog(logEntry) {
        await this.saveToLocalFile(logEntry);
        await this.sendToLocalBridge(logEntry);
    }

    async saveToLocalFile(logEntry) {
        const currentLogs = JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, 'utf-8'));
        currentLogs.push(logEntry);
        fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(currentLogs, null, 2));
    }

    async sendToLocalBridge(logEntry) {
        try {
            await fetch(LOCAL_BRIDGE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry),
            });
        } catch (error) {
            console.error('Error sending log entry to local bridge:', error);
        }
    }

    async getAuditLogs() {
        return JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, 'utf-8'));
    }

    async clearAuditLogs() {
        fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify([]));
    }
}

const auditLog = new AuditLog();

export const logDataOperation = async (operationType, details) => {
    await auditLog.logOperation(operationType, details);
};

export const fetchAuditLogs = async () => {
    return await auditLog.getAuditLogs();
};

export const resetAuditLogs = async () => {
    await auditLog.clearAuditLogs();
};