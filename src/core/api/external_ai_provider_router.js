/** External AI provider router - api17 **/

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const LOCAL_API_URL = 'http://127.0.0.1:3001';
const MODEL_PROVIDERS = {
    OPENAI: 'OpenAI',
    ANTHROPIC: 'Anthropic',
    LOCAL: 'Local'
};

const PROVIDER_CONFIG = {
    [MODEL_PROVIDERS.OPENAI]: {
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.OPENAI_API_KEY
    },
    [MODEL_PROVIDERS.ANTHROPIC]: {
        url: 'https://api.anthropic.com/v1/messages',
        apiKey: process.env.ANTHROPIC_API_KEY
    },
    [MODEL_PROVIDERS.LOCAL]: {
        url: LOCAL_API_URL
    }
};

async function callOpenAI(prompt) {
    const response = await fetch(PROVIDER_CONFIG[MODEL_PROVIDERS.OPENAI].url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PROVIDER_CONFIG[MODEL_PROVIDERS.OPENAI].apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500 
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data;
}

async function callAnthropic(prompt) {
    const response = await fetch(PROVIDER_CONFIG[MODEL_PROVIDERS.ANTHROPIC].url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PROVIDER_CONFIG[MODEL_PROVIDERS.ANTHROPIC].apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });
    return await response.json();
}

async function callLocal(prompt) {
    const response = await fetch(`${PROVIDER_CONFIG[MODEL_PROVIDERS.LOCAL].url}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });
    return await response.json();
}

async function routeRequest(provider, prompt) {
    switch (provider) {
        case MODEL_PROVIDERS.OPENAI:
            return await callOpenAI(prompt);
        case MODEL_PROVIDERS.ANTHROPIC:
            return await callAnthropic(prompt);
        case MODEL_PROVIDERS.LOCAL:
            return await callLocal(prompt);
        default:
            throw new Error('Invalid provider specified');
    }
}

function logRequest(provider, prompt, response) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        provider,
        prompt,
        response
    };
    const logPath = path.join(__dirname, 'request_logs.json');

    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Could not read log file', err);
            return;
        }
        const logs = JSON.parse(data || '[]');
        logs.push(logEntry);
        fs.writeFile(logPath, JSON.stringify(logs, null, 2), (err) => {
            if (err) {
                console.error('Could not write log file', err);
            }
        });
    });
}

export async function handleRequest(provider, prompt) {
    const response = await routeRequest(provider, prompt);
    logRequest(provider, prompt, response);
    return response;
}

export const getProviders = () => Object.values(MODEL_PROVIDERS);