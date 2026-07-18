# Guía rápida de uso — Thermo-IoT

Esta guía explica cómo usar el sitio, paso a paso, sin necesidad de conocimientos técnicos.

## ¿Qué es Thermo-IoT?

Es un panel web para monitorear y controlar una incubadora a distancia: muestra la temperatura y humedad en tiempo real, permite encender o apagar el calefactor y el ventilador, y puede regularlos automáticamente según los valores que tú configures.

## 1. Iniciar sesión

Al entrar al sitio verás la pantalla de inicio de sesión.

- Si ya tienes una cuenta: escribe tu correo y contraseña, y presiona **Ingresar**.
- Si es la primera vez: haz clic en **"¿No tienes cuenta? Crea una"**, completa el formulario, y quedarás registrado.

## 2. El Dashboard (pantalla principal)

Es lo primero que ves después de iniciar sesión. Muestra:

- **Estado**: si el dispositivo (ESP32) está conectado ("En línea") o no ("Desconectado").
- **Temperatura** y **Humedad**: los valores actuales, actualizados cada pocos segundos.
- **Alarmas activas**: cuántos valores están fuera del rango que configuraste (0 significa que todo está bien).
- **Gráficas**: la evolución de temperatura y humedad en el tiempo. La franja de color sombreada en cada gráfica marca el rango seguro — mientras la línea esté dentro de esa franja, todo está en orden.
- **Últimas lecturas**: una lista con los datos más recientes, uno por uno.
- **Estadísticas de hoy**: el máximo, mínimo y promedio del día, y cuánto tiempo ha estado encendido el calefactor hoy.

## 3. Controlar el calefactor y el ventilador

En el Dashboard, a la derecha, está el **Centro de control**:

- **Modo Manual**: tú decides — botones para **Encender** o **Apagar** el calefactor y el ventilador por separado.
- **Modo Automático**: el sistema los regula solo, encendiendo o apagando según si la temperatura/humedad se sale de los umbrales configurados. En este modo, los botones manuales se desactivan (para que no interfieras con el control automático).

Para cambiar de uno a otro, simplemente haz clic en **Manual** o **Automático** arriba del panel.

## 4. Ver el historial

En el menú de la izquierda:

- **Eventos**: un registro de todo lo que ha pasado (cuándo se encendió/apagó algo, cuándo cambió el modo).
- **Alarmas**: las veces que la temperatura o humedad se salieron de rango.

En ambas puedes filtrar por fecha (arriba, "Desde" / "Hasta") si buscas algo de un día en particular, y descargar la información en un archivo Excel con el botón **Exportar CSV**.

## 5. Configurar los umbrales

En **Configuración** (menú izquierdo) puedes cambiar:
- El rango de temperatura y humedad que se considera "seguro".
- Cada cuánto tiempo el dispositivo toma una lectura.

Los cambios se aplican solos en el dispositivo en los siguientes segundos, sin que tengas que hacer nada más.

## 6. Varias incubadoras

Si tienes más de un dispositivo, en **Incubadoras** (menú izquierdo) puedes agregar uno nuevo (ponle un nombre y la temperatura que quieres mantener) o eliminar uno que ya no uses. Para cambiar cuál estás viendo en el Dashboard, usa el selector desplegable arriba a la izquierda, junto al logo.

## 7. Modo Demo

Arriba a la derecha hay un botón **Demo**. Actívalo si quieres ver el sitio funcionando con datos de ejemplo (que se mueven solos, de forma realista) sin necesidad de tener el dispositivo físico conectado — útil para una presentación o para explorar el sitio con calma. Un aviso amarillo aparece en toda la pantalla mientras está activo, para que nunca lo confundas con datos reales. Se apaga con el mismo botón.

## 8. Tu cuenta

Haciendo clic en tu nombre (arriba a la derecha) entras a **Mi perfil**, donde puedes cambiar tu nombre, correo o contraseña. El ícono de salida junto a tu nombre cierra tu sesión.

---

¿Alguna pantalla no se explica aquí o te queda una duda puntual? Este documento se puede ampliar.
