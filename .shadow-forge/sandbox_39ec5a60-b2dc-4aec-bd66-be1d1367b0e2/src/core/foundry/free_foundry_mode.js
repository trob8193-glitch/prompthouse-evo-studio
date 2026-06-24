import { BRIDGE_URL } from '../../config/bridge-config.js';
const BASE_URL = BRIDGE_URL;

class FreeFoundryMode {
  async train(params = {}) {
    const response = await fetch(`${BASE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Train request failed: ${response.status}`);
    }

    return response.json();
  }

  async infer(params = {}) {
    const response = await fetch(`${BASE_URL}/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Infer request failed: ${response.status}`);
    }

    return response.json();
  }
}

export default new FreeFoundryMode();
