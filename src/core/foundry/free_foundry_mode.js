const BASE_URL = 'http://127.0.0.1:3001';

class FreeFoundryMode {
  async train(params = {}) {
    try {
      const response = await fetch(`${BASE_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Train request failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async infer(params = {}) {
    try {
      const response = await fetch(`${BASE_URL}/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Infer request failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new FreeFoundryMode();
