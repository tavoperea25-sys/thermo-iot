function verificarDispositivo(req, res, next) {

    const llaveRecibida = req.headers["x-device-key"];

    if (!llaveRecibida || llaveRecibida !== process.env.DEVICE_API_KEY) {

        return res.status(401).json({
            mensaje: "Llave de dispositivo inválida o ausente"
        });

    }

    next();

}

module.exports = verificarDispositivo;
