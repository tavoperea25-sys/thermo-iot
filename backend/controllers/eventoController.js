//====================================
// EVENTOS CONTROLLER
//====================================

const db = require("../config/db");

const eventoService = require("../services/eventoService");
const { manejarErrorServidor } = require("../utils/errores");

//====================================
// REGISTRAR EVENTO
//====================================

const registrarEvento = async (req, res) => {

    try {

        const {

            esp32_id,
            evento

        } = req.body;

        await eventoService.registrarEvento(

            esp32_id,
            evento

        );

        res.json({

            mensaje: "Evento registrado"

        });

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo registrar el evento");

    }

};


//====================================
// OBTENER EVENTOS
//====================================

const obtenerEventos = async (req, res) => {

    try {

        const result = await eventoService.obtenerEventos(
            req.query.esp32_id,
            req.query.desde,
            req.query.hasta
        );

        res.json(result);

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudieron consultar los eventos");

    }

};

module.exports = {

    registrarEvento,
    obtenerEventos

};