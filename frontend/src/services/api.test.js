import MockAdapter from "axios-mock-adapter";

vi.mock("./auth", () => ({
    obtenerToken: vi.fn(),
    cerrarSesion: vi.fn()
}));

import api from "./api";
import { obtenerToken, cerrarSesion } from "./auth";

describe("services/api", () => {

    let mock;

    beforeEach(() => {
        mock = new MockAdapter(api);
        obtenerToken.mockReset();
        cerrarSesion.mockReset();
    });

    afterEach(() => {
        mock.restore();
    });

    test("agrega el header Authorization cuando hay un token guardado", async () => {

        obtenerToken.mockReturnValue("token-de-prueba");

        mock.onGet("/cualquier-ruta").reply((config) => {
            expect(config.headers.Authorization).toBe("Bearer token-de-prueba");
            return [200, {}];
        });

        await api.get("/cualquier-ruta");

    });

    test("no agrega Authorization cuando no hay token guardado", async () => {

        obtenerToken.mockReturnValue(null);

        mock.onGet("/cualquier-ruta").reply((config) => {
            expect(config.headers.Authorization).toBeUndefined();
            return [200, {}];
        });

        await api.get("/cualquier-ruta");

    });

    test("un 401 en una ruta inesperada cierra la sesión local", async () => {

        mock.onGet("/incubadoras").reply(401);

        await expect(api.get("/incubadoras")).rejects.toBeDefined();

        expect(cerrarSesion).toHaveBeenCalled();

    });

    test("un 401 en /auth/login NO cierra la sesión (es una respuesta esperada del formulario)", async () => {

        mock.onPost("/auth/login").reply(401);

        await expect(api.post("/auth/login")).rejects.toBeDefined();

        expect(cerrarSesion).not.toHaveBeenCalled();

    });

});
