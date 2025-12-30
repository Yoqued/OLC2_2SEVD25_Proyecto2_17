# OLC2_2SEVD25_ML_3<img src='https://user-images.githubusercontent.com/36779113/128587817-1a6c2fdc-d106-4dd3-b092-104c8299bded.png' background='white'>

## Universidad de San Carlos de Guatemala, Diciembre 2025

## Facultad de Ingeniería

## Escuela de Ciencias y Sistemas

## Laboratorio Organización de Lenguajes y Compiladores 2 Sección A

| DATOS DE LOS INTEGRANTES                  |
| ----------------------------------------- |
| Carné:    202102140                       |
| Nombre:   Javier Andrés Monterroso García |
| Carné:    202103988                       |
| Nombre:   Raúl David Yoque Sum            |

<br>
<br>
<br>

<center>

# Manual Técnico

</center>

<br>



## Introducción a InsightCluster

En la actualidad, las empresas generan y almacenan grandes volúmenes de datos relacionados con el comportamiento de sus clientes, tales como registros de consumo y reseñas de productos. Sin embargo, estos datos suelen carecer de etiquetas o clasificaciones previas, lo que dificulta su análisis directo y la identificación de patrones relevantes que apoyen la toma de decisiones.

InsightCluster es un proyecto desarrollado como parte del curso **Organización de Lenguajes y Compiladores 2**, cuyo objetivo es diseñar e implementar una aplicación basada en técnicas de **aprendizaje no supervisado** para la segmentación de clientes y el agrupamiento de reseñas textuales. A través del uso de algoritmos de clustering, el sistema busca descubrir estructuras y patrones ocultos en los datos sin la necesidad de información previamente etiquetada.

El proyecto integra un flujo completo de análisis que abarca desde la carga y limpieza de los datos, pasando por su normalización y transformación, hasta el entrenamiento, evaluación e interpretación de los modelos de clustering. De esta manera, InsightCluster no solo se enfoca en la aplicación técnica de algoritmos de machine learning, sino también en la correcta interpretación de los resultados obtenidos, traduciendo la información técnica en conocimiento útil y comprensible.

Finalmente, InsightCluster pretende reforzar los conocimientos adquiridos en el curso, promoviendo buenas prácticas de programación, análisis de datos y documentación técnica, así como el desarrollo de soluciones que puedan ser aplicables a contextos reales del ámbito empresarial.

<br>

## Limpieza de datos

### Tipo correcto de los datos

```python
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

# Convertir columnas a string
df['canal_principal'] = df['canal_principal'].astype("string")
df['texto_reseña'] = df['texto_reseña'].astype("string")
df['producto_categoria'] = df['producto_categoria'].astype("string")
```


En esta primera etapa del proceso de limpieza, consideramos fundamental asegurar que cada variable tenga el tipo de dato correcto, ya que un tipo incorrecto puede generar errores durante el análisis y afectar directamente el comportamiento de los algoritmos de clustering. Al trabajar con aprendizaje no supervisado, los modelos no corrigen este tipo de problemas por sí mismos, por lo que es responsabilidad nuestra preparar adecuadamente la información antes del entrenamiento.

Para el análisis de clientes, elaboramos un conjunto de columnas que representan variables numéricas, tales como la frecuencia de compra, los montos gastados y la antigüedad del cliente. Estas variables deben ser estrictamente numéricas, ya que posteriormente serán utilizadas en cálculos estadísticos, procesos de normalización y algoritmos como K-Means, los cuales requieren valores numéricos válidos para operar correctamente.

Al convertir estas columnas a tipo numérico, utilizamos un mecanismo que permite manejar errores de forma controlada. En lugar de provocar una interrupción del proceso cuando se encuentra un valor inválido —por ejemplo texto, símbolos o datos mal ingresados—, dichos valores se transforman automáticamente en valores nulos (NaN). Esta decisión es importante porque nos permite identificar y tratar posteriormente los datos problemáticos, ya sea mediante imputación o eliminación, sin comprometer la continuidad del flujo de limpieza.

