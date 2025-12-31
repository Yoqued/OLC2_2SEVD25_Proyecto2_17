import pandas as pd
import numpy as np

from sklearn.preprocessing import StandardScaler, normalize
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score

from sentence_transformers import SentenceTransformer



def limpiar_df(df: pd.DataFrame) -> pd.DataFrame:
    # -------------------------- AQUÍ EMPIEZA LA LIMPIEZA --------------------------

    cols_numericas = [
        'frecuencia_compra',
        'monto_total_gastado',
        'monto_promedio_compra',
        'dias_desde_ultima_compra',
        'antiguedad_cliente_meses',
        'numero_productos_distintos'
    ]

    # Convertir columnas a numérico (errores → NaN)
    for col in cols_numericas:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Convertir columnas a string (si existen)
    for col in ['canal_principal', 'texto_reseña', 'producto_categoria']:
        if col in df.columns:
            df[col] = df[col].astype("string")

    # Eliminar duplicados
    subset_dups = [c for c in ['cliente_id', 'reseña_id'] if c in df.columns]
    if subset_dups:
        df = df.drop_duplicates(subset=subset_dups)

    # FRECUENCIA COMPRA
    if 'frecuencia_compra' in df.columns:
        df.loc[df['frecuencia_compra'] < 0, 'frecuencia_compra'] = np.nan
        q1 = df['frecuencia_compra'].quantile(0.25)
        q3 = df['frecuencia_compra'].quantile(0.75)
        iqr = q3 - q1
        limite_superior = q3 + 1.5 * iqr
        df.loc[df['frecuencia_compra'] > limite_superior, 'frecuencia_compra'] = np.nan

    # MONTO TOTAL GASTADO
    if 'monto_total_gastado' in df.columns:
        df.loc[df['monto_total_gastado'] < 0, 'monto_total_gastado'] = np.nan
        q1 = df['monto_total_gastado'].quantile(0.25)
        q3 = df['monto_total_gastado'].quantile(0.75)
        iqr = q3 - q1
        limite_superior = q3 + 3.0 * iqr
        df.loc[df['monto_total_gastado'] > limite_superior, 'monto_total_gastado'] = np.nan

    # MONTO PROMEDIO COMPRA
    if 'monto_promedio_compra' in df.columns:
        df.loc[df['monto_promedio_compra'] < 0, 'monto_promedio_compra'] = np.nan
        q1 = df['monto_promedio_compra'].quantile(0.25)
        q3 = df['monto_promedio_compra'].quantile(0.75)
        iqr = q3 - q1
        limite_superior = q3 + 1.5 * iqr
        df.loc[df['monto_promedio_compra'] > limite_superior, 'monto_promedio_compra'] = np.nan

    # DIAS DESDE ULTIMA COMPRA
    if 'dias_desde_ultima_compra' in df.columns:
        df.loc[df['dias_desde_ultima_compra'] < 0, 'dias_desde_ultima_compra'] = np.nan
        p95 = df["dias_desde_ultima_compra"].quantile(0.95)
        df.loc[df["dias_desde_ultima_compra"] > p95, "dias_desde_ultima_compra"] = p95

    # ANTIGUEDAD CLIENTE MESES
    if 'antiguedad_cliente_meses' in df.columns:
        df.loc[df['antiguedad_cliente_meses'] < 0, 'antiguedad_cliente_meses'] = np.nan
        q1 = df['antiguedad_cliente_meses'].quantile(0.25)
        q3 = df['antiguedad_cliente_meses'].quantile(0.75)
        iqr = q3 - q1
        limite_superior = q3 + 3 * iqr
        df.loc[df['antiguedad_cliente_meses'] > limite_superior, 'antiguedad_cliente_meses'] = np.nan

    # CANAL PRINCIPAL
    if 'canal_principal' in df.columns:
        df['canal_principal'] = df['canal_principal'].str.strip().str.lower()

    # NUMERO PRODUCTOS DISTINTOS
    if 'numero_productos_distintos' in df.columns:
        df.loc[df['numero_productos_distintos'] < 0, 'numero_productos_distintos'] = np.nan
        q1 = df['numero_productos_distintos'].quantile(0.25)
        q3 = df['numero_productos_distintos'].quantile(0.75)
        iqr = q3 - q1
        limite_superior = q3 + 1.5 * iqr
        df.loc[df['numero_productos_distintos'] > limite_superior, 'numero_productos_distintos'] = np.nan

    # RESEÑA ID
    if 'reseña_id' in df.columns:
        df['reseña_id'] = pd.to_numeric(df['reseña_id'], errors='coerce')
        df.loc[df['reseña_id'] <= 0, 'reseña_id'] = np.nan

    # TEXTO RESEÑA
    if 'texto_reseña' in df.columns:
        df['texto_reseña'] = df['texto_reseña'].str.strip().str.lower()
        df = df[df['texto_reseña'].notna() & (df['texto_reseña'] != "")]

    # FECHA RESEÑA
    if 'fecha_reseña' in df.columns:
        df['fecha_reseña'] = pd.to_datetime(df['fecha_reseña'], errors='coerce')

    # PRODUCTO CATEGORIA
    if 'producto_categoria' in df.columns:
        df['producto_categoria'] = df['producto_categoria'].str.strip().str.lower()

    # LONGITUD RESEÑA
    if 'texto_reseña' in df.columns:
        df['longitud_reseña'] = df['texto_reseña'].str.split().str.len()
        df['longitud_reseña'] = pd.to_numeric(df['longitud_reseña'], errors='coerce')

    # 4. IMPUTACIÓN O ELIMINACIÓN

    if 'cliente_id' in df.columns:
        df = df[df['cliente_id'].notna()]

    # Imputación medianas
    def fill_median(col):
        if col in df.columns:
            med = df[col].median()
            df[col] = df[col].fillna(med)

    fill_median('frecuencia_compra')
    fill_median('monto_total_gastado')
    fill_median('monto_promedio_compra')
    fill_median('dias_desde_ultima_compra')
    fill_median('antiguedad_cliente_meses')
    fill_median('numero_productos_distintos')

    if 'reseña_id' in df.columns:
        df = df[df['reseña_id'].notna()]

    return df


