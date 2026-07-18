const db = require("../config/db");

//====================================
// OBTENER CONFIGURACIÓN
//====================================

const obtenerConfiguracion = (esp32_id) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM configuracion
            WHERE esp32_id = ?
            LIMIT 1
        `;

        db.query(sql, [esp32_id], (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve(result);

        });

    });

};

//====================================
// ACTUALIZAR CONFIGURACIÓN (upsert real:
// crea la fila si no existía, la actualiza si ya existía)
//====================================

const actualizarConfiguracion = (

    esp32_id,
    temperatura_min,
    temperatura_max,
    humedad_min,
    humedad_max,
    tiempo_lectura

) => {

    return new Promise((resolve, reject) => {

        obtenerConfiguracion(esp32_id)
            .then((filas) => {

                if (filas.length > 0) {

                    const sql = `
                        UPDATE configuracion
                        SET
                            temperatura_min = ?,
                            temperatura_max = ?,
                            humedad_min = ?,
                            humedad_max = ?,
                            tiempo_lectura = ?
                        WHERE esp32_id = ?
                    `;

                    db.query(
                        sql,
                        [
                            temperatura_min,
                            temperatura_max,
                            humedad_min,
                            humedad_max,
                            tiempo_lectura,
                            esp32_id
                        ],
                        (err, result) => {

                            if (err) return reject(err);
                            resolve(result);

                        }
                    );

                } else {

                    const sql = `
                        INSERT INTO configuracion
                        (
                            esp32_id,
                            temperatura_min,
                            temperatura_max,
                            humedad_min,
                            humedad_max,
                            tiempo_lectura
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        sql,
                        [
                            esp32_id,
                            temperatura_min,
                            temperatura_max,
                            humedad_min,
                            humedad_max,
                            tiempo_lectura
                        ],
                        (err, result) => {

                            if (err) return reject(err);
                            resolve(result);

                        }
                    );

                }

            })
            .catch(reject);

    });

};

module.exports = {

    obtenerConfiguracion,
    actualizarConfiguracion

};