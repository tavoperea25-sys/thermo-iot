const request = require("supertest");
const mysql = require("mysql2/promise");

const app = require("../server");

const sufijo = Date.now();

// Dispositivo "suelto", sin incubadora registrada — se usa para las
// pruebas de llave de dispositivo y para la de "sin configuración".
const esp32IdTest = `ESP32_TEST_IOT_${sufijo}`;

// Dispositivo CON incubadora registrada a nombre del usuario de
// prueba — necesario para las pruebas de comandos desde la web,
// ya que esas rutas ahora exigen que el esp32_id sea del usuario
// autenticado (ver middleware/ownershipMiddleware.js).
const esp32IdComandosTest = `ESP32_TEST_IOT_CMD_${sufijo}`;

const llaveCorrecta = process.env.DEVICE_API_KEY;

const correoTest = `test_iot_${sufijo}@thermoiot.test`;
const usuarioTest = `test_iot_${sufijo}`;
const passwordTest = "clave123456";

const correoOtroTest = `test_iot_otro_${sufijo}@thermoiot.test`;
const usuarioOtroTest = `test_iot_otro_${sufijo}`;

let dbDirecta;
let comandoCreadoId;
let token;
let tokenOtroUsuario;

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

    // Incubadora del usuario de prueba, dueña de esp32IdComandosTest —
    // sin esto, las rutas de comandos rechazarían al propio usuario
    // dueño por no tener ninguna incubadora asociada.

    await request(app)
        .post("/api/incubadoras")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Incubadora comandos test",
            esp32_id: esp32IdComandosTest,
            temperatura_objetivo: 37
        });

    // Segundo usuario, sin ninguna incubadora — se usa para probar
    // que NO puede tocar los dispositivos del primero.

    await request(app).post("/api/auth/register").send({
        nombre: "Otro Usuario IoT Test",
        correo: correoOtroTest,
        usuario: usuarioOtroTest,
        password: passwordTest
    });

    const loginOtro = await request(app)
        .post("/api/auth/login")
        .send({ correo: correoOtroTest, password: passwordTest });

    tokenOtroUsuario = loginOtro.body.token;

});

afterAll(async () => {

    await dbDirecta.execute(
        "DELETE FROM mediciones WHERE esp32_id = ?",
        [esp32IdTest]
    );

    await dbDirecta.execute(
        "DELETE FROM comandos WHERE esp32_id IN (?, ?)",
        [esp32IdTest, esp32IdComandosTest]
    );

    await dbDirecta.execute(
        "DELETE FROM configuracion WHERE esp32_id = ?",
        [esp32IdComandosTest]
    );

    await dbDirecta.execute(
        "DELETE FROM incubadoras WHERE esp32_id = ?",
        [esp32IdComandosTest]
    );

    await dbDirecta.execute(
        "DELETE FROM usuarios WHERE correo IN (?, ?)",
        [correoTest, correoOtroTest]
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
                esp32_id: esp32IdComandosTest,
                comando: "calefactor",
                valor: "ON"
            });

        expect(creado.status).toBe(200);

        const pendiente = await request(app)
            .get(`/api/iot/command/${esp32IdComandosTest}`)
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
            .send({ esp32_id: esp32IdComandosTest, comando: "modo", valor: "AUTO_ON" });

        await request(app)
            .post("/api/iot/command")
            .set("Authorization", `Bearer ${token}`)
            .send({ esp32_id: esp32IdComandosTest, comando: "modo", valor: "AUTO_OFF" });

        const [pendientes] = await dbDirecta.execute(
            "SELECT * FROM comandos WHERE esp32_id = ? AND comando = 'modo' AND ejecutado = FALSE",
            [esp32IdComandosTest]
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

describe("Propiedad del dispositivo (autorización entre usuarios)", () => {

    test("un usuario no puede enviar comandos a una incubadora que no es suya", async () => {

        const respuesta = await request(app)
            .post("/api/iot/command")
            .set("Authorization", `Bearer ${tokenOtroUsuario}`)
            .send({
                esp32_id: esp32IdComandosTest,
                comando: "calefactor",
                valor: "ON"
            });

        expect(respuesta.status).toBe(403);

    });

    test("un usuario no puede leer las mediciones de una incubadora que no es suya", async () => {

        const respuesta = await request(app)
            .get(`/api/iot/mediciones/${esp32IdComandosTest}`)
            .set("Authorization", `Bearer ${tokenOtroUsuario}`);

        expect(respuesta.status).toBe(403);

    });

    test("un usuario no puede cambiar la configuración de una incubadora que no es suya", async () => {

        const respuesta = await request(app)
            .put(`/api/iot/configuracion/${esp32IdComandosTest}`)
            .set("Authorization", `Bearer ${tokenOtroUsuario}`)
            .send({
                temperatura_min: 10,
                temperatura_max: 15,
                humedad_min: 10,
                humedad_max: 15,
                tiempo_lectura: 1000
            });

        expect(respuesta.status).toBe(403);

    });

    test("el dueño sí puede consultar sus propias mediciones", async () => {

        const respuesta = await request(app)
            .get(`/api/iot/mediciones/${esp32IdComandosTest}`)
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.status).toBe(200);

    });

});
