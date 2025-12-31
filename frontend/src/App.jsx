import { useEffect, useState } from "react";
import { getEvaluation } from "./api";
import "./App.css";


import {
  uploadCsv,
  preprocessData,
  trainClusters,
  getMetrics,
  exportReviews,
  exportSummary,
} from "./api";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [uploadId, setUploadId] = useState(null);


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
    <div className="app-shell">
      <header className="app-header">
        <h1 style={{ fontSize: "20px", fontWeight: "650", letterSpacing: "0.2px" }}>
          InsightCluster
        </h1>
        <span style={{ fontSize: "14px", color: "#9ca3af" }}>
          Segmentación de clientes y reseñas
        </span>
      </header>

      <div className="app-body">
        <nav className="app-sidebar">
          <NavButton classNameName="nav-btn" active={activeTab === "upload"} onClick={() => handleSetTab("upload")}>
            1. Carga masiva
          </NavButton>

          <NavButton classNameName="nav-btn" active={activeTab === "train"} onClick={() => handleSetTab("train")}>
            2. Configurar & Entrenar
          </NavButton>

          <NavButton classNameName="nav-btn" active={activeTab === "results"} onClick={() => handleSetTab("results")}>
            3. Metricas
          </NavButton>

          <NavButton classNameName="nav-btn" active={activeTab === "perfil"} onClick={() => handleSetTab("perfil")}>
            4. Perfil por cluster
          </NavButton>

          <div style={{ marginTop: "14px", fontSize: "12px", color: "#9ca3af", padding: "0 8px" }}>
            * Asegúrate de que el backend tenga CORS + credentials si usas sesión.
          </div>
        </nav>

        <main className="app-main">
          {!!globalMessage && <AlertBox kind="success">{globalMessage}</AlertBox>}
          {!!globalError && <AlertBox kind="error">{globalError}</AlertBox>}

          {activeTab === "upload" && (
            <UploadAndPreprocessSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
              uploadId={uploadId}
              setUploadId={setUploadId}
            />
          )}

          {activeTab === "train" && (
            <TrainSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
              cfg={cfg}
              setCfg={setCfg}
              uploadId={uploadId}
            />
          )}

          {activeTab === "results" && (
            <ResultsSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
              uploadId={uploadId}
            />
          )}

          {activeTab === "perfil" && (
            <PerfilClusterSection
              setGlobalMessage={setGlobalMessage}
              setGlobalError={setGlobalError}
              uploadId={uploadId}
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
function UploadAndPreprocessSection({ setGlobalMessage, setGlobalError, uploadId, setUploadId }) {
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

function TrainSection({ setGlobalMessage, setGlobalError, cfg, setCfg, uploadId }) {

  const [loadingSave, setLoadingSave] = useState(false);
  const [trainResponse, setTrainResponse] = useState(null);

  const update = (key, value) => setCfg((prev) => ({ ...prev, [key]: value }));

  const handleTrain = async () => {
    setGlobalError("");
    setGlobalMessage("");
    setTrainResponse(null);

    if (!uploadId) {
      setGlobalError("Primero sube el CSV y ejecuta Preprocesar.");
      return;
    }

    try {
      setLoadingSave(true);

      const res = await trainClusters({ ...cfg, upload_id: uploadId }); // ✅ AQUÍ

      setGlobalMessage(res.message || "Entrenamiento completado.");
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

            <SliderRow
              label="Número Clusters Reseñas (K_reseñas)"
              value={cfg.K_reseñas}
              min={2}
              max={100}
              step={1}
              onChange={(v) => update("K_reseñas", v)}
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
            <div><b>K reseñas:</b> {cfg.K_reseñas}</div>
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
function ResultsSection({ setGlobalMessage, setGlobalError, uploadId }) {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const load = async () => {
    setGlobalError("");
    setGlobalMessage("");

    const uid = typeof uploadId === "string" ? uploadId : uploadId?.upload_id;

    if (!uid) {
      setGlobalError("Primero sube el CSV (upload_id inválido).");
      return;
    }

    try {
      setLoading(true);
      const data = await getEvaluation(uid);
      setEvaluation(data);
      setGlobalMessage("Métricas cargadas.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (uploadId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  // ✅ Aquí es donde normalmente fallan: las llaves no coinciden.
  // Primero intentamos estos nombres:
  const num = evaluation?.clientes || evaluation?.metrics_num || evaluation?.numerico || {};
  const txt = evaluation?.reseñas || evaluation?.metrics_text || evaluation?.texto || {};

  const metricsClientes = [
    {
      name: "Inercia",
      value: num.inercia_clientes ?? num.inercia ?? num.inercia_num,
      desc: "Suma de distancias cuadradas al centroide. Menor = clusters más compactos."
    },
    {
      name: "Índice Calinski–Harabasz",
      value: num.calinski_clientes ?? num.calinski ?? num.ch_num,
      desc: "Relación entre separación y compactación. Mayor = mejor separación."
    },
    {
      name: "Coeficiente de Silueta",
      value: num.silhouette_clientes ?? num.silhouette ?? num.sil_num,
      desc: "Qué tan bien encaja un punto en su cluster. Rango: -1 a 1. Mayor = mejor."
    },
    {
      name: "Índice de Davies–Bouldin",
      value: num.davies_clientes ?? num.davies ?? num.db_num,
      desc: "Similitud promedio entre clusters. Menor = mejor separación."
    },
  ];

  const metricsResenas = [
    {
      name: "Inercia",
      value: txt.inercia_reseñas ?? txt.inercia ?? txt.inercia_text,
      desc: "Inercia del clustering de embeddings. Menor = más compacto."
    },
    {
      name: "Índice Calinski–Harabasz",
      value: txt.calinski_reseñas ?? txt.calinski ?? txt.ch,
      desc: "Separación entre clusters en embeddings. Mayor = mejor."
    },
    {
      name: "Coeficiente de Silueta",
      value: txt.silhouette_reseñas ?? txt.silhouette ?? txt.sil,
      desc: "Silueta (cosine). Mayor = mejor asignación de clusters."
    },
    {
      name: "Índice de Davies–Bouldin",
      value: txt.davies_reseñas ?? txt.davies ?? txt.db,
      desc: "Menor = clusters más distintos entre sí."
    },
  ];

  return (
    <section style={{ height: "calc(100vh - 80px)", overflowY: "auto", padding: "20px", paddingBottom: "60px" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: "600" }}>
        Evaluación y validación del análisis
      </h2>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: loading ? "#4b5563" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
        >
          {loading ? "⏳ Cargando..." : "🔄 Actualizar métricas"}
        </button>

        {uploadId && (
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            upload_id: <b style={{ color: "#e5e7eb" }}>{uploadId}</b>
          </span>
        )}
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Métricas (Clientes)</h3>
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metricsClientes.map((m, idx) => (
          <MetricCard key={idx} name={m.name} value={m.value} desc={m.desc} />
        ))}
      </div>

      <div style={{ marginTop: "26px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Métricas (Reseñas)</h3>
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {metricsResenas.map((m, idx) => (
            <MetricCard key={idx} name={m.name} value={m.value} desc={m.desc} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}


function PerfilClusterSection({ setGlobalMessage, setGlobalError, uploadId }) {
  const [loading, setLoading] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [rows, setRows] = useState([]);

  const load = async () => {
    setGlobalError("");
    setGlobalMessage("");

    const uid = typeof uploadId === "string" ? uploadId : uploadId?.upload_id;
    if (!uid) {
      setGlobalError("Primero sube el CSV, preprocesa y entrena (upload_id inválido).");
      return;
    }

    try {
      setLoading(true);

      const data = await getEvaluation(uid);
      const perfil =
        data?.clientes?.perfil_clientes ||
        data?.perfil_clientes ||
        [];

      const sizeTable =
      data?.clientes?.cluster_size_clientes ||
      data?.cluster_size_clientes ||
      [];
      

      if (!Array.isArray(perfil) || perfil.length === 0) {
        setRows([]);
        setGlobalError("No hay perfil_clientes aún. Asegúrate de haber ejecutado Entrenar.");
        return;
      }

      setRows(perfil);
      setSizes(Array.isArray(sizeTable) ? sizeTable : []);
      setGlobalMessage("Perfil por cluster cargado.");
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uploadId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const fmt = (v) => {
    const n = Number(v);
    if (Number.isFinite(n)) return n.toFixed(4);
    return v ?? "—";
  };

  return (
    <section style={{ height: "calc(100vh - 80px)", overflowY: "auto", padding: "20px", paddingBottom: "60px" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: "600" }}>
        Perfil promedio por cluster (Clientes)
      </h2>

      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
        Esta tabla es el equivalente a: <code>df.groupby("cluster_clientes")[cols].mean()</code>
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
        <PrimaryButton disabled={loading} onClick={load}>
          {loading ? "Cargando..." : "Actualizar tabla"}
        </PrimaryButton>

        {uploadId && (
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            upload_id: <b style={{ color: "#e5e7eb" }}>{uploadId}</b>
          </span>
        )}
      </div>

      <div style={{ border: "1px solid #334155", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto", backgroundColor: "#0b1220" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ backgroundColor: "#020617" }}>
                {columns.map((c) => (
                  <th
                    key={c}
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      fontSize: "12px",
                      color: "#cbd5e1",
                      borderBottom: "1px solid #334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} style={{ padding: "14px", color: "#9ca3af" }}>
                    Sin datos. Ejecuta Entrenar y luego vuelve a cargar.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #1f2937" }}>
                    {columns.map((c) => (
                      <td
                        key={c}
                        style={{
                          padding: "12px",
                          fontSize: "13px",
                          color: "#e5e7eb",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(r[c])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#9ca3af" }}>
        * Si quieres que el cluster sea el índice (como Colab), el campo normalmente viene como{" "}
        <b>cluster_clientes</b>.
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: "22px", marginBottom: "12px" }}>
        Tamaño y porcentaje por cluster
      </h3>

      <div style={{ border: "1px solid #334155", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto", backgroundColor: "#0b1220" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
            <thead>
              <tr style={{ backgroundColor: "#020617" }}>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", color: "#cbd5e1", borderBottom: "1px solid #334155" }}>
                  cluster_clientes
                </th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", color: "#cbd5e1", borderBottom: "1px solid #334155" }}>
                  cantidad
                </th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", color: "#cbd5e1", borderBottom: "1px solid #334155" }}>
                  porcentaje
                </th>
              </tr>
            </thead>

            <tbody>
              {sizes.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "14px", color: "#9ca3af" }}>
                    Sin datos. Ejecuta Entrenar y vuelve a cargar.
                  </td>
                </tr>
              ) : (
                sizes.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #1f2937" }}>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#e5e7eb" }}>{r.cluster_clientes}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#e5e7eb" }}>{r.cantidad}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#e5e7eb" }}>
                      {Number.isFinite(Number(r.porcentaje)) ? Number(r.porcentaje).toFixed(2) : "—"}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
    
  );
}


function clamp(v, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

function progressForMetric(name, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 0;

  switch (name) {
    case "Coeficiente de Silueta":
      return clamp(((v + 1) / 2) * 100); // [-1,1] => 0..100

    case "Índice de Davies–Bouldin":
      return clamp((1 - Math.min(v, 3) / 3) * 100); // menor mejor

    case "Índice Calinski–Harabasz":
      return clamp((Math.log10(v + 1) / Math.log10(1000)) * 100); // mayor mejor (suave)

    case "Inercia":
      return clamp((1 - Math.log10(v + 1) / Math.log10(1_000_000)) * 100); // menor mejor (suave)

    default:
      return 50;
  }
}

function colorForProgress(p) {
  if (p >= 75) return "#10b981";
  if (p >= 50) return "#f59e0b";
  return "#ef4444";
}

function labelForProgress(p) {
  if (p >= 75) return "Excelente";
  if (p >= 50) return "Aceptable";
  return "Necesita mejora";
}

function MetricCard({ name, value, desc }) {
  const v = Number(value);
  const display = Number.isFinite(v) ? v.toFixed(4) : "—";

  const pct = progressForMetric(name, v);
  const color = colorForProgress(pct);
  const label = labelForProgress(pct);

  return (
    <div style={{ backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" }}>
      <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "8px" }}>
        {name}
      </h4>

      {desc && (
        <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.4", marginTop: 0, marginBottom: "12px" }}>
          {desc}
        </p>
      )}

      <div style={{ fontSize: "24px", fontWeight: "800", color: "#60a5fa", marginBottom: "12px" }}>
        {display}
      </div>

      <div style={{ width: "100%", height: "6px", backgroundColor: "#334155", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color }} />
      </div>

      <div style={{ marginTop: "8px", fontSize: "12px", color, fontWeight: "700" }}>
        {label}
      </div>
    </div>
  );
}



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
              onClick={() => doExport("clients")}
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