# =========================
# CONFIG
# =========================

COLS_CLUSTER_NUM = [
    'frecuencia_compra',
    'monto_total_gastado',
    'monto_promedio_compra',
    'dias_desde_ultima_compra',
    'antiguedad_cliente_meses',
    'numero_productos_distintos'
]


# =========================
# ENTRENAMIENTO NUMÉRICO
# =========================

def entrenar_numerico(df: pd.DataFrame, cfg: dict):
    # Hiperparámetros desde el front
    k_num = int(cfg.get("k_clientes", 6))
    max_iter_num = int(cfg.get("max_iter", 300))
    n_init_num = int(cfg.get("n_init", 10))

    # Validación básica (según tus rangos)
    if not (2 <= k_num <= 100):
        raise ValueError("k_clientes fuera de rango (2-100)")
    if not (100 <= max_iter_num <= 500):
        raise ValueError("max_iter fuera de rango (100-500)")
    if not (5 <= n_init_num <= 30):
        raise ValueError("n_init fuera de rango (5-30)")

    # Matriz numérica
    X_num = df[COLS_CLUSTER_NUM].copy()

    # Normalización
    scaler = StandardScaler()
    X_num_scaled = scaler.fit_transform(X_num)

    # KMeans
    kmeans_num = KMeans(
        n_clusters=k_num,
        max_iter=max_iter_num,
        random_state=42,
        n_init=n_init_num
    )

    clusters_num = kmeans_num.fit_predict(X_num_scaled)
    df["cluster_clientes"] = clusters_num

    # Métricas
    sil_num = float(silhouette_score(X_num_scaled, clusters_num))
    inercia_num = float(kmeans_num.inertia_)
    ch_num = float(calinski_harabasz_score(X_num_scaled, clusters_num))
    db_num = float(davies_bouldin_score(X_num_scaled, clusters_num))


    # Perfil por cluster (promedios)
    perfil_clientes = (
        df.groupby("cluster_clientes")[COLS_CLUSTER_NUM]
        .mean()
        .round(4)
        .reset_index()
        .to_dict(orient="records")
    )

    # Tamaño y porcentaje de cluster
    cluster_size = (
        df["cluster_clientes"]
        .value_counts()
        .rename("cantidad")
        .to_frame()
    )

    cluster_size["porcentaje"] = (
        cluster_size["cantidad"] / cluster_size["cantidad"].sum() * 100
    )

    # A formato JSON-friendly
    cluster_size_clientes = (
        cluster_size
        .reset_index()
        .rename(columns={"index": "cluster_clientes"})
        .sort_values("cluster_clientes")
        .round({"porcentaje": 2})
        .to_dict(orient="records")
    )


    metrics_num = {
        "k_clientes": k_num,
        "max_iter": max_iter_num,
        "n_init": n_init_num,
        "silhouette_clientes": sil_num,
        "inercia_clientes": inercia_num,
        "calinski_clientes": ch_num,
        "davies_clientes": db_num,
        "perfil_clientes": perfil_clientes,
        "cluster_size_clientes": cluster_size_clientes
    }

    return df, metrics_num


