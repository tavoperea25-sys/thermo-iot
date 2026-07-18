# start.ps1 — Levanta Thermo-IoT con Docker Compose, verificando
# primero que exista tu .env (para no repetir el error de "carpeta
# nueva sin .env" que ya nos pasó un par de veces).
#
# Uso: parado en la raíz del proyecto (junto a docker-compose.yml):
#   .\start.ps1

$envPath = ".env"
$examplePath = ".env.example"

if (-not (Test-Path $envPath)) {

    if (-not (Test-Path $examplePath)) {
        Write-Host "No se encontró ni .env ni .env.example en esta carpeta." -ForegroundColor Red
        Write-Host "¿Estás parado en la raíz del proyecto (junto a docker-compose.yml)?" -ForegroundColor Red
        exit 1
    }

    Copy-Item $examplePath $envPath

    Write-Host ""
    Write-Host "No tenías un .env en esta carpeta — se creó uno nuevo a partir de .env.example." -ForegroundColor Yellow
    Write-Host "Ábrelo y reemplaza los valores de ejemplo por los tuyos reales (contraseña de MySQL, JWT_SECRET, DEVICE_API_KEY)." -ForegroundColor Yellow
    Write-Host ""

    $code = Get-Command code -ErrorAction SilentlyContinue

    if ($code) {
        code $envPath
    }

    Read-Host "Presiona Enter aquí cuando ya hayas guardado tus valores reales en .env"

} else {

    Write-Host "✅ .env encontrado — usando tus valores existentes." -ForegroundColor Green

}

Write-Host ""
Write-Host "Levantando Thermo-IoT con Docker Compose..." -ForegroundColor Cyan
Write-Host ""

docker compose up -d --build
