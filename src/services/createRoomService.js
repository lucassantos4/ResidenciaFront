import { data } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || '';

export async function createRoom(config) {
  const url = `${API}/rooms`
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
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
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao backend de criação de sala. Verifique se a API está no ar e se a URL está correta.');
    }

    throw error;
  }
}

export default createRoom;