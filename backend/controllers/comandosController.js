//====================================
// COMANDOS CONTROLLER
//====================================

const comandoService = require("../services/comandoService");
const { manejarErrorServidor } = require("../utils/errores");

//====================================
// MARCAR COMANDO EJECUTADO
//====================================

const marcarComandoEjecutado = async (req, res) => {

    try {

        const id = req.params.id;

        await comandoService.marcarComandoEjecutado(id);

        res.json({

            mensaje: "Comando ejecutado"

        });

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo marcar el comando como ejecutado");

    }

};


//====================================
// OBTENER COMANDO PENDIENTE
//====================================

const obtenerComandoPendiente = async (req, res) => {

    try {

        const esp32_id = req.params.esp32_id;

        const result =
            await comandoService.obtenerComandoPendiente(esp32_id);

        if (result.length === 0) {

            return res.json({
                comando: null
            });

        }

        res.json(result[0]);

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo consultar el comando pendiente");

    }

};

//====================================
// CREAR COMANDO
//====================================

const crearComando = async (req, res) => {

    try {

        const {

            esp32_id,
            comando,
            valor

        } = req.body;

        await comandoService.crearComando(

            esp32_id,
            comando,
            valor

        );

        res.json({

            mensaje: "Comando enviado correctamente"

        });

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo enviar el comando");

    }

};

module.exports = {

    crearComando,
    marcarComandoEjecutado,
    obtenerComandoPendiente
    

};