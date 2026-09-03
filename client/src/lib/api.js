import { auth } from './firebaseClient.js';

// Every request goes through /api/*, which Vite proxies to Express in dev
// (see vite.config.js) and which Express serves directly in production.
const BASE_URL = import.meta.env.VITE_API_URL || '';

async function authHeader() {
  if (!auth.currentUser) return {};
  // getIdToken() returns the cached token and transparently refreshes it
  // when expired — callers never need to think about token lifetime.
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request(path, { method = 'GET', body, skipAuth = false } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(skipAuth ? {} : await authHeader()),
  };

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export async function checkHealth() {
  return api.get('/health', { skipAuth: true });
}