# =========================
# ENTRENAMIENTO TEXTO (RESEÑAS)
# =========================

def entrenar_texto(df: pd.DataFrame, cfg: dict):
    # Hiperparámetro K reseñas desde el front (usa tu cfg.k_reseñas)
    k_text = int(cfg.get("K_reseñas", 6))
    print("K texto:",k_text)
    if not (2 <= k_text <= 100):
        raise ValueError("k_reseñas fuera de rango (2-100)")

    # 1) corpus limpio
    text_series = df["texto_reseña"].astype(str).fillna("").str.strip()
    text_series = text_series[text_series != ""]
    df_text = df.loc[text_series.index].copy()
    corpus = text_series.tolist()

    if len(corpus) < k_text:
        raise ValueError("Hay menos reseñas que k_reseñas. Baja k_reseñas.")

    # 2) sentence embeddings
    model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

    # 3) embeddings
    emb = model.encode(
        corpus,
        batch_size=64,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # 4) clustering
    kmeans = MiniBatchKMeans(
        n_clusters=k_text,
        random_state=42,
        batch_size=2048,
        max_iter=200,
        n_init="auto"
    )
    labels = kmeans.fit_predict(emb)
    df_text["cluster_reseñas"] = labels

    # 5) métricas (silhouette con sample)
    n = emb.shape[0]
    sample_size = min(5000, n)
    if sample_size < n:
        rng = np.random.RandomState(42)
        idx = rng.choice(n, size=sample_size, replace=False)
        sil = float(silhouette_score(emb[idx], labels[idx], metric="cosine"))
    else:
        sil = float(silhouette_score(emb, labels, metric="cosine"))

    ch = float(calinski_harabasz_score(emb, labels))
    db = float(davies_bouldin_score(emb, labels))
    inercia = float(kmeans.inertia_)

    # 6) guardar clusters al df original
    df.loc[df_text.index, "cluster_reseñas"] = df_text["cluster_reseñas"]

    print("-----------------------------------")

    metrics_text = {
        "k_reseñas": k_text,
        "silhouette_reseñas": sil,
        "inercia_reseñas": inercia,
        "calinski_reseñas": ch,
        "davies_reseñas": db,
    }

    return df, metrics_text


# =========================
# PIPELINE ENTRENAR TODO
# =========================

def entrenar_todo(df_clean: pd.DataFrame, cfg: dict):
    """
    Entrena numérico + texto y regresa:
    - df_trained (con cluster_clientes y cluster_reseñas)
    - metrics (dict para guardar/mostrar en front)
    """
    # copia para no mutar raro
    df = df_clean.copy()

    # numérico
    df, m_num = entrenar_numerico(df, cfg)

    # texto (si existe columna)
    if "texto_reseña" in df.columns:
        df, m_txt = entrenar_texto(df, cfg)
    else:
        m_txt = {"warning": "No existe columna texto_reseña, se omite clustering de reseñas."}

    metrics = {
        "clientes": m_num,
        "reseñas": m_txt,
    }
    return df, metrics