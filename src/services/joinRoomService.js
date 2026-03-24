const API = import.meta.env.VITE_API_URL || '';

export async function joinRoom(pin, companyName, playerName ) {
  const url = `${API}/companies/join`
  const headers = {
    'Content-Type': 'application/json',
  };


  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
        code: pin,
        name: companyName,
        managerName: playerName
    })
  })


  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Falha ao entrar: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
}

export default joinRoom;