Por otro lado, identificamos variables que representan información textual o categórica, como el canal principal de compra, el texto de la reseña y la categoría del producto. En estos casos, forzamos su conversión a tipo string para garantizar un manejo consistente del texto. Esta conversión resulta clave para aplicar operaciones de limpieza posteriores, como la normalización de mayúsculas y minúsculas, la eliminación de espacios innecesarios y el procesamiento del contenido textual de las reseñas.

<br>

### Eliminación de registros duplicados

```python
# Eliminación de duplicados por cliente_id y reseña_id
df = df.drop_duplicates(subset=[
    'cliente_id',
    'reseña_id'
])
```

En esta etapa consideramos importante eliminar registros duplicados presentes en el conjunto de datos, ya que la existencia de información repetida puede distorsionar los resultados del análisis y afectar la correcta formación de los clusters. En particular, elaboramos la limpieza tomando como referencia la combinación de las variables cliente_id y reseña_id, debido a que esta pareja identifica de forma única la relación entre un cliente y una reseña específica.

La presencia de duplicados en este contexto podría provocar que ciertos clientes o reseñas tengan mayor peso dentro del modelo, influyendo de manera incorrecta en las métricas de similitud y en la asignación de los grupos durante el proceso de clustering. Al eliminar estos duplicados, aseguramos que cada reseña asociada a un cliente sea considerada una sola vez, manteniendo la coherencia y representatividad de los datos.

Esta limpieza resulta especialmente relevante en un enfoque de aprendizaje no supervisado, donde el modelo no distingue entre información válida y redundante. Por ello, al depurar los registros duplicados desde esta etapa, contribuimos a que el análisis posterior se base en información más confiable, equilibrada y consistente, mejorando la calidad de los resultados obtenidos.

<br>

### Limpieza de variables

```python
# FRECUENCIA COMPRA

df.loc[df['frecuencia_compra'] < 0, 'frecuencia_compra'] = np.nan

q1 = df['frecuencia_compra'].quantile(0.25)
q3 = df['frecuencia_compra'].quantile(0.75)
iqr = q3 - q1

limite_superior = q3 + 1.5 * iqr

df.loc[df['frecuencia_compra'] > limite_superior, 'frecuencia_compra'] = np.nan
```


En esta etapa nos enfocamos en la limpieza de la variable frecuencia_compra, la cual representa la cantidad de compras realizadas por un cliente en un periodo determinado. Consideramos que esta variable es especialmente sensible, ya que valores incorrectos pueden alterar de forma significativa el comportamiento del modelo de clustering.

En primer lugar, elaboramos una validación básica para identificar valores negativos. Dado que no es lógico que un cliente tenga una frecuencia de compra menor a cero, decidimos marcar estos casos como valores nulos. Esta decisión nos permite reconocerlos posteriormente como datos inválidos y tratarlos de forma adecuada sin introducir información errónea al análisis.

Posteriormente, abordamos la presencia de valores atípicos utilizando el método del rango intercuartílico (IQR). Para ello, calculamos el primer y tercer cuartil de la variable y obtenemos el rango entre ambos. A partir de este valor, definimos un límite superior que nos permite identificar frecuencias de compra excesivamente altas en comparación con el comportamiento general de los clientes.

Cuando un valor supera este límite, lo consideramos atípico y lo convertimos en nulo. Esta limpieza es importante porque valores extremadamente grandes pueden dominar las distancias utilizadas por algoritmos como K-Means, provocando clusters poco representativos del conjunto de datos. Al controlar estos valores, buscamos que la variable refleje de manera más realista el patrón de compra típico de los clientes.

En conjunto, este proceso contribuye a que la información utilizada para el análisis sea más estable, coherente y adecuada para el entrenamiento de modelos de aprendizaje no supervisado, mejorando la calidad de los segmentos obtenidos.

En el caso de las variables monto_total_gastado, monto_promedio_compra, antiguedad_cliente_meses y numero_productos_distintos, aplicamos el mismo criterio de limpieza utilizado previamente para la variable frecuencia_compra. Consideramos que estas variables también representan magnitudes numéricas sensibles a valores inválidos y atípicos, por lo que fue necesario controlar tanto valores negativos como extremos antes del análisis.

