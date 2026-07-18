const express = require("express");
const router = express.Router();
const db = require("../config/db");

const verificarDispositivo = require("../middleware/deviceAuthMiddleware");
const verificarToken = require("../middleware/authMiddleware");
const verificarDispositivoOUsuario = require("../middleware/deviceOrUserMiddleware");

const iotController = require("../controllers/iotController");
const comandosController = require("../controllers/comandosController");
const configController = require("../controllers/configController");
const eventoController = require("../controllers/eventoController");
const heartbeatController = require("../controllers/heartbeatController");
const estadisticasController = require("../controllers/estadisticasController");
const purgaController = require("../controllers/purgaController");
const { manejarErrorServidor } = require("../utils/errores");


router.get("/history", verificarToken, iotController.obtenerHistorial);

router.post("/command", verificarToken, comandosController.crearComando);

router.get(
    "/command/:esp32_id",
    verificarDispositivo,
    comandosController.obtenerComandoPendiente
);

router.put(
    "/command/:id/ejecutado",
    verificarDispositivo,
    comandosController.marcarComandoEjecutado
);



router.get("/status/:esp32_id", verificarToken, (req, res) => {

    const esp32_id = req.params.esp32_id;

    const sql = `
        SELECT comando, valor
        FROM comandos
        WHERE esp32_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [esp32_id], (err, result) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudo consultar el estado de los actuadores");
        }

        let estado = {
            calefactor: null,
            ventilador: null,
            modo: null
        };

        result.forEach(item => {

            if (item.comando === "calefactor" &&
                estado.calefactor === null) {

                estado.calefactor = item.valor;
            }

            if (item.comando === "ventilador" &&
                estado.ventilador === null) {

                estado.ventilador = item.valor;
            }

            if (item.comando === "modo" &&
                estado.modo === null) {

                estado.modo = item.valor;
            }

        });

        if (estado.calefactor === null)
            estado.calefactor = "OFF";

        if (estado.ventilador === null)
            estado.ventilador = "OFF";

        if (estado.modo === null)
            estado.modo = "AUTO_OFF";

        res.json(estado);

    });

});

router.post("/sensor", verificarDispositivo, iotController.guardarSensor);

router.get("/latest/:esp32_id", verificarToken, iotController.obtenerUltimaMedicion);

router.get("/mediciones/:esp32_id", verificarToken, iotController.obtenerMediciones);

router.post("/heartbeat", verificarDispositivo, heartbeatController.registrarHeartbeat);

router.get("/online-status/:esp32_id", verificarToken, heartbeatController.obtenerEstadoOnline);

router.post("/evento", verificarDispositivo, eventoController.registrarEvento);

router.get("/eventos", verificarToken, eventoController.obtenerEventos);

router.get(
    "/estadisticas/:esp32_id",
    verificarToken,
    estadisticasController.obtenerEstadisticasHoy
);

router.post(
    "/purgar",
    verificarToken,
    purgaController.purgarAhora
);

router.get(
    "/configuracion/:esp32_id",
    verificarDispositivoOUsuario,
    configController.obtenerConfiguracion
);


// ===============================
// ACTUALIZAR CONFIGURACIÓN
// ===============================

router.put(
    "/configuracion/:esp32_id",
    verificarToken,
    configController.actualizarConfiguracion
);

module.exports = router;