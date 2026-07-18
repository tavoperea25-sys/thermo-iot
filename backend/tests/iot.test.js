const request = require("supertest");
const mysql = require("mysql2/promise");

const app = require("../server");

const sufijo = Date.now();
const esp32IdTest = `ESP32_TEST_IOT_${sufijo}`;
const llaveCorrecta = process.env.DEVICE_API_KEY;

const correoTest = `test_iot_${sufijo}@thermoiot.test`;
const usuarioTest = `test_iot_${sufijo}`;
const passwordTest = "clave123456";

let dbDirecta;
let comandoCreadoId;
let token;

beforeAll(async () => {

    dbDirecta = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    // POST /api/iot/command lo usa la web (el usuario logueado
    // haciendo clic en Encender/Apagar), así que necesitamos un
    // usuario real con sesión para probarlo.

    await request(app).post("/api/auth/register").send({
        nombre: "Usuario IoT Test",
        correo: correoTest,
        usuario: usuarioTest,
        password: passwordTest
    });

    const login = await request(app)
        .post("/api/auth/login")
        .send({ correo: correoTest, password: passwordTest });

    token = login.body.token;

});

afterAll(async () => {

    await dbDirecta.execute(
        "DELETE FROM mediciones WHERE esp32_id = ?",
        [esp32IdTest]
    );

    await dbDirecta.execute(
        "DELETE FROM comandos WHERE esp32_id = ?",
        [esp32IdTest]
    );

    await dbDirecta.execute(
        "DELETE FROM usuarios WHERE correo = ?",
        [correoTest]
    );

    await dbDirecta.end();

});

describe("Llave de dispositivo en rutas del ESP32", () => {

    test("POST /api/iot/sensor sin llave devuelve 401", async () => {

        const respuesta = await request(app)
            .post("/api/iot/sensor")
            .send({ esp32_id: esp32IdTest, temperatura: 36.5, humedad: 55 });

        expect(respuesta.status).toBe(401);

    });

    test("POST /api/iot/sensor con llave incorrecta devuelve 401", async () => {

        const respuesta = await request(app)
            .post("/api/iot/sensor")
            .set("X-Device-Key", "llave-inventada")
            .send({ esp32_id: esp32IdTest, temperatura: 36.5, humedad: 55 });

        expect(respuesta.status).toBe(401);

    });

    test("POST /api/iot/sensor con la llave correcta guarda la medición", async () => {

        const respuesta = await request(app)
            .post("/api/iot/sensor")
            .set("X-Device-Key", llaveCorrecta)
            .send({ esp32_id: esp32IdTest, temperatura: 36.5, humedad: 55 });

        expect(respuesta.status).toBe(200);

        const [filas] = await dbDirecta.execute(
            "SELECT * FROM mediciones WHERE esp32_id = ?",
            [esp32IdTest]
        );

        expect(filas.length).toBe(1);
        expect(Number(filas[0].temperatura)).toBe(36.5);

    });

    test("GET /api/iot/command/:esp32_id sin llave devuelve 401", async () => {

        const respuesta = await request(app).get(
            `/api/iot/command/${esp32IdTest}`
        );

        expect(respuesta.status).toBe(401);

    });

});

describe("Flujo de comandos manuales", () => {

    test("un comando creado por la web aparece como pendiente para el ESP32", async () => {

        const creado = await request(app)
            .post("/api/iot/command")
            .set("Authorization", `Bearer ${token}`)
            .send({
                esp32_id: esp32IdTest,
                comando: "calefactor",
                valor: "ON"
            });

        expect(creado.status).toBe(200);

        const pendiente = await request(app)
            .get(`/api/iot/command/${esp32IdTest}`)
            .set("X-Device-Key", llaveCorrecta);

        expect(pendiente.status).toBe(200);
        expect(pendiente.body.comando).toBe("calefactor");
        expect(pendiente.body.valor).toBe("ON");
        expect(pendiente.body.ejecutado).toBe(0);

        comandoCreadoId = pendiente.body.id;

    });

    test("marcar como ejecutado lo saca de la cola de pendientes", async () => {

        const marcar = await request(app)
            .put(`/api/iot/command/${comandoCreadoId}/ejecutado`)
            .set("X-Device-Key", llaveCorrecta);

        expect(marcar.status).toBe(200);

        const [filas] = await dbDirecta.execute(
            "SELECT ejecutado FROM comandos WHERE id = ?",
            [comandoCreadoId]
        );

        expect(filas[0].ejecutado).toBe(1);

    });

    test("un comando nuevo del mismo tipo cancela el anterior sin ejecutar", async () => {

        await request(app)
            .post("/api/iot/command")
            .set("Authorization", `Bearer ${token}`)
            .send({ esp32_id: esp32IdTest, comando: "modo", valor: "AUTO_ON" });

        await request(app)
            .post("/api/iot/command")
            .set("Authorization", `Bearer ${token}`)
            .send({ esp32_id: esp32IdTest, comando: "modo", valor: "AUTO_OFF" });

        const [pendientes] = await dbDirecta.execute(
            "SELECT * FROM comandos WHERE esp32_id = ? AND comando = 'modo' AND ejecutado = FALSE",
            [esp32IdTest]
        );

        // Solo debe quedar UNO pendiente (el más reciente) — el
        // anterior se cancela automáticamente al llegar uno nuevo
        // del mismo tipo.

        expect(pendientes.length).toBe(1);
        expect(pendientes[0].valor).toBe("AUTO_OFF");

    });

});

describe("Configuración accesible por dispositivo o usuario", () => {

    test("sin llave ni sesión de usuario devuelve 401", async () => {

        const respuesta = await request(app).get(
            `/api/iot/configuracion/${esp32IdTest}`
        );

        expect(respuesta.status).toBe(401);

    });

    test("responde 404 si el dispositivo no tiene configuración (con llave válida)", async () => {

        const respuesta = await request(app)
            .get(`/api/iot/configuracion/${esp32IdTest}`)
            .set("X-Device-Key", llaveCorrecta);

        expect(respuesta.status).toBe(404);

    });

});
