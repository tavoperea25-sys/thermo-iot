# Firmware ESP32 — Thermo-IoT

Firmware para ESP32 + sensor DHT22, que envía lecturas al backend de Thermo-IoT, consulta su configuración y comandos pendientes, y controla un calefactor y un ventilador en modo manual o automático (con histéresis).

## Cableado actual

| Componente | Pin ESP32 |
|---|---|
| DHT22 — DATA | GPIO 15 |
| Relé calefactor — IN | GPIO 2 |
| Relé ventilador — IN | GPIO 4 |

Ambos relés alimentados desde un punto común de 5V (fuente 12V → convertidor LM2596 → 5V), con los GND de fuente, convertidor, ESP32 y ambos relés unidos entre sí.

## Configuración antes de subir

1. Copia `config_secrets.example.h` como `config_secrets.h` (mantenlo en la misma carpeta que el `.ino`).
2. Completa tus datos reales: WiFi, `DEVICE_ID`, `DEVICE_API_KEY` (debe coincidir con el `.env` del backend/Docker), e IP del backend.
3. `config_secrets.h` está en `.gitignore` — no se sube al repositorio.

## Librerías necesarias (Arduino IDE → Gestor de Librerías)

- **DHT sensor library** (Adafruit)
- **ArduinoJson**

## Subir el firmware

Selecciona tu placa (DOIT ESP32 DEVKIT V1) y el puerto correspondiente, sube, y abre el Monitor Serial a **115200 baudios**.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `Proyecto_ESP32_IoT_Temperatura_prueba2.ino` | `setup()` / `loop()` |
| `config.h` / `config.cpp` | Configuración general y credenciales expuestas |
| `config_secrets.h` | Credenciales reales (no se sube a git) |
| `wifi_manager.*` | Conexión y reconexión WiFi, con timeout y parpadeo del LED al arrancar |
| `sensores.*` | Lectura del DHT22 |
| `http_client.*` | Funciones HTTP centralizadas (GET/POST/PUT), incluida la llave de dispositivo |
| `api.*` | Comunicación con el backend: enviar lecturas, consultar config/comandos, registrar eventos |
| `automatico.*` | Lógica de control automático con histéresis |
| `estado.*` | Estado compartido de los actuadores (una sola fuente de verdad entre modo manual y automático) |
| `heartbeat.*` | Aviso periódico de actividad |
| `incubadora.*` | Orquesta todo lo anterior en el `loop()` principal, sin bloquear (basado en `millis()`) |
| `pantalla.*` | Display GMT130 (ST7789, SPI) — muestra temperatura, humedad, modo y estado de calefactor/ventilador |

## Nota sobre esta copia

Este firmware fue reconstruido a partir del historial de nuestra conversación (se perdió la copia original en el entorno de trabajo). La lógica y estructura son fieles a la última versión que probamos con hardware real, pero **pruébalo con cuidado al subirlo** — revisa el Monitor Serial y confirma que el calefactor/ventilador respondan igual que antes.
