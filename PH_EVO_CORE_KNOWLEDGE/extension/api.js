export async function fetchConnectors() {
  const response = await fetch('http://127.0.0.1:3001/api/connectors');
  if (!response.ok) throw new Error('Failed to fetch connectors');
  return await response.json();
}

export async function saveConnector(connector) {
  const response = await fetch('http://127.0.0.1:3001/api/connectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(connector)
  });
  if (!response.ok) throw new Error('Failed to save connector');
  return await response.json();
}

export async function deleteConnector(id) {
  const response = await fetch(`http://127.0.0.1:3001/api/connectors/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete connector');
  return await response.json();
}
