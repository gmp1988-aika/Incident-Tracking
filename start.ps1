$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$npmCmd = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path -LiteralPath $npmCmd)) {
  throw "No se encontro npm en '$npmCmd'."
}

Set-Location -LiteralPath $projectRoot

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "package.json"))) {
  throw "No se encontro package.json en '$projectRoot'."
}

Write-Host "Proyecto:" $projectRoot
Write-Host "Iniciando Vite..."

& $npmCmd run dev