De manera particular, elaboramos un umbral más flexible para las variables monto_total_gastado y antiguedad_cliente_meses, utilizando un límite superior de tres veces el rango intercuartílico. Esta decisión se tomó debido a que estas variables suelen presentar una mayor dispersión natural, ya sea por clientes con un historial largo de relación con la empresa o por consumidores con niveles de gasto acumulado significativamente más altos que el promedio.

<br>

### Limpieza de la variable dias_desde_ultima_compra

```python
df.loc[df['dias_desde_ultima_compra'] < 0, 'dias_desde_ultima_compra'] = np.nan

p95 = df["dias_desde_ultima_compra"].quantile(0.95)

df.loc[df["dias_desde_ultima_compra"] > p95, "dias_desde_ultima_compra"] = p95
```
En el caso de la variable dias_desde_ultima_compra, consideramos importante aplicar un tratamiento ligeramente distinto al de otras variables numéricas. Esta variable representa el tiempo que ha pasado desde la última compra de un cliente, por lo que es normal que existan valores altos, especialmente en clientes que llevan mucho tiempo sin interactuar con la empresa.

En primer lugar, eliminamos los valores negativos, ya que no es posible que hayan transcurrido días negativos desde una compra. Estos casos se consideran errores en los datos y se marcan como valores nulos para su posterior tratamiento.

Posteriormente, elaboramos un control de valores extremos utilizando el percentil 95. En lugar de eliminar por completo los valores muy altos, decidimos limitar su impacto estableciendo un tope máximo. Esto significa que cualquier valor que supere dicho percentil se reemplaza por el valor del percentil 95, manteniendo así la información general del comportamiento de los clientes sin permitir que unos pocos casos extremos dominen el análisis.

Este enfoque nos pareció más adecuado para esta variable, ya que permite conservar a los clientes con largos periodos de inactividad dentro del análisis, pero evitando que estos valores distorsionen las distancias utilizadas por el algoritmo de clustering. De esta forma, logramos un balance entre preservar información relevante y mantener la estabilidad del modelo en las etapas posteriores.


<br>

### Limpieza de la variable texto_reseña

```python
df['texto_reseña'] = (
    df['texto_reseña']
    .str.strip()
    .str.lower()
)

df = df[df['texto_reseña'].notna() & (df['texto_reseña'] != "")]
```

En la variable texto_reseña consideramos necesario normalizar el contenido antes de cualquier análisis. Elaboramos esta limpieza para eliminar espacios innecesarios y unificar el texto en minúsculas, evitando que diferencias de formato influyan en el procesamiento de las reseñas.

Además, decidimos eliminar los registros que no contienen texto válido, ya sea porque están vacíos o porque el valor es nulo. Esta depuración es importante porque una reseña sin contenido no aporta información útil y podría afectar negativamente los resultados del análisis textual y del proceso de clustering.

<br>

### Tratamiento de la variable cliente_id

```python
df = df[df['cliente_id'].notna()]
```
En el caso de la variable cliente_id, consideramos que su presencia es indispensable para el análisis, ya que identifica de forma única a cada cliente. Por esta razón, elaboramos una limpieza directa eliminando aquellos registros donde este valor no está presente.

Mantener registros sin identificador no aporta información útil y puede generar inconsistencias durante el análisis. Al eliminar estos casos, aseguramos que todos los datos utilizados correspondan a clientes válidos y correctamente identificados, fortaleciendo la calidad del conjunto de datos de entrada.

<br>

### Imputación de valores faltantes en variables numéricas

```python
mediana_frecuencia = df['frecuencia_compra'].median()
df['frecuencia_compra'] = df['frecuencia_compra'].fillna(mediana_frecuencia)
```

Después de limpiar valores inválidos y recortar outliers, consideramos que era importante resolver los valores faltantes porque, si dejamos NaN, muchas veces los algoritmos simplemente no pueden entrenar o terminan descartando filas completas. Eso significa que podríamos perder bastantes registros y, al final, el clustering se haría con menos información de la que realmente tenemos. Por eso elaboramos una imputación para “rellenar” esos huecos y mantener el dataset lo más completo posible, sin inventar valores raros ni meter ruido innecesario.

