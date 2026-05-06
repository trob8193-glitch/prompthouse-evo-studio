/** Connectors screen - pb11 **/

import { fetchConnectors, saveConnector, deleteConnector } from './api.js';

export class ConnectorsScreen {
    constructor() {
        this.connectorsList = document.getElementById('connectorsList');
        this.connectorForm = document.getElementById('connectorForm');
        this.connectorIdInput = document.getElementById('connectorId');
        this.connectorNameInput = document.getElementById('connectorName');
        this.initialize();
    }

    async initialize() {
        await this.loadConnectors();
        this.connectorForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleFormSubmit();
        });
    }

    async loadConnectors() {
        try {
            const connectors = await fetchConnectors();
            this.renderConnectors(connectors);
        } catch (error) {
            console.error('Error loading connectors:', error);
        }
    }

    renderConnectors(connectors) {
        this.connectorsList.innerHTML = '';
        connectors.forEach(connector => {
            const connectorItem = document.createElement('li');
            connectorItem.textContent = `${connector.name} (ID: ${connector.id})`;
            connectorItem.appendChild(this.createDeleteButton(connector.id));
            this.connectorsList.appendChild(connectorItem);
        });
    }

    createDeleteButton(connectorId) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            this.handleDeleteConnector(connectorId);
        });
        return deleteButton;
    }

    async handleFormSubmit() {
        const connectorId = this.connectorIdInput.value;
        const connectorName = this.connectorNameInput.value;

        if (connectorId) {
            await this.updateConnector(connectorId, connectorName);
        } else {
            await this.createConnector(connectorName);
        }

        this.connectorForm.reset();
        await this.loadConnectors();
    }

    async createConnector(name) {
        try {
            await saveConnector({ name });
        } catch (error) {
            console.error('Error creating connector:', error);
        }
    }

    async updateConnector(id, name) {
        try {
            await saveConnector({ id, name });
        } catch (error) {
            console.error('Error updating connector:', error);
        }
    }

    async handleDeleteConnector(connectorId) {
        try {
            await deleteConnector(connectorId);
            await this.loadConnectors();
        } catch (error) {
            console.error('Error deleting connector:', error);
        }
    }
}

const connectorsScreen = new ConnectorsScreen();
export default connectorsScreen;