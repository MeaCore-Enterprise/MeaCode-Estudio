#!/bin/bash
# Script para limpiar archivos de build de Rust del repositorio Git

echo "Limpiando archivos de build de Rust del repositorio Git..."

# Remover archivos de target del índice de Git (pero mantenerlos localmente)
git rm -r --cached src-tauri/target/ 2>/dev/null || true
git rm -r --cached src-tauri/target2/ 2>/dev/null || true

# Remover archivos .json de build
find src-tauri/target -name "*.json" -type f -exec git rm --cached {} \; 2>/dev/null || true
find src-tauri/target2 -name "*.json" -type f -exec git rm --cached {} \; 2>/dev/null || true

# Remover archivos .fingerprint
find src-tauri -path "*/target*/.fingerprint/*" -type f -exec git rm --cached {} \; 2>/dev/null || true

echo "Archivos de build removidos del índice de Git."
echo "Los archivos siguen existiendo localmente pero ya no serán rastreados."
echo ""
echo "Para verificar, ejecuta: git status"

