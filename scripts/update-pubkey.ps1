# Script para actualizar la clave pública en tauri.conf.json

param(
    [Parameter(Mandatory=$true)]
    [string]$PublicKey
)

Write-Host "🔑 Actualizando clave pública en tauri.conf.json..." -ForegroundColor Cyan

$configPath = "$PSScriptRoot\..\src-tauri\tauri.conf.json"

if (-not (Test-Path $configPath)) {
    Write-Host "❌ Error: No se encontró tauri.conf.json en $configPath" -ForegroundColor Red
    exit 1
}

# Leer el archivo JSON
$config = Get-Content $configPath -Raw | ConvertFrom-Json

# Actualizar la clave pública
$config.tauri.updater.pubkey = $PublicKey

# Guardar el archivo
$json = $config | ConvertTo-Json -Depth 10
$json | Set-Content $configPath -Encoding UTF8

Write-Host "✅ Clave pública actualizada correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Verifica que la clave sea correcta en:" -ForegroundColor Yellow
Write-Host "   $configPath" -ForegroundColor Cyan

