# Script PowerShell para limpiar archivos de build de Rust del repositorio Git

Write-Host "Limpiando archivos de build de Rust del repositorio Git..." -ForegroundColor Yellow

# Remover archivos de target del índice de Git (pero mantenerlos localmente)
if (Test-Path "src-tauri/target") {
    git rm -r --cached src-tauri/target 2>$null
    Write-Host "✓ Removido src-tauri/target del índice" -ForegroundColor Green
}

if (Test-Path "src-tauri/target2") {
    git rm -r --cached src-tauri/target2 2>$null
    Write-Host "✓ Removido src-tauri/target2 del índice" -ForegroundColor Green
}

# Remover archivos .json de build (excepto configs importantes)
Get-ChildItem -Path "src-tauri" -Recurse -Include "*.json" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "Cargo\.toml$" -and
    $_.FullName -notmatch "tauri\.conf\.json$" -and
    ($_.FullName -match "target" -or $_.FullName -match "target2" -or $_.FullName -match "\.fingerprint")
} | ForEach-Object {
    git rm --cached $_.FullName 2>$null
}

Write-Host ""
Write-Host "Archivos de build removidos del índice de Git." -ForegroundColor Green
Write-Host "Los archivos siguen existiendo localmente pero ya no serán rastreados." -ForegroundColor Cyan
Write-Host ""
Write-Host "Para verificar, ejecuta: git status" -ForegroundColor Yellow

