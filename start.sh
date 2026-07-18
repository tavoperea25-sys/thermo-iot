#!/bin/bash
# start.sh — Levanta Thermo-IoT con Docker Compose, verificando
# primero que exista tu .env (equivalente a start.ps1, para
# Mac/Linux).
#
# Uso: parado en la raíz del proyecto (junto a docker-compose.yml):
#   chmod +x start.sh   (la primera vez)
#   ./start.sh

ENV_PATH=".env"
EXAMPLE_PATH=".env.example"

if [ ! -f "$ENV_PATH" ]; then

    if [ ! -f "$EXAMPLE_PATH" ]; then
        echo "No se encontró ni .env ni .env.example en esta carpeta."
        echo "¿Estás parado en la raíz del proyecto (junto a docker-compose.yml)?"
        exit 1
    fi

    cp "$EXAMPLE_PATH" "$ENV_PATH"

    echo ""
    echo "No tenías un .env en esta carpeta — se creó uno nuevo a partir de .env.example."
    echo "Ábrelo y reemplaza los valores de ejemplo por los tuyos reales (contraseña de MySQL, JWT_SECRET, DEVICE_API_KEY)."
    echo ""

    if command -v code &> /dev/null; then
        code "$ENV_PATH"
    fi

    read -p "Presiona Enter aquí cuando ya hayas guardado tus valores reales en .env"

else

    echo "✅ .env encontrado — usando tus valores existentes."

fi

echo ""
echo "Levantando Thermo-IoT con Docker Compose..."
echo ""

docker compose up -d --build