Elegimos la mediana porque, en la práctica, suele ser una opción más segura que el promedio cuando trabajamos con datos de compras, montos y comportamiento de clientes. El promedio se puede “desbalancear” fácilmente si existen unos pocos valores muy grandes o muy pequeños (aunque ya hayamos limpiado outliers, siempre pueden quedar casos extremos o distribuciones muy sesgadas). En cambio, la mediana es el valor que queda en el centro cuando ordenamos los datos, así que no se deja influenciar tanto por esos extremos. Dicho de forma simple, la mediana representa mejor a un “cliente típico” y no se va a ir hacia arriba solo porque existan algunos clientes que gastan muchísimo o compran demasiado.

Además, como el clustering funciona comparando distancias entre clientes, si imputáramos con un valor demasiado alto o demasiado bajo, podríamos terminar moviendo artificialmente a varios registros hacia clusters que no les corresponden. La mediana ayuda a que ese “relleno” sea más neutral y menos invasivo, o sea, que complete el dato sin alterar demasiado el patrón real del cliente.

Por esa misma razón, decidimos aplicar exactamente este criterio en las demás variables numéricas del dataset, como monto_total_gastado, monto_promedio_compra, dias_desde_ultima_compra, antiguedad_cliente_meses y numero_productos_distintos. Al imputarlas todas igual, mantenemos consistencia en el tratamiento del dataset y aseguramos que el modelo pueda trabajar con un conjunto estable, completo y más representativo, sin que los valores faltantes se conviertan en un problema durante el entrenamiento y la evaluación.



<br>
<br>
<br>
<br>

## K-Means
Para la segmentación de clientes con variables numéricas, consideramos que el enfoque más adecuado era utilizar K-Means, porque es un método de clustering que agrupa datos basándose en qué tan “parecidos” son entre sí, usando distancias. En pocas palabras, lo que hace K-Means es intentar formar grupos donde los clientes dentro de un mismo grupo se parezcan bastante, y al mismo tiempo estén lo más separados posible de los clientes de otros grupos. Esto nos sirve mucho en este proyecto porque justamente queremos descubrir patrones de comportamiento sin tener etiquetas previas, es decir, sin saber de antemano qué tipo de cliente es cada quien.

![alt text](img/Cluster.png)

La idea detrás de K-Means es bastante directa. Primero, el algoritmo parte de un número de grupos que definimos nosotros (ese es el “K”). Luego, el método coloca unos puntos iniciales llamados centroides, que se pueden imaginar como el “centro” de cada grupo. Después, asigna cada cliente al centro que le quede más cercano, y vuelve a recalcular los centros con base en los clientes que quedaron asignados a cada grupo. Este proceso se repite varias veces hasta que los grupos dejan de cambiar de forma importante o hasta que se alcanza un límite de iteraciones. Lo bueno de esto es que al final obtenemos una segmentación clara: cada cliente queda en un grupo y ese grupo tiene un “perfil” numérico que se puede interpretar.

![alt text](img/iteraciones.webp)

En nuestro caso, K-Means encaja bien porque las variables que estamos usando para clientes son numéricas y continuas, como montos, frecuencia de compra, días desde la última compra, antigüedad y cantidad de productos distintos. Este tipo de variables se presta muy bien para un algoritmo basado en distancias, porque son medidas que se pueden comparar directamente. Además, como el objetivo es crear segmentos como “clientes frecuentes”, “clientes de alto gasto”, “clientes inactivos”, etc., K-Means normalmente logra separar bien este tipo de patrones cuando los datos están bien preparados.

Y aquí entra un punto clave: la limpieza y la normalización son muy importantes para que K-Means funcione bien. Como este algoritmo toma decisiones con base en distancias, si dejamos valores extremos o escalas muy diferentes, el modelo se puede sesgar. Por ejemplo, una variable como monto_total_gastado podría dominar completamente la formación de grupos si no se controla, y entonces el clustering terminaría agrupando solo por “quién gasta más”, ignorando otras señales importantes como la frecuencia o la antigüedad. Por eso, primero limpiamos valores inválidos y controlamos outliers, y luego trabajamos con variables en una escala comparable. Esa preparación hace que K-Means sea más justo con todas las variables y la segmentación resulte más representativa.

