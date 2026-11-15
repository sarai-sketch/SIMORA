# SIMORA — actualización de fuentes territoriales y despliegue

## Qué cambia en esta versión

- Añade `LandDataPanel` al detalle de parcela, en la columna de información, debajo de `SoilMicroclimateCard`.
- Añade endpoints FastAPI para consultar el catálogo MapBiomas y descubrir en vivo las colecciones y estaciones expuestas por SENAMHI WIS OGC API.
- Mantiene el simulador climático junto al modelo 3D (ya estaba integrado en `App.tsx`).
- Mantiene el diseño actual; no reemplaza mapa, catálogo, gemelo 3D ni rotación.

## Importante: qué es realmente “live”

1. SENAMHI: el backend consulta el endpoint público de colecciones OGC API y el listado de estaciones. Si la consulta responde, el panel muestra `Connected` y la cantidad de colecciones/estaciones devueltas. La selección de la estación más representativa de la parcela y la consulta de sus series temporales todavía requieren un paso adicional de georreferenciación y revisión de las colecciones de observaciones.
2. MapBiomas: SIMORA muestra el catálogo oficial, la colección 4 (1985–2025), 30 m y 29 clases, y enlaces a los assets. No se muestra una clasificación de la parcela como si ya hubiera sido calculada. El muestreo real por polígono necesita Google Earth Engine (GEE) y seleccionar el Asset ID oficial vigente.
3. NASA POWER sigue siendo el contexto climático histórico que ya consume el proyecto. No mide fertilidad, pH, nitrógeno, fósforo ni materia orgánica.
4. La tarjeta de suelo continúa identificando las capacidades hídricas por textura como supuestos ilustrativos, no como análisis de laboratorio.

## Archivos nuevos

- `backend/app/routers/land_sources.py`
- `frontend/src/components/LandDataPanel.tsx`
- `frontend/src/components/land-data-panel.css`

## Archivos modificados

- `backend/app/main.py`: registra `land_sources_router`.
- `frontend/src/App.tsx`: importa `LandDataPanel` y lo muestra en el detalle de parcela, debajo de `SoilMicroclimateCard`.
- `frontend/package.json`: se sincronizan dependencias con el `package-lock.json` incluido, incluido Recharts.

## Dónde cambiar cada cosa

### Cambiar el bloque MapBiomas

Archivo: `frontend/src/components/LandDataPanel.tsx`

Busca `MapBiomas Bolivia`. Ahí están el período, resolución, clases y enlaces oficiales. Los valores visibles son los metadatos publicados por MapBiomas; no son estadísticas calculadas para la parcela.

### Cambiar la consulta SENAMHI

Archivo: `backend/app/routers/land_sources.py`

- `SENAMHI_OAPI`: URL base oficial WIS OGC API.
- `/senamhi/collections`: descubre colecciones disponibles.
- `/senamhi/stations`: consulta una muestra de estaciones.

Para incorporar observaciones de una estación concreta, primero hay que elegir el identificador correcto desde la colección Stations y verificar la colección de observaciones asociada. No se debe asumir que la primera estación es la más cercana.

### Cambiar la ubicación de la sección en la interfaz

Archivo: `frontend/src/App.tsx`

- Importación: cerca de `SoilMicroclimateCard`.
- Render: busca `<SoilMicroclimateCard apiBaseUrl={API} soil={selected.soil} />`.
- `LandDataPanel` se coloca inmediatamente después. Si quieres moverlo, corta esa etiqueta JSX y pégala en otra parte de la sección `page==='detail'`.

### Cambiar el estilo

Archivo: `frontend/src/components/land-data-panel.css`.

Las clases comienzan con `land-` para evitar afectar otros componentes.

## Cómo ejecutar localmente en Windows

Terminal 1 — backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Comprueba:
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/api/land/sources`
- `http://127.0.0.1:8000/api/land/senamhi/collections`
- `http://127.0.0.1:8000/api/land/senamhi/stations?limit=5`

Terminal 2 — frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Abre la URL que Vite muestre (normalmente `http://localhost:5173`). Selecciona una parcela y entra en `View this property`. El bloque `Land history & national data` aparece en la columna derecha, debajo de Soil & Microclimate. El simulador de escenarios está debajo del modelo 3D.

## Despliegue en GitHub → Render → Netlify

1. Haz una copia de seguridad de tu carpeta local actual.
2. Descomprime el ZIP completo. Copia el contenido de `SIMORA-main` dentro de tu carpeta Git local existente, sin reemplazar ni borrar la carpeta oculta `.git`.
3. Desde la raíz del repositorio:

```powershell
git status
git add .
git commit -m "Add MapBiomas and SENAMHI land intelligence"
git push origin main
```

4. Render: confirma que el servicio usa la rama `main` y Root Directory `backend`. Usa el Build Command del servicio (`pip install -r requirements.txt`) y el Start Command existente (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`). Haz Manual Deploy → Deploy latest commit si no se inicia automáticamente.
5. Verifica en `https://TU-SERVICIO.onrender.com/docs` que aparezcan los tags `Land history & national sources`, `Climate simulations` y `Microclimates`.
6. Netlify: confirma rama `main`, Base directory `frontend`, Build command `npm ci && npm run build`, Publish directory `dist`, y variable `VITE_API_URL` apuntando al backend Render (sin `/` final).
7. En Netlify ejecuta Deploys → Trigger deploy → Clear cache and deploy site.
8. Abre el sitio publicado en ventana privada, selecciona una parcela y comprueba `Land history & national data`.

Si Render responde CORS, agrega el dominio exacto de Netlify a `CORS_ORIGINS` en Render, separado por coma y sin barra final. Ejemplo: `https://tu-sitio.netlify.app,http://localhost:5173`.

## MapBiomas: cómo habilitar estadísticas por parcela (siguiente integración)

Los assets oficiales de MapBiomas Bolivia se consumen desde Google Earth Engine. La página oficial publica los IDs y requiere una cuenta GEE. Para calcular porcentajes de clases dentro de una parcela SIMORA:

1. Crear/usar un proyecto de Google Earth Engine.
2. Abrir la página oficial de Assets MapBiomas Bolivia y elegir el asset actual de Cobertura y Uso del Suelo (Colección 4).
3. Copiar el Asset ID oficial (no inventar ni reutilizar un ID de otra colección).
4. En un servicio backend autenticado con Earth Engine, cargar el asset, seleccionar la banda/año y ejecutar `reduceRegion` sobre el polígono de la parcela.
5. Convertir el histograma de clases a porcentajes de área y guardar el año, resolución, colección, asset ID y fecha de cálculo.
6. Mostrarlo como `MapBiomas raster-derived parcel statistic`, no como observación de campo.

No se activa automáticamente en esta entrega porque requiere configurar el proyecto GEE y sus credenciales en Render. La interfaz deja claro este límite y enlaza al catálogo oficial.

## Criterios de calidad

- Nunca etiquetar MapBiomas como fertilidad o análisis químico.
- Nunca presentar valores de textura supuestos como mediciones reales.
- No asignar estación SENAMHI por proximidad sin evaluar distancia, altitud, calidad y disponibilidad temporal.
- Mostrar fuente, fecha, resolución y estado de cada dato.
- Los escenarios de granizo/helada/calor son hipotéticos; no convertirlos en porcentajes de pérdida sin calibración agronómica.
