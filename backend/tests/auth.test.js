const request = require("supertest");
const mysql = require("mysql2/promise");

const app = require("../server");

// Correo único por corrida, para que repetir "npm test" varias
// veces nunca choque con un usuario que quedó de una corrida
// anterior (por si una limpieza falla).

const sufijo = Date.now();
const correoTest = `test_auth_${sufijo}@thermoiot.test`;
const usuarioTest = `test_auth_${sufijo}`;
const passwordOriginal = "clave123456";
const passwordNueva = "claveNueva789";

let dbDirecta;
let token;

beforeAll(async () => {

    dbDirecta = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

});

afterAll(async () => {

    // Limpieza: borramos el usuario de prueba para no dejar
    // basura acumulándose en la base de datos de test.

    await dbDirecta.execute(
        "DELETE FROM usuarios WHERE correo = ?",
        [correoTest]
    );

    await dbDirecta.end();

});

describe("POST /api/auth/register", () => {

    test("registra un usuario nuevo correctamente", async () => {

        const respuesta = await request(app)
            .post("/api/auth/register")
            .send({
                nombre: "Usuario de Prueba",
                correo: correoTest,
                usuario: usuarioTest,
                password: passwordOriginal
            });

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.mensaje).toMatch(/registrado/i);

    });

    test("rechaza un correo duplicado", async () => {

        const respuesta = await request(app)
            .post("/api/auth/register")
            .send({
                nombre: "Otro Nombre",
                correo: correoTest,
                usuario: `${usuarioTest}_2`,
                password: passwordOriginal
            });

        expect(respuesta.status).not.toBe(200);

    });

    test("rechaza un correo con formato inválido", async () => {

        const respuesta = await request(app)
            .post("/api/auth/register")
            .send({
                nombre: "Usuario Correo Malo",
                correo: "esto-no-es-un-correo",
                usuario: `${usuarioTest}_correo_malo`,
                password: passwordOriginal
            });

        expect(respuesta.status).toBe(400);

    });

    test("rechaza una contraseña demasiado corta", async () => {

        const respuesta = await request(app)
            .post("/api/auth/register")
            .send({
                nombre: "Usuario Password Corta",
                correo: `test_pwcorta_${sufijo}@thermoiot.test`,
                usuario: `${usuarioTest}_pwcorta`,
                password: "123"
            });

        expect(respuesta.status).toBe(400);

    });

});

describe("POST /api/auth/login", () => {

    test("con credenciales correctas devuelve un token", async () => {

        const respuesta = await request(app)
            .post("/api/auth/login")
            .send({ correo: correoTest, password: passwordOriginal });

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.token).toBeDefined();
        expect(respuesta.body.usuario.correo).toBe(correoTest);

        token = respuesta.body.token;

    });

    test("con contraseña incorrecta devuelve 401", async () => {

        const respuesta = await request(app)
            .post("/api/auth/login")
            .send({ correo: correoTest, password: "una_password_mala" });

        expect(respuesta.status).toBe(401);

    });

    test("con correo inexistente devuelve 401", async () => {

        const respuesta = await request(app)
            .post("/api/auth/login")
            .send({ correo: "nadie_registrado@thermoiot.test", password: "loquesea" });

        expect(respuesta.status).toBe(401);

    });

    test("el mensaje es el mismo para correo inexistente y contraseña incorrecta (sin enumeración)", async () => {

        const correoInexistente = await request(app)
            .post("/api/auth/login")
            .send({ correo: "tampoco_existe@thermoiot.test", password: "loquesea" });

        const passwordIncorrecta = await request(app)
            .post("/api/auth/login")
            .send({ correo: correoTest, password: "una_password_mala" });

        expect(correoInexistente.body.mensaje).toBe(passwordIncorrecta.body.mensaje);

    });

});

describe("Rutas de perfil protegidas", () => {

    test("GET /api/auth/me sin token devuelve 401", async () => {

        const respuesta = await request(app).get("/api/auth/me");

        expect(respuesta.status).toBe(401);

    });

    test("GET /api/auth/me con token devuelve los datos del usuario", async () => {

        const respuesta = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.correo).toBe(correoTest);

    });

    test("PUT /api/auth/password con la contraseña actual incorrecta falla", async () => {

        const respuesta = await request(app)
            .put("/api/auth/password")
            .set("Authorization", `Bearer ${token}`)
            .send({ passwordActual: "esto_no_es", passwordNueva });

        expect(respuesta.status).toBe(401);

    });

    test("PUT /api/auth/password con la contraseña correcta la cambia", async () => {

        const respuesta = await request(app)
            .put("/api/auth/password")
            .set("Authorization", `Bearer ${token}`)
            .send({ passwordActual: passwordOriginal, passwordNueva });

        expect(respuesta.status).toBe(200);

        // Confirmamos que el login ahora funciona con la contraseña nueva.

        const login = await request(app)
            .post("/api/auth/login")
            .send({ correo: correoTest, password: passwordNueva });

        expect(login.status).toBe(200);

    });

});

describe("Límite de intentos de login", () => {

    test("bloquea después de varios intentos fallidos seguidos", async () => {

        const correoBloqueo = `test_bloqueo_${sufijo}@thermoiot.test`;

        let ultimaRespuesta;

        for (let i = 0; i < 6; i++) {

            ultimaRespuesta = await request(app)
                .post("/api/auth/login")
                .send({ correo: correoBloqueo, password: "loquesea" });

        }

        expect(ultimaRespuesta.status).toBe(429);

    });

});