#### Razones para la elección del modelo

* Una de las razones por la cual elegimos K-Means es porque se adapta de forma natural al análisis de variables numéricas, que es precisamente el tipo de información que estamos utilizando para segmentar a los clientes. Al basarse en distancias entre observaciones, este algoritmo aprovecha muy bien variables continuas como montos, frecuencias, antigüedad y tiempos, permitiendo identificar patrones reales de comportamiento sin necesidad de transformar excesivamente los datos. Esto nos facilita obtener grupos que reflejan similitudes reales entre clientes, en lugar de segmentaciones forzadas o artificiales.

* Además, K-Means permite una interpretación directa de los clusters, ya que cada grupo puede analizarse a partir de los valores centrales de sus variables. Esto resulta clave en el proyecto, porque no solo buscamos agrupar clientes, sino también entender qué caracteriza a cada segmento. Gracias a esta propiedad, es posible describir los clusters en términos claros de comportamiento, como niveles de gasto, frecuencia de compra o grado de actividad, lo cual facilita el análisis posterior y la toma de decisiones basada en los resultados del modelo.

* También consideramos importante que K-Means ofrece un control claro sobre sus parámetros principales, lo que nos permite ajustar el modelo de manera consciente y justificada. Podemos definir el número de clusters según las necesidades del análisis, limitar el número de iteraciones para garantizar convergencia y realizar múltiples inicializaciones para reducir el riesgo de obtener resultados poco representativos debido a una mala selección inicial de centroides. Este control nos brinda mayor estabilidad en los resultados y nos permite evaluar distintas configuraciones hasta encontrar una segmentación más coherente.

<br>
<br>
<br>
<br>


## Separación del proceso de clustering

Para el entrenamiento del modelo consideramos que no todas las variables debían tratarse de la misma forma. En el proyecto contamos con información de naturaleza distinta: por un lado, variables numéricas relacionadas con el comportamiento de compra de los clientes y, por otro lado, información textual proveniente de las reseñas. Debido a esta diferencia, decidimos dividir el proceso de clustering en dos partes independientes, utilizando un enfoque específico para cada tipo de dato.

En esta sección nos enfocamos únicamente en el **clustering de variables numéricas**, ya que estas representan cantidades medibles como montos, frecuencias y tiempos. Al separarlas del análisis textual, logramos un tratamiento más adecuado de los datos y evitamos mezclar técnicas que no son compatibles entre sí. Esto nos permite obtener segmentos de clientes más claros y coherentes basados exclusivamente en su comportamiento numérico.



### Explicación de código de Clustering numérico

```python
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)
```

Para llevar a cabo el proceso de clustering numérico, elaboramos la importación de varias herramientas de la librería scikit-learn, las cuales nos permiten preparar los datos, entrenar el modelo y evaluar la calidad de los resultados obtenidos.

En primer lugar, utilizamos StandardScaler, que se encarga de normalizar las variables numéricas. Consideramos este paso esencial porque K-Means trabaja con distancias, y si las variables no están en la misma escala, aquellas con valores más grandes pueden influir de manera desproporcionada en la formación de los clusters.

Posteriormente, importamos el algoritmo KMeans, el cual será el modelo principal encargado de realizar la segmentación de los clientes. Este algoritmo agrupa los datos en función de su similitud, permitiéndonos identificar patrones de comportamiento sin necesidad de etiquetas previas.

Finalmente, incorporamos métricas internas de validación como silhouette_score, calinski_harabasz_score y davies_bouldin_score. Estas métricas nos permiten evaluar qué tan bien se formaron los clusters, midiendo aspectos como la cohesión dentro de los grupos y la separación entre ellos. Gracias a estas métricas, podemos respaldar de forma objetiva la calidad del agrupamiento obtenido y justificar las decisiones tomadas durante el entrenamiento del modelo.


<br>

