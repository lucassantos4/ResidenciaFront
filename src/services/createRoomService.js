import { data } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || '';

export async function createRoom(config) {
  const url = `${API}/rooms`
  const headers = {
    'Content-Type': 'application/json',
  };


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
  console.log( "envio: ", res.body)
  console.log("resposta: ", res)

  return res.json();
}

export default createRoom;