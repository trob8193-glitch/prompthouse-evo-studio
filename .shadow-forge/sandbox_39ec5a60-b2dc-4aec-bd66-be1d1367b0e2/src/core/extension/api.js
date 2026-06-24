import { BRIDGE_URL } from '../../config/bridge-config.js';
export async function fetchConnectors() {
  const response = await fetch(BRIDGE_URL + '/api/connectors');
  if (!response.ok) throw new Error('Failed to fetch connectors');
  return await response.json();
}

export async function saveConnector(connector) {
  const response = await fetch(BRIDGE_URL + '/api/connectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(connector)
  });
  if (!response.ok) throw new Error('Failed to save connector');
  return await response.json();
}

export async function deleteConnector(id) {
  const response = await fetch(`${BRIDGE_URL}/api/connectors/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete connector');
  return await response.json();
}
