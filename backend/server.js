require("dotenv").config();

const iotRoutes = require("./routes/iot");
const incubadorasRoutes = require("./routes/incubadoras");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("./config/db");

const authRoutes = require("./routes/auth");

const app = express();

// Cabeceras de seguridad básicas (X-Content-Type-Options,
// X-Frame-Options, etc.). Desactivamos CSP por defecto porque el
// frontend es una app aparte (Vite/React) servida desde otro
// origen/puerto — no HTML generado por este servidor al que
// aplicarle una política de contenido.
app.use(helmet({ contentSecurityPolicy: false }));

// Permitir recibir JSON
app.use(express.json());

// Peticiones desde el frontend. El origen no es fijo a propósito:
// el mismo sitio se abre desde localhost, desde la IP del PC en la
// red WiFi (celular) o detrás de un túnel (ngrok/Cloudflare) para
// demos remotas — ver el README, sección "Compartir el sitio con
// alguien en otra red". Si defines CORS_ORIGIN (lista separada por
// comas) en el .env, se restringe a esos orígenes exactos; si no,
// se refleja el origen de cada petición (equivalente a lo de
// antes, pero dejando la puerta abierta a restringirlo en
// producción sin tocar código).
const origenesPermitidos = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : true;

app.use(cors({ origin: origenesPermitidos }));

app.use("/api/auth", authRoutes);
app.use("/api/incubadoras", incubadorasRoutes);
app.use("/api/iot", iotRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({
        mensaje: "THERMO-IOT API funcionando correctamente 🚀"
    });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Solo levantamos el servidor si este archivo se ejecuta
// directamente (node server.js / npm run dev) — cuando los
// tests lo requieren como módulo, no queremos que además
// intente ocupar un puerto real.

if (require.main === module) {

    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });

    // Purga automática de mediciones/eventos antiguos: una vez al
    // arrancar, y después cada 24 horas mientras el servidor siga
    // corriendo. Solo aquí (no cuando los tests requieren server.js
    // como módulo), para no borrar datos de la base de test sin
    // querer ni depender de que la conexión ya esté lista en ese
    // contexto.

    const { purgarDatosAntiguos } = require("./services/purgaService");

    purgarDatosAntiguos();

    setInterval(purgarDatosAntiguos, 24 * 60 * 60 * 1000);

}

module.exports = app;