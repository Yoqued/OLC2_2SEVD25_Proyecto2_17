import pandas as pd
import numpy as np

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
