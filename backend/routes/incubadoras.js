const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/authMiddleware");
const configService = require("../services/configService");
const { manejarErrorServidor } = require("../utils/errores");

router.use(verificarToken);

// Margen alrededor de la temperatura objetivo para el modo automático.
const MARGEN_TEMPERATURA = 2;

// Valores por defecto para humedad y tiempo de lectura,
// usados cuando todavía no existe una configuración propia.
const HUMEDAD_MIN_DEFECTO = 50;
const HUMEDAD_MAX_DEFECTO = 70;
const TIEMPO_LECTURA_DEFECTO = 3000;

// Obtener las incubadoras del usuario logueado
router.get("/", (req, res) => {

    const sql = `
        SELECT * FROM incubadoras WHERE usuario_id = ?
    `;

    db.query(sql, [req.usuario.id], (err, results) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudieron consultar las incubadoras");
        }

        res.json(results);

    });

});

// Crear incubadora
router.post("/", async (req, res) => {

    const {
        nombre,
        descripcion,
        esp32_id,
        temperatura_objetivo
    } = req.body;

    // El dueño siempre es el usuario autenticado — nunca se confía
    // en un usuario_id que venga del body, o cualquiera podría
    // registrar una incubadora a nombre de otra persona.
    const usuario_id = req.usuario.id;

    const sql = `
        INSERT INTO incubadoras
        (
            nombre,
            descripcion,
            esp32_id,
            temperatura_objetivo,
            usuario_id
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            nombre,
            descripcion,
            esp32_id,
            temperatura_objetivo,
            usuario_id
        ],
        async (err) => {

            if (err) {
                return manejarErrorServidor(res, err, "No se pudo crear la incubadora");
            }

            // Si el dispositivo todavía no tiene configuración propia,
            // la generamos a partir de la temperatura objetivo (±2°C).
            // Si ya existía (por ejemplo, otra incubadora usando el
            // mismo esp32_id), no la pisamos.

            try {

                const configExistente =
                    await configService.obtenerConfiguracion(esp32_id);

                if (configExistente.length === 0) {

                    const objetivo = Number(temperatura_objetivo);

                    await configService.actualizarConfiguracion(
                        esp32_id,
                        objetivo - MARGEN_TEMPERATURA,
                        objetivo + MARGEN_TEMPERATURA,
                        HUMEDAD_MIN_DEFECTO,
                        HUMEDAD_MAX_DEFECTO,
                        TIEMPO_LECTURA_DEFECTO
                    );

                }

            } catch (errConfig) {

                console.error(
                    "No se pudo generar la configuración automática:",
                    errConfig
                );

                // No bloqueamos la creación de la incubadora por esto —
                // el usuario siempre puede ajustar la configuración
                // manualmente después.

            }

            res.json({
                mensaje: "Incubadora creada correctamente"
            });

        }
    );

});

// Eliminar incubadora (solo si es del usuario logueado)
router.delete("/:id", (req, res) => {

    const { id } = req.params;

    const sql = `DELETE FROM incubadoras WHERE id = ? AND usuario_id = ?`;

    db.query(sql, [id, req.usuario.id], (err, result) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudo eliminar la incubadora");
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                mensaje: "Incubadora no encontrada"
            });

        }

        res.json({
            mensaje: "Incubadora eliminada correctamente"
        });

    });

});

module.exports = router;