const db = require("../config/db");

//====================================
// REGISTRAR EVENTO
//====================================

const registrarEvento = (esp32_id, evento) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO eventos
            (
                esp32_id,
                evento
            )
            VALUES (?, ?)
        `;

        db.query(
            sql,
            [esp32_id, evento],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result);

            }
        );

    });

};

//====================================
// OBTENER EVENTOS
//====================================

const obtenerEventos = (esp32_id, desde, hasta) => {

    return new Promise((resolve, reject) => {

        const condiciones = [];
        const params = [];

        if (esp32_id) {
            condiciones.push("esp32_id = ?");
            params.push(esp32_id);
        }

        if (desde) {
            condiciones.push("fecha >= ?");
            params.push(`${desde} 00:00:00`);
        }

        if (hasta) {
            condiciones.push("fecha <= ?");
            params.push(`${hasta} 23:59:59`);
        }

        const where = condiciones.length > 0
            ? `WHERE ${condiciones.join(" AND ")}`
            : "";

        // Si hay filtro de fechas, el usuario quiere ver ese rango
        // completo, no solo los últimos 20 — subimos el límite.

        const limite = (desde || hasta) ? 500 : 20;

        const sql = `
            SELECT *
            FROM eventos
            ${where}
            ORDER BY fecha DESC
            LIMIT ${limite}
        `;

        db.query(sql, params, (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve(result);

        });

    });

};

module.exports = {

    registrarEvento,
    obtenerEventos

};