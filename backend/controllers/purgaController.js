const purgaService = require("../services/purgaService");
const { manejarErrorServidor } = require("../utils/errores");

const purgarAhora = async (req, res) => {

    try {

        const resultado = await purgaService.purgarDatosAntiguos();

        res.json({
            mensaje: "Purga completada",
            ...resultado
        });

    } catch (error) {

        manejarErrorServidor(res, error, "No se pudo completar la purga de datos");

    }

};

module.exports = { purgarAhora };