```python
# Columnas numéricas que usarás para clustering de clientes
cols_cluster_numerico = [
    'frecuencia_compra',
    'monto_total_gastado',
    'monto_promedio_compra',
    'dias_desde_ultima_compra',
    'antiguedad_cliente_meses',
    'numero_productos_distintos'
]

# Matriz numérica
X_num = df[cols_cluster_numerico].copy()

# Normalización (importante para K-Means)
scaler = StandardScaler()
X_num_scaled = scaler.fit_transform(X_num)
```

En esta parte del proceso definimos de forma explícita cuáles variables numéricas serían utilizadas para el clustering de clientes. Consideramos únicamente aquellas columnas que describen el comportamiento de compra y la relación del cliente con la empresa, como la frecuencia, los montos, el tiempo desde la última compra, la antigüedad y la variedad de productos adquiridos. Al seleccionar solo estas variables, nos aseguramos de que el modelo se enfoque en información relevante y comparable entre clientes.

Posteriormente, elaboramos una matriz numérica a partir del conjunto de datos limpio, copiando únicamente las columnas seleccionadas. Esta matriz representa la base sobre la cual se aplicará el algoritmo de clustering, separando claramente las variables numéricas del resto de la información que no participa directamente en este análisis.

Antes de entrenar el modelo, consideramos fundamental normalizar los datos utilizando StandardScaler. Este paso es clave porque K-Means calcula distancias entre los datos, y si las variables no están en la misma escala, aquellas con valores más grandes, como los montos monetarios, podrían dominar el proceso de agrupamiento. Al normalizar, logramos que todas las variables tengan una influencia similar dentro del modelo, permitiendo que el clustering refleje de mejor manera el comportamiento general de los clientes y no solo una característica en particular.


<br>

```python
kmeans_num = KMeans(
    n_clusters = k_num,
    max_iter = max_iter_num,
    random_state = 42,
    n_init = n_init_num
) 
```

En esta parte lo que hicimos fue crear (configurar) el modelo de K-Means con los parámetros que van a controlar cómo se forman los clusters. Consideramos importante definir estos hiperparámetros de forma explícita porque K-Means no es algo que se ejecute de manera arbitaria: dependiendo de cómo lo configuremos, el resultado puede variar. La idea es tener control sobre el comportamiento del algoritmo para poder probar, ajustar y justificar por qué una segmentación se ve mejor que otra.

* El parámetro **n_clusters = k_num** indica cuántos grupos queremos que el algoritmo forme. Aquí elegimos manejarlo como un hiperparámetro porque realmente no existe un “K perfecto” universal; depende del conjunto de datos y de qué tan detallada queramos la segmentación. Si K es muy pequeño, terminamos metiendo clientes diferentes en el mismo grupo y perdemos detalle. Si K es muy grande, el modelo puede crear grupos demasiado específicos y difíciles de interpretar. Por eso, consideramos que este es el hiperparámetro más importante para ajustar: nos permite buscar un balance entre segmentos útiles y segmentos interpretables, y luego validar esa elección con métricas internas.

* El parámetro **max_iter = max_iter_num** define el número máximo de iteraciones que K-Means puede realizar para ajustar los centroides. En palabras simples, es el “límite de intentos” que le damos al algoritmo para estabilizar los clusters. Lo manejamos como hiperparámetro porque si el límite es muy bajo, el modelo podría quedarse a medias y no terminar de acomodar bien los grupos. En cambio, si es demasiado alto, normalmente no mejora mucho, solo hace que el entrenamiento tarde más. Entonces, lo que buscamos aquí es darle suficiente espacio para converger sin hacerlo innecesariamente pesado.

* El parámetro **random_state = 42** lo usamos para mantener consistencia en los resultados. K-Means inicia con centroides aleatorios (o casi aleatorios), y eso puede hacer que en diferentes ejecuciones salgan clusters ligeramente distintos. Al fijar random_state, logramos reproducibilidad: si volvemos a correr el modelo con los mismos datos y parámetros, obtendremos el mismo resultado. Esto es clave para poder comparar experimentos, documentar métricas y defender que nuestros resultados no cambiaron “por suerte”.

