@echo off
setlocal

cd /d "%~dp0"

if not exist "package.json" (
  echo No se encontro package.json en %cd%
  exit /b 1
)

if not exist "C:\Program Files\nodejs\npm.cmd" (
  echo No se encontro npm en C:\Program Files\nodejs\npm.cmd
  exit /b 1
)

echo Proyecto: %cd%
echo Iniciando Vite...
"C:\Program Files\nodejs\npm.cmd" run dev
