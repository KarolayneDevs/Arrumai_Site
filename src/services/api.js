// A mesma base serve as chamadas fetch e os links diretos para abrir arquivos.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const body = options.body;

  if (!(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    body: options.body,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || 'Erro ao comunicar com a API.';
    throw new Error(message);
  }

  return payload;
}
