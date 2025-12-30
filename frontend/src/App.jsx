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

  // Estado persistente para la configuración
  const [cfg, setCfg] = useState({
    k_clientes: 6,
    max_iter: 300,
    n_init: 10,
    k_reseñas: 5,
  });

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
              cfg={cfg}
              setCfg={setCfg}
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
  const [uploadId, setUploadId] = useState(null); // ✅ NUEVO
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

      // ✅ Guardar upload_id para el preprocess
      if (res?.upload_id) setUploadId(res.upload_id);

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

    // ✅ Si aún no has subido CSV, no hay upload_id
    if (!uploadId) {
      setGlobalError("Primero sube el CSV para obtener upload_id.");
      return;
    }

    try {
      setLoadingPre(true);

      // ✅ Enviar upload_id al backend
      const res = await preprocessData({ upload_id: uploadId });

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

      {/* ✅ Mostrar uploadId para que veas que sí se guardó */}
      {!!uploadId && (
        <div style={{ marginBottom: "12px", color: "#9ca3af", fontSize: "13px" }}>
          upload_id actual: <b style={{ color: "#e5e7eb" }}>{uploadId}</b>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card title="Archivo CSV" description="Selecciona el archivo y súbelo al servidor.">
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
          <SuccessButton onClick={handlePreprocess} disabled={loadingPre || !uploadId}>
            {loadingPre ? "Procesando..." : "Preprocesar"}
          </SuccessButton>

          {!uploadId && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#9ca3af" }}>
              * Primero sube el CSV para habilitar el preprocesamiento.
            </div>
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

/* ---------------- 2) Train ---------------- */

function TrainSection({ setGlobalMessage, setGlobalError, cfg, setCfg }) {

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
            title="Clustering Numérico (Clientes)"
            description="Parámetros de K-Means para segmentación de clientes."
          >
            <SliderRow
              label="Número de Clusters (K)"
              value={cfg.k_clientes}
              min={2}
              max={100}
              step={1}
              onChange={(v) => update("k_clientes", v)}
            />

            <SliderRow
              label="Máximas Iteraciones (max_iter)"
              value={cfg.max_iter}
              min={100}
              max={500}
              step={10}
              onChange={(v) => update("max_iter", v)}
            />

            <SliderRow
              label="Número de Reinicios (n_init)"
              value={cfg.n_init}
              min={5}
              max={30}
              step={1}
              onChange={(v) => update("n_init", v)}
            />
          </Card>
        </div>

        <Card
          title="Entrenamiento"
          description="Ejecuta clustering con la configuración actual."
          style={{ position: "sticky", top: "16px" }}
        >
          <div style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "12px" }}>
            <div style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #1f2937" }}>
              <b>Clustering Numérico:</b>
            </div>
            <div><b>K clientes:</b> {cfg.k_clientes}</div>
            <div><b>max_iter:</b> {cfg.max_iter}</div>
            <div><b>n_init:</b> {cfg.n_init}</div>
            
            <div style={{ marginTop: "12px", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #1f2937" }}>
              <b>Clustering de Reseñas:</b>
            </div>
            <div><b>K reseñas:</b> {cfg.k_reseñas}</div>
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
  const [useMockData, setUseMockData] = useState(false);

  const evaluationData = {
    title: "Evaluación y validación del análisis",
    metrics: [
      { name: "Inercia", value: "85.63", description: "Mide la suma de las distancias cuadradas de cada punto a su centroide. Valores más bajos indican clusters más compactos." },
      { name: "Índice Calinski–Harabasz", value: "58.69", description: "Ratio entre la dispersión entre clusters y dentro de clusters. Valores más altos indican mejor separación." },
      { name: "Coeficiente de Silueta", value: "0.5", description: "Mide qué tan similar es un objeto a su propio cluster en comparación con otros clusters. Rango: -1 a 1." },
      { name: "Índice de Davies–Bouldin", value: "78.25", description: "Ratio promedio de similitud entre cada cluster y su cluster más similar. Valores más bajos son mejores." }
    ],
    note: "Nota: Esta información es solamente de referencia para la evaluación del modelo."
  };

  const handleLoad = async () => {
    setGlobalError("");
    setGlobalMessage("");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    handleLoad();
  }, []);

  return (
    <section style={{
      height: "calc(100vh - 80px)",
      overflowY: "auto",
      padding: "20px",
      paddingBottom: "60px"
    }}>
      <style>{`
        section::-webkit-scrollbar {
          width: 8px;
        }
        
        section::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 4px;
        }
        
        section::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        
        section::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        
        section {
          scrollbar-width: thin;
          scrollbar-color: #334155 #0f172a;
        }
        
        @media (max-width: 900px) {
          .metrics-grid { 
            grid-template-columns: 1fr !important; 
          }
          .summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 1200px) {
          .metrics-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
          }
        }
      `}</style>

      {/* TÍTULO Y DESCRIPCIÓN - mismo patrón que UploadAndPreprocessSection */}
      <h2 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: "600" }}>
        {evaluationData.title}
      </h2>
      
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px", lineHeight: "1.5" }}>
        {evaluationData.description}
      </p>

      {/* BOTONES DE CONTROL */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        flexWrap: "wrap",
        marginBottom: "24px",
        alignItems: "center"
      }}>
        <button
          onClick={handleLoad}
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: loading ? "#4b5563" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "500"
          }}
        >
          {loading ? "⏳ Cargando..." : "🔄 Actualizar métricas"}
        </button>
      </div>

      {/* GRID DE MÉTRICAS - mismo patrón de grid que el componente anterior */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ 
          fontSize: "16px", 
          fontWeight: "600", 
          marginBottom: "12px"
        }}>
         Métricas de Evaluación
        </h3>
        
        <div className="metrics-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px"
        }}>
          {evaluationData.metrics.map((metric, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "8px",
                padding: "20px",
                border: "1px solid #334155"
              }}
            >
              <h4 style={{ 
                fontSize: "15px", 
                fontWeight: "600", 
                color: "#f1f5f9", 
                marginBottom: "8px"
              }}>
                {metric.name}
              </h4>
              
              <div style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#60a5fa",
                marginBottom: "12px"
              }}>
                {metric.value}
              </div>
              
              <p style={{ 
                fontSize: "13px", 
                color: "#cbd5e1", 
                lineHeight: "1.4",
                marginBottom: "12px"
              }}>
                {metric.description}
              </p>
              
              {/* Barra de progreso */}
              <div style={{ 
                width: "100%",
                height: "6px",
                backgroundColor: "#334155",
                borderRadius: "3px",
                overflow: "hidden",
                marginBottom: "8px"
              }}>
                <div style={{
                  width: `${calculateProgress(metric.name, metric.value)}%`,
                  height: "100%",
                  backgroundColor: getMetricColor(metric.name, metric.value),
                  borderRadius: "3px"
                }} />
              </div>
              
              <div style={{
                fontSize: "12px",
                color: getMetricColor(metric.name, metric.value),
                fontWeight: "600"
              }}>
                {getMetricQuality(metric.name, metric.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESUMEN - GRID ADAPTATIVO */}
      <div style={{ 
        backgroundColor: "#1e293b",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "16px",
        border: "1px solid #334155"
      }}>
        <h3 style={{ 
          fontSize: "16px", 
          fontWeight: "600", 
          marginBottom: "16px"
        }}>
          Resumen de Evaluación
        </h3>
        
        <div className="summary-grid" style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
          marginBottom: "16px"
        }}>
          {evaluationData.metrics.map((metric, index) => (
            <div key={index} style={{
              backgroundColor: "#0f172a",
              padding: "16px",
              borderRadius: "6px",
              borderLeft: `3px solid ${getMetricColor(metric.name, metric.value)}`
            }}>
              <div style={{ 
                fontWeight: "600", 
                color: "#f1f5f9",
                fontSize: "14px",
                marginBottom: "8px"
              }}>
                {metric.name}
              </div>
              <p style={{ 
                fontSize: "13px", 
                color: "#94a3b8", 
                margin: 0,
                lineHeight: "1.4",
                marginBottom: "8px"
              }}>
                {getMetricInterpretation(metric.name, metric.value)}
              </p>
              <div style={{
                fontSize: "12px",
                color: getMetricColor(metric.name, metric.value),
                fontWeight: "600"
              }}>
                Valor: {metric.value}
              </div>
            </div>
          ))}
        </div>
        
        {/* Recomendaciones */}
        <div style={{
          backgroundColor: "#0f172a",
          padding: "16px",
          borderRadius: "6px",
          borderLeft: "3px solid #f59e0b"
        }}>
          <h4 style={{ 
            fontSize: "14px", 
            fontWeight: "600", 
            color: "#fbbf24", 
            marginBottom: "8px"
          }}>
            Recomendaciones
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: "20px", 
            fontSize: "13px", 
            color: "#cbd5e1",
            lineHeight: "1.5"
          }}>
            <li style={{ marginBottom: "4px" }}>Ajustar clusters si silueta &lt; 0.5</li>
            <li style={{ marginBottom: "4px" }}>Optimizar separación si Davies-Bouldin &gt; 1.0</li>
            <li style={{ marginBottom: "4px" }}>Validar con múltiples métricas</li>
            <li>Realizar análisis de sensibilidad</li>
          </ul>
        </div>
      </div>

      {/* NOTA FINAL */}
      <div style={{ 
        backgroundColor: "#0f172a",
        padding: "14px",
        borderRadius: "6px",
        border: "1px dashed #475569",
        textAlign: "center"
      }}>
        <p style={{ 
          fontSize: "13px", 
          color: "#94a3b8", 
          margin: 0, 
          fontStyle: "italic"
        }}>
          {evaluationData.note}
        </p>
      </div>
    </section>
  );
}

