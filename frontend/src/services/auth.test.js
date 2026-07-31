import {
    guardarSesion,
    actualizarUsuarioLocal,
    obtenerToken,
    obtenerUsuario,
    haySesion,
    cerrarSesion
} from "./auth";

describe("services/auth", () => {

    beforeEach(() => {
        localStorage.clear();
    });

    test("no hay sesión si no se guardó nada todavía", () => {

        expect(haySesion()).toBe(false);
        expect(obtenerToken()).toBeNull();
        expect(obtenerUsuario()).toBeNull();

    });

    test("guardarSesion guarda token y usuario, y haySesion pasa a true", () => {

        guardarSesion("token123", { id: 1, nombre: "Ana" });

        expect(haySesion()).toBe(true);
        expect(obtenerToken()).toBe("token123");
        expect(obtenerUsuario()).toEqual({ id: 1, nombre: "Ana" });

    });

    test("actualizarUsuarioLocal cambia el usuario sin tocar el token", () => {

        guardarSesion("token123", { id: 1, nombre: "Ana" });
        actualizarUsuarioLocal({ id: 1, nombre: "Ana Actualizada" });

        expect(obtenerToken()).toBe("token123");
        expect(obtenerUsuario().nombre).toBe("Ana Actualizada");

    });

    test("cerrarSesion borra token y usuario", () => {

        guardarSesion("token123", { id: 1, nombre: "Ana" });
        cerrarSesion();

        expect(haySesion()).toBe(false);
        expect(obtenerToken()).toBeNull();
        expect(obtenerUsuario()).toBeNull();

    });

});