* Por último, **n_init = n_init_num** define cuántas veces se reinicia el algoritmo con diferentes inicializaciones de centroides y se elige la mejor solución. Este hiperparámetro es importante porque K-Means puede caer en una solución mala si arranca con centroides poco favorables. Al permitir varios reinicios, reducimos ese riesgo y aumentamos la probabilidad de obtener clusters más estables y representativos. En resumen, n_init funciona como una forma práctica de mejorar la calidad del resultado sin cambiar los datos, solo dándole más oportunidades al algoritmo de “empezar bien”.

En conjunto, elegimos manipular estos hiperparámetros porque son los que más impactan la calidad y estabilidad del clustering. n_clusters nos permite ajustar el nivel de detalle de la segmentación, max_iter asegura que el algoritmo tenga oportunidad de converger correctamente, n_init ayuda a evitar soluciones pobres por inicialización, y random_state garantiza que podamos reproducir y justificar los resultados. Todo esto nos facilita defender técnicamente las decisiones del modelo y respaldarlas luego con las métricas internas de evaluación.

<br>

```python
clusters_num = kmeans_num.fit_predict(X_num_scaled)

df['cluster_clientes'] = clusters_num
```

En esta etapa ejecutamos finalmente el modelo de K-Means sobre los datos numéricos ya normalizados. Al utilizar el método fit_predict, el algoritmo primero entrena el modelo, ajustando los centroides a partir de los datos, y luego asigna a cada cliente el cluster al que pertenece. De esta forma, cada registro queda asociado directamente a un grupo específico según su similitud con los demás clientes.

El resultado de este proceso es un arreglo donde cada valor representa el identificador del cluster asignado a un cliente. Posteriormente, incorporamos esta información al DataFrame original creando la columna cluster_clientes. Consideramos importante guardar esta asignación porque nos permite relacionar fácilmente cada cliente con su segmento correspondiente y continuar con el análisis, la interpretación de los clusters y la generación de reportes. De esta manera, el clustering deja de ser solo un resultado del modelo y pasa a formar parte integral del conjunto de datos para las siguientes etapas del proyecto.

<br>

```python
sil_num = silhouette_score(X_num_scaled, clusters_num)
inercia_num = kmeans_num.inertia_
ch_num = calinski_harabasz_score(X_num_scaled, clusters_num)
db_num = davies_bouldin_score(X_num_scaled, clusters_num)
```

Una vez que el modelo de K-Means ha sido entrenado y que cada cliente ha sido asignado a un cluster, consideramos necesario evaluar la calidad del agrupamiento obtenido. Dado que estamos trabajando con aprendizaje no supervisado y no contamos con etiquetas reales, utilizamos métricas internas, las cuales analizan la estructura de los clusters basándose únicamente en los datos y en la forma en que estos fueron agrupados.


* La métrica de Silhouette nos permite medir qué tan bien encaja cada cliente dentro de su cluster en comparación con los demás clusters. En términos simples, nos indica si los clientes están bien agrupados con otros similares o si, por el contrario, podrían pertenecer mejor a otro grupo. Valores más altos indican clusters más definidos y mejor separados.

* La inercia es una métrica propia de K-Means y representa la suma de las distancias de los puntos a su centroide correspondiente. Esta métrica nos da una idea de qué tan compactos son los clusters: valores más bajos indican que los clientes están más cerca del centro de su grupo. Aunque por sí sola no define si un modelo es “bueno” o “malo”, resulta muy útil para comparar diferentes configuraciones del modelo, especialmente al variar el número de clusters.

* La métrica de Calinski-Harabasz evalúa la relación entre la dispersión interna de los clusters y la separación entre ellos. En otras palabras, mide qué tan bien diferenciados están los grupos formados. Valores más altos suelen indicar una mejor estructura de clustering, con clusters compactos y bien separados.

* Por último, el índice de Davies-Bouldin analiza qué tan similares son los clusters entre sí. A diferencia de las métricas anteriores, en este caso valores más bajos indican un mejor resultado, ya que reflejan clusters más distintos y con menor solapamiento entre ellos.

En conjunto, estas métricas nos permiten evaluar el clustering desde diferentes perspectivas y respaldar de manera objetiva la calidad del modelo entrenado. Gracias a ellas, podemos comparar distintas configuraciones de K-Means y justificar técnicamente las decisiones tomadas durante el proceso de segmentación de clientes.