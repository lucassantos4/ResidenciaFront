
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createRoom(config) {
  const url = (API_BASE ? API_BASE.replace(/\/$/, '') : '') + '/rooms';

  const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('API_KEY') || null;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Falha ao criar sala: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
}

export default createRoom;
