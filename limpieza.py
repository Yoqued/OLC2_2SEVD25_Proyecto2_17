import pandas as pd
import numpy as np


# Leer el archivo CSV
df = pd.read_csv("clientes.csv")

# 1. TIPO CORRECTO DE LOS DATOS

# Columnas numéricas para el análisis
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
    df[col] = pd.to_numeric(df[col], errors='coerce')

df['canal_principal'] = df['canal_principal'].astype(str)


# 2. ELIMINACIÓN DE DUPLICADOS POR cliente_id y reseña_id

df = df.drop_duplicates(subset=[
    'cliente_id',
    'reseña_id'
])

# 3. LIMPIEZA DE VARIABLES

# FRECUENCIA COMPRA

df.loc[df['frecuencia_compra'] < 0, 'frecuencia_compra'] = np.nan

q1 = df['frecuencia_compra'].quantile(0.25)
q3 = df['frecuencia_compra'].quantile(0.75)
iqr = q3 - q1

limite_superior = q3 + 1.5 * iqr

df.loc[df['frecuencia_compra'] > limite_superior, 'frecuencia_compra'] = np.nan


# 3. LIMPIEZA DE VARIABLES

# MONTO TOTAL GASTADO

df.loc[df['monto_total_gastado'] < 0, 'monto_total_gastado'] = np.nan

q1 = df['monto_total_gastado'].quantile(0.25)
q3 = df['monto_total_gastado'].quantile(0.75)
iqr = q3 - q1

limite_superior = q3 + 3.0 * iqr

df.loc[df['monto_total_gastado'] > limite_superior, 'monto_total_gastado'] = np.nan


# 3. LIMPIEZA DE VARIABLES

# MONTO PROMEDIO COMPRA

df.loc[df['monto_promedio_compra'] < 0, 'monto_promedio_compra'] = np.nan

q1 = df['monto_promedio_compra'].quantile(0.25)
q3 = df['monto_promedio_compra'].quantile(0.75)
iqr = q3 - q1

limite_superior = q3 + 1.5 * iqr

df.loc[df['monto_promedio_compra'] > limite_superior, 'monto_promedio_compra'] = np.nan


# 3. LIMPIEZA DE VARIABLES

# MONTO PROMEDIO COMPRA

df.loc[df['dias_desde_ultima_compra'] < 0, 'dias_desde_ultima_compra'] = np.nan


# 3. LIMPIEZA DE VARIABLES

# ANTIGUEDAD CLIENTE MESES

df.loc[df['antiguedad_cliente_meses'] < 0, 'antiguedad_cliente_meses'] = np.nan

q1 = df['antiguedad_cliente_meses'].quantile(0.25)
q3 = df['antiguedad_cliente_meses'].quantile(0.75)
iqr = q3 - q1

limite_superior = q3 + 1.5 * iqr

df.loc[
    df['antiguedad_cliente_meses'] > limite_superior,
    'antiguedad_cliente_meses'
] = np.nan


# 3. LIMPIEZA DE VARIABLES

# CANAL PRINCIPAL

df['canal_principal'] = (
    df['canal_principal']
    .str.strip()
    .str.lower()
)

# 3. LIMPIEZA DE VARIABLES

# NUMERO PRODUCTOS DISTINTOS

df.loc[df['numero_productos_distintos'] < 0, 'numero_productos_distintos'] = np.nan

# 2. Detección de outliers (IQR - límite superior)
q1 = df['numero_productos_distintos'].quantile(0.25)
q3 = df['numero_productos_distintos'].quantile(0.75)
iqr = q3 - q1

limite_superior = q3 + 1.5 * iqr

df.loc[
    df['numero_productos_distintos'] > limite_superior,
    'numero_productos_distintos'
] = np.nan


# 3. LIMPIEZA DE VARIABLES

# RESEÑA ID

df['reseña_id'] = pd.to_numeric(df['reseña_id'], errors='coerce')

df.loc[df['reseña_id'] <= 0, 'reseña_id'] = np.nan


# 3. LIMPIEZA DE VARIABLES

# TEXTO RESEÑA

df['texto_reseña'] = df['texto_reseña'].astype(str)

# Eliminar valores nulos y textos vacíos
df['texto_reseña'] = df['texto_reseña'].str.strip()
df = df[df['texto_reseña'] != '']
df = df[df['texto_reseña'].notna()]


# 3. LIMPIEZA DE VARIABLES

# FECHA RESEÑA

# Convertir a datetime (errores → NaT)
df['fecha_reseña'] = pd.to_datetime(
    df['fecha_reseña'],
    errors='coerce'
)

# 3. LIMPIEZA DE VARIABLES

# PRODUCTO CATEGORIA

df['producto_categoria'] = df['producto_categoria'].astype(str)

# Limpieza básica
df['producto_categoria'] = (
    df['producto_categoria']
    .str.strip()
    .str.lower()
)

# 3. LIMPIEZA DE VARIABLES

# LONGITUD RESEÑA

df['longitud_reseña'] = df['texto_reseña'].str.split().str.len()

# Asegurar tipo numérico
df['longitud_reseña'] = pd.to_numeric(
    df['longitud_reseña'],
    errors='coerce'
)

# 4. IMPUTACIÓN O ELIMINACIÓN

# CLIENTE ID

df = df[df['cliente_id'].notna()]


# 4. IMPUTACIÓN O ELIMINACIÓN

# FRECUENCIA COMPRA

mediana_frecuencia = df['frecuencia_compra'].median()
df['frecuencia_compra'] = df['frecuencia_compra'].fillna(mediana_frecuencia)


# 4. IMPUTACIÓN O ELIMINACIÓN

# MONTO TOTAL GASTADO

mediana_monto_total = df['monto_total_gastado'].median()
df['monto_total_gastado'] = df['monto_total_gastado'].fillna(mediana_monto_total)


# 4. IMPUTACIÓN O ELIMINACIÓN 

# MONTO PROMEDIO COMPRA

mediana_monto_promedio = df['monto_promedio_compra'].median()
df['monto_promedio_compra'] = df['monto_promedio_compra'].fillna(mediana_monto_promedio)


# 4. IMPUTACIÓN O ELIMINACIÓN

# DIAS DESDE ULTIMA COMPRA

mediana_dias = df['dias_desde_ultima_compra'].median()
df['dias_desde_ultima_compra'] = df['dias_desde_ultima_compra'].fillna(mediana_dias)


# 4. IMPUTACION O ELIMINACIÓN

# ANTIGUEDAD CLIENTE MESES 

mediana_antiguedad = df['antiguedad_cliente_meses'].median()
df['antiguedad_cliente_meses'] = df['antiguedad_cliente_meses'].fillna(mediana_antiguedad)


# 4. IMPUTACION O ELIMINACIÓN

# NUMERO PRODUCTOS DISTINTOS

mediana_productos = df['numero_productos_distintos'].median()
df['numero_productos_distintos'] = df['numero_productos_distintos'].fillna(mediana_productos)


# 4. IMPUTACION O ELIMINACIÓN

# RESEÑA ID

df = df[df['reseña_id'].notna()]


# 4. IMPUTACION O ELIMINACIÓN

# TEXTO RESEÑA

df = df[df['texto_reseña'].notna() & (df['texto_reseña'] != '')]


# 4. IMPUTACIÓN O ELIMINACIÓN 

# LONGITUD RESEÑA

df['longitud_reseña'] = df['longitud_reseña'].fillna(0)