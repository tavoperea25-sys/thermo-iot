const db = require("../config/db");

//====================================
// GUARDAR MEDICIÓN
//====================================

const guardarSensor = (esp32_id, temperatura, humedad) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO mediciones
            (
                esp32_id,
                temperatura,
                humedad
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [esp32_id, temperatura, humedad],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result);

            }
        );

    });

};

module.exports = {

    guardarSensor

};