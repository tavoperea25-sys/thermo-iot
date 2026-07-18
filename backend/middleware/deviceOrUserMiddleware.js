const jwt = require("jsonwebtoken");

// Usado únicamente en /configuracion/:esp32_id, que consultan
// tanto el ESP32 (con su llave de dispositivo) como el sitio web
// (con la sesión del usuario logueado).

function verificarDispositivoOUsuario(req, res, next) {

    const llaveDispositivo = req.headers["x-device-key"];

    if (llaveDispositivo && llaveDispositivo === process.env.DEVICE_API_KEY) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {

        const token = authHeader.split(" ")[1];

        try {

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = payload;

            return next();

        } catch (error) {

            // sigue abajo al rechazo genérico

        }

    }

    return res.status(401).json({
        mensaje: "Se requiere sesión de usuario o llave de dispositivo válida"
    });

}

module.exports = verificarDispositivoOUsuario;
