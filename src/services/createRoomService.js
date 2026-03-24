const API = import.meta.env.VITE_API_URL || '';

export async function createRoom(config, events) {
  const url = `${API}/rooms`
  const headers = {
    'Content-Type': 'application/json',
  };


  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(config, events),
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