import { safeFetchBridge } from '../config/bridge-config.js';

export async function authenticateUser(email, password) {
  const result = await safeFetchBridge('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!result.ok) {
    throw new Error(result.error || 'Authentication failed');
  }

  return { id: result.data.user.id, email: result.data.user.email, token: result.data.token };
}
