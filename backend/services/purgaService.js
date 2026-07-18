const db = require("../config/db");

//====================================
// PURGA DE DATOS ANTIGUOS
// Mantiene la tabla `mediciones` (la que más crece, una fila
// cada pocos segundos por dispositivo) y `eventos` dentro de un
// tamaño razonable, borrando lo más viejo que ya nadie necesita
// consultar en el día a día.
//====================================

const DIAS_RETENCION_MEDICIONES =
    parseInt(process.env.RETENCION_DIAS_MEDICIONES) || 30;

const DIAS_RETENCION_EVENTOS =
    parseInt(process.env.RETENCION_DIAS_EVENTOS) || 90;

const purgarMediciones = (dias) => {

    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM mediciones
            WHERE fecha < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;

        db.query(sql, [dias], (err, result) => {

            if (err) return reject(err);

            resolve(result.affectedRows);

        });

    });

};

const purgarEventos = (dias) => {

    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM eventos
            WHERE fecha < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;

        db.query(sql, [dias], (err, result) => {

            if (err) return reject(err);

            resolve(result.affectedRows);

        });

    });

};

const purgarDatosAntiguos = async () => {

    try {

        const medicionesBorradas = await purgarMediciones(DIAS_RETENCION_MEDICIONES);
        const eventosBorrados = await purgarEventos(DIAS_RETENCION_EVENTOS);

        if (medicionesBorradas > 0 || eventosBorrados > 0) {

            console.log(
                `🧹 Purga de datos: ${medicionesBorradas} mediciones (más de ${DIAS_RETENCION_MEDICIONES} días) ` +
                `y ${eventosBorrados} eventos (más de ${DIAS_RETENCION_EVENTOS} días) eliminados.`
            );

        }

        return {
            medicionesBorradas,
            eventosBorrados,
            diasRetencionMediciones: DIAS_RETENCION_MEDICIONES,
            diasRetencionEventos: DIAS_RETENCION_EVENTOS
        };

    } catch (error) {

        console.error("Error en la purga de datos antiguos:", error);
        throw error;

    }

};

module.exports = {
    purgarDatosAntiguos,
    purgarMediciones,
    purgarEventos,
    DIAS_RETENCION_MEDICIONES,
    DIAS_RETENCION_EVENTOS
};
