//====================================
// IOT CONTROLLER
//====================================

const db = require("../config/db");

const sensorService = require("../services/sensorService");
const { manejarErrorServidor } = require("../utils/errores");

//====================================
// GUARDAR SENSOR
//====================================

const guardarSensor = async (req, res) => {

    try {

        const {

            esp32_id,
            temperatura,
            humedad

        } = req.body;

        await sensorService.guardarSensor(

            esp32_id,
            temperatura,
            humedad

        );

        res.json({

            mensaje: "Datos guardados correctamente"

        });

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo guardar la medición");

    }

};


const obtenerUltimaMedicion = (req, res) => {

    const esp32_id = req.params.esp32_id;

    const sql = `
        SELECT *
        FROM mediciones
        WHERE esp32_id = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(sql, [esp32_id], (err, result) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudo consultar la última medición");
        }

        if (result.length === 0) {

            return res.json({
                temperatura: 0,
                humedad: 0
            });

        }

        res.json(result[0]);

    });

};


const obtenerMediciones = (req, res) => {

    const esp32_id = req.params.esp32_id;

    const { desde, hasta } = req.query;

    if (desde || hasta) {

        const condiciones = ["esp32_id = ?"];
        const params = [esp32_id];

        if (desde) {
            condiciones.push("fecha >= ?");
            params.push(`${desde} 00:00:00`);
        }

        if (hasta) {
            condiciones.push("fecha <= ?");
            params.push(`${hasta} 23:59:59`);
        }

        const sql = `
            SELECT *
            FROM mediciones
            WHERE ${condiciones.join(" AND ")}
            ORDER BY fecha ASC
            LIMIT 2000
        `;

        db.query(sql, params, (err, result) => {

            if (err) {
                return manejarErrorServidor(res, err, "No se pudieron consultar las mediciones");
            }

            res.json(result);

        });

        return;

    }

    const limite = parseInt(req.query.limit) || 50;

    const sql = `
        SELECT *
        FROM mediciones
        WHERE esp32_id = ?
        ORDER BY fecha DESC
        LIMIT ?
    `;

    db.query(sql, [esp32_id, limite], (err, result) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudieron consultar las mediciones");
        }

        res.json(result.reverse());

    });

};


const obtenerHistorial = (req, res) => {

    const sql = `
        SELECT
            temperatura,
            humedad,
            fecha
        FROM mediciones
        ORDER BY fecha DESC
        LIMIT 10
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudo consultar el historial");
        }

        res.json(result.reverse());

    });

};

module.exports = {

    guardarSensor,
    obtenerUltimaMedicion,
    obtenerMediciones,
    obtenerHistorial


};
