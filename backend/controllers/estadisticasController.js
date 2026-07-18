const db = require("../config/db");
const { manejarErrorServidor } = require("../utils/errores");

//====================================
// ESTADÍSTICAS DEL DÍA
// Min/máx/promedio de temperatura y humedad, y tiempo total
// que el calefactor estuvo encendido hoy.
//====================================

const obtenerEstadisticasHoy = (req, res) => {

    const esp32_id = req.params.esp32_id;

    const sqlMediciones = `
        SELECT
            MIN(temperatura) AS temp_min,
            MAX(temperatura) AS temp_max,
            AVG(temperatura) AS temp_avg,
            MIN(humedad) AS hum_min,
            MAX(humedad) AS hum_max,
            AVG(humedad) AS hum_avg,
            COUNT(*) AS total_lecturas
        FROM mediciones
        WHERE esp32_id = ?
        AND DATE(fecha) = CURDATE()
    `;

    const sqlEventosCalefactor = `
        SELECT evento, fecha
        FROM eventos
        WHERE esp32_id = ?
        AND DATE(fecha) = CURDATE()
        AND (evento LIKE '%Calefactor ENCENDIDO' OR evento LIKE '%Calefactor APAGADO')
        ORDER BY fecha ASC
    `;

    db.query(sqlMediciones, [esp32_id], (err, resultMediciones) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudieron calcular las estadísticas");
        }

        db.query(sqlEventosCalefactor, [esp32_id], (errEventos, resultEventos) => {

            if (errEventos) {
                return manejarErrorServidor(res, errEventos, "No se pudieron calcular las estadísticas");
            }

            let segundosEncendido = 0;
            let inicioActual = null;

            resultEventos.forEach((item) => {

                const esEncendido = item.evento.endsWith("Calefactor ENCENDIDO");
                const esApagado = item.evento.endsWith("Calefactor APAGADO");

                if (esEncendido && !inicioActual) {

                    inicioActual = new Date(item.fecha);

                } else if (esApagado && inicioActual) {

                    segundosEncendido +=
                        (new Date(item.fecha) - inicioActual) / 1000;

                    inicioActual = null;

                }

            });

            // Si a esta hora sigue encendido (no hubo un "APAGADO" después
            // del último "ENCENDIDO"), contamos hasta el momento actual.

            if (inicioActual) {

                segundosEncendido += (new Date() - inicioActual) / 1000;

            }

            const stats = resultMediciones[0];

            res.json({

                temp_min: stats.temp_min,
                temp_max: stats.temp_max,
                temp_avg: stats.temp_avg,

                hum_min: stats.hum_min,
                hum_max: stats.hum_max,
                hum_avg: stats.hum_avg,

                total_lecturas: stats.total_lecturas,

                calefactor_segundos_hoy: Math.round(segundosEncendido)

            });

        });

    });

};

module.exports = {
    obtenerEstadisticasHoy
};
