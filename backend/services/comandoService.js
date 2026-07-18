const db = require("../config/db");

//====================================
// CREAR COMANDO
// Antes de insertar el nuevo, cancela (marca como ejecutados)
// los comandos del MISMO TIPO que sigan pendientes — solo el
// más reciente de cada tipo (calefactor/ventilador/modo) importa.
//====================================

const crearComando = (esp32_id, comando, valor) => {

    return new Promise((resolve, reject) => {

        const sqlCancelar = `
            UPDATE comandos
            SET ejecutado = 1
            WHERE esp32_id = ?
            AND comando = ?
            AND ejecutado = FALSE
        `;

        db.query(sqlCancelar, [esp32_id, comando], (errCancelar) => {

            if (errCancelar) {
                return reject(errCancelar);
            }

            const sqlInsertar = `
                INSERT INTO comandos
                (
                    esp32_id,
                    comando,
                    valor
                )
                VALUES (?, ?, ?)
            `;

            db.query(
                sqlInsertar,
                [esp32_id, comando, valor],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(result);

                }
            );

        });

    });

};

//====================================
// MARCAR COMANDO EJECUTADO
//====================================

const marcarComandoEjecutado = (id) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE comandos
            SET ejecutado = 1
            WHERE id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve(result);

        });

    });

};

//====================================
// OBTENER COMANDO PENDIENTE
//====================================

const obtenerComandoPendiente = (esp32_id) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM comandos
            WHERE esp32_id = ?
            AND ejecutado = FALSE
            ORDER BY id ASC
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

module.exports = {

    crearComando,
    marcarComandoEjecutado,
    obtenerComandoPendiente

};