// Funciones auxiliares
function calculateProgress(metricName, value) {
  const valueNum = parseFloat(value);
  
  switch(metricName) {
    case "Inercia":
      return Math.max(0, Math.min(100, 100 - (valueNum * 0.5)));
    case "Índice Calinski–Harabasz":
      return Math.max(0, Math.min(100, valueNum * 1.5));
    case "Coeficiente de Silueta":
      return Math.max(0, Math.min(100, ((valueNum + 1) / 2) * 100));
    case "Índice de Davies–Bouldin":
      return Math.max(0, Math.min(100, 100 - (valueNum * 0.8)));
    default:
      return 50;
  }
}

function getMetricColor(metricName, value) {
  const valueNum = parseFloat(value);
  
  switch(metricName) {
    case "Inercia":
      return valueNum < 50 ? "#10b981" : valueNum < 100 ? "#f59e0b" : "#ef4444";
    case "Índice Calinski–Harabasz":
      return valueNum > 200 ? "#10b981" : valueNum > 100 ? "#f59e0b" : "#ef4444";
    case "Coeficiente de Silueta":
      if (valueNum > 0.7) return "#10b981";
      if (valueNum > 0.5) return "#f59e0b";
      if (valueNum > 0.3) return "#f97316";
      return "#ef4444";
    case "Índice de Davies–Bouldin":
      return valueNum < 0.5 ? "#10b981" : valueNum < 1.0 ? "#f59e0b" : "#ef4444";
    default:
      return "#60a5fa";
  }
}

