/** Live Command Graph - pb14 **/

import fs from 'fs';
import fetch from 'node-fetch';
import { createServer } from 'http';
import WebSocket from 'ws';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const COMMAND_GRAPH_FILE = './commandGraph.json';

let commandGraph = {};

const saveCommandGraph = async () => {
    try {
        await fs.promises.writeFile(COMMAND_GRAPH_FILE, JSON.stringify(commandGraph, null, 2));
    } catch (error) {
        console.error('Error saving command graph:', error);
    }
};

const loadCommandGraph = async () => {
    try {
        const data = await fs.promises.readFile(COMMAND_GRAPH_FILE, 'utf-8');
        commandGraph = JSON.parse(data);
    } catch (error) {
        console.warn('No existing command graph found, starting fresh.', error);
        commandGraph = {};
    }
};

const fetchCommandGraphFromServer = async () => {
    try {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/command-graph`);
        if (!response.ok) throw new Error('Network response was not ok');
        commandGraph = await response.json();
        await saveCommandGraph();
    } catch (error) {
        console.error('Failed to fetch command graph from server:', error);
    }
};

const updateCommandGraph = (newNode) => {
    commandGraph[newNode.id] = newNode;
    saveCommandGraph();
};

const deleteCommandGraphNode = (nodeId) => {
    delete commandGraph[nodeId];
    saveCommandGraph();
};

const initializeWebSocketServer = () => {
    const server = createServer();
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.send(JSON.stringify(commandGraph));

        ws.on('message', (message) => {
            const command = JSON.parse(message);
            if (command.action === 'update') {
                updateCommandGraph(command.node);
            } else if (command.action === 'delete') {
                deleteCommandGraphNode(command.nodeId);
            }
            ws.send(JSON.stringify(commandGraph));
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    server.listen(8080, () => {
        console.log('WebSocket server is listening on ws://localhost:8080');
    });
};

export const startLiveCommandGraph = async () => {
    await loadCommandGraph();
    await fetchCommandGraphFromServer();
    initializeWebSocketServer();
};

export const getCommandGraph = () => {
    return commandGraph;
};

export const addCommandNode = (node) => {
    updateCommandGraph(node);
};

export const removeCommandNode = (nodeId) => {
    deleteCommandGraphNode(nodeId);
};

startLiveCommandGraph();