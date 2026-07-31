const db = require("../config/db");

// Verifica que el esp32_id de la petición pertenezca al usuario
// autenticado (req.usuario, puesto por authMiddleware). Sin esto,
// cualquier usuario logueado podía leer o controlar la incubadora
// de otro solo adivinando/cambiando el esp32_id en la URL o el body.
//
// Si la petición llegó autenticada como dispositivo (llave de
// ESP32, sin req.usuario), no hay nada que verificar aquí — el
// dispositivo ya demostró su identidad por su cuenta.

function verificarPropietarioIncubadora(req, res, next) {

    if (!req.usuario) {
        return next();
    }

    const esp32_id =
        req.params.esp32_id || req.body.esp32_id || req.query.esp32_id;

    if (!esp32_id) {
        return res.status(400).json({
            mensaje: "Falta esp32_id"
        });
    }

    const sql = `
        SELECT usuario_id
        FROM incubadoras
        WHERE esp32_id = ?
    `;

    db.query(sql, [esp32_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                mensaje: "No se pudo verificar la propiedad del dispositivo"
            });
        }

        if (result.length === 0 || result[0].usuario_id !== req.usuario.id) {

            return res.status(403).json({
                mensaje: "No tienes acceso a este dispositivo"
            });

        }

        next();

    });

}

module.exports = verificarPropietarioIncubadora;
