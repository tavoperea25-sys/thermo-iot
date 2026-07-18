// El error real (con nombres de columnas, mensajes de MySQL, etc.)
// se queda en el log del servidor, donde es útil para depurar.
// Al cliente solo le llega un mensaje genérico y seguro — nunca
// la estructura interna de la base de datos ni del código.

function manejarErrorServidor(res, error, contexto = "Ocurrió un error en el servidor") {

    console.error(`[ERROR] ${contexto}:`, error);

    res.status(500).json({
        mensaje: contexto
    });

}

module.exports = { manejarErrorServidor };
