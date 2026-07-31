//====================================
// CONFIG CONTROLLER
//====================================

const configService = require("../services/configService");
const { manejarErrorServidor } = require("../utils/errores");

//====================================
// OBTENER CONFIGURACIÓN
//====================================

const obtenerConfiguracion = async (req, res) => {

    try {

        const esp32_id = req.params.esp32_id;

        const result =
            await configService.obtenerConfiguracion(esp32_id);

        if (result.length === 0) {

            return res.status(404).json({

                mensaje: "Configuración no encontrada"

            });

        }

        res.json(result[0]);

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo consultar la configuración");

    }

};


//====================================
// ACTUALIZAR CONFIGURACIÓN
//====================================

const actualizarConfiguracion = async (req, res) => {

    try {

        const esp32_id = req.params.esp32_id;

        const {

            temperatura_min,
            temperatura_max,
            humedad_min,
            humedad_max,
            tiempo_lectura

        } = req.body;

        await configService.actualizarConfiguracion(

            esp32_id,
            temperatura_min,
            temperatura_max,
            humedad_min,
            humedad_max,
            tiempo_lectura

        );

        res.json({

            mensaje: "Configuración actualizada"

        });

    }
    catch (error) {

        manejarErrorServidor(res, error, "No se pudo actualizar la configuración");

    }

};

module.exports = {

    obtenerConfiguracion,
    actualizarConfiguracion

};