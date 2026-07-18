//====================================
// HEARTBEAT CONTROLLER
//====================================

const db = require("../config/db");
const { manejarErrorServidor } = require("../utils/errores");


//====================================
// RECIBIR HEARTBEAT DEL ESP32
//====================================

const registrarHeartbeat = (req, res) => {

    // El estado "online" real se calcula con la última medición
    // de sensor (ver obtenerEstadoOnline), así que este endpoint
    // solo confirma recepción para que el ESP32 no reciba un 404.

    res.json({
        mensaje: "Heartbeat recibido"
    });

};


//====================================
// ESTADO ONLINE DEL ESP32
//====================================

const obtenerEstadoOnline = (req, res) => {

    const esp32_id = req.params.esp32_id;

    const sql = `
        SELECT fecha
        FROM mediciones
        WHERE esp32_id = ?
        ORDER BY fecha DESC
        LIMIT 1
    `;

    db.query(sql, [esp32_id], (err, result) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudo consultar el estado del dispositivo");
        }

        if (result.length === 0) {

            return res.json({
                online: false
            });

        }

        const ultimaFecha = new Date(result[0].fecha);
        const ahora = new Date();

        const diferenciaSegundos =
            (ahora - ultimaFecha) / 1000;

        const online = diferenciaSegundos <= 25;

        res.json({

            online,
            ultima_medicion: result[0].fecha,
            segundos_sin_datos: Math.floor(diferenciaSegundos)

        });

    });

};

module.exports = {

    registrarHeartbeat,
    obtenerEstadoOnline

};
