# SIMORA — Corrección del mapa y arranque de backend (Windows)

## Qué se corrigió
- En la vista **Satellite** del gemelo digital, la URL de mosaicos Esri tenía `{x}/{y}` invertidos. La ruta correcta es `tile/{z}/{y}/{x}`.
- Se permite acercar más el mapa, usando la imagen nativa hasta zoom 18 (ampliar más NO agrega resolución real).
- Se normaliza la URL del backend en el frontend.
- Se incluye el dominio público de Netlify en los orígenes CORS por defecto (se puede sobrescribir con `CORS_ORIGINS`).
- Se incluye `backend/INICIAR_SIMORA_WINDOWS.ps1` para crear `.venv`, instalar dependencias y arrancar sin activar el entorno.

## Cómo aplicar sin perder datos locales
1. Cierra los servidores locales.
2. Haz una copia de seguridad de `C:\Users\SARAI\Downloads\SIMORA`.
3. Abre el ZIP, entra en `SIMORA-main` y copia **su contenido** dentro de tu carpeta `SIMORA`. No copies `.git` ni borres carpetas de usuario.
4. En PowerShell:
   ```powershell
   cd C:\Users\SARAI\Downloads\SIMORA\backend
   powershell -ExecutionPolicy Bypass -File .\INICIAR_SIMORA_WINDOWS.ps1
   ```
5. En otra terminal:
   ```powershell
   cd C:\Users\SARAI\Downloads\SIMORA\frontend
   npm install
   npm run build
   npm run dev
   ```
6. Abre `http://localhost:5173`, ve al mapa, selecciona parcela y entra en Satellite.
7. Prueba `http://127.0.0.1:8000/health`, `http://127.0.0.1:8000/docs`, `http://127.0.0.1:8000/api/climate/power?latitude=-17.335&longitude=-66.215` y `http://127.0.0.1:8000/api/land/sources`.

## Publicar en la web
Solo después de que `npm run build` funcione y las rutas del backend respondan:
```powershell
cd C:\Users\SARAI\Downloads\SIMORA
git status
git add .
git commit -m "Fix satellite tiles and Windows backend setup"
git push origin main
```
Render: despliega último commit, directorio raíz `backend`. Netlify: despliega último commit, directorio base `frontend`, variable `VITE_API_URL=https://simora-pskk.onrender.com`. Verifica `https://simoraa.netlify.app/`.

## Importante
- Las imágenes Esri NO son en tiempo real; la fecha de adquisición varía según lugar.
- Si la imagen muestra suelo desnudo, puede deberse a la fecha histórica de la imagen, época seca o falta de detalle; no podemos garantizar que muestre cultivos actuales. Se requiere comparar con imágenes de fechas conocidas (p.ej. Sentinel-2) para verificar cambios.
- MapBiomas en este paquete muestra el catálogo; no calcula todavía cobertura por parcela. SENAMHI consulta colecciones públicas pero no asigna automáticamente una estación a la parcela.
- NASA POWER depende de conectividad externa y puede fallar temporalmente. Verifica el endpoint y la consola del navegador antes de atribuirlo a los datos.
