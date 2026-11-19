# Thermo-IoT

[![Pruebas](https://github.com/tavoperea25-sys/thermo-iot/actions/workflows/tests.yml/badge.svg)](https://github.com/tavoperea25-sys/thermo-iot/actions/workflows/tests.yml)

Sistema de monitoreo y control remoto para una incubadora, compuesto por tres partes: un firmware para ESP32 que lee sensores y controla actuadores, un backend en Node.js/Express que centraliza los datos, y un frontend en React que sirve como panel de control.

> ¿Quieres ver cómo llegó el proyecto hasta acá — qué bugs reales se encontraron probando con hardware físico y cómo se resolvieron? Revisa el [`CHANGELOG.md`](./CHANGELOG.md).

## Índice

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Instalación](#instalación)
  - [1. Base de datos](#1-base-de-datos)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
  - [4. Firmware ESP32](#4-firmware-esp32)
- [Compartir el sitio con alguien en otra red (demo remota)](#compartir-el-sitio-con-alguien-en-otra-red-demo-remota)
- [Variables de entorno](#variables-de-entorno)
- [Modelo de datos](#modelo-de-datos)
- [API — endpoints principales](#api--endpoints-principales)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Mantenimiento de datos (purga automática)](#mantenimiento-de-datos-purga-automática)
- [Seguridad](#seguridad)
- [Limitaciones conocidas](#limitaciones-conocidas)

---

## Arquitectura

```
┌─────────────┐        WiFi / HTTP          ┌──────────────────┐        HTTP         ┌────────────┐
│  ESP32 +    │ ─────────────────────────▶ │     Backend       │ ◀───────────────── │  Frontend  │
│  DHT22      │ ◀───────────────────────── │  (Node/Express)   │ ──────────────────▶│  (React)   │
│  (firmware) │   sensores, comandos,      │                    │   login, dashboard,│  (Vite)    │
└─────────────┘   configuración, eventos   └────────┬───────────┘   control, config  └────────────┘
                                                    │
                                                    ▼
                                               ┌──────────┐
                                               │  MySQL   │
                                               └──────────┘
```

- El **ESP32** lee temperatura/humedad del DHT22, las envía al backend, consulta su configuración y comandos pendientes, y controla un calefactor (LED) y un ventilador — de forma manual (por comando) o automática (por umbrales, con histéresis).
- El **backend** expone una API REST, autentica usuarios con JWT, autentica al ESP32 con una llave de dispositivo separada, y persiste todo en MySQL.
- El **frontend** es un panel React con dashboard en tiempo real, gráficas, control manual/automático, gestión de incubadoras, alarmas, eventos y perfil de usuario.

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Firmware | C++ (Arduino core para ESP32), `WiFi.h`, `HTTPClient.h`, `ArduinoJson`, `DHT sensor library` |
| Backend | Node.js, Express, MySQL (`mysql2`), `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`, `express-rate-limit` |
| Pruebas | Jest, Supertest |
| Frontend | React 19, Vite, React Router, Axios, Chart.js (`react-chartjs-2`), `lucide-react` |
| Base de datos | MySQL |
| Contenedores (opcional) | Docker, Docker Compose |

## Estructura del proyecto

```
proyecto1/                     # Firmware ESP32 (Arduino)
├── *.ino / *.cpp / *.h        # Un archivo por responsabilidad (wifi, sensores, api, etc.)
├── config_secrets.h           # Credenciales reales — NO se sube a git
└── config_secrets.example.h   # Plantilla de config_secrets.h

thermoiot/
├── docker-compose.yml          # Levanta MySQL + backend + frontend juntos
├── start.ps1 / start.sh        # Script de arranque (verifica .env antes de levantar Docker)
├── .env.example                # Plantilla de variables para Docker Compose
├── backend/
│   ├── config/db.js           # Conexión a MySQL
│   ├── controllers/           # Lógica de cada recurso
│   ├── middleware/            # authMiddleware (usuarios) y deviceAuthMiddleware (ESP32)
│   ├── routes/                # auth, incubadoras, iot
│   ├── services/               # Acceso a datos por recurso
│   ├── tests/                  # Pruebas automatizadas (Jest + Supertest)
│   ├── schema.sql              # Estructura completa de la base de datos
│   ├── Dockerfile
│   ├── .env                   # Credenciales reales — NO se sube a git
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/              # Una página por ruta (Dashboard, Incubadoras, Alarmas...)
    │   ├── components/         # Componentes reutilizables (dashboard/, ConfirmModal, EmptyState...)
    │   ├── context/             # IncubadoraContext, ToastContext, DemoContext
    │   ├── hooks/               # useDashboard, useDemoDashboard
    │   ├── services/            # api.js (axios + interceptores), auth.js
    │   └── styles/               # CSS por página/componente, con variables en globals.css
    ├── Dockerfile
    └── index.html
```

## Funcionalidades

- **Autenticación**: registro, login, JWT, cambio de contraseña, edición de perfil.
- **Multi-incubadora**: cada usuario puede registrar varias incubadoras (varios ESP32), y elegir cuál ver desde un selector en el Navbar.
- **Dashboard en tiempo real**: temperatura y humedad actuales, gráficas históricas, estado de conexión real (basado en la última lectura recibida).
- **Control manual y automático**: encender/apagar calefactor y ventilador a mano, o dejar que el ESP32 los regule solo según los umbrales configurados (con histéresis para evitar parpadeo).
- **Configuración remota**: los umbrales de temperatura/humedad y el intervalo de lectura se editan desde la web y el ESP32 los toma en su siguiente consulta (máx. 5 s).
- **Alarmas**: lecturas fuera de rango, calculadas contra la configuración vigente.
- **Eventos**: historial de acciones (encendidos/apagados, cambios de modo) confirmadas por el propio ESP32.
- **Exportar a CSV**: mediciones, eventos y alarmas.
- **Sesión robusta**: expiración de token manejada globalmente (redirige al login con aviso), Error Boundary para no dejar pantalla en blanco ante errores inesperados.

## Instalación

Hay dos formas de levantar el proyecto: con Docker Compose (todo con un solo comando) o manualmente (más control, útil para desarrollo activo). El firmware del ESP32 se configura igual en ambos casos — ver el paso 4 más abajo.

### Opción rápida: Docker Compose

Levanta MySQL, el backend y el frontend juntos, sin instalar nada de eso en tu máquina.

**La forma más simple — con el script de arranque incluido**, que revisa que tengas tu `.env` antes de levantar todo (y te avisa/ayuda a crearlo si falta, en vez de que te enteres por un error de Docker):

```powershell
# Windows (PowerShell)
.\start.ps1
```
```bash
# Mac/Linux
./start.sh
```

**O manualmente, si prefieres los pasos por separado:**
```bash
cd thermoiot
cp .env.example .env       # y completa tus valores reales
docker compose up -d --build
```

**Nota para Windows:** si al correr `.\start.ps1` te sale un error de "no se puede cargar porque la ejecución de scripts está deshabilitada", es la política de seguridad de PowerShell bloqueando scripts locales por defecto (no es un problema del script). Se soluciona una sola vez con:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Si después de eso sigue sin dejarte** (el error ahora dice "el archivo no está firmado digitalmente" en vez de mencionar la política), es una segunda protección de Windows, independiente de la anterior: marca como "bloqueado" cualquier archivo que venga de un `.zip` descargado de internet. Se desbloquea así (una vez, por archivo):
```powershell
Unblock-File -Path .\start.ps1
Unblock-File -Path .\start.sh
```

- Sitio web: `http://localhost:5173`
- API: `http://localhost:3000`
- MySQL queda expuesto en el puerto `3307` (no el 3306 por defecto — se cambió para no chocar con una instalación local de MySQL fuera de Docker) por si quieres conectarte con un cliente externo.
- **Desde tu celular** (misma red WiFi): usa la IP de tu PC en vez de `localhost`, igual que en la opción manual — por ejemplo `http://192.168.1.50:5173`.

La base de datos se crea automáticamente la primera vez (usa el mismo `schema.sql`). Tus datos quedan en un volumen de Docker — si vuelves a correr `docker compose up`, no se pierden ni se recrean las tablas de nuevo.

**Sobre actualizar el proyecto más adelante:** el `.env` (tanto el de la raíz como `backend/.env`) nunca viene incluido en las entregas del proyecto — a propósito, porque tiene tus contraseñas y llaves reales, y está en `.gitignore`. Si descomprimes una versión nueva **en la misma carpeta** donde ya tienes tu `.env` funcionando, no se borra (descomprimir un zip no elimina archivos que no vienen en el paquete). Pero si extraes en una carpeta **nueva** (por ejemplo, "Nueva carpeta V2"), ese `.env` no existe ahí todavía — vas a necesitar crearlo de nuevo con `cp .env.example .env` y completar los valores, como la primera vez.

**Verificado en vivo:** este `docker-compose.yml` se probó de punta a punta (registro e inicio de sesión reales, con los 3 contenedores corriendo) — no se quedó solo en teoría.

**Comandos útiles:**
```bash
docker compose logs -f          # ver los logs de los 3 servicios en vivo
docker compose down             # apagar todo
docker compose down -v          # apagar todo Y borrar la base de datos (empezar de cero)
docker compose up -d --build    # reconstruir después de cambiar código
```

#### Problemas comunes al levantar Docker (y cómo se resuelven)

**"ports are not available... 3306" al arrancar `mysql`**
Ya tienes MySQL instalado directo en tu sistema (fuera de Docker) y está ocupando ese puerto. El `docker-compose.yml` ya usa `3307:3306` hacia afuera para evitar el choque — si de todas formas te pasa (por ejemplo porque cambiaste el puerto), tu MySQL local sigue corriendo en el 3306 de siempre; Docker usa el 3307 solo para el acceso desde tu PC, la comunicación interna entre contenedores no se ve afectada.

**"ports are not available... 3000" o "...5173"**
Tienes `npm run dev` corriendo en una terminal aparte (backend o frontend) al mismo tiempo que Docker. Son dos formas alternativas de correr el proyecto — no se usan las dos a la vez. Cierra esas terminales (`Ctrl+C`) antes de usar Docker, o haz `docker compose down` antes de volver a `npm run dev`.

**`level=warning msg="The '...' variable is not set. Defaulting to a blank string."`**
Docker Compose no encontró tu archivo `.env` (en la raíz del proyecto, junto a `docker-compose.yml` — no confundir con `backend/.env`, son archivos distintos para propósitos distintos). Confírmalo con:
```bash
Get-ChildItem -Force .env*     # PowerShell
ls -la .env*                   # Mac/Linux
```
Si solo ves `.env.example` y no `.env`, créalo:
```bash
Copy-Item .env.example .env    # PowerShell
cp .env.example .env           # Mac/Linux
```
y completa los valores reales antes de volver a levantar.

**El registro/login funciona pero no reconoce un usuario que ya tenías**
La base de datos de Docker es **independiente** de tu MySQL local — son dos bases separadas, cada una con sus propios datos. Un usuario creado en un modo no existe en el otro. Si corriste `docker compose down -v` en algún momento, además se borró todo lo que tenías en la base de Docker específicamente (el `-v` borra el volumen de datos).

**Volvieron las advertencias de "variable is not set" después de que ya funcionaba**
Probablemente descomprimiste el proyecto en una carpeta **nueva** (ej. pasaste de "Nueva carpeta V14" a "V15"). Cada carpeta es un entorno independiente — el `.env` que creaste en la carpeta anterior no viaja solo a la nueva. Copia `.env.example` como `.env` de nuevo ahí y completa los valores.

### Opción manual

### 1. Base de datos

Crea una base de datos MySQL con las tablas: `usuarios`, `incubadoras`, `mediciones`, `eventos`, `comandos`, `configuracion`.

### 2. Backend

```bash
cd thermoiot/backend
npm install
cp .env.example .env   # y completa tus valores reales
npm run dev
```

### 3. Frontend

```bash
cd thermoiot/frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Regístrate desde la pantalla de login y crea tu primera incubadora.

**Para entrar desde tu celular** (conectado a la misma red WiFi que tu PC): en vez de `localhost`, usa la IP de tu PC en esa red — por ejemplo `http://192.168.1.50:5173`. La URL del backend se calcula sola en base a eso, no hay que configurar nada más. Si no conecta, revisa el Firewall de Windows: la primera vez que corres `npm run dev`, puede preguntarte si permites el acceso a redes públicas/privadas — dile que sí, o revisa que el puerto 5173 (y el 3000, del backend) no estén bloqueados.

### 4. Firmware ESP32

1. Cablea el DHT22: `VCC → 3.3V`, `GND → GND`, `DATA → GPIO 15` (resistencia pull-up de 10kΩ si tu módulo no la trae).
2. Copia `config_secrets.example.h` como `config_secrets.h` y completa tus datos reales (WiFi, `DEVICE_ID`, `DEVICE_API_KEY`, IP del backend).
3. El `DEVICE_ID` debe coincidir exactamente con el `esp32_id` que registres en "Incubadoras" en la web.
4. El `DEVICE_API_KEY` debe coincidir exactamente con `DEVICE_API_KEY` en el `.env` del backend.
5. Abre `Proyecto_ESP32_IoT_Temperatura_prueba2.ino` en Arduino IDE, instala las librerías `DHT sensor library` (Adafruit) y `ArduinoJson`, selecciona tu placa y puerto, y sube.

## Compartir el sitio con alguien en otra red (demo remota)

Para que alguien en una red completamente distinta a la tuya (por ejemplo, un profesor entrando desde su casa durante tu sustentación) pueda ver el sitio con tu ESP32 real mandando datos en vivo, necesitas "exponer" temporalmente tu sitio a internet con un túnel.

**Solo necesitas exponer un puerto (el 5173, el frontend)** — el frontend redirige internamente las peticiones a la API hacia el backend, así que el backend no necesita su propio túnel. Esto es importante porque los planes gratuitos de estos servicios suelen limitarte a un solo túnel activo a la vez.

**1. Instala una herramienta de túnel** (cualquiera de las dos funciona; usa la que sí te conecte — algunas redes bloquean una y no la otra):

- **ngrok** (la que terminamos usando, tras que Cloudflare no lograra conectar en esta red particular):
  ```powershell
  winget install Ngrok.Ngrok
  ```
  Crea una cuenta gratis en [ngrok.com](https://ngrok.com), copia tu authtoken desde el panel, y regístralo una sola vez:
  ```powershell
  ngrok config add-authtoken TU_TOKEN_AQUI
  ```

- **Cloudflare Tunnel** (alternativa, no requiere cuenta):
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```

(Después de instalar cualquiera de las dos: **cierra la terminal/VS Code por completo y vuelve a abrirlo**, si no, no va a reconocer el comando.)

**2. Ten el proyecto corriendo como siempre** (`docker compose up -d`, o `npm run dev` en backend y frontend por separado).

**3. Expón el frontend** (**ojo:** el puerto 5173, no el 3000):

- Con ngrok:
  ```powershell
  ngrok http 5173
  ```
- Con Cloudflare:
  ```powershell
  cloudflared tunnel --url http://localhost:5173
  ```

Vas a ver una URL pública — con ngrok se ve como `https://algo-al-azar.ngrok-free.dev`, con Cloudflare como `https://algo-al-azar.trycloudflare.com`. **Esa es la que compartes** con quien quieras que entre al sitio.

**4. Dile al frontend que use el proxy interno en vez de conectarse directo al backend:**

- **Si corres manualmente**: crea o edita `frontend/.env`:
  ```
  VITE_API_URL=/api
  ```
  y reinicia el frontend (`Ctrl+C` y `npm run dev` de nuevo).

- **Si corres con Docker Compose**: edita el `.env` de la **raíz** del proyecto y agrega:
  ```
  VITE_API_URL=/api
  ```
  Luego reinicia solo el frontend:
  ```bash
  docker compose up -d frontend
  ```
  (`VITE_BACKEND_INTERNAL_URL` ya está configurada automáticamente en `docker-compose.yml` para este caso — no hay que tocarla)

**Notas importantes:**
- Las URLs son temporales — cambian cada vez que vuelves a correr el comando. Está pensado para una sesión puntual (como tu sustentación), no para dejarlo corriendo permanentemente.
- Necesitas la terminal del túnel abierta durante toda la demo, además de las de tu backend/frontend.
- Si tu red bloquea una herramienta (nos pasó con Cloudflare — el protocolo que usa por dentro, QUIC, chocó con la red), prueba con la otra.
- Verificado en vivo: se probó pidiendo la misma ruta protegida por las dos vías (directo al backend, y a través del proxy del frontend) y devolvieron exactamente la misma respuesta — confirma que el redireccionamiento sí llega al backend real.

## Variables de entorno

**Backend (`.env`)**

| Variable | Descripción |
|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL |
| `JWT_SECRET` | Firma de los tokens de sesión de usuario |
| `DEVICE_API_KEY` | Llave compartida que valida las peticiones del ESP32 |
| `RETENCION_DIAS_MEDICIONES`, `RETENCION_DIAS_EVENTOS` | Días que se conservan antes de purgarse automáticamente (opcionales, por defecto 30 y 90) |
| `PORT` | Puerto del servidor (por defecto 3000) |

**Frontend (`.env`, opcional)**

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | Solo si el backend vive en una dirección distinta a "el mismo equipo, puerto 3000" (ej. desplegado en un servidor real). Sin esto, la URL se calcula sola según cómo entraste al sitio — funciona igual en tu PC y desde el celular en la misma red. |

**Firmware (`config_secrets.h`)**

| Constante | Descripción |
|---|---|
| `WIFI_SSID`, `WIFI_PASSWORD` | Credenciales de tu red WiFi |
| `DEVICE_ID` | Identificador único de este ESP32 (debe existir como incubadora en la web) |
| `DEVICE_API_KEY` | Debe ser idéntica a la del backend |
| `SERVER_IP_ADDR`, `SERVER_PORT_NUM` | IP y puerto donde corre el backend |

## Modelo de datos

| Tabla | Contenido |
|---|---|
| `usuarios` | Cuentas del sitio (nombre, correo, usuario, contraseña hasheada) |
| `incubadoras` | Dispositivos registrados por usuario (nombre, `esp32_id`, temperatura objetivo) |
| `mediciones` | Historial de lecturas de temperatura/humedad por `esp32_id` |
| `eventos` | Historial de acciones confirmadas por el ESP32 |
| `comandos` | Cola de comandos manuales/automáticos pendientes de ejecutar |
| `configuracion` | Umbrales e intervalo de lectura vigentes por `esp32_id` |

## API — endpoints principales

**Auth** (`/api/auth`)
`POST /register` · `POST /login` · `GET /me` 🔒 · `PUT /perfil` 🔒 · `PUT /password` 🔒

**Incubadoras** (`/api/incubadoras`, todas 🔒)
`GET /` · `POST /` · `DELETE /:id`

**IoT** (`/api/iot`)
`POST /sensor` 🔑 · `POST /evento` 🔑 · `POST /heartbeat` 🔑 · `GET /command/:esp32_id` 🔑 · `PUT /command/:id/ejecutado` 🔑 · `POST /command` · `GET /status/:esp32_id` · `GET /mediciones/:esp32_id` · `GET /eventos` · `GET /online-status/:esp32_id` · `GET /configuracion/:esp32_id` · `PUT /configuracion/:esp32_id` · `GET /estadisticas/:esp32_id` · `POST /purgar`

🔒 = requiere sesión de usuario (JWT) · 🔑 = requiere llave de dispositivo (`X-Device-Key`)

## Pruebas automatizadas

El backend tiene 25 pruebas automatizadas (Jest + Supertest) que cubren los flujos críticos: registro, login, límite de intentos, rutas protegidas por sesión de usuario, rutas protegidas por llave de dispositivo, creación de incubadoras con generación automática de configuración, y la cola de comandos manuales/automáticos.

**Corren solas en cada `push`**, gracias al workflow de GitHub Actions en `.github/workflows/tests.yml` — no dependen de que nadie se acuerde de correr `npm test` a mano. Ese mismo workflow también verifica que el frontend compile sin errores (`npm run build`). El estado se ve en la insignia al inicio de este README, y en la pestaña ["Actions"](https://github.com/tavoperea25-sys/thermo-iot/actions) del repositorio.
Corren contra una base de datos separada (`thermo_iot_test`), para no tocar nunca tus datos reales de desarrollo.

**Preparación (una sola vez):**

```bash
cd thermoiot/backend
mysql -u root -p -e "CREATE DATABASE thermo_iot_test"
mysql -u root -p thermo_iot_test < schema.sql
cp .env.test.example .env.test   # y completa tus credenciales reales
```

**Correr las pruebas:**

```bash
npm test
```

Cada archivo de test limpia sus propios datos al terminar (usuarios, incubadoras, mediciones y comandos de prueba), así que la base de test queda igual de vacía después de correr `npm test` las veces que sea.

## Mantenimiento de datos (purga automática)

La tabla `mediciones` crece constantemente (una fila cada pocos segundos por dispositivo), así que el backend borra sola la información que ya nadie necesita consultar en el día a día:

- **Mediciones**: se eliminan las de más de **30 días**.
- **Eventos**: se eliminan los de más de **90 días** (se conservan más tiempo porque pesan mucho menos y sirven de bitácora histórica).

Corre automáticamente una vez al arrancar el backend, y luego cada 24 horas mientras el proceso siga corriendo — sin necesidad de configurar nada externo (cron, tareas programadas de Windows, etc.).

**Para ajustar cuántos días se conservan**, cambia estas variables en tu `.env`:
```
RETENCION_DIAS_MEDICIONES=30
RETENCION_DIAS_EVENTOS=90
```

**Para forzarla manualmente** (por ejemplo, justo antes de una demo, para no tener que esperar al ciclo diario), hay un botón "Purgar datos antiguos ahora" en la página **Sistema** del sitio — pide confirmación antes de borrar, ya que es una acción irreversible.

## Seguridad

- Contraseñas hasheadas con `bcryptjs`.
- Sesión de usuario vía JWT, con expiración manejada globalmente en el frontend (redirige al login con aviso).
- El ESP32 se autentica con una llave de dispositivo (`X-Device-Key`) en las rutas que escriben datos o entregan comandos — evita que terceros en la red inyecten lecturas falsas o controlen la incubadora sin autorización.
- Credenciales (WiFi, base de datos, secretos JWT y de dispositivo) fuera del código fuente, en archivos excluidos de git (`.env`, `config_secrets.h`).

## Limitaciones conocidas

- La recuperación de contraseña ("¿Olvidaste tu contraseña?") no está implementada — requeriría un servicio de correo saliente.

### Ya resueltas (quedan documentadas por si sirve de referencia)

- ~~Las rutas de solo lectura de `/api/iot` no exigían sesión de usuario~~ — todas piden JWT o llave de dispositivo desde que se agregó el middleware `verificarToken` a las rutas de lectura.
- ~~El histórico de `mediciones` no tenía límite de retención~~ — hay una purga automática diaria (ver [Mantenimiento de datos](#mantenimiento-de-datos-purga-automática)).
