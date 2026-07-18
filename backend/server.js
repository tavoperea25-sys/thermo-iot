require("dotenv").config();

const iotRoutes = require("./routes/iot");
const incubadorasRoutes = require("./routes/incubadoras");
const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes = require("./routes/auth");

const app = express();

// Permitir recibir JSON
app.use(express.json());

// Permitir peticiones desde el frontend
app.use(cors());

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