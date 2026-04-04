$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$port = 8000

Write-Host "Starting local server at http://127.0.0.1:$port/index.html"
Write-Host "Press Ctrl+C to stop."

Start-Process "http://127.0.0.1:$port/index.html"

python -m http.server $port

