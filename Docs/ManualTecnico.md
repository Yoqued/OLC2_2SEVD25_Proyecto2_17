# Manual Técnico - InsightCluster Frontend

## Tabla de Contenidos
1. [Información General](#información-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías y Herramientas](#tecnologías-y-herramientas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Principales](#componentes-principales)
6. [Flujo de Datos](#flujo-de-datos)
7. [API y Comunicación con Backend](#api-y-comunicación-con-backend)
8. [Gestión de Estado](#gestión-de-estado)
9. [Estilos y UI/UX](#estilos-y-uiux)
10. [Instalación y Configuración](#instalación-y-configuración)
11. [Despliegue](#despliegue)
12. [Mantenimiento y Mejoras](#mantenimiento-y-mejoras)

---

## Información General

**Nombre del Proyecto:** InsightCluster  
**Versión:** 1.0.0  
**Descripción:** Aplicación web para segmentación de clientes y análisis de reseñas mediante clustering de machine learning.

**Propósito:** Proporcionar una interfaz intuitiva para que usuarios no técnicos puedan:
- Cargar datasets en formato CSV
- Configurar algoritmos de clustering (K-Means)
- Visualizar resultados de segmentación
- Evaluar métricas de calidad del clustering
- Exportar resultados procesados

---

## Arquitectura del Sistema

### Patrón de Diseño
La aplicación sigue una arquitectura **Component-Based** utilizando React con hooks funcionales.

```
┌─────────────────────────────────────────┐
│          App.jsx (Root)                 │
│  - Gestión de navegación por tabs       │
│  - Estado global de configuración       │
│  - Manejo de mensajes globales          │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼────────┐  ┌────────▼────────┐
│  Sidebar   │  │   Main Content  │
│ Navigation │  │   Area          │
└────────────┘  └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ Upload &     │ │   Train     │ │  Results &  │
│ Preprocess   │ │  Section    │ │   Export    │
└──────────────┘ └─────────────┘ └─────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                    ┌────▼────┐
                    │  API    │
                    │ (api.js)│
                    └─────────┘
                         │
                    ┌────▼────┐
                    │ Backend │
                    │  REST   │
                    │   API   │
                    └─────────┘
```

---

## Tecnologías y Herramientas

### Framework y Librerías Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.3+ | Framework principal para construcción de UI |
| **Vite** | 5.4+ | Build tool y dev server de alto rendimiento |
| **JavaScript (ES6+)** | - | Lenguaje de programación |

### Dependencias de Desarrollo

```json
{
  "vite": "^5.4.10",
  "@vitejs/plugin-react": "^4.3.3",
  "eslint": "^9.13.0",
  "eslint-plugin-react": "^7.37.2",
  "eslint-plugin-react-hooks": "^5.0.0",
  "eslint-plugin-react-refresh": "^0.4.14"
}
```

### Herramientas de Desarrollo

- **ESLint**: Linting y análisis estático de código
- **Vite HMR**: Hot Module Replacement para desarrollo
- **React DevTools**: Depuración de componentes React

### Gestión de Paquetes
- **npm** o **yarn**: Gestión de dependencias

---

## Estructura del Proyecto

```
frontend/
├── node_modules/           # Dependencias instaladas
├── public/                 # Archivos estáticos públicos
├── src/
│   ├── assets/            # Recursos (imágenes, iconos)
│   │   └── react.svg
│   ├── api.js             # ⭐ Capa de comunicación con backend
│   ├── App.css            # Estilos globales CSS
│   ├── App.jsx            # ⭐ Componente principal
│   ├── index.css          # Estilos base de la aplicación
│   └── main.jsx           # ⭐ Punto de entrada de React
├── .gitignore             # Archivos ignorados por Git
├── eslint.config.js       # Configuración de ESLint
├── index.html             # Template HTML principal
├── package-lock.json      # Lock de versiones de dependencias
├── package.json           # ⭐ Configuración del proyecto
├── README.md              # Documentación del usuario
└── vite.config.js         # ⭐ Configuración de Vite
```

### Archivos Clave

#### `package.json`
Define scripts, dependencias y metadatos del proyecto:
```json
{
  "scripts": {
    "dev": "vite",              // Servidor de desarrollo
    "build": "vite build",      // Build de producción
    "preview": "vite preview",  // Preview del build
    "lint": "eslint ."          // Análisis de código
  }
}
```

#### `vite.config.js`
Configuración del bundler:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // Puerto de desarrollo
    proxy: {           // Proxy para evitar CORS
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

#### `main.jsx`
Punto de entrada que monta la aplicación React:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Componentes Principales

### 1. App Component (`App.jsx`)

**Responsabilidades:**
- Gestión de navegación entre secciones (tabs)
- Manejo de estado global de configuración
- Propagación de mensajes y errores
- Renderizado del layout principal

**Estado Principal:**
```javascript
const [activeTab, setActiveTab] = useState("upload");
const [globalMessage, setGlobalMessage] = useState("");
const [globalError, setGlobalError] = useState("");
const [cfg, setCfg] = useState({
  k_clientes: 6,      // Número de clusters para clientes
  max_iter: 300,      // Iteraciones máximas K-Means
  n_init: 10,         // Número de reinicios K-Means
  k_reseñas: 5,       // Número de clusters para reseñas
});
```

**Flujo de Navegación:**
```
Upload → Train → Results → Eval & Export
```

### 2. UI Components Helper

#### `AlertBox`
**Propósito:** Mostrar mensajes de éxito o error globales.

**Props:**
- `kind`: "success" | "error"
- `children`: Contenido del mensaje

**Estilos Dinámicos:**
```javascript
backgroundColor: isError ? "#450a0a" : "#022c22"
border: isError ? "#b91c1c" : "#047857"
```

#### `NavButton`
**Propósito:** Botón de navegación en el sidebar.

**Props:**
- `active`: Boolean que indica si está activo
- `onClick`: Handler de click
- `children`: Texto del botón

**Características:**
- Efecto de scale al hacer click (`transform: scale(0.99)`)
- Cambio de color según estado activo
- Transiciones suaves (120ms)

#### `Card`
**Propósito:** Contenedor visual para agrupar contenido relacionado.

**Props:**
- `title`: Título de la tarjeta
- `description`: Descripción opcional
- `children`: Contenido de la tarjeta
- `style`: Estilos adicionales

#### Botones Especializados

| Componente | Uso | Color |
|------------|-----|-------|
| `PrimaryButton` | Acciones principales | Azul (#1d4ed8) |
| `SuccessButton` | Confirmaciones | Verde (#10b981) |
| `GhostButton` | Acciones secundarias | Gris (#334155) |

#### `Badge`
**Propósito:** Etiquetas visuales para categorización.

**Props:**
- `text`: Texto a mostrar
- `color`: Color del badge (default: #93c5fd)

### 3. Secciones Funcionales

#### `UploadAndPreprocessSection`

**Responsabilidad:** Carga de archivos CSV y preprocesamiento de datos.

**Estado Local:**
```javascript
const [file, setFile] = useState(null);
const [uploadId, setUploadId] = useState(null);  // ID único del upload
const [loadingUpload, setLoadingUpload] = useState(false);
const [loadingPre, setLoadingPre] = useState(false);
```

**Flujo de Operación:**
```
1. Usuario selecciona archivo CSV
2. handleUpload() → uploadCsv(file)
3. Backend retorna upload_id
4. handlePreprocess() → preprocessData({ upload_id })
5. Datos listos para clustering
```

**Validaciones:**
- Verificar que se haya seleccionado archivo
- Verificar que exista upload_id antes de preprocesar
- Manejo de estados de carga

#### `TrainSection`

**Responsabilidad:** Configuración y entrenamiento de modelos de clustering.

**Props Recibidas:**
```javascript
{ 
  setGlobalMessage, 
  setGlobalError, 
  cfg,      // Configuración actual
  setCfg    // Setter de configuración
}
```

**Componentes UI Internos:**

**`SliderRow`:**
```javascript
<SliderRow
  label="Número de Clusters (K)"
  value={cfg.k_clientes}
  min={2}
  max={100}
  step={1}
  onChange={(v) => update("k_clientes", v)}
/>
```

**Estado Local:**
```javascript
const [loadingSave, setLoadingSave] = useState(false);
const [trainResponse, setTrainResponse] = useState(null);
```

**Parámetros de Clustering:**
- **k_clientes**: Número de segmentos de clientes (2-100)
- **max_iter**: Iteraciones máximas del algoritmo (100-500)
- **n_init**: Reinicios aleatorios para encontrar mejor centroide (5-30)
- **k_reseñas**: Número de clusters para análisis de texto (fijo: 5)

#### `ResultsSection`

**Responsabilidad:** Visualización de métricas de evaluación del clustering.

**Estructura de Datos:**
```javascript
const evaluationData = {
  title: "Evaluación y validación del análisis",
  metrics: [
    {
      name: "Inercia",
      value: "85.63",
      description: "Suma de distancias cuadradas..."
    },
    // ... más métricas
  ]
}
```

**Métricas Visualizadas:**

| Métrica | Rango | Interpretación |
|---------|-------|----------------|
| **Inercia** | 0-∞ | Menor es mejor (compactación) |
| **Calinski-Harabasz** | 0-∞ | Mayor es mejor (separación) |
| **Coeficiente de Silueta** | -1 a 1 | >0.7 excelente, <0.3 pobre |
| **Davies-Bouldin** | 0-∞ | Menor es mejor (similitud clusters) |

**Funciones de Evaluación:**

```javascript
// Calcula progreso visual (0-100%)
calculateProgress(metricName, value)

// Retorna color según calidad
getMetricColor(metricName, value)
// Verde: excelente, Amarillo: aceptable, Rojo: pobre

// Genera interpretación textual
getMetricInterpretation(metricName, value)

// Califica la métrica
getMetricQuality(metricName, value)
// "Excelente" | "Bueno" | "Regular" | "Deficiente"
```

**Características UI:**
- Grid responsivo (4 columnas → 2 → 1 en móvil)
- Barras de progreso visuales
- Código de colores por calidad
- Recomendaciones automáticas
- Scroll personalizado

#### `EvalExportSection`

**Responsabilidad:** Métricas detalladas y exportación de resultados.

**Estado Local:**
```javascript
const [metrics, setMetrics] = useState(null);
const [loadingMetrics, setLoadingMetrics] = useState(false);
const [loadingExport, setLoadingExport] = useState({
  clients: false,
  reviews: false,
  summary: false,
});
```

**Funciones de Exportación:**
```javascript
// Exporta clientes segmentados (CSV)
exportClients()

// Exporta reseñas clasificadas (CSV)
exportReviews()

// Exporta resumen ejecutivo (JSON)
exportSummary()
```

**Ciclo de Vida:**
```javascript
useEffect(() => {
  load();  // Carga automática de métricas al montar
}, []);
```

---

## Flujo de Datos

### Arquitectura de Comunicación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Interacción
┌──────▼──────────────────────────┐
│     Componente React            │
│  (UI + Estado Local)            │
└──────┬──────────────────────────┘
       │ Llamada a función
┌──────▼──────────────────────────┐
│       api.js                    │
│  (Abstracción HTTP)             │
└──────┬──────────────────────────┘
       │ fetch() + credentials
┌──────▼──────────────────────────┐
│    Backend REST API             │
│  (Python Flask/FastAPI)         │
└──────┬──────────────────────────┘
       │ Respuesta JSON
┌──────▼──────────────────────────┐
│   Componente React              │
│  (Actualiza estado)             │
└──────┬──────────────────────────┘
       │ Re-render
┌──────▼──────────────────────────┐
│        UI Actualizada           │
└─────────────────────────────────┘
```

### Gestión de Errores

Patrón estándar en todos los componentes:

```javascript
const handleAction = async () => {
  setGlobalError("");
  setGlobalMessage("");
  
  try {
    setLoading(true);
    const result = await apiFunction(params);
    setGlobalMessage(result.message || "Operación exitosa");
  } catch (err) {
    setGlobalError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Niveles de Error:**
1. **Validación Local**: Antes de llamar API
2. **Error de Red**: Capturado en catch
3. **Error de Backend**: Propagado desde api.js
4. **Mensaje Global**: Mostrado en AlertBox

---

## API y Comunicación con Backend

### Estructura del Módulo `api.js`

```javascript
// Base URL del backend
const BASE_URL = "http://localhost:5000/api";

// Configuración de fetch con credenciales
const fetchConfig = {
  credentials: "include",  // Incluye cookies de sesión
  headers: {
    "Content-Type": "application/json"
  }
};
```

### Endpoints Disponibles

#### 1. Upload CSV
```javascript
export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  
  return await response.json();
  // Retorna: { upload_id: string, message: string }
}
```

#### 2. Preprocess Data
```javascript
export async function preprocessData(payload) {
  // payload = { upload_id: string }
  const response = await fetch(`${BASE_URL}/preprocess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });
  
  return await response.json();
  // Retorna: { message: string, stats: object }
}
```

#### 3. Train Clusters
```javascript
export async function trainClusters(cfg) {
  // cfg = { k_clientes, max_iter, n_init, k_reseñas }
  const response = await fetch(`${BASE_URL}/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
    credentials: "include"
  });
  
  return await response.json();
  // Retorna: { message: string, clusters_info: object }
}
```

#### 4. Get Metrics
```javascript
export async function getMetrics() {
  const response = await fetch(`${BASE_URL}/metrics`, {
    credentials: "include"
  });
  
  return await response.json();
  /*
  Retorna: {
    silhouette_clientes: float,
    calinski_clientes: float,
    davies_clientes: float,
    silhouette_reseñas: float,
    calinski_reseñas: float,
    davies_reseñas: float
  }
  */
}
```

#### 5. Export Functions

**Exportar Clientes:**
```javascript
export async function exportClients() {
  const response = await fetch(`${BASE_URL}/export/clients`, {
    credentials: "include"
  });
  
  const blob = await response.blob();
  downloadFile(blob, "clientes_segmentados.csv");
}
```

**Exportar Reseñas:**
```javascript
export async function exportReviews() {
  const response = await fetch(`${BASE_URL}/export/reviews`, {
    credentials: "include"
  });
  
  const blob = await response.blob();
  downloadFile(blob, "reseñas_clasificadas.csv");
}
```

**Exportar Resumen:**
```javascript
export async function exportSummary() {
  const response = await fetch(`${BASE_URL}/export/summary`, {
    credentials: "include"
  });
  
  const blob = await response.blob();
  downloadFile(blob, "resumen_clustering.json");
}
```

#### Helper: Download File
```javascript
function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
```

### Manejo de Sesiones

**Cookies HTTP-Only:**
- El backend debe configurar cookies de sesión
- Frontend incluye `credentials: "include"` en todas las peticiones
- Permite mantener contexto del usuario sin tokens en localStorage

**CORS Configuration Required:**
```python
# Backend (Flask ejemplo)
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000"])
```

---

## Gestión de Estado

### Estados Globales (App Level)

```javascript
// Navegación
const [activeTab, setActiveTab] = useState("upload");

// Mensajes y Errores
const [globalMessage, setGlobalMessage] = useState("");
const [globalError, setGlobalError] = useState("");

// Configuración Persistente
const [cfg, setCfg] = useState({
  k_clientes: 6,
  max_iter: 300,
  n_init: 10,
  k_reseñas: 5,
});
```

### Estados Locales por Sección

**Upload Section:**
```javascript
- file: File | null
- uploadId: string | null
- loadingUpload: boolean
- loadingPre: boolean
```

**Train Section:**
```javascript
- loadingSave: boolean
- trainResponse: object | null
```

**Results Section:**
```javascript
- loading: boolean
- useMockData: boolean (no utilizado actualmente)
```

**Eval Section:**
```javascript
- metrics: object | null
- loadingMetrics: boolean
- loadingExport: {clients, reviews, summary}
```

### Propagación de Estado

**Pattern: Props Drilling**
```javascript
<TrainSection
  setGlobalMessage={setGlobalMessage}  // Callback para mensajes
  setGlobalError={setGlobalError}      // Callback para errores
  cfg={cfg}                            // Estado compartido
  setCfg={setCfg}                      // Setter compartido
/>
```

**Alternativa Futura:** Context API o Zustand para evitar prop drilling en aplicaciones más grandes.

---

## Estilos y UI/UX

### Sistema de Diseño

**Paleta de Colores:**

| Uso | Color Hex | Descripción |
|-----|-----------|-------------|
| Background Principal | `#0f172a` | Azul oscuro slate |
| Background Secundario | `#020617` | Negro azulado |
| Bordes | `#1e293b` | Gris azulado |
| Texto Principal | `#e5e7eb` | Gris claro |
| Texto Secundario | `#9ca3af` | Gris medio |
| Primario (Botones) | `#1d4ed8` | Azul |
| Éxito | `#10b981` | Verde esmeralda |
| Error | `#ef4444` | Rojo |
| Advertencia | `#f59e0b` | Ámbar |

**Tipografía:**
```css
font-family: "system-ui, sans-serif"
```

**Tamaños:**
- Título Principal: 20px
- Título Sección: 18px
- Subtítulo: 16px
- Texto Normal: 14px
- Texto Pequeño: 13px
- Auxiliar: 12px

### Responsive Design

**Breakpoints:**
```css
@media (max-width: 900px) {
  /* 2 columnas → 1 columna */
  grid-template-columns: 1fr !important;
}

@media (max-width: 1200px) {
  /* 4 columnas → 2 columnas */
  grid-template-columns: repeat(2, 1fr) !important;
}
```

**Estrategia:**
- Mobile First approach
- Grid layouts auto-adaptables
- Sidebar colapsable en móvil (futuro)

### Animaciones y Transiciones

**Botones:**
```css
transition: transform 120ms ease, background-color 120ms ease;
transform: scale(0.99);  /* Al hacer click */
```

**Hover Effects:**
```css
cursor: pointer;
opacity: 0.7;  /* Cuando disabled */
```

### Accesibilidad

**Consideraciones:**
- Contraste de colores cumple WCAG AA
- Estados de `disabled` visualmente claros
- Feedback visual en acciones (loading states)
- Mensajes de error descriptivos

**Mejoras Pendientes:**
- ARIA labels
- Navegación por teclado
- Screen reader support
- Focus indicators más prominentes

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (o yarn >= 1.22.0)
- **Backend**: Servidor API corriendo en puerto 5000

### Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd frontend

# 2. Instalar dependencias
npm install
# o
yarn install

# 3. Verificar instalación
npm list react react-dom vite
```

### Configuración de Entorno

Crear archivo `.env` (opcional):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=InsightCluster
```

Modificar `vite.config.js` si es necesario:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
```

### Scripts de Desarrollo

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Linting con auto-fix
npm run lint -- --fix
```

### Estructura de URLs

**Desarrollo:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

**Producción:**
- Configurar variables de entorno según hosting

---

## Despliegue

### Build de Producción

```bash
# Generar build optimizado
npm run build

# Resultado en carpeta dist/
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
```

### Optimizaciones Aplicadas por Vite

- **Code Splitting**: Separación automática de chunks
- **Tree Shaking**: Eliminación de código no utilizado
- **Minificación**: JS y CSS comprimidos
- **Asset Hashing**: Cache busting automático
- **Lazy Loading**: Importaciones dinámicas (si se implementan)

### Opciones de Hosting

#### 1. Vercel
```bash
npm install -g vercel
vercel
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 2. Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### Variables de Entorno en Producción

```bash
# .env.production
VITE_API_BASE_URL=https://api.produccion.com
VITE_APP_ENV=production
```

### Checklist Pre-Despliegue

- [ ] Tests (si existen) pasan correctamente
- [ ] Linting sin errores
- [ ] Build se genera sin errores
- [ ] Variables de entorno configuradas
- [ ] CORS configurado en backend
- [ ] URLs de API actualizadas
- [ ] Certificado SSL configurado
- [ ] Monitoring configurado

---

## Mantenimiento y Mejoras

### Tareas de Mantenimiento

#### Actualizaciones de Dependencias

```bash
# Verificar paquetes desactualizados
npm outdated

# Actualizar dependencias (cuidado con breaking changes)
npm update

# Actualizar a última versión (peligroso)
npm install <package>@latest
```

**Frecuencia Recomendada:**
- Dependencias de seguridad: Inmediatamente
- Minor updates: Mensual
- Major updates: Trimestral (con testing)

#### Monitoreo de Performance

**Métricas Clave:**
- First Contentful Paint (FCP): < 1.8s
- Time to Interactive (TTI): < 3.9s
- Bundle size: < 500KB (gzipped)

**Herramientas:**
```bash
# Analizar bundle
npm run build -- --mode analyze

# Lighthouse
npx lighthouse http://localhost:3000
```

### Mejoras Propuestas

#### Corto Plazo

1. **Gestión de Estado Mejorada**
   - Implementar Context API o Zustand
   - Reducir prop drilling
   - Persistencia de configuración en localStorage

2. **Validación de Formularios**
   - Integrar React Hook Form
   - Validaciones síncronas y asíncronas
   - Mensajes de error mejorados

3. **Testing**
   - Configurar Vitest
   - Tests unitarios de componentes
   - Tests de integración de API

4. **Optimización de Carga**
   - Lazy loading de secciones
   - Suspense boundaries