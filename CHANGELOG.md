# Changelog — Thermo-IoT

Este documento narra cómo llegó el proyecto a su estado actual: no es una lista de versiones numeradas, sino el recorrido real de desarrollo — qué se encontró roto, qué se construyó, y qué bugs reales aparecieron al probar con hardware físico. Sirve como evidencia del proceso de ingeniería detrás de la entrega final.

## Punto de partida

El proyecto se recibió con: rutas del sidebar sin conectar (enlaces `href="#"` que no llevaban a ningún lado), credenciales de WiFi y base de datos escritas directo en el código fuente, varias páginas del frontend completamente vacías, y sin ningún tipo de autenticación real entre el ESP32 y el backend.

## Estructura base y navegación

- Se conectó el enrutamiento del frontend (React Router) — antes, `MainLayout` renderizaba el Dashboard a la fuerza sin importar la URL.
- Se construyeron desde cero las páginas que estaban vacías: Incubadoras, Eventos, Configuración, Sistema.
- Se corrigió una inconsistencia real en el firmware: dos funciones usaban una IP hardcodeada distinta a la de las demás, rompiéndose en cuanto se cambiaba de red.

## Autenticación y cuentas

- Login y registro conectados de verdad al backend (antes existían visualmente pero no hacían nada).
- Rutas protegidas con JWT, tanto en el frontend (redirección automática si no hay sesión) como en el backend.
- Perfil de usuario: edición de datos, cambio de contraseña.
- Mostrar/ocultar contraseña, indicador de fortaleza al registrarse, checkbox "recordar mi correo".
- Sesión expirada manejada globalmente (redirige al login con aviso, en vez de errores sueltos por la pantalla).
- Límite de intentos de login (5 por 15 minutos) contra fuerza bruta — probado en vivo disparando 6 intentos reales y confirmando el bloqueo en el 6to.

## Dashboard y control de la incubadora

- Panel de control con modo Manual/Automático real, conectado al firmware.
- Estado "En línea/Desconectado" calculado con datos reales (antes era texto fijo).
- Conteo de alarmas activas real, comparando la lectura actual contra los umbrales configurados (antes era `0` fijo).
- Selector de múltiples incubadoras, con generación automática del rango de temperatura al crear una nueva (objetivo ± 2°C).
- Estadísticas del día (máx/mín/promedio, tiempo de calefactor encendido).
- Banda de rango seguro sombreada directamente en las gráficas.

## Seguridad del dispositivo (ESP32 ↔ backend)

- Llave de dispositivo (`X-Device-Key`) exigida en las rutas que el ESP32 usa para escribir datos o recibir comandos.
- Rutas de solo lectura del sitio protegidas con sesión de usuario (antes cualquiera en la red podía consultarlas sin loguearse).
- Mensajes de error saneados en 20 puntos del backend — antes se mandaba el error crudo de MySQL al navegador (nombres de tabla, restricciones); ahora el detalle real solo queda en el log del servidor.

## Bugs reales encontrados probando con hardware físico

Estos solo aparecieron al conectar el ESP32 real — quedan documentados porque fueron los más importantes de diagnosticar:

- **DECIMAL como texto:** MySQL devolvía los umbrales de temperatura como texto (`"48.00"`) en vez de número; el firmware los interpretaba como `0`, así que el modo automático nunca disparaba el calefactor aunque la temperatura estuviera fuera de rango.
- **Cola de comandos al revés:** los comandos se procesaban del más nuevo al más viejo, así que cambiar rápido de Manual a Automático podía terminar deshaciendo tu última acción. Se corrigió el orden y se agregó cancelación automática de comandos viejos del mismo tipo.
- **Estados de actuador desincronizados:** el modo manual y el modo automático usaban variables separadas para saber si el calefactor estaba encendido, así que cambiar de un modo a otro podía dejar al sistema "pensando" que el estado era distinto al real. Se unificó en una sola variable compartida.
- **Un solo intento de conexión a MySQL:** el backend abría la conexión una vez al arrancar; si fallaba (como puede pasar en el arranque de Docker), quedaba rota para siempre. Se cambió a un pool de conexiones que se recupera solo.
- **Timeout de WiFi:** el ESP32 se quedaba colgado indefinidamente si no lograba conectar al arrancar. Se le agregó un límite de 15 segundos con parpadeo del LED, y reintento en segundo plano.

## Experiencia y diseño

- Rediseño visual completo (paleta, tipografía, componentes reutilizables: toasts, modales de confirmación, estados vacíos con ícono, skeletons de carga).
- Diseño responsive (sidebar colapsable en pantallas chicas).
- Recorrido guiado interactivo para quien entra por primera vez, con resaltado directo sobre los elementos reales de la página.
- Modo Demo con datos simulados de forma realista, para mostrar el sitio sin depender del hardware físico.
- Notificaciones de alarma del navegador + sonido, filtro de fechas en Eventos/Alarmas, exportar a CSV.

## Calidad e ingeniería

- 25 pruebas automatizadas (Jest + Supertest) cubriendo los flujos críticos — corridas en vivo antes de cada entrega, no solo escritas.
- `schema.sql` — probado creando la base de datos desde cero y corriendo las consultas reales del backend contra ella.
- Reducción del paquete del frontend con carga diferida por página (de 507KB a 297KB iniciales).
- Purga automática de datos antiguos (mediciones >30 días, eventos >90 días), con botón manual y probada insertando datos con fechas viejas a propósito.

## Infraestructura y despliegue

- `docker-compose.yml` para levantar MySQL + backend + frontend con un solo comando — depurado en conjunto con varios problemas reales de un entorno Windows (puertos ocupados por instalaciones locales, política de ejecución de PowerShell, archivos bloqueados por venir de un zip descargado).
- Integración continua con GitHub Actions: las 25 pruebas y el build del frontend corren solos en cada `push`, contra una base de datos temporal creada desde cero.
- Repositorio publicado en GitHub con historial real de commits.

## Documentación

- `README.md` técnico completo (arquitectura, instalación, variables de entorno, modelo de datos, endpoints, troubleshooting de Docker).
- `GUIA-RAPIDA.md` — guía de uso no técnica para quien ve el sitio por primera vez.
- Versiones en Word de ambos documentos, para anexar a un informe.
