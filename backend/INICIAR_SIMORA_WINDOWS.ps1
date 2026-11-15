# Ejecutar desde la carpeta backend: powershell -ExecutionPolicy Bypass -File .\INICIAR_SIMORA_WINDOWS.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "SIMORA - Preparando backend" -ForegroundColor Green
$pyCommand = $null
$pyArgs = @()
if (Get-Command py -ErrorAction SilentlyContinue) {
    foreach ($version in @('3.11', '3.12')) {
        & py "-$version" -c "import sys; print(sys.version)" 2>$null
        if ($LASTEXITCODE -eq 0) { $pyCommand = 'py'; $pyArgs = @("-$version"); break }
    }
}
if (-not $pyCommand) {
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $ver = & python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
        if ($ver -in @('3.11','3.12')) { $pyCommand='python' }
    }
}
if (-not $pyCommand) {
    Write-Host 'No se encontro Python 3.11 o 3.12. Instala Python 3.11 x64 desde python.org y vuelve a ejecutar este script.' -ForegroundColor Red
    exit 1
}
if (-not (Test-Path '.venv\Scripts\python.exe')) {
    Write-Host 'Creando .venv...' -ForegroundColor Cyan
    & $pyCommand @pyArgs -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear .venv' }
}
$venvPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path $venvPython)) { throw 'El entorno .venv no se creo correctamente' }
& $venvPython -m pip install --upgrade pip setuptools wheel
if ($LASTEXITCODE -ne 0) { throw 'Fallo actualizando pip' }
& $venvPython -m pip install --only-binary=pydantic-core -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw 'Fallo instalando dependencias. Comparte la salida completa y python --version.' }
Write-Host 'Backend listo: http://127.0.0.1:8000/docs' -ForegroundColor Green
& $venvPython -m uvicorn app.main:app --reload
