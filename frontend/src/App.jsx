import { useEffect, useState } from "react";

import {
  uploadCsv,
  preprocessData,
  trainClusters,
  getResults,
  getMetrics,
  queryClientCluster,
  queryReviewCluster,
  exportClients,
  exportReviews,
  exportSummary,
} from "./api";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalError, setGlobalError] = useState("");

  const handleSetTab = (tab) => {
    setGlobalMessage("");
    setGlobalError("");
    setActiveTab(tab);
  };

  return (
    <div
      style={{
        width: "100vw",
	height: "100vh",
	margin: 0,
	padding: 0,
	display: "flex",
	flexDirection: "column",
	fontFamily: "system-ui, sans-serif",
	backgroundColor: "#0f172a",
	color: "#e5e7eb",
	overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "650", letterSpacing: "0.2px" }}>
          InsightCluster
        </h1>
        <span style={{ fontSize: "14px", color: "#9ca3af" }}>
          Segmentación de clientes y reseñas
        </span>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <nav
          style={{
            width: "280px",
            borderRight: "1px solid #1e293b",
            padding: "16px 12px",
            backgroundColor: "#020617",
          }}
        >
          <NavButton active={activeTab === "upload"} onClick={() => handleSetTab("upload")}>
            1. Carga masiva
          </NavButton>

          <NavButton active={activeTab === "train"} onClick={() => handleSetTab("train")}>
            2. Configurar & Entrenar
          </NavButton>

          <NavButton active={activeTab === "results"} onClick={() => handleSetTab("results")}>
            3. Resultados
          </NavButton>

          <NavButton active={activeTab === "eval_export"} onClick={() => handleSetTab("eval_export")}>
            4. Evaluación & Exportar
          </NavButton>

          <div style={{ marginTop: "14px", fontSize: "12px", color: "#9ca3af", padding: "0 8px" }}>
            * Asegúrate de que el backend tenga CORS + credentials si usas sesión.
          </div>
        </nav>

        {/* Contenido */}
        <main style={{ flex: 1, padding: "26px" }}>
          {!!globalMessage && (
            <AlertBox kind="success">{globalMessage}</AlertBox>
          )}
          {!!globalError && (
            <AlertBox kind="error">{globalError}</AlertBox>
          )}

          {activeTab === "upload" && (
            <UploadAndPreprocessSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
            />
          )}

          {activeTab === "train" && (
            <TrainSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
            />
          )}

          {activeTab === "results" && (
            <ResultsSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
            />
          )}

          {activeTab === "eval_export" && (
            <EvalExportSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function AlertBox({ kind, children }) {
  const isError = kind === "error";
  return (
    <div
      style={{
        marginBottom: "16px",
        padding: "12px 12px",
        borderRadius: "10px",
        backgroundColor: isError ? "#450a0a" : "#022c22",
        border: `1px solid ${isError ? "#b91c1c" : "#047857"}`,
        fontSize: "14px",
      }}
    >
      {children}
    </div>
  );
}

function NavButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 12px",
        marginBottom: "8px",
        borderRadius: "10px",
        border: "1px solid transparent",
        cursor: "pointer",
        fontSize: "14px",
        backgroundColor: active ? "#1d4ed8" : "transparent",
        color: active ? "#e5e7eb" : "#9ca3af",
        transition: "transform 120ms ease, background-color 120ms ease",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.99)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function Card({ title, description, children, style }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #1f2937",
        backgroundColor: "#020617",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        ...style,
      }}
    >
      <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>{title}</h3>
      {description && (
        <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: 0, marginBottom: "12px" }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

function PrimaryButton({ children, disabled, onClick, type = "button", style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        fontSize: "14px",
        borderRadius: "10px",
        border: "1px solid #1d4ed8",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: disabled ? "#0b1f3a" : "#1d4ed8",
        color: "#e5e7eb",
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SuccessButton({ children, disabled, onClick, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        fontSize: "14px",
        borderRadius: "10px",
        border: "1px solid #10b981",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: disabled ? "#052e2a" : "#10b981",
        color: "#052e2a",
        fontWeight: 800,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, disabled, onClick, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        fontSize: "14px",
        borderRadius: "10px",
        border: "1px solid #334155",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: "#0b1220",
        color: "#e5e7eb",
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Badge({ text, color = "#93c5fd" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        border: `1px solid ${color}`,
        color,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.2px",
      }}
    >
      {text}
    </span>
  );
}

/* ---------------- 1) Upload + Preprocess ---------------- */

function UploadAndPreprocessSection({ setGlobalMessage, setGlobalError }) {
  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingPre, setLoadingPre] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setGlobalError("");
    setGlobalMessage("");

    if (!file) {
      setGlobalError("Selecciona un archivo CSV primero.");
      return;
    }

    try {
      setLoadingUpload(true);
      const res = await uploadCsv(file);
      setGlobalMessage(res.message || "CSV subido correctamente.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handlePreprocess = async () => {
    setGlobalError("");
    setGlobalMessage("");
    try {
      setLoadingPre(true);
      const res = await preprocessData();
      setGlobalMessage(res.message || "Preprocesamiento completado.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoadingPre(false);
    }
  };

  return (
    <section>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Carga masiva</h2>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
        Sube el CSV y ejecuta el preprocesamiento (limpieza + preparación para clustering).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card
          title="Archivo CSV"
          description="Selecciona el archivo y súbelo al servidor."
        >
          <form onSubmit={handleUpload} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ fontSize: "14px" }}
            />
            <PrimaryButton type="submit" disabled={loadingUpload}>
              {loadingUpload ? "Subiendo..." : "Subir CSV"}
            </PrimaryButton>
          </form>
        </Card>

        <Card
          title="Preprocesamiento"
          description="Ejecuta la transformación requerida: limpieza, tipos, features, etc."
        >
          <SuccessButton onClick={handlePreprocess} disabled={loadingPre}>
            {loadingPre ? "Procesando..." : "Preprocesar"}
          </SuccessButton>
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ---------------- 2) Train ---------------- */

function TrainSection({ setGlobalMessage, setGlobalError }) {
  const [cfg, setCfg] = useState({
    k_clientes: 6,
    k_reseñas: 2,
    vectorizer: "tfidf", // "tfidf" o "bow" si lo implementas
    max_features: 5000,
  });

  const [loadingSave, setLoadingSave] = useState(false);
  const [trainResponse, setTrainResponse] = useState(null);

  const update = (key, value) => setCfg((prev) => ({ ...prev, [key]: value }));

  const handleTrain = async () => {
    setGlobalError("");
    setGlobalMessage("");
    setTrainResponse(null);

    try {
      setLoadingSave(true);
      const res = await trainClusters(cfg);
      setGlobalMessage(res.message || "Entrenamiento de clustering completado.");
      setTrainResponse(res);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <section>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Configurar & Entrenar</h2>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
        Define parámetros esenciales y ejecuta el clustering de clientes (numérico) y reseñas (texto).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card
            title="Clientes (numérico)"
            description="Ajusta K para segmentación de clientes."
          >
            <SliderRow
              label="K clientes"
              value={cfg.k_clientes}
              min={2}
              max={12}
              step={1}
              onChange={(v) => update("k_clientes", v)}
            />
          </Card>

          <Card
            title="Reseñas (texto)"
            description="Ajusta K y opciones de vectorización."
          >
            <SliderRow
              label="K reseñas"
              value={cfg.k_reseñas}
              min={2}
              max={12}
              step={1}
              onChange={(v) => update("k_reseñas", v)}
            />

            <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
              <SelectRow
                label="Vectorizador"
                value={cfg.vectorizer}
                onChange={(v) => update("vectorizer", v)}
                options={[
                  { value: "tfidf", label: "TF-IDF" },
                  { value: "bow", label: "Bag of Words" },
                ]}
              />

              <SliderRow
                label="Max features"
                value={cfg.max_features}
                min={1000}
                max={20000}
                step={500}
                onChange={(v) => update("max_features", v)}
              />
            </div>
          </Card>
        </div>

        <Card
          title="Entrenamiento"
          description="Ejecuta clustering con la configuración actual."
          style={{ position: "sticky", top: "16px" }}
        >
          <div style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "12px" }}>
            <div><b>k_clientes:</b> {cfg.k_clientes}</div>
            <div><b>k_reseñas:</b> {cfg.k_reseñas}</div>
            <div><b>vectorizer:</b> {cfg.vectorizer}</div>
            <div><b>max_features:</b> {cfg.max_features}</div>
          </div>

          <PrimaryButton disabled={loadingSave} onClick={handleTrain} style={{ width: "100%" }}>
            {loadingSave ? "Entrenando..." : "Entrenar clustering"}
          </PrimaryButton>

          {trainResponse && (
            <pre
              style={{
                marginTop: "12px",
                backgroundColor: "#020617",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #1f2937",
                fontSize: "12px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#9ca3af",
              }}
            >
              {JSON.stringify(trainResponse, null, 2)}
            </pre>
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <span style={{ fontSize: "14px" }}>{label}</span>
        <span style={{ fontSize: "14px", fontWeight: 900 }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: "10px" }}
      />
      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
        Rango: {min} - {max}
      </div>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <label style={{ fontSize: "13px", color: "#9ca3af" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #334155",
          backgroundColor: "#0b1220",
          color: "#e5e7eb",
          fontSize: "14px",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------------- 3) Results ---------------- */

function ResultsSection({ setGlobalMessage, setGlobalError }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Query
  const [clienteId, setClienteId] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryOut, setQueryOut] = useState(null);

  const clusterColor = (cluster) => {
    const palette = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb7185", "#22d3ee", "#c084fc"];
    return palette[Math.abs(Number(cluster)) % palette.length] || "#93c5fd";
  };

  const handleLoad = async () => {
    setGlobalError("");
    setGlobalMessage("");
    try {
      setLoading(true);
      const res = await getResults();
      setResults(res);
      setGlobalMessage("Resultados cargados.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryClient = async () => {
    setGlobalError("");
    setGlobalMessage("");
    setQueryOut(null);

    if (!clienteId.trim()) {
      setGlobalError("Ingresa un cliente_id.");
      return;
    }

    try {
      setQueryLoading(true);
      const res = await queryClientCluster(clienteId.trim());
      setQueryOut({ type: "client", ...res });
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleQueryReview = async () => {
    setGlobalError("");
    setGlobalMessage("");
    setQueryOut(null);

    if (!reviewText.trim()) {
      setGlobalError("Escribe un texto de reseña.");
      return;
    }

    try {
      setQueryLoading(true);
      const res = await queryReviewCluster(reviewText.trim());
      setQueryOut({ type: "review", ...res });
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    // auto-cargar una vez al entrar
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Resultados</h2>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
        Visualiza resúmenes por cluster y consulta a qué segmento pertenece un cliente o una reseña.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
        <PrimaryButton disabled={loading} onClick={handleLoad}>
          {loading ? "Cargando..." : "Actualizar resultados"}
        </PrimaryButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
        {/* Resúmenes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card title="Clusters de clientes" description="Resumen por cluster (conteos/promedios/top features).">
            {!results?.clientes ? (
              <div style={{ color: "#9ca3af", fontSize: "14px" }}>Sin datos aún.</div>
            ) : (
              <JsonPreview data={results.clientes} />
            )}
          </Card>

          <Card title="Clusters de reseñas" description="Resumen por cluster (keywords/top términos).">
            {!results?.reseñas ? (
              <div style={{ color: "#9ca3af", fontSize: "14px" }}>Sin datos aún.</div>
            ) : (
              <JsonPreview data={results.reseñas} />
            )}
          </Card>
        </div>

        {/* Consulta */}
        <Card title="Consulta rápida" description="Busca el cluster por cliente_id o por texto de reseña.">
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ border: "1px solid #1f2937", borderRadius: "12px", padding: "12px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  placeholder="cliente_id"
                  style={inputStyle}
                />
                <PrimaryButton disabled={queryLoading} onClick={handleQueryClient}>
                  {queryLoading ? "Buscando..." : "Consultar cliente"}
                </PrimaryButton>
              </div>
            </div>

            <div style={{ border: "1px solid #1f2937", borderRadius: "12px", padding: "12px" }}>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Escribe una reseña aquí..."
                rows={5}
                style={{ ...inputStyle, width: "100%", resize: "vertical" }}
              />
              <div style={{ marginTop: "10px" }}>
                <PrimaryButton disabled={queryLoading} onClick={handleQueryReview}>
                  {queryLoading ? "Analizando..." : "Consultar reseña"}
                </PrimaryButton>
              </div>
            </div>

            {/* Resultado bonita */}
            <div
              style={{
                minHeight: "160px",
                padding: "14px",
                borderRadius: "14px",
                border: "1px dashed #334155",
                backgroundColor: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!queryOut ? (
                <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Aquí aparece el segmento detectado
                </span>
              ) : (
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                    <Badge
                      text={`CLUSTER ${queryOut.cluster}`}
                      color={clusterColor(queryOut.cluster)}
                    />
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                      {queryOut.type === "client" ? "Cliente" : "Reseña"}
                    </span>
                  </div>

                  {queryOut.descripcion && (
                    <div style={{ marginTop: "10px", fontSize: "14px", color: "#e5e7eb" }}>
                      {queryOut.descripcion}
                    </div>
                  )}

                  <div style={{ marginTop: "10px" }}>
                    <pre
                      style={{
                        backgroundColor: "#0b1220",
                        padding: "10px",
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        fontSize: "12px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: "#cbd5e1",
                      }}
                    >
                      {JSON.stringify(queryOut, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function JsonPreview({ data }) {
  return (
    <pre
      style={{
        backgroundColor: "#0b1220",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #334155",
        fontSize: "12px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "#cbd5e1",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

const inputStyle = {
  width: "220px",
  padding: "10px 10px",
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "#0b1220",
  color: "#e5e7eb",
  fontSize: "14px",
};

/* ---------------- 4) Eval + Export ---------------- */

function EvalExportSection({ setGlobalMessage, setGlobalError }) {
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const [loadingExport, setLoadingExport] = useState({
    clients: false,
    reviews: false,
    summary: false,
  });

  const load = async () => {
    setGlobalError("");
    setGlobalMessage("");
    try {
      setLoadingMetrics(true);
      const res = await getMetrics();
      setMetrics(res);
      setGlobalMessage("Métricas cargadas.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doExport = async (key, fn) => {
    setGlobalError("");
    setGlobalMessage("");
    try {
      setLoadingExport((p) => ({ ...p, [key]: true }));
      await fn();
      setGlobalMessage("Archivo exportado correctamente.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoadingExport((p) => ({ ...p, [key]: false }));
    }
  };

  const toFixed = (v) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "—";
    return Number(v).toFixed(4);
  };

  return (
    <section>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Evaluación & Exportar</h2>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
        Revisa métricas internas (silhouette, Calinski-Harabasz, Davies-Bouldin) y exporta resultados.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
        <PrimaryButton disabled={loadingMetrics} onClick={load}>
          {loadingMetrics ? "Cargando..." : "Actualizar métricas"}
        </PrimaryButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card title="Métricas internas" description="Idealmente separadas para clientes y reseñas.">
          {!metrics ? (
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>Sin métricas aún.</div>
          ) : (
            <>
              {/* Si tu backend manda estructura distinta, esto igual lo verás abajo en JSON */}
              <div style={{ display: "grid", gap: "10px", marginBottom: "12px" }}>
                <MetricLine label="silhouette_clientes" value={toFixed(metrics?.silhouette_clientes)} />
                <MetricLine label="calinski_clientes" value={toFixed(metrics?.calinski_clientes)} />
                <MetricLine label="davies_clientes" value={toFixed(metrics?.davies_clientes)} />

                <div style={{ height: "1px", backgroundColor: "#1f2937", margin: "6px 0" }} />

                <MetricLine label="silhouette_reseñas" value={toFixed(metrics?.silhouette_reseñas)} />
                <MetricLine label="calinski_reseñas" value={toFixed(metrics?.calinski_reseñas)} />
                <MetricLine label="davies_reseñas" value={toFixed(metrics?.davies_reseñas)} />
              </div>

              <JsonPreview data={metrics} />
            </>
          )}
        </Card>

        <Card title="Exportación" description="Descarga CSV/JSON de resultados segmentados.">
          <div style={{ display: "grid", gap: "10px" }}>
            <SuccessButton
              disabled={loadingExport.clients}
              onClick={() => doExport("clients", exportClients)}
            >
              {loadingExport.clients ? "Exportando..." : "Exportar clientes segmentados"}
            </SuccessButton>

            <SuccessButton
              disabled={loadingExport.reviews}
              onClick={() => doExport("reviews", exportReviews)}
            >
              {loadingExport.reviews ? "Exportando..." : "Exportar reseñas segmentadas"}
            </SuccessButton>

            <GhostButton
              disabled={loadingExport.summary}
              onClick={() => doExport("summary", exportSummary)}
            >
              {loadingExport.summary ? "Exportando..." : "Exportar resumen (JSON)"}
            </GhostButton>

            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
              * Los endpoints deben devolver archivos (Content-Disposition) para descarga.
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function MetricLine({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
      <span style={{ fontSize: "13px", color: "#9ca3af" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 900 }}>{value}</span>
    </div>
  );
}

export default App;