function getMetricInterpretation(metricName, value) {
  const valueNum = parseFloat(value);
  
  switch(metricName) {
    case "Inercia":
      if (valueNum < 50) return "Clusters muy compactos y bien definidos";
      if (valueNum < 100) return "Compactación moderada de clusters";
      return "Clusters poco compactos, considerar ajustar modelo";
    case "Índice Calinski–Harabasz":
      if (valueNum > 200) return "Excelente separación entre clusters";
      if (valueNum > 100) return "Buena separación entre clusters";
      return "Separación insuficiente entre clusters";
    case "Coeficiente de Silueta":
      if (valueNum > 0.7) return "Estructura de clusters fuerte y bien definida";
      if (valueNum > 0.5) return "Estructura razonable de clusters";
      if (valueNum > 0.3) return "Estructura débil o traslapada de clusters";
      return "Posible asignación incorrecta de puntos a clusters";
    case "Índice de Davies–Bouldin":
      if (valueNum < 0.5) return "Clusters muy bien separados y compactos";
      if (valueNum < 1.0) return "Separación aceptable entre clusters";
      return "Clusters muy similares o traslapados";
    default:
      return "Métrica dentro del rango esperado";
  }
}

function getMetricQuality(metricName, value) {
  const valueNum = parseFloat(value);
  
  switch(metricName) {
    case "Inercia":
      if (valueNum < 50) return "Excelente";
      if (valueNum < 100) return "Aceptable";
      return "Necesita mejora";
    case "Índice Calinski–Harabasz":
      if (valueNum > 200) return "Excelente";
      if (valueNum > 100) return "Bueno";
      return "Regular";
    case "Coeficiente de Silueta":
      if (valueNum > 0.7) return "Excelente";
      if (valueNum > 0.5) return "Bueno";
      if (valueNum > 0.3) return "Regular";
      return "Deficiente";
    case "Índice de Davies–Bouldin":
      if (valueNum < 0.5) return "Excelente";
      if (valueNum < 1.0) return "Aceptable";
      return "Necesita mejora";
    default:
      return "Normal";
  }
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
