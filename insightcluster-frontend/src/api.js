const API_URL = "http://127.0.0.1:8000/api";

export async function testBackend() {
  const res = await fetch(`${API_URL}/test/`);
  if (!res.ok) throw new Error("Error en backend");
  return res.json();
}
