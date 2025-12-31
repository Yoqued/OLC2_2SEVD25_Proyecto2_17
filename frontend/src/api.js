const BASE_URL = "http://127.0.0.1:8000/api";

// Helper para errores bonitos
async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const msg =
      (data && data.error) ||
      (data && data.detail) ||
      (typeof data === "string" ? data : null) ||
      `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* ---------------- Endpoints (match con Django) ---------------- */

// POST /api/dataset/upload/
export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/dataset/upload/`, {
    method: "POST",
    body: formData,
    credentials: "include", // si luego usas sesión/cookies
  });

  return parseResponse(res);
}

// POST /api/dataset/preprocess/
export async function preprocessData(payload = {}) {
  const res = await fetch(`${BASE_URL}/dataset/preprocess/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return parseResponse(res);
}


// POST /api/model/train/
export async function trainClusters(config) {
  const res = await fetch(`${BASE_URL}/model/train/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
    credentials: "include",
  });
  return parseResponse(res);
}

// GET /api/model/results/
export async function getResults() {
  const res = await fetch(`${BASE_URL}/model/results/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse(res);
}

// GET /api/model/evaluation/
export async function getMetrics() {
  const res = await fetch(`${BASE_URL}/model/evaluation/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse(res);
}

/* ---------------- Query endpoints (si los agregas luego en Django) ---------------- */
/* Si aún no existen, déjalos: tu App los llama, así que estos endpoints
   debes crearlos en backend cuando quieras (o comenta la UI). */

export async function queryClientCluster(clienteId) {
  const res = await fetch(`${BASE_URL}/query/client/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente_id: clienteId }),
    credentials: "include",
  });

  return parseResponse(res);
}

export async function queryReviewCluster(text) {
  const res = await fetch(`${BASE_URL}/query/review/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto_reseña: text }),
    credentials: "include",
  });

  return parseResponse(res);
}

/* ---------------- Export endpoints ---------------- */
/* Los exports deben devolver archivo (CSV/JSON/PDF).
   Estos helpers descargan el archivo en el navegador. */

async function downloadFile(url, filename = "export") {
  const res = await fetch(url, { method: "GET", credentials: "include" });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Error exportando (${res.status})`);
  }

  const blob = await res.blob();
  const a = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);

  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(objectUrl);
}

export async function exportClients() {
  return downloadFile(`${BASE_URL}/export/clients/`, "clientes_segmentados.csv");
}

export async function exportReviews() {
  return downloadFile(`${BASE_URL}/export/reviews/`, "reseñas_segmentadas.csv");
}

export async function exportSummary() {
  return downloadFile(`${BASE_URL}/export/summary/`, "resumen.json");
}

export async function getEvaluation(uploadId) {
  const res = await fetch(`${BASE_URL}/model/evaluation/?upload_id=${encodeURIComponent(uploadId)}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error cargando métricas");
  return data;
}
