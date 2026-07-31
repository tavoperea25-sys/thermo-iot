const request = require("supertest");
const mysql = require("mysql2/promise");

const app = require("../server");

const sufijo = Date.now();
const correoTest = `test_incub_${sufijo}@thermoiot.test`;
const usuarioTest = `test_incub_${sufijo}`;
const passwordTest = "clave123456";
const esp32IdTest = `ESP32_TEST_${sufijo}`;

let dbDirecta;
let token;
let usuarioId;
let incubadoraCreadaId;

beforeAll(async () => {

    dbDirecta = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    // Registramos y logueamos un usuario propio para este archivo,
    // para no depender de datos creados por otros tests.

    await request(app).post("/api/auth/register").send({
        nombre: "Usuario Incubadoras Test",
        correo: correoTest,
        usuario: usuarioTest,
        password: passwordTest
    });

    const login = await request(app)
        .post("/api/auth/login")
        .send({ correo: correoTest, password: passwordTest });

    token = login.body.token;
    usuarioId = login.body.usuario.id;

});

afterAll(async () => {

    // Limpieza completa: configuración generada, incubadora y usuario.

    await dbDirecta.execute(
        "DELETE FROM configuracion WHERE esp32_id = ?",
        [esp32IdTest]
    );

    await dbDirecta.execute(
        "DELETE FROM incubadoras WHERE esp32_id = ?",
        [esp32IdTest]
    );

    await dbDirecta.execute(
        "DELETE FROM usuarios WHERE correo = ?",
        [correoTest]
    );

    await dbDirecta.end();

});

describe("Protección con sesión de usuario", () => {

    test("GET /api/incubadoras sin token devuelve 401", async () => {

        const respuesta = await request(app).get("/api/incubadoras");

        expect(respuesta.status).toBe(401);

    });

    test("POST /api/incubadoras sin token devuelve 401", async () => {

        const respuesta = await request(app)
            .post("/api/incubadoras")
            .send({
                nombre: "No debería crearse",
                esp32_id: "ESP32_NO_CREAR",
                temperatura_objetivo: 37
            });

        expect(respuesta.status).toBe(401);

    });

});

describe("Crear incubadora", () => {

    test("con token válido crea la incubadora", async () => {

        const respuesta = await request(app)
            .post("/api/incubadoras")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Incubadora de Prueba",
                descripcion: "Creada por los tests automáticos",
                esp32_id: esp32IdTest,
                temperatura_objetivo: 37,
                usuario_id: usuarioId
            });

        expect(respuesta.status).toBe(200);

        const [filas] = await dbDirecta.execute(
            "SELECT * FROM incubadoras WHERE esp32_id = ?",
            [esp32IdTest]
        );

        expect(filas.length).toBe(1);
        incubadoraCreadaId = filas[0].id;

    });

    test("genera automáticamente la configuración (objetivo ± 2°C)", async () => {

        const respuesta = await request(app)
            .get(`/api/iot/configuracion/${esp32IdTest}`)
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(Number(respuesta.body.temperatura_min)).toBe(35);
        expect(Number(respuesta.body.temperatura_max)).toBe(39);

    });

    test("la incubadora aparece en el listado del usuario", async () => {

        const respuesta = await request(app)
            .get("/api/incubadoras")
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.status).toBe(200);

        const encontrada = respuesta.body.find(
            (item) => item.esp32_id === esp32IdTest
        );

        expect(encontrada).toBeDefined();

    });

});

describe("Aislamiento entre usuarios", () => {

    const correoOtro = `test_incub_otro_${sufijo}@thermoiot.test`;
    const usuarioOtro = `test_incub_otro_${sufijo}`;

    let tokenOtroUsuario;

    beforeAll(async () => {

        await request(app).post("/api/auth/register").send({
            nombre: "Otro Usuario",
            correo: correoOtro,
            usuario: usuarioOtro,
            password: passwordTest
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({ correo: correoOtro, password: passwordTest });

        tokenOtroUsuario = login.body.token;

    });

    afterAll(async () => {

        await dbDirecta.execute(
            "DELETE FROM usuarios WHERE correo = ?",
            [correoOtro]
        );

    });

    test("un usuario no ve las incubadoras de otro en el listado", async () => {

        const respuesta = await request(app)
            .get("/api/incubadoras")
            .set("Authorization", `Bearer ${tokenOtroUsuario}`);

        expect(respuesta.status).toBe(200);

        const encontrada = respuesta.body.find(
            (item) => item.esp32_id === esp32IdTest
        );

        expect(encontrada).toBeUndefined();

    });

    test("un usuario no puede eliminar la incubadora de otro", async () => {

        const respuesta = await request(app)
            .delete(`/api/incubadoras/${incubadoraCreadaId}`)
            .set("Authorization", `Bearer ${tokenOtroUsuario}`);

        expect(respuesta.status).toBe(404);

        const [filas] = await dbDirecta.execute(
            "SELECT * FROM incubadoras WHERE id = ?",
            [incubadoraCreadaId]
        );

        expect(filas.length).toBe(1);

    });

});

describe("Eliminar incubadora", () => {

    test("borra la incubadora creada", async () => {

        const respuesta = await request(app)
            .delete(`/api/incubadoras/${incubadoraCreadaId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.status).toBe(200);

        const [filas] = await dbDirecta.execute(
            "SELECT * FROM incubadoras WHERE id = ?",
            [incubadoraCreadaId]
        );

        expect(filas.length).toBe(0);

    });

});
